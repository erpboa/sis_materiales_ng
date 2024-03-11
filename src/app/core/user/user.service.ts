import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from 'app/core/user/user.types';
import { map, Observable, ReplaySubject, tap, of } from 'rxjs';
import { cloneDeep } from "lodash-es";

@Injectable({providedIn: 'root'})
export class UserService
{
    private _httpClient = inject(HttpClient);
    private _user: ReplaySubject<User> = new ReplaySubject<User>(1);

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for user
     *
     * @param value
     */
    set user(value: User)
    {
        // Store the value
        this._user.next(value);
    }

    get user$(): Observable<User>
    {
        return this._user.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the current signed-in user data
     */
    get(): Observable<User>
    {
        let auth = JSON.parse(localStorage.getItem('aut'));

        let protocol = location.protocol.replace(':', '');
        let user = {
            avatar: `${protocol}://erp.boa.bo/uploaded_files/sis_parametros/Archivo/${auth.logo}`,
            email: auth.email,
            id: auth.id_usuario,
            name: auth.nombre_usuario,
            status: "online"
        };

        this._user.next(user);
        return of(cloneDeep(user));
    }

    /**
     * Update the user
     *
     * @param user
     */
    update(user: User): Observable<any>
    {
        // Update the user
        this._user.next(user);
        // Return the response
        return of(cloneDeep(user));
    }
}
