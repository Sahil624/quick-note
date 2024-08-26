import { Component, ViewChild } from '@angular/core';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'qn-application',
  standalone: true,
  imports: [
    MatSidenavModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    HeaderComponent,
    SidebarComponent,
    RouterModule],
  templateUrl: './application.component.html',
  styleUrl: './application.component.scss'
})
export class ApplicationComponent {

  @ViewChild('leftsidenav')
  public sidenav: MatSidenav | any;
  private isMobileScreen = false;
  private isContentWidthFixed = true;
  private isCollapsedWidthFixed = false;
  private htmlElement!: HTMLHtmlElement;

  get isOver(): boolean {
    return this.isMobileScreen;
  }

  constructor() {
  }

  ngOnInit(): void { }

  toggleCollapsed() {
    this.isContentWidthFixed = false;
  }

  onSidenavClosedStart() {
    this.isContentWidthFixed = false;
  }

  onSidenavOpenedChange(isOpened: boolean) {
    this.isCollapsedWidthFixed = !this.isOver;
  }
}
