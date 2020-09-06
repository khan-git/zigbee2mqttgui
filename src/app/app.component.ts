import { Component, OnInit } from '@angular/core';
import { Zigbee2MqttService } from './services/zigbee2mqtt.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'zigbee2mqttgui';
  constructor(private zigbee2mqttservice: Zigbee2MqttService) {
  }

  getDevices() {return this.zigbee2mqttservice.getDevices();}
  getGroups() { return this.zigbee2mqttservice.getGroups();}
  getConfig() {return this.zigbee2mqttservice.getConfig();}

  ngOnInit() {
  }

  isConnected() {
    return this.zigbee2mqttservice.isConnected();
  }


  isJoinable() {
    return this.zigbee2mqttservice.config.permit_join;
  }

  coordinatorType() {
    return {'type': this.zigbee2mqttservice.config.coordinator.type, 'version': this.zigbee2mqttservice.config.version};
  }

  updateSystemView() {
    this,this.zigbee2mqttservice.updateSystemView();
  }

  filterRotary(device) {
    return (device.type === 'Rotary');
  }
}
