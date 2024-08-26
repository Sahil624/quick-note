import { Component, Input } from '@angular/core';
import { NavItem } from './nav-item';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'qn-nav-item',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatListModule
  ],
  templateUrl: './nav-item.component.html',
  styleUrl: './nav-item.component.scss'
})
export class NavItemComponent {
  @Input() item: NavItem | any;
  @Input() depth: any;

  constructor(public router: Router) {
    if (this.depth === undefined) {
      this.depth = 0;
    }
  }

  ngOnChanges() {
    // this.navService.currentUrl.subscribe((url: string) => {
    //   if (this.item.route && url) {
    //   }
    // });
  }

  onItemSelected(item: NavItem) {
    if (!item.children || !item.children.length) {
      this.router.navigate([item.route]);
    }

    // scroll
    document.querySelector('.page-wrapper')?.scroll({
      top: 0,
      left: 0,
    });
  }
}
