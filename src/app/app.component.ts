import {Component, HostListener} from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector   : 'app-root',
    templateUrl: './app.component.html',
    styleUrls  : ['./app.component.scss'],
    standalone : true,
    imports    : [RouterOutlet],
})
export class AppComponent
{
    /*@HostListener('window:beforeunload', [ '$event' ])
    beforeUnloadHandler(event) {
        localStorage.removeItem('aut');
    }*/
    /**
     * Constructor
     */
    constructor()
    {
    }
}
