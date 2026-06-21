// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';

/**
 * AppShellComponent — Layout principal de l'application
 * Navbar fixe en haut + Sidebar à gauche + RouterOutlet pour le contenu
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="app-body">
      <app-sidebar></app-sidebar>
      <main class="app-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-body {
      display: flex;
      padding-top: 64px; /* hauteur navbar */
      min-height: 100vh;
    }
    .app-content {
      flex: 1;
      margin-left: 220px; /* largeur sidebar */
      padding: 2.5rem;
      overflow: auto;
    }
    @media (max-width: 768px) {
      .app-body { flex-direction: column; }
      .app-content { margin-left: 0; padding: 1rem; }
    }
  `]
})
export class AppShellComponent {}
