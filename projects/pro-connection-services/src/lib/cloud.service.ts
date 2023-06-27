import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root',
})
export class CloudService {
  readonly MFT_CLOUD_URL = 'ws://89.22.112.177:8088/mft';
  readonly MFT_CLOUD_SSL_URL = 'wss://mft.protronic-gmbh.com/mft';
  public url!: string;
  socket!: WebSocketSubject<Object>;
  messages!: Observable<Object>;

  constructor() {}

  public connect(sessionId: string) {
    this.url = this.getMFTCloudURL(sessionId, 'gateway');
    if (this.socket && !this.socket.closed) {
      this.socket.complete();
      console.log('Cloud_Chat closed: ' + this.socket.closed);
    }
    console.log('Cloud_Chat: ' + this.url);
    this.socket = webSocket(this.url);
    this.messages = this.socket.asObservable();
  }

  public getMFTCloudURL(id: string, mode: string): string {
    const wsProtocol =
      location.protocol == 'https:' || location.host == 'mft.protronic-gmbh.com'
        ? 'wss://'
        : 'ws://';
    const wsPort = location.port.length > 2 && location.port !== '4200' ? ':' + location.port : '';
    return wsProtocol + location.hostname + wsPort + '/mft/' + id + '/' + mode;
  }

  public closeSocket() {
    if (this.socket !== undefined) this.socket.complete();
  }

  public send(message: object): void {
    // If the websocket is not connected then the QueueingSubject will ensure
    // that messages are queued and delivered when the websocket reconnects.
    // A regular Subject can be used to discard messages sent when the websocket
    // is disconnected.
    if (this.socket !== undefined && !this.socket.closed) {
      this.socket.next(message);
    }
  }
}
