// pages/collection/collection.js
const db = wx.cloud.database();
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    carclub:'',//收藏的车社
    markStatus: 'mark',//是否收藏本车社
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
    const that = this;
    var carclub = new Array();
    db.collection('collection').where({ _openid: app.globalData.userID }).get({
      success: res => {
        for (var i = 0; i < res.data.length; i++) {
          db.collection('carclub').where({ _id: res.data[i].carclub_id }).get({//状态正常
            success: e => {
              carclub.push(e.data["0"]);
              if (carclub.length == res.data.length) {
                that.setData({
                  carclub: carclub,
                });
              }
            }
          });
        }
      }
    });
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
  nomark:function(res){
    const that = this;
    //取消收藏
    db.collection('collection').doc(that.data.mark_id).remove({
      success: function (res) {
        if (res.stats.removed) {
          wx.showToast({
            title: '已取消收藏',
          })
          that.setData({
            markStatus: 'nomark'
          })
        }
      }
    })
  },
  // 车社详情页
  navTOinfo: function (res) {
    //获取选中车社的ID
    const carclubid = res.currentTarget.id;
    wx.navigateTo({
      url: '/pages/orderList/orderList?id=' + carclubid,
      success: res => {
        // console.log('ok');
      },
      fail: res => {
        console.log(res);
      }
    })
  },
})