import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, ElementRef,
    HostListener, OnInit, TemplateRef,
    ViewChild, ViewContainerRef,
    ViewEncapsulation,
    Renderer2
} from '@angular/core';
import {AsyncPipe, DatePipe, NgClass, NgFor, NgIf} from '@angular/common';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormControl} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {MatSort, Sort, MatSortModule} from "@angular/material/sort";
import {SisMaterialesNgService} from "../sis-materiales-ng.service";
import {Observable} from "rxjs";
import {MatTableExporterModule} from "mat-table-exporter";
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatPaginator, MatPaginatorModule, PageEvent} from "@angular/material/paginator";
import { MatTooltipModule } from '@angular/material/tooltip';
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
import {Overlay, OverlayRef} from "@angular/cdk/overlay";
import {TemplatePortal} from "@angular/cdk/portal";
import {BobyNumbersOnlyDirective} from "../../../../../@boby/directives/numbers-only";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {BobyConfirmationService} from "@boby/services/confirmation";
import {DetailsDialogComponent} from "./details-dialog/details-dialog.component";
import {cloneDeep} from "lodash-es";
import {MatCheckboxChange, MatCheckboxModule} from "@angular/material/checkbox";
import {MatBadgeModule} from "@angular/material/badge";

@Component({
    selector: 'erp-incoming-list',
    standalone: true,
    templateUrl: './incoming-list.component.html',
    styleUrls:['./incoming-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule,ReactiveFormsModule,MatTableModule,MatSortModule,MatFormFieldModule,MatIconModule,MatInputModule,MatButtonModule,NgIf,NgFor,NgClass,AsyncPipe,DatePipe,MatTableExporterModule,MatPaginatorModule,MatTooltipModule,MatTabsModule,TableModule,MatSidenavModule,RouterOutlet,MatMenuModule,BobyNumbersOnlyDirective,MatButtonToggleModule,MatCheckboxModule,MatBadgeModule]
})
export class IncomingListComponent implements OnInit{

    @ViewChild(MatSort) private _sort: MatSort;
    @ViewChild(MatPaginator) private paginator: MatPaginator;
    @ViewChild('matDrawer', {static: true}) matDrawer: MatDrawer;

    @ViewChild('quantity') quantity: ElementRef;

    public isLoading: boolean = false;
    public searchInputControl: UntypedFormControl = new UntypedFormControl();
    public incoming$: Observable<any []>;

    private sort = 'nro_guia';
    private dir = 'desc';

    public selectedItem: any = {};

    public displayedColumns = ['accion','nro_guia','fecha_guia','nro_parte_cot','descripcion_cot','tipo','cantidad_recepcionada','serial_registrado','nro_lote','fecha_entrada','fecha_aprobacion'];

    public addDisplayedColumns = ['nro_tramite','nro_po','cantidad_det','estado','cantidad_pendiente','nro_parte_alterno_cot','cd','motivo_rechazo','fecha_vencimiento','fecha_reg','fecha_mod','usr_reg','usr_mod'];

    private bg_color: any = 'bg-green-600';
    public cols: any = [
        {header:'Nro. Guia',field:'nro_guia',class:'p-2 font-bold text-left min-w-40',width:'min-w-40',checked:true,order:1},
        {header:'Fecha Guia',field:'fecha_guia',class:'p-2 font-bold text-left min-w-28',width:'min-w-28',checked:true,order:2},
        {header:'Part Number',field:'nro_parte_cot',class:'p-2 font-bold text-left min-w-48',width:'min-w-48',checked:true,order:3},
        {header:'Desc. Cotización',field:'descripcion_cot',class:'p-2 font-bold text-left min-w-96',width:'min-w-96',checked:true,order:4},
        {header:'Tipo',field:'tipo',class:'p-2 font-bold text-left min-w-28',width:'min-w-28',checked:true,order:5},
        {header:'Cant. Recepcionada',field:'cantidad_recepcionada',class:'p-2 font-bold text-left min-w-44',width:'min-w-44',checked:true,order:6},

        {header:'Nro. Serial',field:'serial_registrado',class:'p-2 font-bold text-left min-w-36',width:'min-w-36',checked:true,order:7},
        {header:'Nro. Lote',field:'nro_lote',class:'p-2 font-bold text-left min-w-36',width:'min-w-36',checked:true,order:8},

        {header:'Fecha Entrada',field:'fecha_entrada',class:'p-2 font-bold text-left min-w-36',width:'min-w-36',checked:true,order:9},
        {header:'Fecha Aprobacion',field:'fecha_aprobacion',class:'p-2 font-bold text-left min-w-40',width:'min-w-40',checked:true,order:10},

        {header:'No Tramite',field:'nro_tramite',class:'p-2 font-bold text-left min-w-44',width:'min-w-44',checked:false,order:11},
        {header:'No PO',field:'nro_po',class:'p-2 font-bold text-left min-w-36',width:'min-w-36',checked:false,order:12},
        {header:'Cant. Requerida',field:'cantidad_det',class:'p-2 font-bold text-left min-w-72',width:'min-w-72',checked:false,order:13},
        {header:'Estado',field:'estado',class:'p-2 font-bold text-left min-w-28',width:'min-w-28',checked:false,order:14},
        {header:'Cant. Pendiente',field:'cantidad_pendiente',class:'p-2 font-bold text-left min-w-44',width:'min-w-44',checked:false,order:15},
        {header:'Part Number Alterno',field:'nro_parte_alterno_cot',class:'p-2 font-bold text-left min-w-72',width:'min-w-72',checked:false,order:16},
        {header:'CD',field:'cd',class:'p-2 font-bold text-left min-w-24',width:'min-w-24',checked:false,order:17},
        {header:'Motivo Rechazo',field:'motivo_rechazo',class:'p-2 font-bold text-left min-w-44',width:'min-w-44',checked:false,order:18},
        {header:'Fecha Vencimiento',field:'fecha_vencimiento',class:'p-2 font-bold text-left min-w-40',width:'min-w-40',checked:false,order:19},
        {header:'Fecha Reg.',field:'fecha_reg',class:'p-2 font-bold text-left min-w-36',width:'min-w-36',checked:false,order:20},
        {header:'Fecha Mod.',field:'fecha_mod',class:'p-2 font-bold text-left min-w-36',width:'min-w-36',checked:false,order:21},
        {header:'Usuario Reg.',field:'usr_reg',class:'p-2 font-bold text-left min-w-36',width:'min-w-36',checked:false,order:22},
        {header:'Usuario Mod.',field:'usr_mod',class:'p-2 font-bold text-left min-w-36',width:'min-w-36',checked:false,order:23},
    ];

    public getScreenWidth: any;

    pagination: any;

    public totalRows = 0;
    public currentPage = 0;
    public pageSize = 24;
    public pageSizeOptions: number[] = [3,6,12,24,45,90,120,360];
    private query = '';
    public listIncoming: any = [];
    public filteredIncoming: any = [];

    public status:String = 'incoming';

    public drawerMode: 'side' | 'over';

    public current_date: any = moment().format("YYYY-MM-DD");

    private _eventPanelOverlayRef: OverlayRef;
    @ViewChild('eventPanel') private _eventPanel: TemplateRef<any>;
    public entries: any=true;
    private configForm: FormGroup;
    private exchange: string = 'maestro';
    listCheck: any;
    displayedColumnsCheck = cloneDeep(this.displayedColumns);

    @ViewChild('tagsPanel') private _tagsPanel: TemplateRef<any>;
    private _tagsPanelOverlayRef: OverlayRef;
    @ViewChild('tagsPanelOrigin') private _tagsPanelOrigin: ElementRef;
    filteredTags: any[];
    tagsEditMode: boolean = false;
    tags: any[];
    constructor(
        private _toolService: SisMaterialesNgService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _matDialog: MatDialog,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _loadService: BobyLoadingService,
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef,
        private _formBuilder: FormBuilder,
        private _fcService: BobyConfirmationService,
        private _renderer2: Renderer2
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
        this._toolService.listIncoming(this.currentPage*this.pageSize,this.pageSize,this.sort,this.dir,this.query,this.status,this.exchange).subscribe(
            (list:any) => {
                this._loadService.hide();
                const djson = JSON.parse(list.datos[0].djson);
                this.listIncoming = this.filteredIncoming = djson;
                this.totalRows = list?.total ?? 0;
                this._changeDetectorRef.markForCheck();

            }
        );

        let col;
        this.displayedColumnsCheck.shift();
        this.displayedColumnsCheck = this.displayedColumnsCheck.concat(this.addDisplayedColumns);
        this.listCheck = this.displayedColumnsCheck.map( (item,index) => {
            col = this.cols.find(elem => elem.field == item);
            return {field : col.field,header : col.header, width : col.width, checked : col.checked, order:index+1};
        });
    }

    showOptions(event:MatCheckboxChange): void {
        const item = this.listCheck.filter((elem) => {
            if (elem.field == event.source.value){
                elem.checked = event.checked
                return elem;
            }
        });

        if (event.checked){
            this.displayedColumns.splice(item[0].order,0,event.source.value);
        }else{
            this.displayedColumns = this.displayedColumns.filter( item => item !== event.source.value);
        }
        this._changeDetectorRef.markForCheck();
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
        this._toolService.listIncoming(this.currentPage*this.pageSize,this.pageSize,this.sort,this.dir,this.query,this.status,this.exchange).subscribe(
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
        console.warn('row',row);
        switch (option) {
            case 'print_single':
                this._toolService.printIncoming(id,row.tipo,0,size,row.exchange).subscribe((html) => {
                    const popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
                    popupWinindow.document.open();
                    popupWinindow.document.write(html);
                    popupWinindow.document.close();
                });
                break;
            case 'print_block':
                const quantity = +this.quantity.nativeElement.value != +row.cantidad_recepcionada ? +this.quantity.nativeElement.value : row.cantidad_recepcionada;

                this._toolService.printIncoming(id,row.tipo,quantity, size,row.exchange).subscribe((html)=>{
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
                        this._toolService.listIncoming(this.currentPage*this.pageSize,this.pageSize,this.sort,this.dir,this.query,this.status,this.exchange).subscribe(
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
                                this._toolService.listIncoming(this.currentPage*this.pageSize,this.pageSize,this.sort,this.dir,this.query,this.status,this.exchange).subscribe(
                                    (list:any) => {
                                        const djson = JSON.parse(list.datos[0].djson);
                                        this.listIncoming = this.filteredIncoming = djson;
                                        this.totalRows = list?.total ?? 0;
                                        this._changeDetectorRef.markForCheck();
                                        this._router.navigate(['./'], {relativeTo: this._activatedRoute});
                                    }
                                );
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
                        this._toolService.listIncoming(this.currentPage*this.pageSize,this.pageSize,this.sort,this.dir,this.query,this.status,this.exchange).subscribe(
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
                        this._toolService.listIncoming(this.currentPage*this.pageSize,this.pageSize,this.sort,this.dir,this.query,this.status,this.exchange).subscribe(
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
        this._toolService.listIncoming(this.currentPage*this.pageSize,this.pageSize,this.sort,this.dir,this.query,this.status,this.exchange).subscribe(
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
        this._toolService.listIncoming(this.currentPage*this.pageSize,this.pageSize,this.sort,this.dir,this.query,this.status,this.exchange).subscribe(
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
        this._toolService.listIncoming(this.currentPage*this.pageSize,this.pageSize,this.sort,this.dir,this.query,this.status,this.exchange).subscribe(
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
        this._toolService.listIncoming(this.currentPage*this.pageSize,this.pageSize,this.sort,this.dir,query,this.status,this.exchange).subscribe(
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
                this._toolService.listIncoming(this.currentPage*this.pageSize,this.pageSize,this.sort,this.dir,this.query,this.status,this.exchange).subscribe(
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

    exchangeList(value){
        this.entries = value;
        if( this.entries ){
            this.exchange = 'maestro';
            this._loadService.show();
            this._toolService.listIncoming(this.currentPage*this.pageSize,this.pageSize,this.sort,this.dir,this.query,this.status,this.exchange).subscribe(
                (list:any) => {
                    this._loadService.hide();
                    const djson = JSON.parse(list.datos[0].djson);
                    this.listIncoming = this.filteredIncoming = djson;
                    this.totalRows = list?.total ?? 0;
                    this._changeDetectorRef.markForCheck();
                    this._router.navigate(['./'], {relativeTo: this._activatedRoute});
                }
            );
        }else{
            this.exchange = 'detalle';
            this._loadService.show();
            this._toolService.listIncoming(this.currentPage*this.pageSize,this.pageSize,this.sort,this.dir,this.query,this.status,this.exchange).subscribe(
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
    }

    /**
     * Open tags panel
     */
    openTagsPanel(): void
    {
        // Create the overlay
        this._tagsPanelOverlayRef = this._overlay.create({
            backdropClass   : '',
            hasBackdrop     : true,
            scrollStrategy  : this._overlay.scrollStrategies.block(),
            positionStrategy: this._overlay.position()
                .flexibleConnectedTo(this._tagsPanelOrigin.nativeElement)
                .withFlexibleDimensions(true)
                .withViewportMargin(64)
                .withLockedPosition(true)
                .withPositions([
                    {
                        originX : 'start',
                        originY : 'bottom',
                        overlayX: 'start',
                        overlayY: 'top',
                    },
                ]),
        });

        // Subscribe to the attachments observable
        this._tagsPanelOverlayRef.attachments().subscribe(() =>
        {
            // Add a class to the origin
            this._renderer2.addClass(this._tagsPanelOrigin.nativeElement, 'panel-opened');

            // Focus to the search input once the overlay has been attached
            this._tagsPanelOverlayRef.overlayElement.querySelector('input').focus();
        });

        // Create a portal from the template
        const templatePortal = new TemplatePortal(this._tagsPanel, this._viewContainerRef);

        // Attach the portal to the overlay
        this._tagsPanelOverlayRef.attach(templatePortal);

        // Subscribe to the backdrop click
        this._tagsPanelOverlayRef.backdropClick().subscribe(() =>
        {
            // Remove the class from the origin
            this._renderer2.removeClass(this._tagsPanelOrigin.nativeElement, 'panel-opened');

            // If overlay exists and attached...
            if ( this._tagsPanelOverlayRef && this._tagsPanelOverlayRef.hasAttached() )
            {
                // Detach it
                this._tagsPanelOverlayRef.detach();

                // Reset the tag filter
                this.filteredTags = this.tags;

                // Toggle the edit mode off
                this.tagsEditMode = false;
            }

            // If template portal exists and attached...
            if ( templatePortal && templatePortal.isAttached )
            {
                // Detach it
                templatePortal.detach();
            }
        });
    }

    /**
     * Toggle the tags edit mode
     */
    toggleTagsEditMode(): void
    {
        this.tagsEditMode = !this.tagsEditMode;
    }

    /**
     * Toggle contact tag
     *
     * @param tag
     */
    toggleContactTag(tag: any): void
    {
        /*if ( this.contact.tags.includes(tag.id) )
        {
            this.removeTagFromContact(tag);
        }
        else
        {
            this.addTagToContact(tag);
        }*/
    }

    /**
     * Update the tag title
     *
     * @param tag
     * @param event
     */
    updateTagTitle(tag: any, event): void
    {
        // Update the title on the tag
        tag.title = event.target.value;

        // Update the tag on the server
        /*this._contactsService.updateTag(tag.id, tag)
            .pipe(debounceTime(300))
            .subscribe();*/

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Delete the tag
     *
     * @param tag
     */
    deleteTag(tag: any): void
    {
        // Delete the tag from the server
        //this._contactsService.deleteTag(tag.id).subscribe();

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Should the create tag button be visible
     *
     * @param inputValue
     */
    shouldShowCreateTagButton(inputValue: string): boolean
    {
        return !!!(inputValue === '' || this.tags.findIndex(tag => tag.title.toLowerCase() === inputValue.toLowerCase()) > -1);
    }

    /**
     * Filter tags
     *
     * @param event
     */
    filterTags(event): void
    {
        // Get the value
        const value = event.target.value.toLowerCase();

        // Filter the tags
        this.filteredTags = this.tags.filter(tag => tag.title.toLowerCase().includes(value));
    }

    /**
     * Filter tags input key down event
     *
     * @param event
     */
    filterTagsInputKeyDown(event): void
    {
        // Return if the pressed key is not 'Enter'
        if ( event.key !== 'Enter' )
        {
            return;
        }

        // If there is no tag available...
        if ( this.filteredTags.length === 0 )
        {
            // Create the tag
            this.createTag(event.target.value);

            // Clear the input
            event.target.value = '';

            // Return
            return;
        }

        // If there is a tag...
        const tag = this.filteredTags[0];
        const isTagApplied = true;//this.contact.tags.find(id => id === tag.id);

        // If the found tag is already applied to the contact...
        if ( isTagApplied )
        {
            // Remove the tag from the contact
            this.removeTagFromContact(tag);
        }
        else
        {
            // Otherwise add the tag to the contact
            this.addTagToContact(tag);
        }
    }

    /**
     * Create a new tag
     *
     * @param title
     */
    createTag(title: string): void
    {
        const tag = {
            title,
        };

        // Create tag on the server
        /*this._contactsService.createTag(tag)
            .subscribe((response) =>
            {
                // Add the tag to the contact
                this.addTagToContact(response);
            });*/
    }

    /**
     * Remove tag from the contact
     *
     * @param tag
     */
    removeTagFromContact(tag: any): void
    {
        // Remove the tag
        //this.contact.tags.splice(this.contact.tags.findIndex(item => item === tag.id), 1);

        // Update the contact form
        //this.contactForm.get('tags').patchValue(this.contact.tags);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Add tag to the contact
     *
     * @param tag
     */
    addTagToContact(tag: any): void
    {
        // Add the tag
        //this.contact.tags.unshift(tag.id);

        // Update the contact form
        //this.contactForm.get('tags').patchValue(this.contact.tags);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }
}
