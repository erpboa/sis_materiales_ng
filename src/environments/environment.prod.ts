export const environment = {
    production: true,
    host: 'apind.boa.bo',
    baseUrl: 'api/erp-nd/Erp/doRequest',
    mode: 'cors',
    port: location.protocol.replace(':', '') == 'https' ? '443' : '80',
    protocol: location.protocol.replace(':', ''),
    backendRestVersion: 2,
    initWebSocket: 'NO',
    portWs: '8010',
    backendVersion: 'v1',
    urlLogin: '',
    storeToken: true,
    filesUrl : location.protocol.replace(':', '')+'://erp.boa.bo/'
};
