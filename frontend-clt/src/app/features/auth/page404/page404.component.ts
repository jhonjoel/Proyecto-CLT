import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-page404',
  templateUrl: './page404.component.html',
  styleUrls: ['./page404.component.scss'],
  standalone: true,
  imports: [MatButtonModule, RouterLink],
})
export class Page404Component {
  constructor(private router: Router) {}

  navigateToMainMenu() {
    this.router.navigate(['/']);
  }
}
