import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { ProSelectComponentComponent } from './pro-select-component.component';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgSelectModule } from '@ng-select/ng-select';


@NgModule({
  declarations: [
    ProSelectComponentComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    FontAwesomeModule,
    NgSelectModule
  ],
  exports: [
    ProSelectComponentComponent
  ]
})
export class ProSelectModule { }
