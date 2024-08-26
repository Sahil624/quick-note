import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { AuthGuard, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['/auth/login']);

export const routes: Routes = [
    {
        path: 'app',
        loadChildren: () => import("./modules/application/application.module").then(m => m.ApplicationModule),
        canActivate: [AuthGuard],
         data: { authGuardPipe: redirectUnauthorizedToLogin }
    },
    {
        path: 'auth',
        loadChildren: () => import("./modules/auth/auth.module").then(m => m.AuthModule),
    },
    {
        path: '',
        loadChildren: () => import("./modules/landing/landing.module").then(m => m.LandingModule)
    },
];
