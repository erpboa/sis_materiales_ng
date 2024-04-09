import { inject } from "@angular/core";
import {Routes, Router, ActivatedRouteSnapshot, RouterStateSnapshot} from "@angular/router";
import {SisMaterialesNgComponent} from "./sis-materiales-ng.component";
import {IncomingListComponent} from "./incoming-list/incoming-list.component";
import {SisMaterialesNgService} from "./sis-materiales-ng.service";
import {IncomingDetailsComponent} from "./incoming-details/incoming-details.component";
import {catchError,throwError} from "rxjs";
import {ParametersComponent} from "./parameters/parameters.component";

/**
 * Detail resolver
 *
 * @param route
 * @param state
 */
const detailResolver = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
{
    const toolService = inject(SisMaterialesNgService);
    const router = inject(Router);

    return toolService.getIncomingById(route.paramMap.get('id'))
        .pipe(
            // Error here means the requested contact is not available
            catchError((error) =>
            {
                // Log the error
                console.error(error);

                // Get the parent url
                const parentUrl = state.url.split('/').slice(0, -1).join('/');

                // Navigate to there
                router.navigateByUrl(parentUrl);

                // Throw an error
                return throwError(error);
            }),
        );
};

/**
 * Can deactivate details
 *
 * @param component
 * @param currentRoute
 * @param currentState
 * @param nextState
 */
const canDeactivateDetails = (
    component: IncomingDetailsComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot) =>
{
    // Get the next route
    let nextRoute: ActivatedRouteSnapshot = nextState.root;
    while ( nextRoute.firstChild )
    {
        nextRoute = nextRoute.firstChild;
    }

    // If the next state doesn't contain '/contacts'
    // it means we are navigating away from the
    // contacts app
    if ( !nextState.url.includes('/incoming') )
    {
        // Let it navigate
        return true;
    }

    // If we are navigating to another contact...
    if ( nextRoute.paramMap.get('id') )
    {
        // Just navigate
        return true;
    }

    // Otherwise, close the drawer first, and then navigate
    return component.closeDrawer().then(() => true);
};

export default [
    {
        path: 'parameters',
        component: ParametersComponent
    },
    {
        path     : '',
        component: SisMaterialesNgComponent,
        children : [
            {
                path     : 'incoming',
                component: IncomingListComponent,
                /*resolve  : {
                    incoming: () => inject(SisMaterialesNgService).listIncoming(0,50,'nro_tramite','asc','')
                }*/
                children : [
                    {
                        path         : ':id',
                        component    : IncomingDetailsComponent,
                        resolve      : {
                            incoming : detailResolver
                        },
                        canDeactivate: [canDeactivateDetails]
                    }
                ]
            }
        ]
    }
] as Routes;
