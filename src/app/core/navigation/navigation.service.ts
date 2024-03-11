import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Navigation } from 'app/core/navigation/navigation.types';
import { Observable, ReplaySubject, tap,from } from 'rxjs';
import {ApiErpService} from '../api-erp/api-erp.service';
import { BobyNavigationItem } from '../../../@boby/components/navigation';
import { cloneDeep } from 'lodash-es';

@Injectable({providedIn: 'root'})
export class NavigationService
{
    private _apiErp = inject(ApiErpService);
    private _navigation: ReplaySubject<Navigation> = new ReplaySubject<Navigation>(1);
    private _compactNavigation: BobyNavigationItem[];
    private _defaultNavigation: BobyNavigationItem[];
    private _futuristicNavigation: BobyNavigationItem[];
    private _horizontalNavigation: BobyNavigationItem[];

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for navigation
     */
    get navigation$(): Observable<Navigation>
    {
        return this._navigation.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get all navigation data
     */
    get(): Observable<Navigation>
    {
        const auth = JSON.parse(localStorage.getItem('aut'));
        return from(this._apiErp.post(
            'seguridad/Gui/getMenuJson',
            {userId : auth.id_usuario}
        )).pipe(
            tap((response: any) => {
                const navigation = JSON.parse(response.data.navigationItem);

                this._compactNavigation = navigation;
                this._defaultNavigation = navigation;
                this._futuristicNavigation = navigation;
                this._horizontalNavigation = navigation;

                // Fill compact navigation children using the default navigation
                this._compactNavigation.forEach((compactNavItem) => {
                    this._defaultNavigation.forEach((defaultNavItem) => {
                        if ( defaultNavItem.id === compactNavItem.id )
                        {
                            compactNavItem.children = cloneDeep(defaultNavItem.children);
                        }
                    });
                });

                // Fill futuristic navigation children using the default navigation
                this._futuristicNavigation.forEach((futuristicNavItem) => {
                    this._defaultNavigation.forEach((defaultNavItem) => {
                        if ( defaultNavItem.id === futuristicNavItem.id )
                        {
                            futuristicNavItem.children = cloneDeep(defaultNavItem.children);
                        }
                    });
                });

                // Fill horizontal navigation children using the default navigation
                this._horizontalNavigation.forEach((horizontalNavItem) => {
                    this._defaultNavigation.forEach((defaultNavItem) => {
                        if ( defaultNavItem.id === horizontalNavItem.id )
                        {
                            horizontalNavItem.children = cloneDeep(defaultNavItem.children);
                        }
                    });
                });

                this._navigation.next({
                    compact   : cloneDeep(this._compactNavigation),
                    default   : cloneDeep(this._defaultNavigation),
                    futuristic: cloneDeep(this._futuristicNavigation),
                    horizontal: cloneDeep(this._horizontalNavigation)
                });
            })
        );
    }
}
