import {inject, Injectable,EventEmitter} from '@angular/core';
import {ApiErpService} from "../../../core/api-erp/api-erp.service";
import {Observable,BehaviorSubject,of,from,take,map,throwError} from "rxjs";
import {catchError, switchMap} from "rxjs/operators";


@Injectable({
  providedIn: 'root'
})
export class SisMaterialesNgService {

    erpService = inject(ApiErpService);

    private _incomings: BehaviorSubject <any[]| null> = new BehaviorSubject(null);
    private _incoming: BehaviorSubject<any | null> = new BehaviorSubject(null);

    private _pagination: BehaviorSubject<any | null> = new BehaviorSubject(null);

    public $emitter = new EventEmitter();
    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for list incoming
     */
    get incomings$(): Observable<any[]>
    {
        return this._incomings.asObservable();
    }

    /**
     * Getter for list incoming
     */
    get incoming$(): Observable<any[]>
    {
        return this._incoming.asObservable();
    }

    emitirEvento() {
        this.$emitter.emit();
    }

    listIncoming(start,limit,sort,dir,query,status,exchange): Observable<any>{
        //URL sistema/control/metodo
        return from(this.erpService.post('gestion_materiales/ItemsRecepcion/getItemRecepcion',{
            start,limit,sort, dir, query,status,exchange,
            par_filtro:'ent.nro_guia#ent.nro_lote#ent.serial_registrado#ent.motivo_rechazo#ent.tipo#ent.nro_po#ent.nro_tramite#ent.nro_parte_cot#ent.nro_parte_alterno_cot#ent.descripcion_cot'
        })).pipe(
            switchMap((list: any) => {
                const djson = JSON.parse(list.datos[0].djson);
                this._incomings.next(djson);
                return of(list);
            }),
            catchError( error =>{
                return of(error);
            })
        );
    }

    agree(id_recepcion,serial_registrado,nro_lote,fecha_vencimiento,fecha_inspeccion):Observable<any>{
        return from(this.erpService.post('gestion_materiales/ItemsRecepcion/agreeIncoming',{
            id_recepcion,serial_registrado,nro_lote,fecha_vencimiento,fecha_inspeccion
        })).pipe(
            switchMap((response: any) => {
                return of(response);
            }),
            catchError( error =>{
                console.error('agree error',error);
                return of(error);
            })
        );
    }

    decline(id_recepcion,motivo_rechazo,observacion):Observable<any>{
        return from(this.erpService.post('gestion_materiales/ItemsRecepcion/declineIncoming',{
            id_recepcion,motivo_rechazo,observacion
        })).pipe(
            switchMap((response: any) => {
                return of(response);
            }),
            catchError( error =>{
                console.error('decline error',error);
                return of(error);
            })
        );
    }

    /**
     * Get contact by id
     */
    getIncomingById(id: string): Observable<any>
    {
        return this._incomings.pipe(
            take(1),
            map((incomings) =>
            {
                // Find the contact
                const incoming = incomings.find(item => +item.id_recepcion === +id) || null;
                // Update the contact
                this._incoming.next(incoming);

                // Return the contact
                return incoming;
            }),
            switchMap((incoming) =>
            {
                if ( !incoming )
                {
                    return throwError('No puede encontrar la Entrada con ID ' + id + '!');
                }

                return of(incoming);
            }),
        );
    }

    getAgreeData(id_recepcion){
        return from(this.erpService.post('gestion_materiales/ItemsRecepcion/getAgreeData',{
            id_recepcion
        })).pipe(
            switchMap((response: any) => {

                return of(JSON.parse(response.data.agree));
            }),
            catchError( error =>{
                console.error('getAgreeData error',error);
                return of(error);
            })
        );
    }

    printIncoming(id_recepcion,tipo,cantidad_recepcionada,size,exchange): Observable<any>{
        if ( cantidad_recepcionada == 0 ){
            if ( size == 'small' ) {
                return from(this.erpService.post('gestion_materiales/ItemsRecepcion/ImprimirEtiqueta', {
                    id_recepcion,tipo,cantidad_recepcionada:1,exchange
                })).pipe(
                    switchMap((response: any) => {
                        return of(response.datos.html);
                    }),
                    catchError(error => {
                        console.error('printIncoming error', error);
                        return of(error);
                    })
                );
            }else{
                return from(this.erpService.post('gestion_materiales/ItemsRecepcion/ImprimirEtiqueta', {
                    id_recepcion,tipo,cantidad_recepcionada:1,exchange
                })).pipe(
                    switchMap((response: any) => {
                        return of(response.datos.html);
                    }),
                    catchError(error => {
                        console.error('printIncoming error', error);
                        return of(error);
                    })
                );
            }
        }else {
            if ( size == 'small' ) {
                return from(this.erpService.post('gestion_materiales/ItemsRecepcion/ImprimirEtiqueta', {
                    id_recepcion,tipo,cantidad_recepcionada, exchange
                })).pipe(
                    switchMap((response: any) => {
                        return of(response.datos.html);
                    }),
                    catchError(error => {
                        console.error('printIncoming error', error);
                        return of(error);
                    })
                );
            }else {
                return from(this.erpService.post('gestion_materiales/ItemsRecepcion/ImprimirEtiqueta', {
                    id_recepcion,tipo,cantidad_recepcionada,exchange
                })).pipe(
                    switchMap((response: any) => {
                        return of(response.datos.html);
                    }),
                    catchError(error => {
                        console.error('printIncoming error', error);
                        return of(error);
                    })
                );
            }
        }
    }

    /**
     * Load Sub Tipo Incidente
     */
    getCategoryList(code): Observable<any[]>
    {
        return from(this.erpService.post('gestion_materiales/Settings/getCategoryList',{code})).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(JSON.parse(resp.datos[0].djson));
            })
        );
    }

    /**
     * Load Sub Tipo Incidente
     */
    rectifyIncoming(id_recepcion,rectificacion): Observable<any[]>
    {
        return from(this.erpService.post('gestion_materiales/ItemsRecepcion/rectifyIncoming',{
            id_recepcion,rectificacion:JSON.stringify(rectificacion)
        })).pipe(
            switchMap((response: any) => {
                return of(response);
            }),
            catchError( error =>{
                console.error('decline error',error);
                return of(error);
            })
        );
    }

    /**
     * Save generate lottery
     */
    saveDetails(id_recepcion,details): Observable<any>{

        return from(this.erpService.post(
            'gestion_materiales/ItemsRecepcion/saveDetails',
            {id_recepcion,details}
        )).pipe(
            switchMap((response: any) => {
                return of(response);
            }),
            catchError((error)=>{
                return of(error);
            })
        );
    }

    updateAgree(row):Observable<any>{
        return from(this.erpService.post('gestion_materiales/ItemsRecepcion/updateAgree',{
            detail: JSON.stringify(row)
        })).pipe(
            switchMap((response: any) => {
                return of(response);
            }),
            catchError( error =>{
                console.error('agree error',error);
                return of(error);
            })
        );
    }

    addDetail(id_recepcion):Observable<any> {
        return from(this.erpService.post('gestion_materiales/ItemsRecepcion/addDetail',{
            id_recepcion
        })).pipe(
            switchMap((response: any) => {
                return of(response.data);
            }),
            catchError( error =>{
                console.error('agree error',error);
                return of(error);
            })
        );
    }

    removeDetail(id_recepcion_detalle):Observable<any>{
        return from(this.erpService.post('gestion_materiales/ItemsRecepcion/removeDetail',{
            id_recepcion_detalle
        })).pipe(
            switchMap((response: any) => {
                return of(response);
            }),
            catchError( error =>{
                console.error('agree error',error);
                return of(error);
            })
        );
    }
}
