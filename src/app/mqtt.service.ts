import {Injectable} from '@angular/core';
import {IMqttMessage, MqttService} from 'ngx-mqtt';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MQTTCommunicationService {
  constructor(private mqttService: MqttService) {
  }

  /**
   * Observe messages from a specific MQTT topic
   * @param topic The topic to subscribe to
   * @returns Observable of MQTT messages
   */
  observeTopic(topic: string): Observable<IMqttMessage> {
    return this.mqttService.observe(topic);
  }

  /**
   * Publish a message to an MQTT topic
   * @param topic The topic to publish to
   * @param message The message to publish
   */
  publish(topic: string, message: string): void {
    this.mqttService.unsafePublish(topic, message, {
      qos: 2,
      retain: false
    });
  }

}
