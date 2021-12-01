import { app } from 'electron';
import { start } from './app/start';

app.on('ready', start)
app.on('window-all-closed', () => app.quit())
