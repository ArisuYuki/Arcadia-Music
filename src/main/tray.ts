import { Tray, Menu, nativeImage, type BrowserWindow } from 'electron'
import iconPath from '../../resources/icon.png?asset'
export function createTray(mainWindow: BrowserWindow) {
  // macOS 推荐状态栏图标尺寸为 22x22 或 24x24
  let icon = nativeImage.createFromPath(iconPath)
  if (process.platform === 'darwin') {
    icon = icon.resize({ width: 22, height: 22 })
  }
  const tray = new Tray(icon)
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '打开',
      type: 'normal',
      click: () => {
        mainWindow.show()
      }
    },
    {
      label: '上一首',
      type: 'normal',
      click: () => {
        mainWindow.webContents.send('pre-song')
      }
    },
    {
      label: '播放/暂停',
      type: 'normal',
      click: () => {
        mainWindow.webContents.send('play')
      }
    },
    {
      label: '下一首',
      type: 'normal',
      click: () => {
        mainWindow.webContents.send('next-song')
      }
    },
    {
      label: '退出',
      type: 'normal',
      click: () => {
        mainWindow.close()
      }
    }
  ])
  tray.setContextMenu(contextMenu)
  return tray
}
