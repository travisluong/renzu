import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import {
  listClusters,
  listServices,
  listTasks,
  getTaskContainers,
  getClusterDetails,
  getServiceDetails,
  getTaskDetails
} from './services/ecs-service'
import { getLogConfiguration, getContainerLogs } from './services/logs-service'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // ECS IPC handlers
  ipcMain.handle('ecs:listClusters', async () => {
    try {
      return await listClusters()
    } catch (error) {
      console.error('IPC ecs:listClusters error:', error)
      throw error
    }
  })

  ipcMain.handle('ecs:getClusterDetails', async (_event, clusterArn: string) => {
    try {
      return await getClusterDetails(clusterArn)
    } catch (error) {
      console.error('IPC ecs:getClusterDetails error:', error)
      throw error
    }
  })

  ipcMain.handle('ecs:listServices', async (_event, clusterArn: string) => {
    try {
      return await listServices(clusterArn)
    } catch (error) {
      console.error('IPC ecs:listServices error:', error)
      throw error
    }
  })

  ipcMain.handle(
    'ecs:getServiceDetails',
    async (_event, clusterArn: string, serviceName: string) => {
      try {
        return await getServiceDetails(clusterArn, serviceName)
      } catch (error) {
        console.error('IPC ecs:getServiceDetails error:', error)
        throw error
      }
    }
  )

  ipcMain.handle('ecs:getTaskDetails', async (_event, clusterArn: string, taskArn: string) => {
    try {
      return await getTaskDetails(clusterArn, taskArn)
    } catch (error) {
      console.error('IPC ecs:getTaskDetails error:', error)
      throw error
    }
  })

  ipcMain.handle('ecs:listTasks', async (_event, clusterArn: string, serviceName: string) => {
    try {
      return await listTasks(clusterArn, serviceName)
    } catch (error) {
      console.error('IPC ecs:listTasks error:', error)
      throw error
    }
  })

  ipcMain.handle('ecs:getTaskContainers', async (_event, clusterArn: string, taskArn: string) => {
    try {
      return await getTaskContainers(clusterArn, taskArn)
    } catch (error) {
      console.error('IPC ecs:getTaskContainers error:', error)
      throw error
    }
  })

  // Logs IPC handlers
  ipcMain.handle(
    'logs:getLogConfiguration',
    async (_event, taskDefinitionArn: string, containerName: string) => {
      try {
        return await getLogConfiguration(taskDefinitionArn, containerName)
      } catch (error) {
        console.error('IPC logs:getLogConfiguration error:', error)
        throw error
      }
    }
  )

  ipcMain.handle(
    'logs:getContainerLogs',
    async (
      _event,
      logGroupName: string,
      logStreamName: string,
      region: string,
      nextToken?: string,
      startFromHead?: boolean
    ) => {
      try {
        return await getContainerLogs(logGroupName, logStreamName, region, nextToken, startFromHead)
      } catch (error) {
        console.error('IPC logs:getContainerLogs error:', error)
        throw error
      }
    }
  )

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
