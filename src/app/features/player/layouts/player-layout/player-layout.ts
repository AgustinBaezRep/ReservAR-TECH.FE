import { Component, inject, OnInit, OnDestroy, HostListener } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-player-layout',
  standalone: true,
  imports: [RouterOutlet, CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './player-layout.html',
  styleUrl: './player-layout.scss'
})
export class PlayerLayoutComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private document = inject(DOCUMENT);
  currentYear = new Date().getFullYear();
  isLandingPage = false;
  showDropdown = false;
  private routeSub!: Subscription;
  private queryParamSub!: Subscription;

  ngOnInit() {
    this.checkRoute(this.router.url);
    this.routeSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => this.checkRoute(e.urlAfterRedirects || e.url));

    // Check for openFilter query param on load/navigation
    this.queryParamSub = this.route.queryParams.subscribe(params => {
      if (params['openFilter']) {
        // Wait for page to render
        setTimeout(() => {
          this.scrollToSearch(params['openFilter']);
          // Clear the query param so it doesn't trigger again on reload if not desired, 
          // or leave it. Clearing is better UX usually but might trigger navigation.
          // For now, let's leave it or just handle the action.
        }, 500);
      }
    });
  }

  ngOnDestroy() {
    this.routeSub?.unsubscribe();
    this.queryParamSub?.unsubscribe();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-wrapper')) {
      this.showDropdown = false;
    }
  }

  private checkRoute(url: string) {
    this.isLandingPage = url.includes('gestion-complejos');
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.showDropdown = !this.showDropdown;
  }

  goToLogin() {
    this.showDropdown = false;
    this.router.navigate(['/login']);
  }

  goToLandingComplejos() {
    this.showDropdown = false;
    this.router.navigate(['/player/gestion-complejos']);
  }

  goHome() {
    this.router.navigate(['/player']);
  }

  onLogoClick() {
    if (this.isLandingPage) {
      // Scroll to top of landing page
      this.document.querySelector('.landing-page')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      this.goHome();
    }
  }

  scrollToSection(sectionId: string) {
    const el = this.document.querySelector('#' + sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  scrollToSearch(filterType: string) {
    const searchBar = this.document.querySelector('.search-bar-wrapper');
    if (searchBar) {
      searchBar.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // After scroll completes, open the relevant filter
      setTimeout(() => {
        let target: HTMLElement | null = null;
        switch (filterType) {
          case 'sport':
            target = this.document.querySelector('.filter-item.sport .mat-mdc-select-trigger') as HTMLElement;
            break;
          case 'date':
            target = this.document.querySelector('.filter-item.date') as HTMLElement;
            break;
          case 'location':
            target = this.document.querySelector('.filter-item.city .mat-mdc-select-trigger') as HTMLElement;
            break;
        }
        if (target) {
          target.click();
        }
      }, 600);
    } else {
      // If search bar is not found (e.g. we are on another page), navigate to player page with query param
      this.router.navigate(['/player'], { queryParams: { openFilter: filterType } });
    }
  }
}
