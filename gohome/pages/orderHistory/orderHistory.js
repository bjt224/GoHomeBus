// 历史订单

const db = wx.cloud.database();
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    order:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    const that = this;
    //查询车社id
    db.collection('admin').where({
      _openid: app.globalData.userID,
    }).get({
      success: res => {
        //显示负责人发布的订单
        db.collection('public_order').where({
          carclub_id: res.carclub_id,
          tag: 1
        }).orderBy('times', 'asc').get({
          success: function (res) {
            that.setData({
              order: res.data,
            });
            wx.hideLoading();
          }
        })
      }
    })
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
  //跳转详情页面
  toDetailPage: function (e) {
    wx.navigateTo({
      url: '/pages/historyOrderDetail/historyOrderDetail?id=' + e.currentTarget.id,
    })
  }
})