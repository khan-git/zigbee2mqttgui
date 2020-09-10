import { Component, OnInit, Inject, Input } from '@angular/core';
import { Zigbee2MqttService } from 'src/app/services/zigbee2mqtt.service';
import { FriendlyNameDialog } from '../../dialogs/friendlyname.component';
import { GroupSelectionDialog } from '../../dialogs/groupselection.component';
import { MatDialog } from '@angular/material/dialog';
import { IMqttClient, IMqttMessage } from 'ngx-mqtt';
import { SnackBarService } from 'src/app/services/snackbar.service';
import { group } from 'console';

@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.css']
})
export class DeviceComponent implements OnInit {

  @Input() device: any = {friendly_name: 'Unknown'};

  ngOnInit(): void {
  }

  getDeviceExtended(networkAddress) {
    return this.z2mService.getDeviceExtended(networkAddress);
  }

  constructor(public dialog: MatDialog, 
    private z2mService: Zigbee2MqttService) {}

  renameDevice() {
    const dialogRef = this.dialog.open(FriendlyNameDialog, {
      width: '250px',
      data: { title: 'Rename device!', name: this.device.friendly_name }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result === undefined) {
        console.log("Canceled");
      }
      else {
        this.z2mService.renameDevice(this.device.friendly_name, result);
      }
    });
  }

  removeDevice() {
    this.z2mService.removeDevice(this.device.friendly_name);
  }

  addToGroup() {
    const dialogRef = this.dialog.open(GroupSelectionDialog, {
      width: '250px',
      data: { title: 'Add to group!', groups: this.z2mService.getGroups(), group:'' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result === undefined) {
        console.log("Canceled");
      }
      else {
        this.z2mService.addToGroup(this.device.friendly_name, result);
      }
    });
  }

  bindToGroup() {
    const dialogRef = this.dialog.open(GroupSelectionDialog, {
      width: '250px',
      data: { title: 'Bind to group!', groups: this.z2mService.getGroups(), group:'' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result === undefined) {
        console.log("Canceled");
      }
      else {
        this.z2mService.bindToDeviceOrGroup(this.device.friendly_name, result);
      }
    });
  }

  bindToDevice() {
    const dialogRef = this.dialog.open(GroupSelectionDialog, {
      width: '250px',
      data: { title: 'Bind to device!', groups: this.z2mService.getDevices(), group:'' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result === undefined) {
        console.log("Canceled");
      }
      else {
        this.z2mService.bindToDeviceOrGroup(this.device.friendly_name, result);
      }
    });
  }
  
  unBindFromGroup() {
    const dialogRef = this.dialog.open(GroupSelectionDialog, {
      width: '250px',
      data: { title: 'Unbind from group!', groups: this.z2mService.getGroups(), group:'' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result === undefined) {
        console.log("Canceled");
      }
      else {
        this.z2mService.unBindFromDeviceOrGroup(this.device.friendly_name, result);
      }
    });
  }

  unbindDefaultGroup() {
    this.z2mService.unBindFromDeviceOrGroup(this.device.friendly_name, 'default_bind_group');
  }

  removeForceDevice() {
    this.z2mService.removeDevice(this.device.friendly_name, true);
  }

  toggleState() {
    this.z2mService.unsafePublish('zigbee2mqtt/'+this.device.friendly_name+'/get', 'state');
    setTimeout(() => {
      let dExt = this.z2mService.getDeviceExtended(this.device.networkAddress);
      if( dExt ) {
        this.z2mService.unsafePublish('zigbee2mqtt/'+this.device.friendly_name+'/set/state', dExt.state == 'ON' ? 'OFF':'ON');
      }
    }, 500);
  }

  getGroupMembership() {
    this.z2mService.getGroupMemebership(this.device.friendly_name);
  }

  removeFromGroup(anyGroup=false) {
    /* Complex operation:
    ** Setup subscripe for group membership
    ** Upon respons, ask which group to remove and send remove command
    */

    this.z2mService.testUnsubscribe('zigbee2mqtt/'+this.device.friendly_name+'/group_list', (message:IMqttMessage) => {
      let groupsId: object[] = JSON.parse('['+message.payload.toString()+']');
      let groups = this.z2mService.getGroups();
      var groupsFiltered = groups;
      if(!anyGroup) {
        groupsFiltered = groups.filter((g, i, groupA) => {
          return groupsId.includes(g.ID);
        });  
      }
      const dialogRef = this.dialog.open(GroupSelectionDialog, {
        width: '250px',
        data: { title: 'Remote from group', groups: groupsFiltered, group:'' }
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if(result === undefined) {
          console.log("Canceled");
        }
        else {
          console.log("Group selected: "+result);
          this.z2mService.removeFromGroup(this.device.friendly_name, result);
        }
      });  
    });
    this.z2mService.getGroupMemebership(this.device.friendly_name);
  }

  checkOTA() {
    this.z2mService.unsafePublish("zigbee2mqtt/bridge/ota_update/check", this.device.friendly_name);
  }
}
