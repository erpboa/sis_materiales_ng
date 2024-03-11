import { ENVIRONMENT_INITIALIZER, EnvironmentProviders, inject, Provider } from '@angular/core';
import { ApiErpService } from './api-erp.service';

export const provideApiErp = (): Array<Provider | EnvironmentProviders> =>
{
    return [
        {
            provide : ENVIRONMENT_INITIALIZER,
            useValue: () => inject(ApiErpService),
            multi   : true,
        },
    ];
};
