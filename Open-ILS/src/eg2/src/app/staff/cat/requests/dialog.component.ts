import {Component, Input, ViewChild} from '@angular/core';
import {Location} from '@angular/common';
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
import {ComboboxEntry} from '@eg/share/combobox/combobox.component';

@Component({
  selector: 'eg-item-request-dialog',
  templateUrl: 'dialog.component.html'
})

export class ItemRequestDialogComponent extends DialogComponent {

    request: IdlObject = null;
    requestId: number | null = null;

    statuses: ComboboxEntry[]  = [
        {id: 'pending',    label: $localize`Pending`},
        {id: 'processing', label: $localize`Processing`},
        {id: 'complete',   label: $localize`Complete`},
        {id: 'canceled',   label: $localize`Canceled`},
        {id: 'rejected',   label: $localize`Rejected`},
    ]

    languages = [
        $localize`English`,
        $localize`Spanish`,
        $localize`French`,
    ];

    languageEntries: ComboboxEntry[] = [];

    constructor(
        private modal: NgbModal,
        private ngLocation: Location,
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
        .toPromise().then(req => {
            this.request = req;
            this.languageEntries = [];
            if (this.hasCustomLang()) {
                this.languageEntries.push({id: req.language(), label: req.language()});
            }
            this.languages.forEach(l => this.languageEntries.push({id: l, label: l}));
        });
    }

    hasCustomLang(): boolean {
        if (this.request) {
            let lang = this.request.language();
            return lang !== null && !this.languages.includes(lang);
        }

        return false;
    }

    save(claim?: boolean): Promise<void> {
        if (claim) {
            this.request.claimed_by(this.auth.user().id());
            this.request.claim_date('now');
        }

        let promise = Promise.resolve();

        if (!this.request.route_to()) {
            promise = this.net.request(
                'open-ils.actor',
                'open-ils.actor.patron-request.get_route_to',
                this.auth.token(), this.request
            ).toPromise().then(routeTo => {
                console.log('Route-To calculated as ' + routeTo);
                this.request.route_to(routeTo);
            });
        }

        return promise.then(_ => {
            this.pcrud.update(this.request).toPromise()
            .then(_ => this.close(true))
        });
    }

    clearClaimedBy() {
        this.request.claimed_by(null);
        this.request.claim_date(null);
    }

    getStatus(): string {
        let req = this.request;

        if (!req)                { return 'pending'; }
        if (req.cancel_date())   { return 'canceled'; }
        if (req.reject_date())   { return 'rejected'; }
        if (req.claim_date())    { return 'processing'; }
        if (req.complete_date()) { return 'complete'; }

        return 'pending';
    }

    changeStatus(entry: ComboboxEntry) {
        console.log('STATUS SET TO ', entry);
        // TODO
    }

    createIll() {
        this.save().then(_ => this.createIllRequest());
    }

    createIllRequest() {
        let req = this.request;

        let url = '/staff/cat/ill/track?';
        url += `title=${encodeURIComponent(req.title())}`;
        url += `&patronBarcode=${encodeURIComponent(req.usr().card().barcode())}`;
        url += `&illno=${encodeURIComponent(req.illno())}`;

        url = this.ngLocation.prepareExternalUrl(url);

        window.open(url);
    }

}


