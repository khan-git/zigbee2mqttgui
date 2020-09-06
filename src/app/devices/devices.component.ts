import { Component, OnInit } from '@angular/core';
import { Zigbee2MqttService } from '../services/zigbee2mqtt.service';

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.css']
})
export class DevicesComponent implements OnInit {

  constructor(private z2mService: Zigbee2MqttService) { 

  }

  ngOnInit(): void {
  }

  getDevices() {
    return this.z2mService.getDevices();
  }

}
