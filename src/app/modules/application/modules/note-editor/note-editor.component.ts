import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Editor } from 'ngx-editor';
import { NgxEditorModule } from 'ngx-editor';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';
import { Note } from '../../services/note/note.model';
import { NoteService } from '../../services/note/note.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'qn-note-editor',
  standalone: true,
  imports: [NoteEditorComponent, NgxEditorModule, CommonModule, FormsModule, ReactiveFormsModule, RouterModule, MatIconModule, MatButtonModule, MatSnackBarModule],
  templateUrl: './note-editor.component.html',
  styleUrl: './note-editor.component.scss'
})
export class NoteEditorComponent implements OnInit, OnDestroy {
  editor!: Editor;
  html = '';
  control = new FormControl();
  private contentChanged: Subject<string> = new Subject<string>();  // Subject to track changes
  private contentChangedSubscription!: Subscription;  // To hold the subscription
  private currentNoteId: string | null = null;  // Track the current note ID

  constructor(
    private noteService: NoteService,
    private activatedRoute: ActivatedRoute,
    private snackbar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.currentNoteId = params['noteID'];
      if (this.currentNoteId) {
        this.noteService.getNoteById(this.currentNoteId).subscribe(note => {
          this.editor.setContent(note.content);
        });
      } else {
        this.editor.setContent('');
      }
    });

    this.editor = new Editor();
    // Debounce the content changes to avoid rapid save operations
    this.contentChangedSubscription = this.contentChanged.pipe(
      debounceTime(1000),  // 1 second delay
      distinctUntilChanged()  // Only emit when the value changes
    ).subscribe(content => {
      this.autoSave(content);  // Auto-save the content
    });
  }

  // Handle content changes and emit the change event to the subject
  onContentChange(content: string): void {
    this.contentChanged.next(content);  // Emit the content change to be debounced
  }

  autoSave(content: string): void {
    if (!content) { return }
    const title = this.generateTitle(content);  // Generate the title from content

    if (this.currentNoteId) {
      // If there's an existing note ID, update the note
      this.noteService.updateNote(this.currentNoteId, { content, updatedAt: new Date() }).subscribe({
        next: () => console.log('Note updated automatically!'),
        error: (err) => console.error('Error updating note:', err),
      });
    } else {
      // If no existing note, create a new one
      const newNote: Note = {
        title: title,  // You can set a dynamic title
        content: content,  // The debounced content of the editor
        createdAt: new Date(),
      };

      this.noteService.addNote(newNote).subscribe({
        next: (docRef) => {
          this.currentNoteId = docRef.id;  // Store the ID of the newly created note
        },
        error: (err) => console.error('Error saving note:', err),
      });
    }
  }

  generateTitle(content: string): string {
    // Create a temporary DOM element to strip the HTML tags
    const tempElement = document.createElement('div');
    tempElement.innerHTML = content;
    const plainText = tempElement.textContent || tempElement.innerText || '';

    // Extract the first 30 characters from the plain text
    const title = plainText.substring(0, 30).trim();

    // If there's no content, use 'Untitled Note'
    return title.length > 0 ? title : 'Untitled Note';
  }

  // make sure to destory the editor
  ngOnDestroy(): void {
    this.editor.destroy();
    if (this.contentChangedSubscription) {
      this.contentChangedSubscription.unsubscribe();  // Unsubscribe here
    }
  }

  deleteNote() {
    if (!this.currentNoteId) {return}
    this.noteService.deleteNoteById(this.currentNoteId).subscribe(() => {
      this.snackbar.open('Note Deleted!');
      this.router.navigate(['app', 'create'])
    })
  }
}
