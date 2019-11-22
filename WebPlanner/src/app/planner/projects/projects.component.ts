import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';
import { FilesService, FileItem, OrderSettings, OrderItem, OrderService, UserInfo, AuthService } from '../../shared';
import { Observable } from 'rxjs';
import { NewProjectComponent } from '../new-project/new-project.component';
import { DialogService } from 'app/dialogs/services/dialog.service';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { FormControl } from '@angular/forms';
import { concatMap, filter, map, switchMap, startWith, scan } from 'rxjs/operators';
import { combineLatest, of } from 'rxjs';
import { NewOrderComponent } from '../orders/new-order/new-order.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

type ViewMode = 'table' | 'grid';

enum ProjectView {
  All = 1,
  My = 2,
  Templates = 3,
  Projects = 4
}

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {
  update = new EventEmitter<void>();
  search = new BehaviorSubject<string | undefined>(undefined);
  PAGE_SIZE = 50;
  skipCount = new BehaviorSubject(0);
  files$: Observable<{list: OrderItem[], columns: string[]}>;
  gallery: Observable<boolean>;
  _viewMode: ViewMode;
  projectView$: Observable<number>;
  authOk: Observable<boolean>;
  sortControl: FormControl;
  checkPrivate = new FormControl(true);
  shopControl = new FormControl(0);
  orderSettings: OrderSettings;
  shops$: Observable<UserInfo[]>;
  handset = false;

  readonly viewModeStore = "projects.viewMode";
  readonly sortModeStore = "projects.sortMode";

  constructor(
    public auth: AuthService,
    private filesService: FilesService,
    private dialog: DialogService,
    private router: Router,
    private route: ActivatedRoute,
    private firm: OrderService,
    breakpointObserver: BreakpointObserver,
  ) {
    this._viewMode = localStorage.getItem(this.viewModeStore) as ViewMode || 'grid';
    this.sortControl = new FormControl('date');
    if (auth.admin) {
      this.shops$ = this.firm.getShops().pipe(
        filter(s => s.length > 0),
        map(s => s.sort((s1, s2) => {
          let n1 = s1.fullName.toLocaleLowerCase();
          let n2 = s2.fullName.toLocaleLowerCase();
          return n1 < n2 ? -1 : n1 > n2 ? 1 : 0;
        }))
      );
    }
    auth.getAppSetting<OrderSettings>('OrderSettings').subscribe(s => this.orderSettings = s);
    breakpointObserver.observe([Breakpoints.Handset]).subscribe(result => {
      this.handset = result.matches;
    });
  }

  // display list of some projects
  @Input() projects?: Observable<OrderItem[]>;
  @Input() userId?: number;

  ngOnInit() {
    let loader = (view: ProjectView, privateProjects: boolean, search?: string, user = 0) => {
      if (view === ProjectView.Templates) {
        return this.filesService.getProjectTemplates(true) as Observable<OrderItem[]>;
      }
      let viewMode = view === ProjectView.My ? '' : (privateProjects ? 'all' : 'gallery');
      let date = '';
      if (search) {
        search = search.replace(/\b(\d{1,2})\.(\d{1,2})$/, (s, day, month) => {
          let cur = new Date();
          let searchDate = new Date(cur.getFullYear(), +month - 1, +day);
          if (searchDate > cur) {
            searchDate.setFullYear(cur.getFullYear() - 1);
          }
          date = searchDate.toISOString();
          return '';
        });
      }
      this.skipCount.next(0);
      user = this.userId || user;
      return this.skipCount.pipe(
        concatMap(skip => this.firm.getOrders(viewMode, this.PAGE_SIZE, skip, search, date, user)),
        scan<OrderItem[]>((all, current) => [...all, ...current], [])
      )
    }
    this.sortControl.setValue(localStorage.getItem(this.sortModeStore) || 'name');
    let sort = this.sortControl.valueChanges.pipe(startWith(this.sortControl.value));
    let privateProjects = this.checkPrivate.valueChanges.pipe(startWith(this.checkPrivate.value));
    let shop = this.shopControl.valueChanges.pipe(startWith(this.shopControl.value));
    let update = this.update.pipe(startWith(undefined));
    let auth = this.auth.isAuthenticated.pipe(filter(v => v !== undefined));

    if (this.projects) {
      this.viewMode = 'table';
      this.projectView$ = of(ProjectView.All);
      this.files$ = this.projects.pipe(
        map(list => this.transformFiles(list, '', ProjectView.Projects))
      );
    } else {
      this.projectView$ = this.route.data.pipe(map(d => d.view as number || ProjectView.Projects));
      this.files$ = combineLatest(this.projectView$, auth, privateProjects, update, this.search, shop)
        .pipe(
          switchMap(params => loader(params[0], this.auth.admin && params[2], params[4], params[5])),
          switchMap(files => combineLatest(of(files), sort, this.projectView$)),
          map(result => this.transformFiles(result[0], result[1], result[2]))
        );
      this.sortControl.valueChanges
        .subscribe(value => localStorage.setItem(this.sortModeStore, value));
    }
    this.authOk = combineLatest(this.projectView$, this.auth.isAuthenticated)
      .pipe(map(result => result[1] || result[0] === ProjectView.All));
  }

  transformFiles(files: OrderItem[], sort: string, view: ProjectView) {
    let list = files.slice();
    let prices = false;
    for (let order of list) {
      if (order.price > 0) {
        prices = true;
      }
      order.name = order.name || '';
    }
    if (sort === 'name') {
      list.sort((f1, f2) => {
        let n1 = f1.name.toLocaleLowerCase();
        let n2 = f2.name.toLocaleLowerCase();
        return n1 < n2 ? -1 : n1 > n2 ? 1 : 0;
      });
    } else if (sort === 'price') {
      list.sort((f1, f2) => f2.price - f1.price);
    } else {
      list.sort((f1, f2) => {
        return new Date(f2.modifiedAt).valueOf() - new Date(f1.modifiedAt).valueOf();
      })
    }
    let galleryColumns = ['name', 'date', 'ownerName'];
    if (this.auth.admin && !this.handset) {
      galleryColumns.push('client');
    }
    let myColumns = ['name', 'date'];
    if (!this.handset) {
      myColumns.push('client');
    }
    let templateColumns = ['name', 'date'];
    let projectColumns = templateColumns;
    let columns = [galleryColumns, myColumns, templateColumns, projectColumns][view - 1];
    if (columns === projectColumns && list.length > 0) {
      if (list.some(p => p.ownerId !== list[0].ownerId)) {
        columns = galleryColumns;
      }
    }
    if (view !== ProjectView.Templates && prices) {
      columns.splice(1, 0, 'price');
    }
    return { list, columns };
  }

  get viewMode() {
    return this._viewMode
  }

  set viewMode(value) {
    this._viewMode = value;
    localStorage.setItem(this.viewModeStore, this.viewMode);
  }

  runSearch(value?: string) {
    this.search.next(value);
  }

  newPlan(view: ProjectView) {
    if (this.orderSettings && this.orderSettings.enabled && view === ProjectView.My) {
      this.dialog.open(NewOrderComponent);
    } else {
      this.dialog.open(NewProjectComponent, { data: view === ProjectView.Templates })
        .componentInstance.afterCreate.subscribe(f => this.router.navigate(['/project', f.id]));
    }
  }

  openProject(_, p: FileItem) {
    this.router.navigate(['/project', p.id]);
  }

  canRemove(p: FileItem) {
    return this.auth.admin || p.ownerId === this.auth.userId;
  }

  removeProject(event: MouseEvent, p: FileItem) {
    event.stopPropagation();
    this.dialog
      .openConfirm({
        message: `Удалить проект ${p.name}?`
      })
      .afterClosed().pipe(
        filter(ok => ok),
        concatMap(_ => this.filesService.removeFile(p))
      ).subscribe(_ => this.update.next());
  }

  displayMoreProjects() {
    this.skipCount.next(this.skipCount.value + this.PAGE_SIZE);
  }
}
