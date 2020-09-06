import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


export interface FriendlynameDialogData {
    title: string;
    name: string;
  }
  
@Component({
    selector: 'friendlyname-dialog',
    templateUrl: 'friendlyname.dialog.html',
  })
  export class FriendlyNameDialog {
  
    constructor(
      public dialogRef: MatDialogRef<FriendlyNameDialog>,
      @Inject(MAT_DIALOG_DATA) public data: FriendlynameDialogData) {}
  
    onNoClick(): void {
      this.dialogRef.close();
    }
  
  }
  