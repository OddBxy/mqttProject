import { Injectable } from '@angular/core';
import { IMqttMessage, MqttService } from 'ngx-mqtt';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MQTTCommunicationService {
  constructor(private mqttService: MqttService) {}

  // Souscription à un topic
  observeTopic(topic: string): Observable<IMqttMessage> {
    return this.mqttService.observe(topic);
  }

  // Publication d'un message
  publish(topic: string, message: string): void {
    this.mqttService.unsafePublish(topic, message, { qos: 1, retain: false });
  }
}
