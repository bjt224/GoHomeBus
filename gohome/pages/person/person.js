// pages/personage/personage.js
const db = wx.cloud.database();
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */ 
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    loginStatus: false ,
    is_admin:2,//如果==1，则是负责人
    is_carclub: 0,////如果大于1，则是已经申请了车社
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    that.setData({
      loginStatus: app.globalData.loginStatus,
    });
  
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const that = this;
    //判断是否是负责人
    db.collection('admin').where({
      _openid: app.globalData.userID,
    }).get({
      success: function (res) {
        if (res.data.length == 0) {
          that.setData({
            is_admin: 2
          });
        }
        if(res.data["0"].state == 1) {
          that.setData({
            is_admin: 1
          });
        }else if(res.data["0"].state == 0) {
          that.setData({
            is_admin: 3
          });
        }
      }
    })
    //判断是否已经申请了车社注册
    db.collection('carclub').where({
      _openid: app.globalData.userID
    }).get({
      success: function (res) {
        that.setData({
          is_carclub: res.data.length//如果大于1，则是负责人
        });
      }
    })
  },
  //授权获取头像
  bindGetUserInfo(e) {
    this.setData({
      userPhoto: e.detail.userInfo.avatarUrl,
      loginStatus: true
    })
    app.globalData.loginStatus=true;
  } ,
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }, 
  //跳转页面
  handleNavigateTo(e){
    if (this.data.loginStatus) {
      wx.navigateTo({
        url: '../' + e.currentTarget.id + '/' + e.currentTarget.id,
      })
    }else {
      wx.showToast({
        title: '请先授权',
        icon: 'none',
        duration: 2000
      })
    }
  },
  //跳转到tab
  handleNavigateTotab(e) {
    if(this.data.loginStatus){
      wx.switchTab({
        url: '../' + e.currentTarget.id + '/' + e.currentTarget.id,
      })
    }else{
      wx.showToast({
        title: '请先授权',
        icon: 'none',
        duration: 2000
      })
    }
  },
  
  //跳转负责人管理页面
  managePrincipalTo:function(e){
    const that = this ;
    wx.showLoading({
      title: 'loading',
      mask:true
    })
    //判断我是否通过审核
    db.collection('admin').where({ _openid: app.globalData.userID }).get({
      success: t => {
        wx.hideLoading();
        if (t.data["0"].state == 1) {          
          wx.navigateTo({
            url: '../' + e.currentTarget.id + '/' + e.currentTarget.id,
          })
        } else {
         wx.showToast({
           title: '审核中..',
           icon:'none'
         })
        }
      },
    });
  }
})
