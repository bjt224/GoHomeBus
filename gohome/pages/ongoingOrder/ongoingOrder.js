// pages/ongoingOrder/ongoingOrder.js

const db = wx.cloud.database();
const app = getApp();
const delBtnWidth = 210;//删除块的宽度

Page({

  /**
   * 页面的初始数据
   */ 
  data: {
      order:{},//用户发布的全部订单
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    wx.showLoading({
      title: '加载中...',
      mask:true
    })
    that.loadData();
  },
  loadData(){
    const that =this;
    //查询车社id
    db.collection('admin').where({
      _openid: app.globalData.userID,
    }).get({
      success: res => {
        //显示负责人发布的订单
        db.collection('public_order').where({
          carclub_id: res.carclub_id,
          tag: 0
        }).orderBy('times', 'desc').get({
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
  toDetailPage:function(e){
    wx.navigateTo({
      url: '/pages/orderDetail/orderDetail?id=' + e.currentTarget.id,
    })
  },
  //手指开始滑动
  sTouch: function (e) {
    if (e.touches.length == 1) {
            this.setData({
                //设置触摸起始点水平方向位置
                startX: e.touches[0].clientX
            });
        }
  },
  mTouch: function (e) {
    if (e.touches.length == 1) {
      //手指移动时水平方向位置
      let moveX = e.touches[0].clientX;
      //手指起始点位置与移动期间的差值
      let nowX = this.data.startX - moveX;
      let dBW = delBtnWidth;
      let txtStyle = "";
      if (nowX <= 0) {//如果移动距离小于等于0，文本层位置不变
        txtStyle = "left:0px";
      } else if (nowX > 0) {
        //移动距离大于0，文本层left值等于手指移动距离
        txtStyle = "left:-" + nowX + "rpx";
        if (nowX >= dBW) {
          //控制手指移动距离最大值为删除按钮的宽度
          txtStyle = "left:-" + dBW + "rpx";
        }
      }
      //获取手指触摸的是哪一项
      let index = e.currentTarget.dataset.index;
      let list = this.data.order;
      list[index].txtStyle = txtStyle;
      //更新列表的状态
      this.setData({
          order: list
      });
    }
  },
  eTouch: function (e) {
    if (e.changedTouches.length == 1) {
      //手指移动结束后水平位置
      let endX = e.changedTouches[0].clientX;
      //触摸开始与结束，手指移动的距离
      let nowX = this.data.startX - endX;
      let dBW = delBtnWidth;
      //如果距离小于删除按钮的1/2，不显示删除按钮
      let txtStyle = nowX > dBW / 3 ? "left:-" + dBW + "rpx" : "left:0rpx";
      //获取手指触摸的是哪一项
      let index = e.currentTarget.dataset.index;
      let list = this.data.order;
      list[index].txtStyle = txtStyle;
      //更新列表的状态
      this.setData({
      order: list
      });
    }
  },
  //取消订单
  unorder: function (e) {
    const that = this;
    wx.showLoading({
      title: 'loading...',
      mask:true
    })
    //查看该订单有无乘客
    db.collection('personal_order').where({
      order_id: e.currentTarget.dataset.orderid
    }).count({
      success: res => {
        wx.hideLoading();
        console.log(res);
        if (res.total == 0) {
          wx.showModal({
            title: '提示',
            content: '您确定取消该订单吗？',
            success: res1 => {
              if (res1.confirm) {
                db.collection('public_order').doc(e.currentTarget.dataset.orderid).remove({
                  success: res => {
                    if (res.stats.removed == 1) {
                      that.loadData();
                      wx.showToast({
                        title: '订单取消成功,请确保完整退款给乘客',
                        icon: "none",
                        duration: 2000
                      })
                    }
                  }
                });
              }
            }
          })
        } else {
          wx.showToast({
            title: '请确保没有乘客再取消该订单！！',
            icon: 'none',
            duration: 2000
          })
        }
      }       
    })
  },
  
})