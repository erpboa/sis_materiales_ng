import {Component, Inject} from '@angular/core';
import {FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {MatIconModule} from "@angular/material/icon";
import {SisMaterialesNgService} from "../../sis-materiales-ng.service";
import {MatSelectModule} from "@angular/material/select";

@Component({
  selector: 'erp-decline-dialog',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule,MatFormFieldModule,MatInputModule,MatButtonModule,MatIconModule,MatSelectModule],
  templateUrl: './decline-dialog.component.html'
})
export class DeclineDialogComponent {

    declineForm: UntypedFormGroup;

    /**
     * Constructor
     */
    constructor(
        @Inject(MAT_DIALOG_DATA) private _data: any,
        private _toolService: SisMaterialesNgService,
        public _matDialogRef: MatDialogRef<DeclineDialogComponent>,
        private _formBuilder: UntypedFormBuilder
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
        // Create the form
        this.declineForm = this._formBuilder.group({
            motivo_rechazo   : ['', [Validators.required]],
            observacion   : ['', [Validators.required]],
        });
    }

    discard(){
        this._matDialogRef.close();
    }

    save(){

        const decline = this.declineForm.getRawValue();
        this._toolService.decline(this._data.id,decline.motivo_rechazo,decline.observacion).subscribe(
            (response)=>{
                console.warn('DECLINE',response);
                this._matDialogRef.close();
            }
        );
    }

}
