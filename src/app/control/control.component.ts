import { Component, OnInit } from '@angular/core';
import { Zigbee2MqttService } from '../services/zigbee2mqtt.service';
import { SnackBarService } from '../services/snackbar.service';

@Component({
  selector: 'app-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.css']
})
export class ControlComponent implements OnInit {

  log_level: string = 'info';
  log_levels = ['debug', 'info', 'warn','error'];

  constructor(private z2mService: Zigbee2MqttService,
    private snackBarService: SnackBarService) { }

  ngOnInit(): void {
  }

  togglePermitJoin() {
    this.z2mService.togglePermitJoin();
  }

  isJoinable() {
    return this.z2mService.config.permit_join;
  }

  touchLinkStart() {
    this.z2mService.touchLinkStart();
  }

  setLogLevel() {
    this.z2mService.unsafePublish('zigbee2mqtt/bridge/config/log_level', this.log_level);
    this.snackBarService.add('Set log level to '+this.log_level);    
  }
}
