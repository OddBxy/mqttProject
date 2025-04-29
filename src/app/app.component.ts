import { Component, OnInit } from '@angular/core';
import { MQTTCommunicationService } from './mqtt.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: false
})
export class AppComponent implements OnInit {
  message = '';
  messages: string[] = [];

  constructor(private mqttService: MQTTCommunicationService) {}

  ngOnInit(): void {
    this.mqttService.observeTopic('test/topic').subscribe((msg) => {
      this.messages.push(msg.payload.toString());
    });
  }

  send(): void {
    if (this.message.trim()) {
      this.mqttService.publish('test/topic', this.message);
      this.message = '';
    }
  }
}
