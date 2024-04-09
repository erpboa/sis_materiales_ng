import {Component, Inject} from '@angular/core';

import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {SisMaterialesNgService} from "../../sis-materiales-ng.service";
import {FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatIconModule} from "@angular/material/icon";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {TextFieldModule} from "@angular/cdk/text-field";
import {
    DateAdapter,
    MAT_DATE_FORMATS,
    MAT_DATE_LOCALE,
    MatNativeDateModule,
    MatRippleModule
} from "@angular/material/core";
import {
    MAT_LUXON_DATE_FORMATS,
    LuxonDateAdapter,
    MAT_LUXON_DATE_ADAPTER_OPTIONS,
} from '@angular/material-luxon-adapter';
import {MatButtonModule} from "@angular/material/button";
import {MatLuxonDateModule} from "@angular/material-luxon-adapter";
import {NgIf} from "@angular/common";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";

@Component({
    selector: 'erp-agree-dialog',
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule,MatFormFieldModule,MatInputModule,MatIconModule,MatDatepickerModule,TextFieldModule,MatRippleModule,MatButtonModule,MatNativeDateModule,MatLuxonDateModule,NgIf,MatProgressSpinnerModule],
    templateUrl: './agree-dialog.component.html'
})
export class AgreeDialogComponent {

    public agreeForm: UntypedFormGroup;
    public type: any;
    public processing: boolean = false;
    /**
     * Constructor
     */
    constructor(
        @Inject(MAT_DIALOG_DATA) private _data: any,
        private _toolService: SisMaterialesNgService,
        public _matDialogRef: MatDialogRef<AgreeDialogComponent>,
        private _formBuilder: UntypedFormBuilder,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.type = this._data.type;
        // Create the form
        if ( ['Consumibles','Herramientas'].includes(this._data.type) ){
            this.agreeForm = this._formBuilder.group({
                nro_lote            : ['', [Validators.required]],
                fecha_vencimiento   : ['', [Validators.required]],
            });
        }else if ( this._data.type === 'Rotables' ){
            this.agreeForm = this._formBuilder.group({
                serial_registrado   : ['', [Validators.required]],
                fecha_vencimiento   : ['', [Validators.required]],
            });
        }


        this._toolService.getAgreeData(this._data.id).subscribe((data)=>{
            this.agreeForm.patchValue(data);
        });
    }

    discard(){
        this._matDialogRef.close();
    }

    save(){
        const agree = this.agreeForm.getRawValue();
        this.processing = true;
        if ( this._data.type === 'Consumibles' ) {
            this._toolService.agree(this._data.id, '', agree.nro_lote, agree.fecha_vencimiento).subscribe(
                (response) => {
                    this.processing = false;
                    this._matDialogRef.close();
                }
            );
        }else if ( this._data.type === 'Rotables' ){
            this._toolService.agree(this._data.id, agree.serial_registrado, '', agree.fecha_vencimiento).subscribe(
                (response) => {
                    this.processing = false;
                    this._matDialogRef.close();
                }
            );
        }
    }

}
