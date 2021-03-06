const events = require('events')
const electron = require('electron')
const fs = require('fs'); // Wow this too can be bloated now!!!!!!!!
const path = require('path');

const CHANNEL_NAME = 'queue-alert'

const debug = false;

class Window extends events.EventEmitter {
    constructor() {
        super()
        this.window = null
    }

    show() {
        if (this.window) {
            this.window.show()
            return
        }

        let display = electron.screen.getPrimaryDisplay();
        let screenWidth = display.bounds.width;
        let screenHeight = display.bounds.height;

        this.window = new electron.BrowserWindow({
            height: 200,
            width: 480,
            x: screenWidth-520,
            y: screenHeight-300,
            frame: false
        })

        const listener = (event, ...args) => {
            if (event.sender === this.window.webContents) {
                this.emit(...args)
            }
        }

        electron.ipcMain.on(CHANNEL_NAME, listener)

        this.window.webContents.on('did-finish-load', () => {
            this.emit('opened')
        })

        this.window.on('closed', () => {
            this.emit('closed')
            electron.ipcMain.removeListener(CHANNEL_NAME, listener)
            this.window = null
        })

        this.window.setMenu(null)
        this.window.loadURL(`file://${__dirname}/www/index.html`)
        if (debug)
            this.window.webContents.openDevTools()
    }

    send(...args) {
        if (!this.window)
            return
        this.window.webContents.send(CHANNEL_NAME, ...args)
    }

    close() {
        if (this.window)
            this.window.close()
    }
}

module.exports = Window
