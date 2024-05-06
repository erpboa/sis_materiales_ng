import {ChangeDetectorRef, Component, ElementRef, TemplateRef, ViewChild, ViewContainerRef} from '@angular/core';
import {MatDrawer, MatDrawerToggleResult} from "@angular/material/sidenav";
import {MatFormFieldModule} from "@angular/material/form-field";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatIconModule} from "@angular/material/icon";
import {MatTooltipModule} from "@angular/material/tooltip";
import {IncomingListComponent} from "../incoming-list/incoming-list.component";
import {RouterLink} from "@angular/router";
import {SisMaterialesNgService} from "../sis-materiales-ng.service";
import {Subject} from "rxjs";
import {Overlay, OverlayRef} from "@angular/cdk/overlay";
import {DatePipe, NgClass, NgFor, NgIf} from "@angular/common";
import {DeclineDialogComponent} from "../incoming-list/decline-dialog/decline-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {AgreeDialogComponent} from "../incoming-list/agree-dialog/agree-dialog.component";
import {MatMenuModule} from "@angular/material/menu";
import {MatBadgeModule} from '@angular/material/badge';
import * as moment from 'moment';
import {RectifyDialogComponent} from "../incoming-list/rectify-dialog/rectify-dialog.component";
import {TemplatePortal} from "@angular/cdk/portal";
import {MatButtonModule} from "@angular/material/button";
import {BobyConfirmationService} from "../../../../../@boby/services/confirmation";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {DetailsDialogComponent} from "../incoming-list/details-dialog/details-dialog.component";
import {takeUntil} from "rxjs/operators";
import {MatSelectModule} from "@angular/material/select";

@Component({
    selector: 'erp-incoming-details',
    standalone: true,
    imports: [FormsModule,ReactiveFormsModule,MatFormFieldModule,MatInputModule,MatIconModule,MatTooltipModule,RouterLink,NgIf,NgFor,NgClass,MatMenuModule,DatePipe,MatBadgeModule,MatButtonModule,MatDatepickerModule,MatSelectModule],
    templateUrl: './incoming-details.component.html'
})
export class IncomingDetailsComponent {

    public editMode: boolean = false;
    public incoming;

    private _tagsPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public current_date: any = moment().format("YYYY-MM-DD");

    public listType: any = [];
    /** Panel Combo*/
    private _eventPanelOverlayRef: OverlayRef;
    @ViewChild('eventPanel') private _eventPanel: TemplateRef<any>;
    @ViewChild('quantity') quantity: ElementRef;
    private configForm: FormGroup;
    public detailsForm: FormGroup;

    /**
     * Constructor
     */
    constructor(
        private _list: IncomingListComponent,
        private _changeDetectorRef: ChangeDetectorRef,
        private _toolService: SisMaterialesNgService,
        private _matDialog: MatDialog,
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef,
        private _formBuilder: FormBuilder,
        private _fcService: BobyConfirmationService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Open the drawer
        this._list.matDrawer.open();

        this._toolService.incoming$.subscribe((item)=>{
            this.incoming = item;
        });

        if ( this.incoming.estado == 'incoming' ) {
            this.detailsForm = this._formBuilder.group({
                tipo_entrada: ['']
            });
        }else if( this.incoming.estado == 'aprobado' ){
            this.detailsForm = this._formBuilder.group({
                serial_registrado: [''],
                nro_lote: [''],
                fecha_vencimiento: [''],
                fecha_inspeccion: [''],
                tipo_entrada: ['']
            });
        }

        this._toolService.getCategoryList('ct')
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((list: any[]) => {
                this.listType = list;
                // Mark for check
                this._changeDetectorRef.markForCheck();
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

        // Dispose the overlays if they are still on the DOM
        if ( this._tagsPanelOverlayRef )
        {
            this._tagsPanelOverlayRef.dispose();
        }
    }

    /**
     * Toggle edit mode
     *
     * @param editMode
     */
    toggleEditMode(editMode: boolean | null = null): void
    {
        if ( editMode === null )
        {
            this.editMode = !this.editMode;
        }
        else
        {
            this.editMode = editMode;
        }

        if(this.editMode){
            if ( this.incoming.estado == 'incoming' ) {
                this.detailsForm = this._formBuilder.group({
                    tipo_entrada: this.incoming.tipo_entrada
                });
            }else if( this.incoming.estado == 'aprobado' ){
                this.detailsForm.patchValue({
                    serial_registrado: this.incoming.serial_registrado,
                    nro_lote: this.incoming.nro_lote,
                    fecha_vencimiento: this.incoming.fecha_vencimiento,
                    fecha_inspeccion: this.incoming.fecha_inspeccion,
                    tipo_entrada: this.incoming.tipo_entrada
                });
            }
        }

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

    displayType(attribute1,attribute2) {
        if (attribute1 == attribute2) {
            return attribute1;
        } else {
            return "";
        }
    }

    /**
     * Close the drawer
     */
    closeDrawer(): Promise<MatDrawerToggleResult>
    {
        return this._list.matDrawer.close();
    }

    execute(option,row,size){

        let id =  row.id_recepcion;
        let type =  row.tipo;
        let dialogRef;
        switch (option) {
            case 'print_single':
                this._toolService.printIncoming(id,row.tipo,0,size,row.exchange).subscribe((html)=>{
                    const popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
                    popupWinindow.document.open();
                    popupWinindow.document.write(html);
                    popupWinindow.document.close();
                });
                break;
            case 'print_block':

                const quantity = +this.quantity.nativeElement.value != +row.cantidad_recepcionada ? +this.quantity.nativeElement.value : row.cantidad_recepcionada;

                this._toolService.printIncoming(id,row.tipo,quantity,size,row.exchange).subscribe((html)=>{
                    this._closeEventPanel();
                    const popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
                    popupWinindow.document.open();
                    popupWinindow.document.write(html);
                    popupWinindow.document.close();
                });
                break;
            case 'agree':
                // Open the dialog
                dialogRef = this._matDialog.open(AgreeDialogComponent,{
                    data:{
                        id,
                        type
                    },
                    disableClose: true
                });

                dialogRef.afterClosed()
                    .subscribe((result) =>
                    {
                        this._list.reload();
                        return this._list.matDrawer.close();
                    });

                break;
            case 'without_form':
                this.configForm = this._formBuilder.group({
                    title: 'Alerta',
                    message: `<p class="font-bold">Estimado Usuario:<br> Esta seguro aprobar la Entrada sin completar el formulario?</p>`,
                    icon: this._formBuilder.group({
                        show: true,
                        name: 'heroicons_outline:exclamation-circle',
                        color: 'warn'
                    }),
                    actions: this._formBuilder.group({
                        confirm: this._formBuilder.group({
                            show: true,
                            label: 'Aceptar',
                            color: 'warn'
                        }),
                        cancel: this._formBuilder.group({
                            show: true,
                            label: 'Cancelar'
                        })
                    }),
                    dismissible: true
                });

                dialogRef = this._fcService.open(this.configForm.value);

                dialogRef.afterClosed().subscribe((result) => {

                    if(result == 'confirmed'){
                        this._toolService.agree(id, '', '', '','').subscribe(
                            (response) => {
                                this._list.reload();
                                return this._list.matDrawer.close();
                            }
                        );
                    }
                });
                break;
            case 'decline':

                // Open the dialog
                dialogRef = this._matDialog.open(DeclineDialogComponent,{
                    data:{
                        id
                    },
                    disableClose: true
                });

                dialogRef.afterClosed()
                    .subscribe((result) =>
                    {
                        this._list.reload();
                        return this._list.matDrawer.close();
                    });
                break;
            case 'upload_detail':
                // Open the dialog
                dialogRef = this._matDialog.open(DetailsDialogComponent,{
                    data:{
                        row
                    },
                    disableClose: true
                });

                dialogRef.afterClosed()
                    .subscribe((result) =>
                    {
                        this._list.reload();
                        //return this._list.matDrawer.close();
                    });
                break;
        }
    }

    isEmpty(item){
        return Object.entries(item).length === 0
    }

    rectify(row){
        let id =  row.id_recepcion;
        // Open the dialog
        let dialogRef = this._matDialog.open(RectifyDialogComponent,{
            data:{
                id
            },
            disableClose: true
        });

        dialogRef.afterClosed()
            .subscribe((result) =>
            {
                this._list.reload();
                return this._list.matDrawer.close();
            });
    }

    onEventClick(event): void
    {

        const positionStrategy = this._overlay.position().flexibleConnectedTo(event.target).withFlexibleDimensions(false).withPositions([
            {
                originX : 'end',
                originY : 'top',
                overlayX: 'start',
                overlayY: 'top',
                offsetX : 8
            },
            {
                originX : 'start',
                originY : 'top',
                overlayX: 'end',
                overlayY: 'top',
                offsetX : -8
            },
            {
                originX : 'start',
                originY : 'bottom',
                overlayX: 'end',
                overlayY: 'bottom',
                offsetX : -8
            },
            {
                originX : 'end',
                originY : 'bottom',
                overlayX: 'start',
                overlayY: 'bottom',
                offsetX : 8
            }
        ]);

        // Create the overlay if it doesn't exist
        if ( !this._eventPanelOverlayRef )
        {
            this._createEventPanelOverlay(positionStrategy);
        }
        // Otherwise, just update the position
        else
        {
            this._eventPanelOverlayRef.updatePositionStrategy(positionStrategy);
        }

        // Attach the portal to the overlay
        this._eventPanelOverlayRef.attach(new TemplatePortal(this._eventPanel, this._viewContainerRef));

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Create the event panel overlay
     *
     * @private
     */
    private _createEventPanelOverlay(positionStrategy): void
    {
        // Create the overlay
        this._eventPanelOverlayRef = this._overlay.create({
            panelClass    : ['calendar-event-panel'],
            backdropClass : '',
            hasBackdrop   : true,
            scrollStrategy: this._overlay.scrollStrategies.reposition(),
            positionStrategy
        });

        // Detach the overlay from the portal on backdrop click
        this._eventPanelOverlayRef.backdropClick().subscribe(() => {
            this._closeEventPanel();
        });
    }

    /**
     * Close the event panel
     *
     * @private
     */
    private _closeEventPanel(): void
    {
        // Detach the overlay from the portal
        this._eventPanelOverlayRef.detach();
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    updateAgree(row){
        const agree = this.detailsForm.getRawValue();
        Object.keys(agree).forEach(key => {
            if(!agree[key]){
                agree[key] = '';
            }
            if( ['fecha_vencimiento','fecha_inspeccion'].includes(key) && agree[key] ){
                agree[key] = moment(agree[key]).format('YYYY-MM-DD');
            }
        });
        agree.id_recepcion = row.id_recepcion;

        this._toolService.updateAgree(agree).subscribe(
            (response) => {
                this.toggleEditMode(false);
                this._list.reload();
                return this._list.matDrawer.close();
            }
        );
    }

}
