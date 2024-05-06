import {ChangeDetectorRef, Component, Inject} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {MatFormFieldModule} from "@angular/material/form-field";
import {JsonPipe, NgFor, NgIf} from "@angular/common";
import {Subject,takeUntil} from "rxjs";
import {MatSelectModule} from "@angular/material/select";
import {BobyLoadingService} from "../../../../../../@boby/services/loading";
import {BobyConfirmationService} from "../../../../../../@boby/services/confirmation";
import * as moment from "moment";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {MatLuxonDateModule} from "@angular/material-luxon-adapter";
import {TextFieldModule} from "@angular/cdk/text-field";
import {MatInputModule} from "@angular/material/input";
import {BobyNumbersOnlyDirective} from "@boby/directives/numbers-only";
import {SisMaterialesNgService} from "../../sis-materiales-ng.service";

@Component({
  selector: 'erp-details-dialog',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule,MatFormFieldModule,MatButtonModule,MatIconModule,MatDialogModule,MatSelectModule,MatTooltipModule,MatDatepickerModule,MatNativeDateModule,MatLuxonDateModule,NgIf,NgFor,TextFieldModule,MatInputModule,BobyNumbersOnlyDirective,JsonPipe],
  templateUrl: './details-dialog.component.html',
  styleUrl: './details-dialog.component.scss'
})
export class DetailsDialogComponent {

    public ControlForm: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    public listDetails: any = [
        {serial_registrado:'777', nro_lote: '777777', fecha_vencimiento:'26/04/2024', cantidad:1},
    ];

    public listOfficials: any;

    private configForm: FormGroup;

    weeks: any[] = [];

    public listPeriods: any;

    public overallPercentage: number = 0;
    public dataUser = JSON.parse(localStorage.getItem('aut')).nombre_usuario;
    public row:any;
    public total_detail: number=0;

    public contador:number = 0;
    constructor(
        @Inject(MAT_DIALOG_DATA) public _data: any,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        public matDialogRef: MatDialogRef<DetailsDialogComponent>,
        private _fcService: BobyConfirmationService,
        private _loadService: BobyLoadingService,
        private _toolService: SisMaterialesNgService
    ) { }

    ngOnInit(): void {
        this.ControlForm = this._formBuilder.group({
            details : this._formBuilder.array([])
        });

        this.row = this._data.row;

        if ( this.row.detalle_aprobacion.length == 0 ) { console.warn('IF');

            this._toolService.addDetail(this.row.id_recepcion)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((response) => {

                    const detailsFormGroup = this._formBuilder.group({
                        id_recepcion        : [this.row.id_recepcion],
                        id_recepcion_detalle: [response.id_recepcion_detalle],
                        serial_registrado   : ['',[Validators.required]],
                        nro_lote            : [''],
                        fecha_vencimiento   : [''],
                        cantidad            : [1],
                        fecha_inspeccion    : [''],
                        contador            : [1]
                    });

                    (this.ControlForm.get('details') as FormArray).push(detailsFormGroup);
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });

            this.total_detail++;
            this.contador++;
        }else if( this.row.detalle_aprobacion.length > 0 ) { console.warn('ELSE');
            this.total_detail = this.row.detalle_aprobacion.length;
            for (let item of this.row.detalle_aprobacion) {
                const detail = this._formBuilder.group({
                    id_recepcion        : [item.id_recepcion],
                    id_recepcion_detalle: [item.id_recepcion_detalle],
                    serial_registrado   : [item.serial_registrado,[Validators.required]],
                    nro_lote            : [item.nro_lote],
                    fecha_vencimiento   : [item.fecha_vencimiento],
                    cantidad            : [item.cantidad],
                    fecha_inspeccion    : [''],
                    contador            : [this.contador+1]
                    /*fecha_reg: [item.fecha_reg],
                    usuario_reg: [item.usuario_reg]*/
                });

                (this.ControlForm.get('details') as FormArray).push(detail);
                this.contador++;
            }
            // Mark for check
            this._changeDetectorRef.markForCheck();
        }
    }

    valueChange(event){

        this.overallPercentage = this.ControlForm.get('details').value.reduce((accumulator, item) => accumulator+item.percent, 0);

        if ( this.overallPercentage > 100 ) {

            // Build the config form
            this.configForm = this._formBuilder.group({
                title: 'ADVERTENCIA',
                message: `Estimado Usuario, el porcentaje actual es ${this.overallPercentage} % no es posible superar el 100% !!`,
                icon: this._formBuilder.group({
                    show: true,
                    name: 'heroicons_outline:exclamation',
                    color: 'warn'
                }),
                actions: this._formBuilder.group({
                    confirm: this._formBuilder.group({
                        show: true,
                        label: 'Aceptar',
                        color: 'warn'
                    }),
                    cancel: this._formBuilder.group({
                        show: false,
                        label: 'Cancelar'
                    })
                }),
                dismissible: true
            });

            const dialogRef = this._fcService.open(this.configForm.value);

            // Subscribe to afterClosed from the dialog reference
            dialogRef.afterClosed().subscribe((result) => {
                if (result == 'confirmed') {


                }
            });

            this._changeDetectorRef.markForCheck();
        }
    }

    /**
     * close Dialog
     */
    Close(): void
    {
        // Close the dialog
        this.matDialogRef.close();
    }

    saveDetails(): void{

        // Build the config form
        this.configForm = this._formBuilder.group({
            title: 'Alerta',
            message: `Estimado Usuario, esta seguro de guardar el detalle?`,
            icon: this._formBuilder.group({
                show: true,
                name: 'heroicons_outline:exclamation',
                color: 'warn'
            }),
            actions: this._formBuilder.group({
                confirm: this._formBuilder.group({
                    show: true,
                    label: 'Confirmar',
                    color: 'warn'
                }),
                cancel: this._formBuilder.group({
                    show: true,
                    label: 'Cancelar'
                })
            }),
            dismissible: true
        });

        const dialogRef = this._fcService.open(this.configForm.value);

        // Subscribe to afterClosed from the dialog reference
        dialogRef.afterClosed().subscribe((result) => {
            if (result == 'confirmed') {

                let details = this.ControlForm.get('details').getRawValue();
                /*details.map( item => {
                    console.warn('item',item);
                    Object.keys(item).forEach(key => {
                        if (!item[key]) {
                            item[key] = '';
                        }
                        if ( ['fecha_vencimiento'].includes(key) && item[key]) {
                            item[key] = moment(item[key]).format('YYYY-MM-DD');
                        }
                    });
                });*/
                this._loadService.show();
                this._toolService.saveDetails(this.row.id_recepcion,JSON.stringify(details))
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((response) => {
                        this._loadService.hide();
                        this.matDialogRef.close(response);
                    });

            }
        });
    }

    addDetailField(): void{

        if ( (this.ControlForm.get('details') as FormArray).length < this.row.cantidad_recepcionada ) {

            this._toolService.addDetail(this.row.id_recepcion)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((response) => {
                    const detailsFormGroup = this._formBuilder.group({
                        id_recepcion        : [this.row.id_recepcion],
                        id_recepcion_detalle: [response.id_recepcion_detalle],
                        serial_registrado   : ['',[Validators.required]],
                        nro_lote            : [''],
                        fecha_vencimiento   : [''],
                        cantidad            : [1],
                        fecha_inspeccion    : [''],
                        contador            : [this.contador+1]
                        /*fecha_reg: moment().format('DD/MM/YYYY HH:mm:ss'),
                        usuario_reg: this.dataUser*/
                    });
                    //detailsFormGroup.get('id_recepcion_detalle').setValue(response.id_recepcion_detalle);
                    (this.ControlForm.get('details') as FormArray).push(detailsFormGroup);
                    this.total_detail++;
                    this.contador++;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });

            // Mark for check
            //this._changeDetectorRef.markForCheck();
        }else{
            // Build the config form
            this.configForm = this._formBuilder.group({
                title: 'ADVERTENCIA',
                message: `Estimado Usuario, la cantidad recepcionada es ${this.row.cantidad_recepcionada}, no es posible agregar mas detalles !!!`,
                icon: this._formBuilder.group({
                    show: true,
                    name: 'heroicons_outline:exclamation',
                    color: 'warn'
                }),
                actions: this._formBuilder.group({
                    confirm: this._formBuilder.group({
                        show: true,
                        label: 'Aceptar',
                        color: 'warn'
                    }),
                    cancel: this._formBuilder.group({
                        show: false,
                        label: 'Cancelar'
                    })
                }),
                dismissible: true
            });

            const dialogRef = this._fcService.open(this.configForm.value);

            // Subscribe to afterClosed from the dialog reference
            dialogRef.afterClosed().subscribe((result) => {
                if (result == 'confirmed') {


                }
            });
        }
    }

    /**
     * Remove the day and percent field
     *
     * @param index
     */
    removeDetailField(index: number): void
    {


        const detailsFormArray = this.ControlForm.get('details') as FormArray;
        const detail = detailsFormArray.at(index).value;
        detailsFormArray.removeAt(index);
        this._toolService.removeDetail(detail.id_recepcion_detalle)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response) => {

            });
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }
}
