import { Injectable} from '@angular/core';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';

@Injectable()
export class SnackBarService {

    private snacksList = [];
    private snackref: MatSnackBarRef<any> = null;
    constructor(private snackBar: MatSnackBar) {}

    add(message: string, action: string = 'Close', duration: number = 2000) {
        this.snacksList.push({message: message, action: action, duration: duration});
        this.nextMessage();
    }

    nextMessage() {
        if(this.snacksList.length > 0 && this.snackref === null) {
            var snack = this.snacksList.pop();
            this.snackref = this.snackBar.open(snack.message, snack.action, {duration: snack.duration})
            this.snackref.afterDismissed()
            .subscribe(null, null, () => {
                this.snackref = null;
                this.nextMessage();
            });
        }
    }
}