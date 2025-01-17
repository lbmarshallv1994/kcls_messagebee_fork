/**
 * Core objects.
 * Note that core services are generally defined with
 * @Injectable({providedIn: 'root'}) so they are globally available
 * and do not require entry in our 'providers' array.
 */
import {NgModule} from '@angular/core';
import {CommonModule, DecimalPipe, DatePipe, CurrencyPipe} from '@angular/common';
import {FormatService, FormatValuePipe, OrgDateInContextPipe,
    DueDatePipe, SimpleDatePipe, SimpleDateTimePipe} from './format.service';

@NgModule({
  declarations: [
    FormatValuePipe,
    OrgDateInContextPipe,
    DueDatePipe,
    SimpleDatePipe,
    SimpleDateTimePipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    CommonModule,
    FormatValuePipe,
    OrgDateInContextPipe,
    DueDatePipe,
    SimpleDatePipe,
    SimpleDateTimePipe
  ],
  providers: [
    DatePipe,
    DecimalPipe
  ]
})

export class EgCoreModule {}

