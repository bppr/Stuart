import { app, session } from 'electron';
import { start } from './app/start';

import installExtension, {REACT_DEVELOPER_TOOLS} from 'electron-devtools-installer';

app.whenReady().then(async () => {
    await installExtension(REACT_DEVELOPER_TOOLS, {
        forceDownload: true,
        loadExtensionOptions: {
            allowFileAccess:true
        }
    })
        .then((name) => console.log(`Added Extension:  ${name}`))
        .catch((err) => console.log('An error occurred: ', err));

    start();
});

app.on('window-all-closed', () => app.quit());