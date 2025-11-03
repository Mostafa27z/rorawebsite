import { Routes } from '@angular/router';
import { HomeComponent } from './general/home/home.component';
import { ShopComponent } from './general/shop/shop.component';
import { AboutComponent } from './general/about/about.component';
import { ContactComponent } from './general/contact/contact.component';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { MyOrdersComponent } from './client/my-orders/my-orders.component';

export const routes: Routes = [
    {path:'' , component:HomeComponent},
    {path:'shop' , component:ShopComponent},
    {path:'about' , component:AboutComponent},
    {path:'contact' , component:ContactComponent},
    {path:'login' , component:LoginComponent},
    {path:'signup' , component:SignupComponent},
    {path:"myorders" , component:MyOrdersComponent}

];
