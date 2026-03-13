import { Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { DOCUMENT, NgClass } from '@angular/common';
import {
  Component,
  Inject,
  ElementRef,
  OnInit,
  Renderer2,
  HostListener,
} from '@angular/core';
import { ROUTES } from './sidebar-items';
import { AuthService } from '@core';
import { RouteInfo } from './sidebar.metadata';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { NgScrollbar } from 'ngx-scrollbar';
import { UnsubscribeOnDestroyAdapter } from '@shared';

 
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [
    NgScrollbar,
    MatButtonModule,
    RouterLink,
    MatTooltipModule,
    RouterLinkActive,
    NgClass,
  ],
})
export class SidebarComponent extends UnsubscribeOnDestroyAdapter implements OnInit {
  public sidebarItems!: RouteInfo[];
  public innerHeight?: number;
  public bodyTag!: HTMLElement;
  listMaxHeight?: string;
  listMaxWidth?: string;
  userFullName?: string;
  userImg?: string;
  userType?: string;
  headerHeight = 60;
  currentRoute?: string;
  usuario?: String;
  area?: String;
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    public elementRef: ElementRef,
    private authService: AuthService,
    private router: Router
  ) {
    super();
    this.subs.sink = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // close sidebar on mobile screen after menu select
        this.renderer.removeClass(this.document.body, 'overlay-open');
      }
    });
  }
  @HostListener('window:resize', ['$event'])
  windowResizecall() {
    this.setMenuHeight();
    this.checkStatuForResize(false);
  }
  @HostListener('document:mousedown', ['$event'])
  onGlobalClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.renderer.removeClass(this.document.body, 'overlay-open');
    }
  }
  callToggleMenu(event: Event, length: number) {
    if (length > 0) {
      const parentElement = (event.target as HTMLInputElement).closest('li');
      const activeClass = parentElement?.classList.contains('active');

      if (activeClass) {
        this.renderer.removeClass(parentElement, 'active');
      } else {
        this.renderer.addClass(parentElement, 'active');
      }
    }
  }
 


  ngOnInit() {
    const permisos = this.authService.getPermisos();
    const roles = this.authService.getRoles();
    const payload = this.authService.getDecodedToken();
    this.usuario = (this.authService.currentUserValue?.nombreCompleto ?? this.authService.currentUserValue?.firstName ?? payload?.sub ?? '').toString();
    this.area = (payload?.roles?.join(', ') ?? roles.join(', ') ?? '').toString();

    this.sidebarItems = this.filterRoutesByPermisosYRoles(ROUTES, permisos, roles);
    this.initLeftSidebar();
    this.bodyTag = this.document.body;
  }

  /** Filtra ítems por permisos y roles del token: se muestran solo si el usuario tiene el permiso y (si aplica) uno de los roles. */
  private filterRoutesByPermisosYRoles(routes: RouteInfo[], permisos: string[], roles: string[]): RouteInfo[] {
    return routes
      .filter((item) => this.puedeVerItem(item, permisos, roles))
      .map((item) => ({
        ...item,
        children: item.children?.length
          ? this.filterRoutesByPermisosYRoles(item.children, permisos, roles)
          : [],
      }))
      .filter((item) => !item.children?.length || item.children.length > 0);
  }

  private puedeVerItem(item: RouteInfo, permisos: string[], roles: string[]): boolean {
    if (item.permiso && !permisos.includes(item.permiso)) return false;
    if (item.roles?.length && !item.roles.some((r) => roles.includes(r))) return false;
    return true;
  }
  initLeftSidebar() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;
    // Set menu height
    _this.setMenuHeight();
    _this.checkStatuForResize(true);
  }
  setMenuHeight() {
    this.innerHeight = window.innerHeight;
    const height = this.innerHeight - this.headerHeight;
    this.listMaxHeight = height + '';
    this.listMaxWidth = '500px';
  }
  isOpen() {
    return this.bodyTag.classList.contains('overlay-open');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  checkStatuForResize(firstTime: boolean) {
    if (window.innerWidth < 1025) {
      this.renderer.addClass(this.document.body, 'ls-closed');
    } else {
      this.renderer.removeClass(this.document.body, 'ls-closed');
    }
  }
  mouseHover() {
    const body = this.elementRef.nativeElement.closest('body');
    if (body.classList.contains('submenu-closed')) {
      this.renderer.addClass(this.document.body, 'side-closed-hover');
      this.renderer.removeClass(this.document.body, 'submenu-closed');
    }
  }
  mouseOut() {
    const body = this.elementRef.nativeElement.closest('body');
    if (body.classList.contains('side-closed-hover')) {
      this.renderer.removeClass(this.document.body, 'side-closed-hover');
      this.renderer.addClass(this.document.body, 'submenu-closed');
    }
  }
}
