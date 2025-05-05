import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {IMqttServiceOptions, MqttModule} from 'ngx-mqtt';
import {AppComponent} from './app.component';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {ChatComponent} from './components/chat/chat.component';
import {LoginComponent} from './components/login/login.component';
import {AppRoutingModule} from './app-routing.module';
import {MQTTCommunicationService} from './mqtt.service';
import {UserService} from './user.service';
import { DragAndDropComponent } from './components/drag-and-drop/drag-and-drop.component';

export const MQTT_SERVICE_OPTIONS: IMqttServiceOptions = {
  hostname: 'broker.hivemq.com',  // Public broker example
  port: 8000,                     // WebSocket port
  path: '/mqtt',                  // Often '/mqtt' for WS
  protocol: 'ws'
};

@NgModule({
  declarations: [AppComponent, ChatComponent, LoginComponent],
  imports: [
    BrowserModule,
    MqttModule.forRoot(MQTT_SERVICE_OPTIONS),
    AppRoutingModule,
    FormsModule,
    RouterModule,
    DragAndDropComponent,
  ],
  providers: [MQTTCommunicationService, UserService],
  bootstrap: [AppComponent],
})
export class AppModule {
}
