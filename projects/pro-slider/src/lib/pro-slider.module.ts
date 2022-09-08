import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { ProSliderComponent } from './pro-slider.component';

// import { DimmPipe } from 'pro-dimm-slider';
import { ProDimmSliderModule } from 'pro-dimm-slider';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [
    ProSliderComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ProDimmSliderModule,
    FontAwesomeModule
  ],
  // providers: [   
  //   DimmPipe
  // ],
  exports: [
    ProSliderComponent
  ]
})
export class ProSliderModule { }
