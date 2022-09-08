import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { ProDimmSliderComponent } from './pro-dimm-slider.component';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DimmPipe } from './dimm.pipe';

@NgModule({
  declarations: [
    ProDimmSliderComponent,
    DimmPipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    FontAwesomeModule,
  ],
  providers: [
    DimmPipe
  ],
  exports: [
    ProDimmSliderComponent,
    DimmPipe
  ]
})
export class ProDimmSliderModule { }
