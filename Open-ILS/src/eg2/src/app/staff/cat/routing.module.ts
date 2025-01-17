import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {BibByIdentComponent} from './bib-by-ident.component';

const routes: Routes = [{
  path: 'vandelay',
  loadChildren: () =>
    import('./vandelay/vandelay.module').then(m => m.VandelayModule)
}, {
  path: 'authority',
  loadChildren: () =>
    import('./authority/authority.module').then(m => m.AuthorityModule)
}, {
  path: 'marcbatch',
  loadChildren: () =>
    import('./marcbatch/marcbatch.module').then(m => m.MarcBatchModule)
}, {
  path: 'marcsr',
  loadChildren: () =>
    import('./marcsr/marcsr.module').then(m => m.MarcSearchReplaceModule)
}, {
  path: 'requests',
  loadChildren: () =>
    import('./requests/requests.module').then(m => m.ItemRequestModule)
}, {
  path: 'bib-from/:identType',
  component: BibByIdentComponent
}, {
  path: 'volcopy',
  loadChildren: () =>
    import('./volcopy/volcopy.module').then(m => m.VolCopyModule)
}, {
  path: 'ill',
  loadChildren: () => import('./ill/ill.module').then(m => m.IllModule)
}, {
  path: 'item',
  loadChildren: () => import('./item/item.module').then(m => m.ItemModule)
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class CatRoutingModule {}
