import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { ProSelectComponent } from './pro-select.component';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgSelectModule } from '@ng-select/ng-select';


@NgModule({
  declarations: [
    ProSelectComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    FontAwesomeModule,
    NgSelectModule
  ],
  exports: [
    ProSelectComponent
  ]
})
export class ProSelectModule { }
