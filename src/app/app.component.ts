import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ScullyLibModule } from '@scullyio/ng-lib';

@Component({
  selector: 'qn-root',
  standalone: true,
  imports: [RouterOutlet, ScullyLibModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'quick-notes';
}
