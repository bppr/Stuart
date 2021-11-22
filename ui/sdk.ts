// override / extend default window object
// see ui/types/api.d.ts
declare var window: WindowWithSDK 

const sdk = window.api;

export default sdk;