module.exports = {
  publicPath: '',
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      customFileProtocol: './',
      builderOptions: {
        productName: "player",
        appId: "ai.guiji.player",
        asarUnpack:[
          "./public/ffmpeg-4.4",
        ],
        extraFiles:[
          {
            from: "public/ffmpeg-4.4",
            to:"lib/ffmpeg-4.4"
          }
        ],
        "nsis": {
          "oneClick": true, // 是否一键安装
          "perMachine": true, // perMachine 可能会影响自动更新的安装权限问题（windows7不受影响）
          "allowElevation": true, // 允许请求提升。 如果为false，则用户必须使用提升的权限重新启动安装程序。
          "allowToChangeInstallationDirectory": false, // 允许修改安装目录
          "createDesktopShortcut": true, // 创建桌面图标
          "createStartMenuShortcut": true, // 创建开始菜单图标
          "runAfterFinish": false, // 安装完成后是否运行项目
          "shortcutName": "本地播放器", // 图标名称
          "deleteAppDataOnUninstall": true, // 卸载应用程序后应删除\AppData
        },
        "dmg": {
          "contents": [{
            "x": 410,
            "y": 150,
            "type": "link",
            "path": "/Applications"
          },
          {
            "x": 130,
            "y": 150,
            "type": "file"
          }
          ]
        },
        "mac": {
          "target": [
            "dmg",
            "zip"
          ]
        },
        "win": {
          "target": [
            "nsis",
            "zip"
          ]
        },
        "linux": {
          "target": [
            "AppImage"
          ]
        }
      }
    }
  }
}
