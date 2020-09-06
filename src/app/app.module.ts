import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MqttModule } from 'ngx-mqtt';
import { FormsModule } from '@angular/forms';

import { MatTabsModule} from '@angular/material/tabs';
import { MatIconModule} from '@angular/material/icon';
import { MatExpansionModule} from '@angular/material/expansion';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule} from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';


import { ControlComponent } from './control/control.component';
import { DevicesComponent } from './devices/devices.component';
import { DeviceComponent } from './devices/device/device.component';

import { MQTT_SERVICE_OPTIONS, Zigbee2MqttService } from './services/zigbee2mqtt.service';
import { SnackBarService } from './services/snackbar.service';
import { GroupsComponent } from './groups/groups.component';
import { GroupComponent } from './groups/group/group.component';

import { ModelNamePipe, FilterDevicePipe } from './devices/modelname.pipe';
import { DialogsComponent } from './dialogs/dialogs.component';
import { FriendlyNameDialog } from './dialogs/friendlyname.component';
import { GroupSelectionDialog } from './dialogs/groupselection.component';

@NgModule({
  declarations: [
    AppComponent,
    ControlComponent,
    DevicesComponent,
    DeviceComponent,
    GroupsComponent,
    GroupComponent,
    ModelNamePipe,
    FilterDevicePipe,
    FriendlyNameDialog,
    DialogsComponent,
    FriendlyNameDialog,
    GroupSelectionDialog
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MqttModule.forRoot(MQTT_SERVICE_OPTIONS),
    MatTabsModule,
    MatIconModule,
    MatExpansionModule,
    MatToolbarModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSnackBarModule,
    MatButtonModule,
    MatSelectModule
    ],
  providers: [
    Zigbee2MqttService,
    SnackBarService
    ],
  bootstrap: [AppComponent]
})
export class AppModule { }
