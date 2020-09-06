import { Component, OnInit, Input } from '@angular/core';
import { Zigbee2MqttService } from 'src/app/services/zigbee2mqtt.service';
import { MatDialog } from '@angular/material/dialog';
import { FriendlyNameDialog } from '../../dialogs/friendlyname.component';
import { SnackBarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent {

  @Input() group: any;
  constructor(private z2mService: Zigbee2MqttService,
    private dialog: MatDialog,
    private snackBarService: SnackBarService) { }

  renameGroup() {
    let currentName = this.group.friendly_name;
    const dialogRef = this.dialog.open(FriendlyNameDialog, {
      width: '250px',
      data: { title: 'Rename group!', name: currentName }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result === undefined) {
        console.log("Canceled");
      }
      else {
        this.z2mService.renameGroup(currentName, result);
      }
    });
  }

  removeGroup() {
    this.z2mService.unsafePublish('zigbee2mqtt/bridge/config/remove_group', this.group.friendly_name);
    this.snackBarService.add('Removing group: ' + this.group.friendly_name);
    this.z2mService.updateGroups();
  }

  removeAll() {
    this.z2mService.removeAllInGroup(this.group.friendly_name);
  }

}
