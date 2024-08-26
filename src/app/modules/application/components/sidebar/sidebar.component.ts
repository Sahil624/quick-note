import { Component, OnInit } from '@angular/core';
import { navItems } from './sidebar.data';
import { NavItemComponent } from './nav-item/nav-item.component';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { NoteService } from '../../services/note/note.service';
import { Note } from '../../services/note/note.model';

@Component({
  selector: 'qn-sidebar',
  standalone: true,
  imports: [
    NavItemComponent,
    MatListModule,
    MatButtonModule,
    CommonModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  navItems = navItems;

  constructor(
    private noteService: NoteService
  ) { }

  ngOnInit(): void {
    // Fetch notes and add them to the navItems dynamically under the 'Notes' section
    this.noteService.getNotes().subscribe((notes: Note[]) => {
      // Find the index of the "Notes" navCap section
      const notesSectionIndex = this.navItems.findIndex(item => item.navCap === 'Notes');
  
      if (notesSectionIndex !== -1) {
        const latestNotes = notes.slice(0, 5);

        latestNotes.forEach((note, index) => {
          const existingNote = this.navItems.find(navItem => navItem.route === `/app/create/${note.id}`);
  
          // Only add the note if it doesn't already exist in navItems
          if (!existingNote) {
            this.navItems.splice(notesSectionIndex + index + 1, 0, {
              displayName: note.title,  // Use the note title as the display name
              iconName: 'description',  // Use an icon for notes
              route: `/app/create/${note.id}`,  // Define a route to the note's detail page with the new format
            });
          }
        });
      }
    });
  }
  
}
