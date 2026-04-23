import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs'; // IMessage importieren
import SockJS from 'sockjs-client';

@Injectable({ providedIn: 'root' })
export class VisuStateService {
  private stompClient: Client | null = null;
  public luEvent$ = new Subject<any>();

  connect() {
    // 1. WICHTIG: Wenn bereits verbunden oder im Verbindungsaufbau, brich ab!
    if (this.stompClient?.active) {
      console.log('STOMP: Bereits aktiv. Kein neuer Verbindungsaufbau nötig.');
      return;
    }

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws-visu'),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: (frame) => {
        console.log('STOMP Connected: ' + frame);

        // Nur subscriben, wenn wir wirklich verbunden sind
        if (this.stompClient && this.stompClient.connected) {
          // Wir speichern die Subscription nicht lokal, da wir nur ein Topic haben
          this.stompClient.subscribe('/topic/events', (msg: IMessage) => {
            if (msg.body) {
              try {
                this.luEvent$.next(JSON.parse(msg.body));
              } catch (e) {
                console.error('Parsing Error', e);
              }
            }
          });
        }
      },
      // ... restlicher Code (onStompError, etc.)
    });

    this.stompClient.activate();
  }
  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
    }
  }
}
