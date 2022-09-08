import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NfcService } from './nfc.service';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { CloudService } from './cloud.service';
import { BleService } from './ble.service';

export enum CalcType {
  NoCalc = 'NoCalc',
  Linear = 'Linear',
  Arc = 'Arc',
  Minutes = 'Minutes',
}

export interface iLsm6Cmd {
  btn_1?: string;
  btn_2?: string;
  btn_3?: string;
  btn_4?: string;
  btn_5?: string;
  btn_6?: string;
  dali_1?: string;
  dali_2?: string;
  dali_3?: string;
  dali_4?: string;
  dali_5?: string;
  dali_6?: string;
}

export function cmdByIndex(index: string, value: string): iLsm6Cmd {
  var ret: iLsm6Cmd = {};
  ret[index as keyof iLsm6Cmd] = value;
  return ret;
}

interface Serializable<T> {
  deserialize(input : iLsm6Data) : T;
}

export interface iLsm6Parameter {
  lsm?: {
    sp: number[];
    sl: number[][];
    si: number[];
    max: number[];
    min: number[];
  };
  sens?: {
    lt: number[];
    ot: number[];
    mo: number[];
  };
  dil?: number;
}

class LsmParameter implements Serializable<LsmParameter>{
  deserialize(input: iLsm6Data): LsmParameter {
    this.sp = input.lsm?.sp!;
    this.sl = input.lsm?.sl!;
    this.si = input.lsm?.si!;
    this.max = input.lsm?.max!;
    this.min = input.lsm?.min!;
    return this;
  }
  sp!: number[];
  sl!: number[][];
  si!: number[];
  max!: number[];
  min!: number[];
};

class SensParameter implements Serializable<SensParameter>{
  deserialize(input: iLsm6Data): SensParameter {
    this.lt = input.sens?.lt!;
    this.ot = input.sens?.ot!;
    this.mo = input.sens?.mo!;
    return this;
  }
  lt!: number[];
  ot!: number[];
  mo!: number[];
};

export class Lsm6Parameter implements iLsm6Parameter, Serializable<Lsm6Parameter> {
  deserialize(input: iLsm6Data): Lsm6Parameter {
    this.lsm = new LsmParameter().deserialize(input);
    this.sens = new SensParameter().deserialize(input);
    this.dil = input.dil;
    return this;
  }
  lsm?: LsmParameter;
  sens?: SensParameter;
  dil?: number;
}

export interface iLsm6Data extends iLsm6Parameter {
  lsm?: {
    dali: number[];
    sp: number[];
    sl: number[][];
    si: number[];
    of: number[];
    oa: number[];
    caof: number[];
    max: number[];
    min: number[];
  };
  sens?: {
    ls: number[];
    lt: number[];
    ot: number[];
    ts: number[];
    mo: number[];
    pot: number[];
  };
  fn?: string;
  btn?: boolean[];
  sw?: boolean[];
  tmp?: number;
  tic?: number;
  dil?: number;
  err?: number;
}

export const defLsm6Parameter: iLsm6Parameter = {
  lsm: {
    min: [96, 96, 96, 96, 96, 96],
    max: [254, 254, 254, 254, 254, 254],
    si: [0, 1, 2, 3, 4, 5],
    sp: [0, 0, 0, 0, 0, 0],
    sl: [
      [255, 255, 255, 255, 255, 255],
      [255, 255, 255, 255, 255, 255],
      [255, 255, 255, 255, 255, 255],
      [255, 255, 255, 255, 255, 255],
      [255, 255, 255, 255, 255, 255],
      [255, 255, 255, 255, 255, 255],
    ],
  },
  sens: {
    lt: [0, 0, 0, 0, 0, 0],
    ot: [0, 0, 0, 0, 0, 0],
    mo: [0, 0, 0, 0, 0, 0],
  },
  dil: 0,
};

export const defLsm6Data: iLsm6Data = {
  btn: [false, false, false, false, false, false],
  sw: [true, true, true, true, true, true],
  lsm: {
    min: [96, 96, 96, 96, 96, 96],
    max: [254, 254, 254, 254, 254, 254],
    of: [255, 255, 255, 255, 255, 255],
    si: [0, 1, 2, 3, 4, 5],
    dali: [0, 0, 0, 0, 0, 0],
    sp: [0, 0, 0, 0, 0, 0],
    sl: [
      [255, 255, 255, 255, 255, 255],
      [255, 255, 255, 255, 255, 255],
      [255, 255, 255, 255, 255, 255],
      [255, 255, 255, 255, 255, 255],
      [255, 255, 255, 255, 255, 255],
      [255, 255, 255, 255, 255, 255],
    ],
    caof: [254, 254, 254, 254, 254, 254],
    oa: [1, 1, 1, 1, 1, 1],
  },
  sens: {
    ls: [-1, -1, -1, -1, -1, -1],
    lt: [0, 0, 0, 0, 0, 0],
    ot: [0, 0, 0, 0, 0, 0],
    ts: [0, 0, 0, 0, 0, 0],
    mo: [0, 0, 0, 0, 0, 0],
    pot: [0, 0, 0, 0, 0, 0],
  },
  dil: 0,
  err: 0,
};

@Injectable()
export class Lsm6Service {
  public url = 'ws://lsm6:8088/echo';
  socket!: WebSocketSubject<Object>;
  nfcService = new NfcService();
  bleService = new BleService();
  messages!: Observable<Object>;
  cs: CloudService = new CloudService();
  constructor() { }

  public connect(host: string, cloudSessionId?: string) {
    if (host === 'nfc') {
      this.messages = this.nfcService.data.asObservable();
      this.nfcService.log.subscribe({
        next: (message: object) => {
          console.log('NFC: ' + message);
        },
        error: (err: string) => {
          'NFC_Error: ' + err;
        },
        complete: () => {
          'NFC closed';
        },
      });
      this.nfcService.connect();
      this.requstPrameter();
    } else if (host === 'ble') {
      this.bleService.connect();
      this.messages = this.bleService.asObservable();
    } else if (host === 'cloud' && cloudSessionId !== undefined) {
      this.url = this.cs.getMFTCloudURL(cloudSessionId, 'master');
      console.log('LSM6_Chat: ' + this.url);
      if (this.socket && !this.socket.closed) {
        this.socket.complete();
        console.log('LSM6_mes closed: ' + this.socket.closed);
      }
      this.socket = webSocket(this.url);
      this.messages = this.socket.asObservable();
    } else {
      this.url = 'ws://' + host + ':8088/echo';
      console.log('LSM6_Chat: ' + this.url);
      if (this.socket && !this.socket.closed) {
        this.socket.complete();
        console.log('LSM6_mes closed: ' + this.socket.closed);
      }
      this.socket = webSocket(this.url);
      this.messages = this.socket.asObservable();
    }
    if (cloudSessionId !== undefined && host !== 'cloud') {
      this.cs.connect(cloudSessionId);
      this.cs.messages.subscribe({
        next: (message: object) => {
          console.log('Cloud_Chat: ' + message);
          this.send(message);
        },
        error: (err: string) => {
          'Cloud_Error: ' + err;
        },
        complete: () => {
          'Cloud closed';
        },
      });
      this.messages.subscribe({
        next: (message: object) => {
          this.cs.send(message);
        },
        error: (err: string) => { },
        complete: () => { },
      });
    }
  }

  public closeSocket() {
    if (this.socket !== undefined) this.socket.complete();
    if (this.cs !== undefined) this.cs.closeSocket();
    this.bleService.disconnect();
  }

  public requstPrameter() {
    if (this.nfcService !== undefined) {
      this.nfcService.readTag();
    }
  }

  public send(message: object): void {
    // If the websocket is not connected then the QueueingSubject will ensure
    // that messages are queued and delivered when the websocket reconnects.
    // A regular Subject can be used to discard messages sent when the websocket
    // is disconnected.
    if (this.socket !== undefined && !this.socket.closed) {
      this.socket.next(message);
    }
    if (this.nfcService !== undefined && this.nfcService.ndef !== undefined) {
      this.nfcService.writeWithDummy(message);
    }
    this.bleService.write(message);
  }
} // end class ChatService
