export const environment = {
    production: true,
    host: 'erp.boa.bo',
    baseUrl: 'pxp/lib/rest',
    mode: 'cors',
    port: location.protocol.replace(':', '') == 'https' ? '443' : '80',
    protocol: location.protocol.replace(':', ''),
    backendRestVersion: 1,
    initWebSocket: 'NO',
    portWs: '8010',
    backendVersion: 'v1',
    urlLogin: '',
    storeToken: false,
    filesUrl : location.protocol.replace(':', '')+'://erp.boa.bo/'
};
