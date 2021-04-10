import {
    app,
    BrowserWindow, Menu, MenuItem,
    MenuItemConstructorOptions
} from 'electron';

/*  Create New Window Function  */

const createWindow = () => {
    const win = new BrowserWindow({
        resizable: false,
        width: 960,
        height: 640,
        webPreferences: {
            nodeIntegration: true
        }
    });

    /*  Load file from public  */
    win.loadFile('index.html');

    /*  Open Developer Tools when debugging  */
    win.webContents.openDevTools();
}

app
    .whenReady()
    .then(() => createWindow());

/*  Basic App Events  */

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0)
        createWindow();
});

/**  Menu  **/

const myMenu = new Menu();
const menuItemConfig: MenuItemConstructorOptions = {
    label: 'Things',
    submenu: [
        {
            label: 'New Window',
            click: () => createWindow(),
            accelerator: 'CommandOrControl+N'
        },
        {
            label: 'Close Window',
            click: () => BrowserWindow.getFocusedWindow().destroy(),
            accelerator: 'CommandOrControl+X'
        },
        {
            label: 'Toggle Fullscreen',
            click: () =>
                BrowserWindow.getFocusedWindow().setFullScreen(
                    !BrowserWindow.getFocusedWindow().fullScreen
                ),
            accelerator: 'F11'
        }
    ]
};

myMenu.append( new MenuItem(menuItemConfig) );

Menu.setApplicationMenu(myMenu);