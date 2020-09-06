import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


export interface GroupSelectionDialogData {
    title: string;
    groups: [];
    group: string;
  }
  
@Component({
    selector: 'groupselection-dialog',
    templateUrl: 'groupselection.dialog.html',
  })
  export class GroupSelectionDialog {
  
    constructor(
      public dialogRef: MatDialogRef<GroupSelectionDialog>,
      @Inject(MAT_DIALOG_DATA) public data: GroupSelectionDialogData) {}
  
    onNoClick(): void {
      this.dialogRef.close();
    }
  
  }
  