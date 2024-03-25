import {ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import {MatDrawer, MatDrawerToggleResult} from "@angular/material/sidenav";
import {MatFormFieldModule} from "@angular/material/form-field";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatIconModule} from "@angular/material/icon";
import {MatTooltipModule} from "@angular/material/tooltip";
import {IncomingListComponent} from "../incoming-list/incoming-list.component";
import {RouterLink} from "@angular/router";
import {SisMaterialesNgService} from "../sis-materiales-ng.service";
import {Subject} from "rxjs";
import {OverlayRef} from "@angular/cdk/overlay";
import {NgIf} from "@angular/common";
import {DeclineDialogComponent} from "../incoming-list/decline-dialog/decline-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {AgreeDialogComponent} from "../agree-dialog/agree-dialog.component";
import {MatMenuModule} from "@angular/material/menu";

@Component({
    selector: 'erp-incoming-details',
    standalone: true,
    imports: [FormsModule,ReactiveFormsModule,MatFormFieldModule,MatInputModule,MatIconModule,MatTooltipModule,RouterLink,NgIf,MatMenuModule],
    templateUrl: './incoming-details.component.html'
})
export class IncomingDetailsComponent {

    public editMode: boolean = false;
    public incoming;

    private _tagsPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    /**
     * Constructor
     */
    constructor(
        private _list: IncomingListComponent,
        private _changeDetectorRef: ChangeDetectorRef,
        private _toolService: SisMaterialesNgService,
        private _matDialog: MatDialog,
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
            console.warn('item',item);
            this.incoming = item;
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

    /**
     * Close the drawer
     */
    closeDrawer(): Promise<MatDrawerToggleResult>
    {
        return this._list.matDrawer.close();
    }

    execute(option, row){

        let id =  row.id_recepcion;
        let dialogRef;
        switch (option) {
            case 'print_single':
                this._toolService.printIncoming(id,row.tipo,0).subscribe((html)=>{
                    const popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
                    popupWinindow.document.open();
                    popupWinindow.document.write(html);
                    popupWinindow.document.close();
                });
                break;
            case 'print_block':
                this._toolService.printIncoming(id,row.tipo,row.cantidad_recepcionada).subscribe((html)=>{
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
                        id
                    }
                });

                dialogRef.afterClosed()
                    .subscribe((result) =>
                    {
                        this._list.reload();
                        console.warn('Compose dialog was closed!',result);
                        return this._list.matDrawer.close();
                    });

                break;
            case 'decline':

                // Open the dialog
                dialogRef = this._matDialog.open(DeclineDialogComponent,{
                    data:{
                        id
                    }
                });

                dialogRef.afterClosed()
                    .subscribe((result) =>
                    {
                        this._list.reload();
                        console.warn('Compose dialog was closed!',result);
                        return this._list.matDrawer.close();
                    });
                break;
        }
    }
}
