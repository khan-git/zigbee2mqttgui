import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Zigbee2MqttService } from '../services/zigbee2mqtt.service';
import { FriendlyNameDialog } from '../dialogs/friendlyname.component';
import { SnackBarService } from '../services/snackbar.service';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css']
})
export class GroupsComponent implements OnInit {

  constructor(
    private z2mService: Zigbee2MqttService, 
    public dialog: MatDialog, 
    private snackBarService: SnackBarService) { }

  ngOnInit(): void {
  }

  getGroups() {
    return this.z2mService.getGroups();
  }

  addGroup() {
    const dialogRef = this.dialog.open(FriendlyNameDialog, {
      width: '250px',
      data: { title: 'Add group!', name: '' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result === undefined) {
        console.log("Canceled");
      }
      else {
        this.z2mService.unsafePublish('zigbee2mqtt/bridge/config/add_group', result);
        this.snackBarService.add('New group: '+result);
        this.z2mService.updateGroups();
      }
    });
  }
}
