import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NoteService } from '../../services/note/note.service';
import { Note } from '../../services/note/note.model';
import { Observable } from 'rxjs';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'qn-note-list',
  standalone: true,
  imports: [MatCardModule, CommonModule, MatIconModule, MatButtonModule, RouterModule],
  templateUrl: './note-list.component.html',
  styleUrl: './note-list.component.scss'
})
export class NoteListComponent {
  notes!: Observable<Note[]>;

  constructor(
    private noteService: NoteService
  ) { }

  ngOnInit() {
    this.notes = this.noteService.getNotes();
  }
}
