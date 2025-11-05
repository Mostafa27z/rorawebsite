import { Routes } from '@angular/router';
import { HomeComponent } from './general/home/home.component';
import { ShopComponent } from './general/shop/shop.component';
import { AboutComponent } from './general/about/about.component';
import { ContactComponent } from './general/contact/contact.component';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { MyOrdersComponent } from './client/my-orders/my-orders.component';
import { InnerLayoutComponent } from './admin/inner-layout/inner-layout.component';
import { OverviewComponent } from './admin/overview/overview.component';
import { CategoriesComponent } from './admin/categories/categories.component';
import { ProductsComponent } from './admin/products/products.component';
import { OrdersComponent } from './admin/orders/orders.component';
import { ProfileComponent } from './auth/profile/profile.component';
import { UserManagementComponent } from './admin/user-management/user-management.component';
import { AdminGuard } from './guards/admin.guard';
import { AuthGuard } from './guards/auth.guard';
import { NotFoundComponent } from './errors/not-found/not-found.component';
import { ForbiddenComponent } from './errors/forbidden/forbidden.component';


export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'shop', component: ShopComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'myorders', component: MyOrdersComponent, canActivate: [AuthGuard] },
  {path:"profile" , component: ProfileComponent, canActivate: [AuthGuard]},

  
  {
    path: 'dashboard',
    component: InnerLayoutComponent,
    canActivate: [AdminGuard],
    children: [
      // Add dashboard-related routes later here
      { path: '', component: OverviewComponent },
      {path:'categories', component:CategoriesComponent},
      { path: 'products', component: ProductsComponent },
      { path: 'orders', component: OrdersComponent },
      { path: 'users', component: UserManagementComponent },
    ],
  },

  {path:"forbidden" , component:ForbiddenComponent},
  { path: '**', component:NotFoundComponent },
];
