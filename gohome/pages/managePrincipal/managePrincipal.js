// pages/managePrincipal/managePrincipal.js

const db = wx.cloud.database();
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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

  },

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
  //发布订单跳转
  TosendOrder:function(res){
    wx.navigateTo({
      url: res.currentTarget.id,
    })
  },
  //离职
  lizhi:function(e){
    wx.showModal({
      title: '警告',
      content: '确定要离职吗！！',
      success:res=>{
        if(res.confirm){
          db.collection('admin').where({ _openid: app.globalData.userID }).get({
            success: res1 => {
              db.collection('admin').doc(res1.data["0"]._id).remove({
                success: res2 => {
                  wx.showToast({
                    title: '您已成功离职！',
                    icon: 'none',
                    success: r => {
                      wx.switchTab({
                        url: '/pages/person/person',
                      })
                    }
                  });
                }
              })
            }
          });
        }
      }
    })
  }
})