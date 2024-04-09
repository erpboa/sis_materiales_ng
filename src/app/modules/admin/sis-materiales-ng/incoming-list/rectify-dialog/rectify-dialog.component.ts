import { Component, Inject} from '@angular/core';
import {FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {Subject} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {SisMaterialesNgService} from "../../sis-materiales-ng.service";
import {MatIconModule} from "@angular/material/icon";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatButtonModule} from "@angular/material/button";
import {MatInputModule} from "@angular/material/input";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";

@Component({
  selector: 'erp-rectify-dialog',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule,MatInputModule,MatButtonModule,MatIconModule,MatFormFieldModule,MatProgressSpinnerModule],
  templateUrl: './rectify-dialog.component.html',
  styleUrl: './rectify-dialog.component.scss'
})
export class RectifyDialogComponent {

    public rectifyForm: UntypedFormGroup;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public processing: boolean = false;
    /**
     * Constructor
     */
    constructor(
        @Inject(MAT_DIALOG_DATA) private _data: any,
        private _toolService: SisMaterialesNgService,
        public _matDialogRef: MatDialogRef<RectifyDialogComponent>,
        private _formBuilder: UntypedFormBuilder
    ){}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Create the form
        this.rectifyForm = this._formBuilder.group({
            observacion   : ['', [Validators.required]],
        });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    discard(){
        this._matDialogRef.close();
    }

    save(){
        this.processing = true;
        const rectify = this.rectifyForm.getRawValue();
        this._toolService.rectifyIncoming(this._data.id,rectify).subscribe(
            (response)=>{
                this.processing = false;
                this._matDialogRef.close();
            }
        );
    }

}
