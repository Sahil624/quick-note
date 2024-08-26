import { Component, OnInit } from '@angular/core';
import { Auth, signOut } from '@angular/fire/auth';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'qn-logout',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.scss'
})
export class LogoutComponent implements OnInit {

  constructor(private auth: Auth, private router: Router) { }

  ngOnInit(): void {
    this.logout();
  }

  async logout() {
    await signOut(this.auth);
    this.router.navigate(['app']);
  }
}
