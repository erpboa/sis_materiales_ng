import { Injectable } from '@angular/core';
import PxpClient from 'pxp-client';
import {AuthService} from "../auth/auth.service";

@Injectable({
    providedIn: 'root'
})
export class ApiErpService {

    constructor(
        private _authService: AuthService
    ) { }

    get (url) {
        return PxpClient.doRequest({
            url: url,
            params: {
                start: 0,
                limit: 50,
            },
        });
    }

    post (url,params) {
        return PxpClient.doRequest({
            url: url,
            params:params,
        })
            .then( (resp) => {
                return resp;
            })
            .catch(
                (error)=>{
                    console.warn('ERROR POST',error);

                    const auth = JSON.parse(localStorage.getItem('aut'));

                    // Redirect
                    if ( !auth ) {
                        this._authService.redirect();
                    }

                    // Reload the app
                    if ( !auth ) {
                        location.reload();
                    }
                }
            );
    }
}
