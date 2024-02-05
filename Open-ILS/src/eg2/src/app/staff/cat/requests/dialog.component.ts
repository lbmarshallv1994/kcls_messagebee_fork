import {Component, Input, ViewChild} from '@angular/core';
import {NetService} from '@eg/core/net.service';
import {IdlObject} from '@eg/core/idl.service';
import {EventService} from '@eg/core/event.service';
import {ToastService} from '@eg/share/toast/toast.service';
import {AuthService} from '@eg/core/auth.service';
import {PcrudService} from '@eg/core/pcrud.service';
import {OrgService} from '@eg/core/org.service';
import {switchMap} from 'rxjs/operators';
import {Observable, from, throwError} from 'rxjs';
import {DialogComponent} from '@eg/share/dialog/dialog.component';
import {NgbModal, NgbModalOptions} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'eg-item-request-dialog',
  templateUrl: 'dialog.component.html'
})

export class ItemRequestDialogComponent extends DialogComponent {

    requestId: number | null = null;
    request: IdlObject = null;

    constructor(
        private modal: NgbModal,
        private toast: ToastService,
        private net: NetService,
        private evt: EventService,
        private pcrud: PcrudService,
        private org: OrgService,
        private auth: AuthService) {
        super(modal); // required for subclassing
    }

    open(args: NgbModalOptions): Observable<boolean> {
        this.request = null;

        if (!this.requestId) {
            return throwError('request ID required');
        }

        // Fire data loading observable and replace results with
        // dialog opener observable.
        return from(this.loadRequest()).pipe(switchMap(_ => super.open(args)));
    }

    loadRequest(): Promise<void> {
        const flesh = {
            flesh: 2,
            flesh_fields: {
                auir: ['usr', 'claimed_by'],
                au: ['card']
            }
        };

        return this.pcrud.retrieve('auir', this.requestId, flesh)
        .toPromise().then(req => this.request = req);
    }

    save() {
        this.pcrud.update(this.request).toPromise().then(_ => this.close(true));
    }
}


