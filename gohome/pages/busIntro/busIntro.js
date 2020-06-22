// pages/busIntro/busIntro.js
const app = getApp();

const db = wx.cloud.database();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    carclub: '',//车社信息
    currentData: 0,
    admin: '',//已任职负责人
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    db.collection('carclub').where({ _id: options.id }).get({
      success: e => {
        // console.log(e);
        that.setData({
          carclub: e.data["0"]
        });
        //管理员负责人
        db.collection('admin').where({ carclub_id: e.data["0"]._id,state:1}).get({
          success: re => {
            console.log(re.data);
            that.setData({
              admin: re.data
            });
          }
        });
      }
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
  //跳转负责人详细信息
  navigateToDetail: function (e){
    wx.navigateTo({
      url: "/pages/principalDetail/principalDetail?id="+e.currentTarget.dataset.id,
    })
  }
})