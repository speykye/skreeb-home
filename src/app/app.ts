import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingOverlay } from './shared/loading/loading-overlay/loading-overlay';
import { Role } from './shared/role/role';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoadingOverlay, Role],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  
}
