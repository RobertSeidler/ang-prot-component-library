import { Injectable } from '@angular/core';
import { fromEvent, Observer, Subject } from 'rxjs';
import { defLsm6Parameter } from './lsm6.service';

@Injectable({
  providedIn: 'root',
})
export class NfcService implements Observer<Object> {
  data: Subject<Object> = new Subject();
  log: Subject<Object> = new Subject();
  ndef: NDEFReader | undefined;
  buffer: any | undefined;

  test = "{\"btn\":[0,0,0,0,0,0],\"sw\":[1,1,1,1,1,1],\"lsm\":{\"min\":[96,96,96,96,96,96],\"max\":[254,254,254,254,254,254],\"of\":[255,255,255,255,255,255],\"si\":[0,0,1,1,4,5],\"dali\":[0,0,0,0,0,0],\"sp\":[400,200,400,200,0,0],\"sl\":[[254,254,255,255,255,255],[120,120,255,255,255,255],[255,254,255,255,255,255],[255,120,255,255,255,255],[254,254,255,255,255,255],[255,255,255,255,255,255]],\"oa\":[1,1,1,1,1,1]},\"sens\":{\"ls\":[-1,-1,-1,-1,-1,-1],\"lt\":[0,0,0,0,0,0],\"ts\":[0,0,0,0,0,0],\"mo\":[1032,8,264,520,1032,0]},\"dil\":0,\"err\":0}\r\n\r\n";
  writeInProgress = false;

  async connect() {
    this.log.next('Requesting NFC permission...');
    if ('NDEFReader' in window) {
      this.ndef = new NDEFReader();
      fromEvent(this.ndef, 'reading').subscribe(this);
    }

    this.log.next("edmit default message")
    this.data.next(defLsm6Parameter);
  }

  next(event: any) {
    if (this.ndef) {
      if (this.buffer && !this.writeInProgress) {
        // Check if we want to write to this tag, or reject.
        this.ndef.write(this.buffer)
          .catch(error => {
            this.log.next(error);
          })
          .finally(() => {
            this.log.next('We wrote to a tag! Records:');
            this.nextMessage(this.buffer);
            this.buffer = undefined;
          });
        this.writeInProgress = true;
      } else {
        this.log.next('Red Records:');
        this.nextMessage(event.message);
      }
    }
  }

  nextMessage(message: any) {
    const decoder = new TextDecoder();
    for (const record of message.records) {
      this.log.next('Record type:  ' + record.recordType);
      this.log.next('MIME type:    ' + record.mediaType);
      this.log.next('=== data ===\n' + decoder.decode(record.data));
      this.data.next(JSON.parse(decoder.decode(record.data)));
    }
  }

  error(e: any) {
    this.log.error(e);
  }

  complete() { }

  async readTag() {
    if (!this.ndef) {
      this.log.next('Web NFC is not supported.');
    } else {
      try {
        await this.ndef.scan();
      } catch (error: any) {
        this.log.next(error);
      }
    }
  }

  async writeTag(message: Object) {
    const ndef = new NDEFReader();
    const encoder = new TextEncoder();
    const jsonRecord = {
      recordType: 'mime',
      mediaType: 'application/json',
      data: encoder.encode(JSON.stringify(message)),
    };
    ndef
      .write({ records: [jsonRecord] })
      .then(() => {
        this.log.next('Message written.');
      })
      .catch((error) => {
        this.log.next(`Write failed :-( try again: ${error}.`);
      });
  }

  async writeWithDummy(message: Object) {
    const ndef = new NDEFReader();
    const encoder = new TextEncoder();
    const jsonRecord = {
      recordType: 'mime',
      mediaType: 'application/json',
      data: encoder.encode(JSON.stringify(message)),
    };
    this.buffer = { records: [jsonRecord] };
    this.writeInProgress = false;
//    await ndef.scan();
  }
}
