import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostListener, OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {AsyncPipe, DatePipe, NgClass, NgFor, NgIf} from '@angular/common';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {FormsModule, ReactiveFormsModule, UntypedFormControl} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {MatSort, Sort, MatSortModule} from "@angular/material/sort";
import {SisMaterialesNgService} from "../sis-materiales-ng.service";
import {Observable} from "rxjs";
import {MatTableExporterModule} from "mat-table-exporter";
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatPaginator, MatPaginatorModule, PageEvent} from "@angular/material/paginator";
import { MatTooltipModule } from '@angular/material/tooltip';
import {BobyConfirmationService} from "../../../../../@boby/services/confirmation";
import {DeclineDialogComponent} from "./decline-dialog/decline-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {MatTabsModule} from "@angular/material/tabs";
import { TableModule } from 'primeng/table';
import {ActivatedRoute, Router, RouterOutlet} from "@angular/router";
import {MatDrawer, MatSidenavModule} from "@angular/material/sidenav";
import {AgreeDialogComponent} from "./agree-dialog/agree-dialog.component";
import {MatMenuModule} from "@angular/material/menu";
import * as moment from "moment";
import {RectifyDialogComponent} from "./rectify-dialog/rectify-dialog.component";
import {BobyLoadingService} from "@boby/services/loading";

@Component({
    selector: 'erp-incoming-list',
    standalone: true,
    templateUrl: './incoming-list.component.html',
    styleUrls:['./incoming-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule,ReactiveFormsModule,MatTableModule,MatSortModule,MatFormFieldModule,MatIconModule,MatInputModule,MatButtonModule,NgIf,NgFor,NgClass,AsyncPipe,DatePipe,MatTableExporterModule,MatPaginatorModule,MatTooltipModule,MatTabsModule,TableModule,MatSidenavModule,RouterOutlet,MatMenuModule]
})
export class IncomingListComponent implements OnInit{

    @ViewChild(MatSort) private _sort: MatSort;
    @ViewChild(MatPaginator) private paginator: MatPaginator;
    @ViewChild('matDrawer', {static: true}) matDrawer: MatDrawer;

    public isLoading: boolean = false;
    public searchInputControl: UntypedFormControl = new UntypedFormControl();
    public incoming$: Observable<any []>;

    private sort = 'nro_guia';
    private dir = 'desc';

    public selectedItem: any = {};

    public displayedColumns = ['nro_guia','fecha_guia','nro_parte_cot','descripcion_cot','tipo','cantidad_recepcionada','accion'];

    public cols: any = [
        {header:'No Tramite',field:'nro_tramite',class:'bg-primary p-2 font-bold text-left min-w-44',width:'min-w-44'},
        {header:'Fecha Guia',field:'fecha_guia',class:'bg-primary p-2 font-bold text-left min-w-28',width:'min-w-28'},
        {header:'Tipo',field:'tipo',class:'bg-primary p-2 font-bold text-left min-w-28',width:'min-w-28'},
        {header:'No PO',field:'nro_po',class:'bg-primary p-2 font-bold text-left min-w-36',width:'min-w-36'},
        {header:'Part Number',field:'nro_parte_cot',class:'bg-primary p-2 font-bold text-left min-w-48',width:'min-w-48'},
        {header:'Desc. Cotización',field:'descripcion_cot',class:'bg-primary p-2 font-bold text-left min-w-96',width:'min-w-96'},
        {header:'Cant. Requerida',field:'cantidad_det',class:'bg-primary p-2 font-bold text-left min-w-72',width:'min-w-72'},
        {header:'Cant. Recepcionada',field:'cantidad_recepcionada',class:'bg-primary p-2 font-bold text-left min-w-44',width:'min-w-44'},
        {header:'Nro. Guia',field:'nro_guia',class:'bg-primary p-2 font-bold text-left min-w-44',width:'min-w-44'},
    ];

    public getScreenWidth: any;

    pagination: any;

    public totalRows = 0;
    public currentPage = 0;
    public pageSize = 6;
    public pageSizeOptions: number[] = [3,6,12,24,45,90,120,360];
    private query = '';
    public listIncoming: any = [];
    public filteredIncoming: any = [];

    private status:String = 'incoming';

    public drawerMode: 'side' | 'over';

    public current_date: any = moment().format("YYYY-MM-DD");
    constructor(
        private _toolService: SisMaterialesNgService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _matDialog: MatDialog,
        private _bobyConfirmationService: BobyConfirmationService,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _loadService: BobyLoadingService,
    ) {

    }
    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this._loadService.show();
        this._toolService.listIncoming(this.currentPage*this.pageSize,this.pageSize,this.sort,this.dir,this.query,this.status).subscribe(
            (list:any) => {
                this._loadService.hide();
                const djson = JSON.parse(list.datos[0].djson);
                this.listIncoming = this.filteredIncoming = djson;
                this.totalRows = list?.total ?? 0;
                this._changeDetectorRef.markForCheck();

            }
        );
    }

    /**
     * On backdrop clicked
     */
    onBackdropClicked(): void
    {
        // Go back to the list
        this._router.navigate(['./'], {relativeTo: this._activatedRoute});

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    @HostListener('window:resize', ['$event'])
    onWindowResize() {
        this.getScreenWidth = window.innerWidth;
        //console.log(this.getScreenWidth);
    }

    pageChanged(event: PageEvent) {
        this.pageSize = event.pageSize;
        this.currentPage = event.pageIndex;
        this._loadService.show();
        this._toolService.listIncoming(this.currentPage*this.pageSize,this.pageSize,this.sort,this.dir,this.query,this.status).subscribe(
            (list:any) => {
                this._loadService.hide();
                const djson = JSON.parse(list.datos[0].djson);
                this.listIncoming = this.filteredIncoming = djson;
                this.totalRows = list?.total ?? 0;
                this._changeDetectorRef.markForCheck();

            }
        );
    }

    ngAfterViewInit() {
        if ( this.paginator ) {
            this.paginator._intl.itemsPerPageLabel = "Registros por pagina";
            this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
                if (length === 0 || pageSize === 0) {
                    return `0 de ${length}`;
                }
                length = Math.max(length, 0);
                const startIndex = page * pageSize;
                // If the start index exceeds the list length, do not try and fix the end index to the end.
                const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
                return `${startIndex + 1} - ${endIndex} de ${length}`;
            };
            this.paginator._intl.nextPageLabel = 'Página Siguiente';
            this.paginator._intl.firstPageLabel = 'Primera Página';
            this.paginator._intl.lastPageLabel = 'Ultima Página';
            this.paginator._intl.previousPageLabel = 'Página Anterior';

            this.paginator.pageIndex = this.currentPage;
            this.paginator.length = this.totalRows;
        }
    }

    /**
     * Create product
     */
    createProduct(): void
    {

    }

    redirect(row){
        this.selectedItem = row;
        this._router.navigate(['./', row.id_recepcion], {relativeTo: this._activatedRoute});
    }

    execute(option, row, size){
        let id =  row.id_recepcion;
        let type =  row.tipo;
        let dialogRef;
        switch (option) {
            case 'print_single':
                this._toolService.printIncoming(id,row.tipo,0,size).subscribe((html) => {
                    const popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
                    popupWinindow.document.open();
                    popupWinindow.document.write(html);
                    popupWinindow.document.close();
                });
                break;
            case 'print_block':
                this._toolService.printIncoming(id,row.tipo,row.cantidad_recepcionada, size).subscribe((html)=>{
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
                        this._toolService.listIncoming(this.currentPage*this.pageSize,this.pageSize,this.sort,this.dir,this.query,this.status).subscribe(
                            (list:any) => {
                                const djson = JSON.parse(list.datos[0].djson);
                                this.listIncoming = this.filteredIncoming = djson;
                                this.totalRows = list?.total ?? 0;
                                this._changeDetectorRef.markForCheck();
                                this._router.navigate(['./'], {relativeTo: this._activatedRoute});
                            }
                        );
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
                        this._toolService.listIncoming(this.currentPage*this.pageSize,this.pageSize,this.sort,this.dir,this.query,this.status).subscribe(
                            (list:any) => {
                                const djson = JSON.parse(list.datos[0].djson);
                                this.listIncoming = this.filteredIncoming = djson;
                                this.totalRows = list?.total ?? 0;
                                this._changeDetectorRef.markForCheck();
                                this._router.navigate(['./'], {relativeTo: this._activatedRoute});
                            }
                        );
                    });
                break;
        }
    }
    sortData(sort: Sort) {
        this.sort = sort.active;
        this.dir = sort.direction;
        this._loadService.show();
        this._toolService.listIncoming(this.currentPage*this.pageSize,this.pageSize,this.sort,this.dir,this.query,this.status).subscribe(
            (list:any) => {
                this._loadService.hide();
                const djson = JSON.parse(list.datos[0].djson);
                this.listIncoming = this.filteredIncoming = djson;
                this.totalRows = list?.total ?? 0;
                this._changeDetectorRef.markForCheck();

            }
        );
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

    selectedTabChange(tab){
        this.currentPage = 0;
        switch (tab.index) {
            case 0:
                this.status = 'incoming';
                break;
            case 1:
                this.status = 'aprobado';
                break;
            case 2:
                this.status = 'rechazado';
                break;
        }
        this._loadService.show();
        this._toolService.listIncoming(this.currentPage*this.pageSize,this.pageSize,this.sort,this.dir,this.query,this.status).subscribe(
            (list:any) => {
                this._loadService.hide();
                const djson = JSON.parse(list.datos[0].djson);
                this.listIncoming = this.filteredIncoming = djson;
                this.totalRows = list?.total ?? 0;
                this._changeDetectorRef.markForCheck();

            }
        );
    }

    reload(){
        this._loadService.show();
        this._toolService.listIncoming(this.currentPage*this.pageSize,this.pageSize,this.sort,this.dir,this.query,this.status).subscribe(
            (list:any) => {
                this._loadService.hide();
                const djson = JSON.parse(list.datos[0].djson);
                this.listIncoming = this.filteredIncoming = djson;
                this.totalRows = list?.total ?? 0;
                this._changeDetectorRef.markForCheck();
                this._router.navigate(['./'], {relativeTo: this._activatedRoute});
            }
        );
    }

    /**
     * Filter by search query
     *
     * @param query
     */
    filterByQuery(query: string): void
    {
        this._loadService.show();
        this._toolService.listIncoming(this.currentPage*this.pageSize,this.pageSize,this.sort,this.dir,query,this.status).subscribe(
            (list:any) => {
                this._loadService.hide();
                const djson = JSON.parse(list.datos[0].djson);
                this.listIncoming = this.filteredIncoming = djson;
                this.totalRows = list?.total ?? 0;
                this._changeDetectorRef.markForCheck();
            }
        );

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
                this._toolService.listIncoming(this.currentPage*this.pageSize,this.pageSize,this.sort,this.dir,this.query,this.status).subscribe(
                    (list:any) => {
                        const djson = JSON.parse(list.datos[0].djson);
                        this.listIncoming = this.filteredIncoming = djson;
                        this.totalRows = list?.total ?? 0;
                        this._changeDetectorRef.markForCheck();
                        this._router.navigate(['./'], {relativeTo: this._activatedRoute});
                    }
                );
            });
    }

    isEmpty(item){
        return Object.entries(item).length === 0;
    }
}
