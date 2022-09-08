import { Pipe, PipeTransform } from '@angular/core';
// import { CalcType } from '../../../pro-connection-services/src/public-api';
import { CalcType } from 'pro-connection-services';

@Pipe({
  name: 'dimm'
})

export class DimmPipe implements PipeTransform {
  transform(value: number, type: CalcType = CalcType.Arc, fractionDigits?: number): string {
    let percent: number = value;
    let result: string;
    if (
      value == null ||
      ((type === CalcType.Arc || type === CalcType.Linear) && (percent === 255))
    ) {
      result = '';
    } else if ((type === CalcType.Arc || type === CalcType.Linear) && percent === 1) {
      result = (0.1).toFixed(fractionDigits);
    } else if ((type === CalcType.Arc || type === CalcType.Linear) && percent === 0) {
      result = (0).toFixed(fractionDigits);
    } else {
      switch (type) {
        case CalcType.Arc:
          percent = Math.pow(10, (percent - 1) / (253.0 / 3) - 1);
          // percent = percent * 100 / 254;
          result = percent.toFixed(fractionDigits);
          break;

        case CalcType.Linear:
          percent = percent * 100 / 254;
          result = percent.toFixed(fractionDigits);
          break;

        case CalcType.Minutes:
          percent = percent / 60000;
          result = percent.toString();
          break;

        default:
          result = percent.toFixed(fractionDigits);
          break;
      }
    }
    // console.log('-> ' + result + ' ' + percent + ' ' + ' ' + type + ' ' + value);
    return result;
  }

  transformBack(value: number, type: CalcType = CalcType.Arc, min?: number, max?: number): number {
    let percent: number = value;
    if (max != null && percent > max) {
      percent = max;
    }
    if (min != null && percent < min) {
      percent = min;
    }
    switch (type) {
      case CalcType.Arc:
        // percent = percent * 254 / 100;
        percent = percent >= 0.1 ? (Math.log10(percent) + 1) * (253.0 / 3) + 1 : 0;
        break;

      case CalcType.Linear:
        percent = percent * 254 / 100;
        break;

      case CalcType.Minutes:
        percent = percent * 60000;
        break;

      default:
        break;
    }
    // console.log('<- ' + Math.round(percent) + ' ' + percent + ' ' + ' ' + type + ' ' + value);
    return Math.round(percent);
  }
}
