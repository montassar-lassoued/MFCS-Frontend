import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs'; // IMessage importieren
import SockJS from 'sockjs-client';

@Injectable({ providedIn: 'root' })
export class VisuStateService {
  private stompClient: Client | null = null;
  public luEvent$ = new Subject<any>();

  connect() {
    this.stompClient = new Client({
      // SockJS-Fabrik
      webSocketFactory: () => new SockJS('http://localhost:8080/ws-visu'),

      // STOMP Optionen für Stabilität
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        // Hier den Typ IMessage hinzufügen!
        this.stompClient?.subscribe('/topic/events', (msg: IMessage) => {
          if (msg.body) {
            this.luEvent$.next(JSON.parse(msg.body));
          }
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      }
    });

    this.stompClient.activate();
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
    }
  }
}
