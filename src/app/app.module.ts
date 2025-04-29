import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MqttModule, IMqttServiceOptions } from 'ngx-mqtt';
import { AppComponent } from './app.component';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import { ChatComponent } from './components/chat/chat.component';
import { LoginComponent } from './components/login/login.component';

import { AppRoutingModule } from './app-routing.module';

export const MQTT_SERVICE_OPTIONS: IMqttServiceOptions = {
  hostname: 'broker.hivemq.com',  // Exemple de broker public
  port: 8000,                      // WebSocket port
  path: '/mqtt',                  // souvent '/mqtt' pour WS
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
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
