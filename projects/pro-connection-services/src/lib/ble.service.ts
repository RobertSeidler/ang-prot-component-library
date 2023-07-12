import { Injectable } from '@angular/core';
import { AnonymousSubject } from 'rxjs/internal/Subject';

const UART_SERVICE_UUID = '0000fe40-cc7a-482a-984a-7f2ed5b3e58f';

// Allows the micro:bit to transmit a byte array
const UART_TX_CHARACTERISTIC_UUID = '0000fe42-8e22-4541-9d4c-21edae82ed19';

// Allows a connected client to send a byte array
const UART_RX_CHARACTERISTIC_UUID = '0000fe41-8e22-4541-9d4c-21edae82ed19';

@Injectable({
  providedIn: 'root',
})
export class BleService extends AnonymousSubject<Object> {
  bleDevice: BluetoothDevice | undefined;
  rxCharacteristic: BluetoothRemoteGATTCharacteristic | undefined;

  constructor() {
    super();
  }

  async connect() {
    try {
      console.log('Requesting Bluetooth Device...');
      this.bleDevice = await navigator.bluetooth.requestDevice({
        //filters: [{ namePrefix: 'BBC micro:bit' }],
        acceptAllDevices: true,
        optionalServices: [UART_SERVICE_UUID],
      });

      if (!this.bleDevice.gatt) {
        console.log('Bluetooth Device init wrong!');
        return;
      }

      console.log('Connecting to GATT Server...');
      const server = await this.bleDevice.gatt.connect();

      console.log('Getting Service...');
      const service = await server.getPrimaryService(UART_SERVICE_UUID);

      console.log('Getting Characteristics...');
      const txCharacteristic = await service.getCharacteristic(
        UART_TX_CHARACTERISTIC_UUID
      );
      txCharacteristic.startNotifications();
      txCharacteristic.addEventListener(
        'characteristicvaluechanged',
        this.onTxCharacteristicValueChanged
      );
      this.rxCharacteristic = await service.getCharacteristic(
        UART_RX_CHARACTERISTIC_UUID
      );
    } catch (error) {
      console.log(error);
      super.error(error);
    }
  }

  disconnect() {
    if (!this.bleDevice || !this.bleDevice.gatt) {
      return;
    }

    if (this.bleDevice.gatt.connected) {
      this.bleDevice.gatt.disconnect();
      console.log('Disconnected');
      super.complete();
    }
  }

  async write(message: object) {
    if (!this.rxCharacteristic) {
      return;
    }

    try {
      let encoder = new TextEncoder();
      this.rxCharacteristic.writeValue(encoder.encode(JSON.stringify(message)));
    } catch (error) {
      console.log(error);
      super.error(error);
    }
  }

  onTxCharacteristicValueChanged(event: any) {
    let receivedData = [];
    for (var i = 0; i < event.target.value.byteLength; i++) {
      receivedData[i] = event.target.value.getUint8(i);
    }

    const receivedString = String.fromCharCode.apply(null, receivedData);
    console.log(receivedString);
    super.next(JSON.parse(receivedString));
    if (receivedString === 'S') {
      console.log('Shaken!');
    }
  }
}
