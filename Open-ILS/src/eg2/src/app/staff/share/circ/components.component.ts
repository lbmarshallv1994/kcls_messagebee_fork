import {Component, OnInit, Output, Input, ViewChild, EventEmitter} from '@angular/core';
import {CircService} from './circ.service';
import {PrecatCheckoutDialogComponent} from './precat-dialog.component';
import {CircEventsComponent} from './events-dialog.component';
import {StringComponent} from '@eg/share/string/string.component';
import {AlertDialogComponent} from '@eg/share/dialog/alert.component';

/* Container component for sub-components used by circulation actions.
 *
 * The CircService has to launch various dialogs for processing checkouts,
 * checkins, etc.  The service itself cannot contain components directly,
 * so we compile them here and provide references.
 * */

@Component({
  templateUrl: 'components.component.html',
  selector: 'eg-circ-components'
})
export class CircComponentsComponent {

    @ViewChild('precatDialog') precatDialog: PrecatCheckoutDialogComponent;
    @ViewChild('circEventsDialog') circEventsDialog: CircEventsComponent;
    @ViewChild('routeToCatalogingDialog') routeToCatalogingDialog: AlertDialogComponent;

    constructor(private circ: CircService) {
        this.circ.components = this;
    }
}
