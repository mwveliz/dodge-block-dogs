const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 460,
        height: 820,
        minWidth: 380,
        minHeight: 680,
        maxWidth: 720,
        maxHeight: 1100,
        title: 'Dodge Block Dogs (DBD) - Tamagotchi & Retro Arcade',
        icon: path.join(__dirname, '../assets/icon.png'),
        backgroundColor: '#0a0c16',
        center: true,
        useContentSize: true,
        autoHideMenuBar: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
            webSecurity: true
        }
    });

    const indexPath = path.join(__dirname, '../index.html');
    mainWindow.loadFile(indexPath);

    // Desktop Menu
    const template = [
        {
            label: 'Game',
            submenu: [
                {
                    label: 'New Pet / Dashboard',
                    accelerator: 'Esc',
                    click: () => {
                        mainWindow.webContents.executeJavaScript(`
                            if (typeof currentScreen !== 'undefined' && typeof SCREENS !== 'undefined') {
                                currentScreen = SCREENS.DASHBOARD;
                                if (typeof stage !== 'undefined') {
                                    stage.setScreen(currentScreen);
                                    if (typeof DOG_BREEDS !== 'undefined' && typeof state !== 'undefined') {
                                        stage.spawnDog(DOG_BREEDS[state.activePetIndex], state.equipped);
                                    }
                                }
                            }
                        `);
                    }
                },
                {
                    label: 'Toggle Retro LCD Mode',
                    accelerator: 'CmdOrCtrl+L',
                    click: () => {
                        mainWindow.webContents.executeJavaScript(`
                            if (typeof state !== 'undefined' && state.vitals) {
                                state.vitals.lcdMode = !state.vitals.lcdMode;
                                if (typeof audio !== 'undefined') audio.play('switch');
                                if (typeof saveState !== 'undefined') saveState();
                            }
                        `);
                    }
                },
                { type: 'separator' },
                { role: 'reload', accelerator: 'CmdOrCtrl+R' },
                { role: 'togglefullscreen', accelerator: 'F11' },
                { type: 'separator' },
                { role: 'quit', accelerator: 'CmdOrCtrl+Q' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'toggleDevTools', accelerator: 'F12' }
            ]
        },
        {
            label: 'Audio',
            submenu: [
                {
                    label: 'Toggle Sound Mute',
                    accelerator: 'CmdOrCtrl+M',
                    click: () => {
                        mainWindow.webContents.executeJavaScript(`
                            if (typeof audio !== 'undefined') {
                                audio.muted = !audio.muted;
                                if (typeof state !== 'undefined') state.soundEnabled = !audio.muted;
                                if (typeof saveState !== 'undefined') saveState();
                            }
                        `);
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
