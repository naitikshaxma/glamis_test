const { app, BrowserWindow } = require('electron');
const { exec } = require('child_process');
const {session} = require('electron')

app.on('ready', () => {
    const mainWindow = new BrowserWindow({
        fullscreen: true,
        kiosk: true, // Prevent minimizing or switching apps
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    mainWindow.setAlwaysOnTop('true','screen-saver');
    mainWindow.on('blur',()=>{
        console.log("window lost focus");
        mainWindow.focus();
    })



    // Disable gestures (Windows example)
    exec('reg add "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad" /v "MultiFingerGestures" /t REG_DWORD /d 0 /f', (err) => {
        if (err) console.error('Failed to disable gestures:', err);
    });

    // Re-enable gestures on app quit
    app.on('quit', () => {
        exec('reg delete "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\PrecisionTouchPad" /v "MultiFingerGestures" /f', (err) => {
            if (err) console.error('Failed to re-enable gestures:', err);
        });
    });

    session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
        if (!details.url.startsWith('http://localhost:4000')) {
            console.log(`Blocked: ${details.url}`);
            return callback({ cancel: true });
        }
        callback({ cancel: false });
    });
    
    mainWindow.loadURL('http://localhost:4000'); 
});
