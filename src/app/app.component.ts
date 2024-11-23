import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'agr-frontend';
  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;
  isMobile= true;
  isCollapsed = true;

  constructor(private observer: BreakpointObserver, private router: Router) {}

  ngOnInit() {
    this.observer.observe(['(max-width: 800px)']).subscribe((screenSize) => {
      if(screenSize.matches){
        this.isMobile = true;
      } else {
        this.isMobile = false;
      }
    });
  }

  // Método chamado ao clicar fora do botão "Dashboard"
  onContainerClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // Verifica se o clique foi fora do botão "Dashboard"
    if (!target.closest('a.mat-list-item')) {
      this.toggleMenu();
    }
  }

  // Método para navegação quando o botão "Dashboard" é clicado
  navigateToDashboard(event: MouseEvent): void {
    event.stopPropagation(); // Impede o clique de disparar o evento no contêiner
    this.router.navigate(['/dashboard']); // Navega para a página de dashboard
  }

  // Método para alternar o estado da sidebar
  toggleMenu() {
    if(this.isMobile){
      this.sidenav.toggle();
      this.isCollapsed = false; // On mobile, the menu can never be collapsed
    } else {
      this.sidenav.open(); // On desktop/tablet, the menu can never be fully closed
      this.isCollapsed = !this.isCollapsed;
      // Força o recalculo do layout após o fechamento do sidenav
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 0);
    }
  }
}
