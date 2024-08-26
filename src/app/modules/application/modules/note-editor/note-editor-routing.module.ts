import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NoteEditorComponent } from './note-editor.component';

const routes: Routes = [
  {
    path: '',
    component: NoteEditorComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NoteEditorRoutingModule { }
