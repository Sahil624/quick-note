import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, collectionData, docData } from '@angular/fire/firestore';
import { Observable, catchError, from, throwError } from 'rxjs';
import { Note } from './note.model';  // Assuming you have a Note interface defined

@Injectable({
  providedIn: 'root'
})
export class NoteService {

  private notesCollection;

  constructor(private firestore: Firestore) {
    this.notesCollection = collection(this.firestore, 'notes');
  }

  // 1. Create a new note
  addNote(note: Note) {
   return from(addDoc(this.notesCollection, note));  // Convert Promise to Observable
  }

  // 2. Get all notes
  getNotes(): Observable<Note[]> {
    return collectionData(this.notesCollection, { idField: 'id' })
      .pipe(
        catchError(this.handleError<Note[]>('getNotes', []))
      );
  }

  // Generic error handling function
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return throwError(() => new Error(`${operation} failed: ${error.message}`));
    };
  }

  // 3. Get a single note by ID
  getNoteById(id: string): Observable<Note> {
    const noteDocRef = doc(this.firestore, `notes/${id}`);
    return docData(noteDocRef, { idField: 'id' }) as Observable<Note>;
  }

  // 4. Update a note by ID
  updateNote(id: string, updatedNote: Partial<Note>): Observable<void> {
    const noteDocRef = doc(this.firestore, `notes/${id}`);
    const updateNote$ = from(updateDoc(noteDocRef, updatedNote));  // Convert Promise to Observable
    return updateNote$;
  }

  // 5. Delete a note by ID
  deleteNoteById(id: string): Observable<void> {
    const noteDocRef = doc(this.firestore, `notes/${id}`);
    const deleteNote$ = from(deleteDoc(noteDocRef));  // Convert Promise to Observable
    return deleteNote$;
  }
}
