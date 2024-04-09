import {Injectable} from "@angular/core";
import {BobyMockApiService} from "@boby/lib/mock-api";
import {ApiErpService} from "../../../core/api-erp/api-erp.service";
import {from, map} from 'rxjs';
import {cloneDeep} from "lodash-es";

@Injectable({providedIn: 'root'})
export class MaterialesMockApi
{
    /**
     * Constructor
     */
    constructor(
        private _bobyApiService: BobyMockApiService,
        private _apiErp: ApiErpService,
    )
    {
        // Register Mock API handlers
        this.registerHandlers();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Register Mock API handlers
     */
    registerHandlers(): void
    {

        this._bobyApiService
            .onGet('api/apps/sis-materiales-ng/getSettings')
            .reply(({request}) => {
                return from(this._apiErp.post('gestion_materiales/Settings/getSettings', {})).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });

        this._bobyApiService
            .onPost('api/apps/sis-materiales-ng/postSettings')
            .reply(({request}) => {
                return from(this._apiErp.post('gestion_materiales/Settings/postSettings', {parameter:JSON.stringify(request.body.parameter),id_settings:request.body.id_settings,status:request.body.status})).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });

        this._bobyApiService
            .onDelete('api/apps/sis-materiales-ng/deleteSettings')
            .reply(({request}) => {
                const id_settings = request.params.get('id_settings');
                return from(this._apiErp.post('gestion_materiales/Settings/deleteSettings', {id_settings})).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });


        this._bobyApiService
            .onPost('api/apps/sis-materiales-ng/postValue')
            .reply(({request}) => {

                return from(this._apiErp.post('gestion_materiales/Settings/postValue', {newValue:JSON.stringify(request.body.newValue), id_settings: request.body.id_settings})).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });

        // -----------------------------------------------------------------------------------------------------
        // @ Labels - PATCH
        // -----------------------------------------------------------------------------------------------------
        this._bobyApiService
            .onPatch('api/apps/sis-materiales-ng/patchValue')
            .reply(({request}) => {

                // Get the id and label
                const id = request.body.id;
                const value = cloneDeep(request.body.value);
                return from(this._apiErp.post('gestion_materiales/Settings/patchValue', {updateValue:JSON.stringify(request.body.updatedValue), id_settings: request.body.id_settings, id: request.body.id})).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });

        // -----------------------------------------------------------------------------------------------------
        // @ Values - DELETE
        // -----------------------------------------------------------------------------------------------------
        this._bobyApiService
            .onDelete('api/apps/sis-materiales-ng/deleteValue')
            .reply(({request}) => {

                // Get the id
                const id = request.params.get('id');
                const id_settings = request.params.get('id_settings');

                return from(this._apiErp.post('gestion_materiales/Settings/deleteValue', {id_settings, id})).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });

    }
}
