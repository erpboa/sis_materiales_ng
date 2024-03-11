import { BooleanInput } from '@angular/cdk/coercion';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, Input, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { BobyNavigationService } from '@boby/components/navigation/navigation.service';
import { BobyNavigationItem } from '@boby/components/navigation/navigation.types';
import { BobyVerticalNavigationBasicItemComponent } from '@boby/components/navigation/vertical/components/basic/basic.component';
import { BobyVerticalNavigationCollapsableItemComponent } from '@boby/components/navigation/vertical/components/collapsable/collapsable.component';
import { BobyVerticalNavigationDividerItemComponent } from '@boby/components/navigation/vertical/components/divider/divider.component';
import { BobyVerticalNavigationSpacerItemComponent } from '@boby/components/navigation/vertical/components/spacer/spacer.component';
import { BobyVerticalNavigationComponent } from '@boby/components/navigation/vertical/vertical.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector       : 'boby-vertical-navigation-group-item',
    templateUrl    : './group.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [NgClass, NgIf, MatIconModule, NgFor, BobyVerticalNavigationBasicItemComponent, BobyVerticalNavigationCollapsableItemComponent, BobyVerticalNavigationDividerItemComponent, forwardRef(() => BobyVerticalNavigationGroupItemComponent), BobyVerticalNavigationSpacerItemComponent],
})
export class BobyVerticalNavigationGroupItemComponent implements OnInit, OnDestroy
{
    /* eslint-disable @typescript-eslint/naming-convention */
    static ngAcceptInputType_autoCollapse: BooleanInput;
    /* eslint-enable @typescript-eslint/naming-convention */

    @Input() autoCollapse: boolean;
    @Input() item: BobyNavigationItem;
    @Input() name: string;

    private _bobyVerticalNavigationComponent: BobyVerticalNavigationComponent;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _bobyNavigationService: BobyNavigationService,
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
        // Get the parent navigation component
        this._bobyVerticalNavigationComponent = this._bobyNavigationService.getComponent(this.name);

        // Subscribe to onRefreshed on the navigation component
        this._bobyVerticalNavigationComponent.onRefreshed.pipe(
            takeUntil(this._unsubscribeAll),
        ).subscribe(() =>
        {
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
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

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
