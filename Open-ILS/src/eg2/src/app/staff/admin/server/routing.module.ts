import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminServerSplashComponent} from './admin-server-splash.component';
import {BasicAdminPageComponent} from '@eg/staff/admin/basic-admin-page.component';
import {OrgUnitTypeComponent} from './org-unit-type.component';
import {PrintTemplateComponent} from './print-template.component';
import {PermGroupTreeComponent} from './perm-group-tree.component';

const routes: Routes = [{
    path: 'splash',
    component: AdminServerSplashComponent
}, {
    path: 'actor/org_unit_type',
    component: OrgUnitTypeComponent
}, {
    path: 'config/coded_value_map',
    loadChildren: () =>
      import('./coded-value-maps/coded-value-maps.module').then(m => m.CodedValueMapsModule)
}, {
    path: 'config/floating_group',
    loadChildren: () =>
      import('./floating-group/floating-group.module').then(m => m.FloatingGroupModule)
}, {
    path: 'config/hard_due_date',
    component: BasicAdminPageComponent,
    data: [{
        schema: 'config',
        table: 'hard_due_date',
        fieldOrder: 'name,owner,ceiling_date,forceto'
    }]
}, {
    path: 'config/print_template',
    component: PrintTemplateComponent
}, {
    path: 'config/rule_recurring_fine',
    component: BasicAdminPageComponent,
    data: [{
        schema: 'config',
        table: 'rule_recurring_fine',
        fieldOrder: 'name,low,normal,high,recurrence_interval,grace_period'
    }]
}, {
    path: 'config/z3950_source',
    component: BasicAdminPageComponent,
    data: [{
        schema: 'config',
        table: 'z3950_source',
        fieldOrder: 'name,label,host,port,db,record_format,transmission_format,auth,use_perm'
    }]
}, {
    path: 'permission/grp_tree',
    component: PermGroupTreeComponent
}, {
    path: 'actor/org_unit',
    loadChildren: () =>
      import('./org-unit.module').then(m => m.OrgUnitModule)
}, {
    path: 'actor/org_unit_proximity_adjustment',
    component: BasicAdminPageComponent,
    data: [{schema: 'actor',
        table: 'org_unit_proximity_adjustment', disableOrgFilter: true}]
}, {
    path: 'asset/call_number_prefix',
    component: BasicAdminPageComponent,
    data: [{schema: 'asset',
        table: 'call_number_prefix', readonlyFields: 'label_sortkey'}]
}, {
    path: 'asset/call_number_suffix',
    component: BasicAdminPageComponent,
    data: [{schema: 'asset',
        table: 'call_number_suffix', readonlyFields: 'label_sortkey'}]
}, {
    path: 'sip/account',
    loadChildren: () =>
      import('./sip/account.module').then(m => m.SipAccountModule)
}, {
    path: 'sip/screen_message',
    component: BasicAdminPageComponent,
    data: [{schema: 'sip',
        table: 'screen_message', readonlyFields: 'key'}]
}, {
    path: 'sip/filter',
    component: BasicAdminPageComponent,
    data: [{schema: 'sip', table: 'filter', readonlyFields: 'key'}]
}, {
    path: ':schema/:table',
    component: BasicAdminPageComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class AdminServerRoutingModule {}
