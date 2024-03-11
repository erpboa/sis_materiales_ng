import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { of, switchMap } from 'rxjs';

export const AuthGuard: CanActivateFn | CanActivateChildFn = (route, state) =>
{

    const router: Router = inject(Router);
    const authService: AuthService = inject(AuthService);

    authService.initErp();

    // Check the authentication status
    return inject(AuthService).check().pipe(
        switchMap((authenticated) =>
        {
            let auth = JSON.parse(localStorage.getItem('aut'));
            if( auth != null ) {
                // If the user is not authenticated...
                if ( !authenticated && !auth.success ) {
                    // Redirect to the sign-in page with a redirectUrl param
                    const redirectURL = state.url === '/sign-out' ? '/' : state.url;

                    // Redirect to the sign-in page
                    router.navigate(['sign-in'], {queryParams: {redirectURL}});

                    // Prevent the access
                    return of(false);
                }
            }else{
                // If the user is not authenticated...
                if ( !authenticated ) {
                    // Redirect to the sign-in page with a redirectUrl param
                    const redirectURL = state.url === '/sign-out' ? '/' : state.url;
                    // Redirect to the sign-in page
                    router.navigate(['sign-in'], {queryParams: {redirectURL}});

                    // Prevent the access
                    return of(false);
                }
            }

            // Allow the access
            return of(true);
        }),
    );
};
