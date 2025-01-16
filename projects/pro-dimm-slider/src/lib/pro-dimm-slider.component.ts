import { CalcType, DimmPipe } from './dimm.pipe';
import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { faCertificate, faPowerOff } from '@fortawesome/free-solid-svg-icons';
import { faLightbulb, faCircle } from '@fortawesome/free-regular-svg-icons';

@Component({
    selector: 'app-pro-dimm-slider',
    templateUrl: './pro-dimm-slider.component.html',
    styleUrls: ['./pro-dimm-slider.component.css'],
    standalone: false
})
export class ProDimmSliderComponent implements OnInit {

  @Input() dimmValue!: number;
  @Input() channel!: number;
  @Input() id!: String;
  @Input() detail: String = '';
  @Input() sceneSlider = true;
  @Input() disabled = false;
  @Output() dimmValueChange = new EventEmitter<number>();
  rangeValue!: number;
  public clacType: typeof CalcType = CalcType;

  faCircle = faCircle;
  faLightbulb = faLightbulb;
  faCertificate = faCertificate;
  faPowerOff = faPowerOff;

  constructor(private calcPipe: DimmPipe) { }

  ngOnInit() { }

  completeValueChange(field: string, value: boolean, disable: boolean) { }

  setDimm(newDimm: number): void {
    this.dimmValue = this.calcPipe.transformBack(newDimm);
    this.dimmValueChange.emit(this.dimmValue);
  }

  toggleActive(): void {
    if (this.sceneSlider) {
      if (this.dimmValue !== 255) {
        this.dimmValue = 255;
      } else {
        this.dimmValue = 254;
      }
    } else {
      if (this.dimmValue === 0) {
        this.dimmValue = 254;
      } else {
        this.dimmValue = 0;
      }
    }
    this.dimmValueChange.emit(this.dimmValue);
  }

  getCBVal(): boolean {
    if (this.sceneSlider) {
      return this.dimmValue !== 255;
    } else {
      return this.dimmValue !== 0;
    }
  }

  getEventTargetsValueAsNumber(e: Event): number {
    let eventTarget = e.target;
    if (eventTarget === null || eventTarget === undefined) return this.dimmValue;
    return (eventTarget as HTMLInputElement).valueAsNumber;
  }

}
