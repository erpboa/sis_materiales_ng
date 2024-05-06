import {Directive, ElementRef, HostListener, OnDestroy, OnInit} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';

@Directive({
    selector  : '[bobyNumbersOnly]',
    exportAs  : 'bobyNumbersOnly',
    standalone: true,
})
export class BobyNumbersOnlyDirective
{
    private regexStr: any = '^[0-9]+$';

    /**
     * Constructor
     */
    constructor(
        private _elementRef: ElementRef
    ){}

    @HostListener('keypress',['$event'])
    onKeyPress(event) {
        return new RegExp(this.regexStr).test(event.key);
    }

}
