import {inject, Injectable} from '@angular/core';
import {catchError, switchMap} from "rxjs/operators";
import {assign, cloneDeep} from "lodash-es";
import {BobyMockApiUtils} from "@boby/lib/mock-api";
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject,Observable,of,tap,take,map} from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class ParametersService {
    _httpClient = inject(HttpClient);

    private _values: BehaviorSubject<any[] | null> = new BehaviorSubject([]);

    constructor() { }

    /**
     * Setter & getter for user
     *
     * @param value
     */
    set values(value)
    {
        // Store the value
        this._values.next(value);
    }

    get values$(): Observable<any[]>
    {
        return this._values.asObservable();
    }

    /**
     * Get Parameters
     */
    getParameters(): Observable<any[]>
    {
        return this._httpClient.get<any[]>('api/apps/sis-materiales-ng/getSettings').pipe(
            switchMap((params: any) => {
                return of(JSON.parse(params.datos[0].djson));
            })
        );
    }

    /**
     * Post Parameter
     *
     * @param parameter
     */
    postParameter(parameter, id_settings, status): Observable<any[]>
    {
        return this._httpClient.post('api/apps/sis-materiales-ng/postSettings', {parameter,id_settings,status}).pipe(
            tap((params: any) => {
                return of(params);
            }),
            catchError(error =>{
                return of(error);
            })
        );
    }

    /**
     * Post Parameter
     *
     * @param id_settings
     */
    deleteParameter(id_settings): Observable<any[]>
    {
        return this._httpClient.delete('api/apps/sis-materiales-ng/deleteSettings', {params: {id_settings}}).pipe(
            tap((params: any) => {
                return of(params);
            }),
            catchError(error =>{
                return of(error);
            })
        );
    }

    /**
     * Add value
     *
     * @param value
     * @param id_settings
     */
    addValue(value,id_settings): Observable<any>
    {

        const newValue = cloneDeep(value);
        newValue.id = BobyMockApiUtils.guid();

        newValue.slug = newValue.title.toLowerCase()
            .replace(/ /g, '-')
            .replace(/[-]+/g, '-')
            .replace(/[^\w-]+/g, '');

        // Check if the slug is being used and update it if necessary
        const originalSlug = newValue.slug;

        let sameSlug;
        let slugSuffix = 1;

        do{
            sameSlug = this._values.getValue().filter(item => item.slug === newValue.slug);

            if ( sameSlug.length > 0 )
            {
                newValue.slug = originalSlug + '-' + slugSuffix;
                slugSuffix++;
            }
        }
        while ( sameSlug.length > 0 );

        // Return the new value
        return this._httpClient.post('api/apps/sis-materiales-ng/postValue', {newValue, id_settings}).pipe(
            tap((value: any) => {
                this._values.next([newValue, ...this._values.getValue()]);

                return of(newValue);
            }),
            catchError(error =>{
                return of(error);
            })
        );
    }

    /**
     * Update value
     *
     * @param id_settings
     * @param id
     * @param value
     */
    updateValue(id_settings, id, value: any): Observable<any>
    {
        let updatedValue = null;
        // Find the label and update it
        this._values.getValue().forEach((item, index, labels) => {

            if ( item.id === id )
            {
                // Update the slug
                value.slug = value.title.toLowerCase()
                    .replace(/ /g, '-')
                    .replace(/[-]+/g, '-')
                    .replace(/[^\w-]+/g, '');

                // Update the label
                labels[index] = assign({}, labels[index], value);

                // Store the updated label
                updatedValue = labels[index];
            }
        });

        return this.values$.pipe(
            take(1),
            switchMap(values => this._httpClient.patch<any>('api/apps/sis-materiales-ng/patchValue', {
                id_settings,
                id,
                updatedValue
            }).pipe(
                map((reponse: any) => {
                    // Find the index of the updated label within the labels
                    const index = values.findIndex(item => item.id === id);
                    // Update the label
                    values[index] = updatedValue;

                    // Update the labels
                    this._values.next(values);

                    // Return the updated label
                    return reponse;
                })
            ))
        );
    }

    /**
     * Delete value
     *
     * @param id_settings
     * @param id
     */
    deleteValue(id_settings, id): Observable<any>
    {
        return this.values$.pipe(
            take(1),
            switchMap(values => this._httpClient.delete('api/apps/sis-materiales-ng/deleteValue', {params: {id_settings,id}}).pipe(
                map((isDeleted: any) => {

                    // Find the index of the deleted label within the labels
                    const index = values.findIndex(item => item.id === id);

                    // Delete the label
                    values.splice(index, 1);

                    // Update the labels
                    this._values.next(values);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }
}
