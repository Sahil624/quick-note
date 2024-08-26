import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApplicationComponent } from './application.component';

const routes: Routes = [
  {
    path: '',
    component: ApplicationComponent,
    children: [
      {
        path: 'create/:noteID',
        loadChildren: () => import('./modules/note-editor/note-editor.module').then(m => m.NoteEditorModule)
      },
      {
        path: 'create',
        loadChildren: () => import('./modules/note-editor/note-editor.module').then(m => m.NoteEditorModule)
      },
      {
        path: '',
        loadChildren: () => import('./modules/note-list/note-list.module').then(m => m.NoteListModule)
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApplicationRoutingModule { }
