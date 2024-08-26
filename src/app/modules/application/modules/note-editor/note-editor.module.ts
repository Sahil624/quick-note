import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoteEditorRoutingModule } from './note-editor-routing.module';
import { NgxEditorModule } from 'ngx-editor';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NoteEditorRoutingModule,
    NgxEditorModule
  ]
})
export class NoteEditorModule { }
