// pages/historyOrderDetail/historyOrderDetail.js


const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    order: '',//订单信息
    personal: [],//买票的用户
    siteNum: [],
    allmoney: 0,
    sumOnBus: 0,
    sumPay: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    db.collection('public_order').where({
      _id: options.id
    }).get({
      success: function (order) {
        that.setData({
          order: order.data["0"]
        });
        that.personalMan(order.data[0])
      }
    });
  },
  personalMan(order) {
    const that = this;
    //已签到人数
    db.collection('personal_order').where({
      order_id: order._id,
      state: 1,
      tag: 1
    }).count({
      success: res => {
        that.setData({
          sumOnBus: res.total
        })
      }
    }),
      //已付款人数
      db.collection('personal_order').where({
        order_id: order._id,
        state: 1,
        paystatus: true
      }).count({
        success: res => {
          that.setData({
            sumPay: res.total
          })
        }
      }),
      //查出本班车乘客
      db.collection('personal_order').where({
        order_id: order._id, state: 1
      }).get({
        success: function (res) {
          let siteNum = [0, 0, 0];
          let summoney = 0;//总金额
          for (let siteTemp of res.data) {
            siteNum[siteTemp.xianlu_i]++;
            summoney = summoney + parseInt(order.end_list[siteTemp.xianlu_i].jiage);
          }
          that.setData({
            personal: res.data,
            allmoney: summoney,
            siteNum: siteNum
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
  //打电话
  getphone: function (res) {
    wx.makePhoneCall({
      phoneNumber: String(res.currentTarget.dataset.phone) //仅为示例，并非真实的电话号码
    })
  },
})