import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { APP_INITIALIZER, ENVIRONMENT_INITIALIZER, EnvironmentProviders, importProvidersFrom, inject, Provider } from '@angular/core';
import { MATERIAL_SANITY_CHECKS } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { BOBY_MOCK_API_DEFAULT_DELAY, mockApiInterceptor } from '@boby/lib/mock-api';
import { BobyConfig } from '@boby/services/config';
import { BOBY_CONFIG } from '@boby/services/config/config.constants';
import { BobyConfirmationService } from '@boby/services/confirmation';
import { bobyLoadingInterceptor, BobyLoadingService } from '@boby/services/loading';
import { BobyMediaWatcherService } from '@boby/services/media-watcher';
import { BobyPlatformService } from '@boby/services/platform';
import { BobySplashScreenService } from '@boby/services/splash-screen';
import { BobyUtilsService } from '@boby/services/utils';

export type BobyProviderConfig = {
    mockApi?: {
        delay?: number;
        services?: any[];
    },
    boby?: BobyConfig
}

/**
 * Boby provider
 */
export const provideBoby = (config: BobyProviderConfig): Array<Provider | EnvironmentProviders> =>
{
    // Base providers
    const providers: Array<Provider | EnvironmentProviders> = [
        {
            // Disable 'theme' sanity check
            provide : MATERIAL_SANITY_CHECKS,
            useValue: {
                doctype: true,
                theme  : false,
                version: true,
            },
        },
        {
            // Use the 'fill' appearance on Angular Material form fields by default
            provide : MAT_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: {
                appearance: 'fill',
            },
        },
        {
            provide : BOBY_MOCK_API_DEFAULT_DELAY,
            useValue: config?.mockApi?.delay ?? 0,
        },
        {
            provide : BOBY_CONFIG,
            useValue: config?.boby ?? {},
        },

        importProvidersFrom(MatDialogModule),
        {
            provide : ENVIRONMENT_INITIALIZER,
            useValue: () => inject(BobyConfirmationService),
            multi   : true,
        },

        provideHttpClient(withInterceptors([bobyLoadingInterceptor])),
        {
            provide : ENVIRONMENT_INITIALIZER,
            useValue: () => inject(BobyLoadingService),
            multi   : true,
        },

        {
            provide : ENVIRONMENT_INITIALIZER,
            useValue: () => inject(BobyMediaWatcherService),
            multi   : true,
        },
        {
            provide : ENVIRONMENT_INITIALIZER,
            useValue: () => inject(BobyPlatformService),
            multi   : true,
        },
        {
            provide : ENVIRONMENT_INITIALIZER,
            useValue: () => inject(BobySplashScreenService),
            multi   : true,
        },
        {
            provide : ENVIRONMENT_INITIALIZER,
            useValue: () => inject(BobyUtilsService),
            multi   : true,
        },
    ];

    // Mock Api services
    if ( config?.mockApi?.services )
    {
        providers.push(
            provideHttpClient(withInterceptors([mockApiInterceptor])),
            {
                provide   : APP_INITIALIZER,
                deps      : [...config.mockApi.services],
                useFactory: () => (): any => null,
                multi     : true,
            },
        );
    }

    // Return the providers
    return providers;
};
