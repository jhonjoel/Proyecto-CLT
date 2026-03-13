import { Route } from "@angular/router";
import { BasicTableComponent } from "./basic-table/basic-table.component";
 import { MaterialTableComponent } from "./material-table/material-table.component";
import { Page404Component } from "../features/auth/page404/page404.component";
import { NgxDatatableComponent } from "./ngx-datatable/ngx-datatable.component";
export const TEBLES_ROUTE: Route[] = [
  {
    path: "",
    redirectTo: "basic-tables",
    pathMatch: "full",
  },
  {
    path: "basic-tables",
    component: BasicTableComponent,
  },
  {
    path: "material-tables",
    component: MaterialTableComponent,
  },
  {
    path: "ngx-datatable",
    component: NgxDatatableComponent,
  },
  { path: '**', component: Page404Component },
];
