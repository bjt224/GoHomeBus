// pages/checkPrincipal/checkPrincipal.js
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    admin:'',//负责人信息
    is_clearance:'meichuli',//判断是否已经处理
    chuli:0,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that=this;
    db.collection('admin').doc(options.id).get({
      success: e => {
        that.setData({
          admin: e.data
        });
        if (e.data.state == 1){
          that.setData({
            chuli: 1,
            is_clearance: true
          });
        }
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
  //审核负责人
  clearance: function (e) {
    const that = this;
    wx.showModal({
      title: '提示',
      content: '确定要通过审核吗？',
      success: res => {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: 'applyadmin',
            data: {
              admin: that.data.admin,
              option: 'yes',
            },
            success: res => {
              wx.navigateBack({
                url: '/pages/manageBus/manageBus',
              })
            },
            fail: err => {
              console.error('[云函数] [sum] 调用失败：', err)
            }
          });
        }
      }
    })
  },
  //不通过审核
  unclearance: function (e) {
    const that = this;
    wx.showModal({
      title: '提示',
      content: '审核不通过',
      success: res => {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: 'applyadmin',
            data: {
              admin: that.data.admin,
              option: 'no',
            },
            success: res => {
              wx.navigateBack({
                url: '/pages/manageBus/manageBus',
              })
            },
            fail: err => {
              console.error('[云函数] [sum] 调用失败：', err)
            }
          });
        }
      }
    })
  }, 
  //打电话
  getphone: function (res) {
    wx.makePhoneCall({
      phoneNumber: res.target.id //仅为示例，并非真实的电话号码
    })
  },
})