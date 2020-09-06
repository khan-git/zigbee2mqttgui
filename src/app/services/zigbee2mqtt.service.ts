import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription, TimeoutError } from 'rxjs';

import { IMqttMessage, MqttModule, IMqttServiceOptions, MqttService } from 'ngx-mqtt';
import { SnackBarService } from './snackbar.service';

export const MQTT_SERVICE_OPTIONS: IMqttServiceOptions = {
    hostname: '10.11.22.97',
    port: 9001,
    path: '/mqtt'
  };

@Injectable()
export class Zigbee2MqttService implements OnDestroy{

    private bridgeState: string = 'offline';
    private subscriptions = new Map<string, Subscription>();
    private devices = [];
    private devicesExtended = new Map();
    private deviceNames = [];
    private groups = [];

    config= { coordinator: {
            type: "Unknown"
        },
        log_level: "debug",
        permit_join: false,
        version: "0.0"
    };
    
    constructor(private mqttService: MqttService, private snackBarService: SnackBarService) {
        this.addTopic('zigbee2mqtt/bridge/state', (message) => { 
            this.bridgeState = message.payload.toString();
            snackBarService.add('Coordinator state updated: '+this.bridgeState.toUpperCase());
        });
        this.addTopic('zigbee2mqtt/bridge/config', (message) => {
            this.config = JSON.parse(message.payload.toString());
            snackBarService.add('Bridge configuration updated');
        });
        this.addTopic('zigbee2mqtt/bridge/config/devices', (message) => {
            this.devices = JSON.parse(message.payload.toString());
            snackBarService.add('Devices updated: '+this.devices.length);
            this.devices.forEach(device => {
                this.deviceNames.push(device.friendly_name);
            });
        });

        this.addTopic('zigbee2mqtt/bridge/log', (message) => {
            var data = JSON.parse(message.payload.toString());
            console.log("Log type "+data.type);
            if(data.type == 'devices') {
                // this.devices = data.message;
                // console.log("Devices found: "+this.devices.length);
                // console.log("Log devices");
            }
            else if(data.type == 'groups') {
                this.groups = data.message;
                snackBarService.add('Groups updated: '+this.groups.length);
            }
            else if ( data.type == 'device_connected') {
                snackBarService.add("New device connected: "+data.message.friendly_name);
            }
            else if ( data.type == 'pairing') {
                if( data.message == 'interview_started') {
                    snackBarService.add('Pairing started: '+data.meta.friendly_name);
                }
                else if ( data.message == 'interview_successful') {
                    snackBarService.add('New device paired: '+data.meta.friendly_name);
                    this.updateDevices();
                }
            }
            else if ( data.type == 'device_removed_failed' || data.type == 'device_force_remove_failed') {
                snackBarService.add('FAILED to remove device');
                this.updateDevices();
            }
            else if ( data.type == 'device_renamed') {
                snackBarService.add('Device renamed from '+data.message.from+' to '+data.message.to);
                this.updateDevices();
            }
            else if ( data.type == 'group_renamed') {
                snackBarService.add('Group renamed from '+data.message.from+' to '+data.message.to);
                this.updateGroups();
            }
            else if ( data.type == 'device_bind') {
                snackBarService.add('Device bound '+data.message.from+' to '+data.message.to);
                this.updateSystemView();
            }
            else if ( data.type == 'device_group_add') {
                snackBarService.add('Device '+data.message.friendly_name+' added to group '+data.message.group);
                this.updateSystemView();
            }
            else if ( data.type == 'device_group_remove') {
                snackBarService.add('Device '+data.message.friendly_name+' removed from group '+data.message.group);
                this.updateSystemView();
            }
            else if ( data.type == 'device_unbind') {
                snackBarService.add('Device unbound '+data.message.from+' to '+data.message.to);
                this.updateSystemView();
            }
            else if ( data.type == 'device_bind_failed') {
                snackBarService.add('Bind FAILED '+data.message.from+' to '+data.message.to);
                this.updateSystemView();
            }
            else if ( data.type == 'device_removed' || data.type == 'device_force_removed') {
                if(data.message == 'left_network') {
                    snackBarService.add('Device removed: '+data.meta.friendly_name);
                    this.updateDevices();    
                }
                else {
                    snackBarService.add('Device removed: '+data.message);
                }
            }
            else {
                console.log("-"+message.topic.toString()+":"+JSON.parse(message.payload.toString()));
            }
        });
        setTimeout(() => {
            this.updateSystemView();
        }, 500);

        this.addTopic('zigbee2mqtt/#', (message) => {
            var deviceItem = null;
            this.devices.forEach( device => {
                if(message.topic.startsWith('zigbee2mqtt/'+device.friendly_name)) {
                    deviceItem = device;
                }
            });
            if(deviceItem == null
                && !message.topic.endsWith('/bridge/log') 
                && !message.topic.endsWith('/bridge/config/devices') 
                && !message.topic.endsWith('/bridge/confif')
                && !message.topic.endsWith('/bridge/state')
                && !message.topic.endsWith('/bridge/group/remove_all')
                && !message.topic.endsWith('/bridge/group/remove')) {
                    console.log(message.topic.toString()+": "+message.payload.toString());
            }
            else if(deviceItem != null) {
                this.handleDeviceUpdate(message, deviceItem);
            }
        });

    }

    handleDeviceUpdate(message, device) {
        let data;
        if(this.devicesExtended.has(device.networkAddress)) {
            data = this.devicesExtended.get(device.networkAddress)
        }
        else {            
            data = {}
        }
        let topic = message.topic.split('/');
        if(topic.length == 3) {
            if(topic[2] != 'get' && topic[2] != 'set') {
                data[topic[topic.length-1]] = message.payload.toString();
                this.devicesExtended.set(device.networkAddress, data);
            }
        }
    }

    getDeviceExtended(id) {
        return this.devicesExtended.get(id);
    }

    public isConnected(): boolean {
        return this.bridgeState == 'online' ? true : false;
    }

    addTopic(topic: string, callback: (message: IMqttMessage) => any) {
        this.subscriptions[topic] = this.mqttService.observe(topic).subscribe((message: IMqttMessage) => {
            callback(message);    
        });

    }
    removeDevice(name, force: boolean = false) {
        if(force) {
            this.unsafePublish("zigbee2mqtt/bridge/config/force_remove", name);
            this.snackBarService.add("Force removing device "+name);    
        }
        else {
            this.unsafePublish("zigbee2mqtt/bridge/config/remove", name);
            this.snackBarService.add("Removing device "+name);    
        }
    }

    updateSystemView() {
        console.log("Updating system view");
        this.updateDevices();
        this.updateGroups();
    }

    updateDevices() {
        this.unsafePublish("zigbee2mqtt/bridge/config/devices/get", "");
    }

    updateGroups() {
        this.unsafePublish('zigbee2mqtt/bridge/config/groups', '');                
    }

    public ngOnDestroy() {
        this.subscriptions.forEach((s, key) => {
            console.log("Unsubscribing "+key);
            s.unsubscribe();
        });
    }

    public unsafePublish(topic: string, message: string): void {
        this.mqttService.unsafePublish(topic, message, {qos: 1, retain: false});
    }

    getDevices() {
        return this.devices;
    }
    
    getGroups() {
        return this.groups;
    }

    getConfig() {
        return this.config;
    }

    togglePermitJoin() {
        this.snackBarService.add('Permit Join toggled to '+String(!this.config.permit_join).toUpperCase());
        this.unsafePublish('zigbee2mqtt/bridge/config/permit_join', ""+!this.config.permit_join);
    }

    renameDevice(oldName: string, newName: string) {
        this.unsafePublish('zigbee2mqtt/bridge/config/rename', '{"old":"'+oldName+'", "new":"'+newName+'"}');
        this.snackBarService.add('Renaming device '+oldName+' to '+newName);
    }

    renameGroup( oldName: string, newName: string) { 
        this.unsafePublish('zigbee2mqtt/bridge/config/rename', '{"old":"'+oldName+'", "new":"'+newName+'"}');
        this.snackBarService.add('Renaming group '+oldName+' to '+newName);
    }

    touchLinkStart() {
        this.unsafePublish('zigbee2mqtt/bridge/config/touchlink/factory_reset', '');
        this.snackBarService.add('Touchlink started');
    }

    addToGroup(device, group) {
        this.unsafePublish('zigbee2mqtt/bridge/group/'+group+'/add', device);
        this.snackBarService.add('Add '+device+' to group '+group);
    }

    removeFromGroup(device, group) {
        this.unsafePublish('zigbee2mqtt/bridge/group/'+group+'/remove', device);
        this.snackBarService.add('Remove '+device+' from group '+group);
    }

    removeAllInGroup(group) {
        this.unsafePublish('zigbee2mqtt/bridge/group/remove_all', group);
        this.snackBarService.add('Remove all from group '+group);
    }

    bindToDeviceOrGroup(srcName, targetName) {
        this.unsafePublish('zigbee2mqtt/bridge/bind/'+srcName, targetName);
        this.snackBarService.add('Bind '+srcName+' to '+targetName);
    }

    unBindFromDeviceOrGroup(srcName, targetName) {
        this.unsafePublish('zigbee2mqtt/bridge/unbind/'+srcName, targetName);
        this.snackBarService.add('Unbind '+srcName+' to '+targetName);
    }

    getGroupMemebership(name) {
        this.unsafePublish('zigbee2mqtt/bridge/device/'+name+'/get_group_membership', '');
    }

    testUnsubscribe(topic, fn) {
        let sub = this.mqttService.observe(topic).subscribe((message: IMqttMessage) => {
            fn(message);
            sub.unsubscribe();
            this.snackBarService.add('Unsubscribed '+topic);
        });

        setTimeout(() => {
            sub.unsubscribe();
            this.snackBarService.add('Timeout unsubscribed '+topic);
        }, 5000);
    }


}
