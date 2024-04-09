import { Inject, Injectable } from '@angular/core';
import { BOBY_CONFIG } from '@boby/services/config/config.constants';
import { merge } from 'lodash-es';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { ApiErpService } from "../../../app/core/api-erp/api-erp.service";
import {Scheme, Theme} from "./config.types";
import {catchError, switchMap} from "rxjs/operators";

@Injectable({providedIn: 'root'})
export class BobyConfigService
{
    private _config: BehaviorSubject<any>;

    /**
     * Constructor
     */
    constructor(
        @Inject(BOBY_CONFIG) config: any,
        private _erpService: ApiErpService
    )
    {
        // Private
        this._config = new BehaviorSubject(config);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for config
     */
    set config(value: any)
    {
        // Merge the new config over to the current config
        const config = merge({}, this._config.getValue(), value);

        // Execute the observable
        this._config.next(config);
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get config$(): Observable<any>
    {
        return this._config.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resets the config to the default
     */
    reset(): void
    {
        // Set the config
        this._config.next(this.config);
    }

    /**
     * Set the theme on the config
     *
     * @param theme
     */
    setTheme(theme: Theme):Observable<any>{
        return from(this._erpService.post('gestion_materiales/TitemsRecepcion/agreeIncoming',{
            theme
        })).pipe(
            switchMap((response: any) => {
                return of(response);
            }),
            catchError( error =>{
                console.error('Theme error',error);
                return of(error);
            })
        );
    }

    /**
     * Set the scheme on the config
     *
     * @param scheme
     */
    setScheme(scheme: Scheme):Observable<any>
    {
        return from(this._erpService.post('gestion_materiales/TitemsRecepcion/agreeIncoming',{
            scheme
        })).pipe(
            switchMap((response: any) => {
                return of(response);
            }),
            catchError( error =>{
                console.error('Scheme error',error);
                return of(error);
            })
        );
    }

    /**
     * Set the layout on the config
     *
     * @param layout
     */
    setLayout(layout: string):Observable<any>
    {
        return from(this._erpService.post('gestion_materiales/TitemsRecepcion/agreeIncoming',{
            layout
        })).pipe(
            switchMap((response: any) => {
                return of(response);
            }),
            catchError( error =>{
                console.error('Layout error',error);
                return of(error);
            })
        );
    }
}
