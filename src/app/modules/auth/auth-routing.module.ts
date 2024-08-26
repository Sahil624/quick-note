import { NgModule } from '@angular/core';
import { AuthGuard, redirectLoggedInTo } from '@angular/fire/auth-guard';
import { RouterModule, Routes } from '@angular/router';

const redirectLoggedInToApp = () => redirectLoggedInTo(['app']);

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./modules/login/login.module').then(m => m.LoginModule),
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectLoggedInToApp }
  },
  {
    path: 'logout',
    loadChildren: () => import('./modules/logout/logout.module').then(m => m.LogoutModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./modules/register/register.module').then(m => m.RegisterModule),
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectLoggedInToApp }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
