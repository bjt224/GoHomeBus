App({
  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch: function () {
    const that = this;
    this.globalData = {};//全局变量
    this.globalData.key = 'MP6BZ-WFFAI-6OZG3-5AKMX-4UTFQ-X4FTM';//腾讯地图的key
    this.globalData.key_gaode = 'f29389ed8ef728f79004eb456020db93';//高德地图key
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }
    //首先获取用户oppid
    wx.cloud.callFunction({
      name: 'login',
      success: res => {
        that.globalData.userID = res.result.userInfo.openId;
      },
      fail: err => {
        console.error('[云函数] [sum] 调用失败：', err)
      }
    }),
    //判断授权情况
    wx.getSetting({      
        success(res) {
          if (res.authSetting['scope.userInfo'] ) {
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称
              that.globalData.loginStatus= true;     
            wx.getUserInfo({
              success: function (res) {         
                that.globalData.userPhoto = res.userInfo.avatarUrl
              }
            })                     
          } else {    
            that.globalData.loginStatus = false;
            wx.showModal({
              title: '提示',
              content: '请先授权登录',
              success:function(){
                wx.switchTab({
                  url: "/pages/person/person",
                })    
              }
            }) 
          }
        }
      }),
      //获取手机高度
      wx.getSystemInfo({
        success: function (res) {
          that.globalData.animationShowHeight = res.screenHeight;
        }
      })

    //检查是否存在新版本
    wx.getUpdateManager().onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      if (res.hasUpdate) {//如果有新版本
        // 小程序有新版本，会主动触发下载操作（无需开发者触发）
        wx.getUpdateManager().onUpdateReady(function () {//当新版本下载完成，会进行回调
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，单击确定重启应用',
            showCancel: false,
            success: function (res) {
              // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
              wx.getUpdateManager().applyUpdate();       
            }
          })
        })
        // 小程序有新版本，会主动触发下载操作（无需开发者触发）
        wx.getUpdateManager().onUpdateFailed(function () {//当新版本下载失败，会进行回调
          wx.showModal({
            title: '提示',
            content: '检查到有新版本，但下载失败，请检查网络设置',
            showCancel: false,
          })
        })
      }
    });
  },
  /**
   * 当小程序启动，或从后台进入前台显示，会触发 onShow
   */
  onShow: function (options) {
  },

  /**
   * 当小程序从前台进入后台，会触发 onHide
   */
  onHide: function () {
    
  },

  /**
   * 当小程序发生脚本错误，或者 api 调用失败时，会触发 onError 并带上错误信息
   */
  onError: function (msg) {
    
  }
})
