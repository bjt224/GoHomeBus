// pages/privateOrder/privateOrder.js

const db  = wx.cloud.database();

const app = getApp();
const delBtnWidth = 210 ;//删除块的宽度
Page({

  /**
   * 页面的初始数据
   */
  data: {
    order:[],//订单信息
    personorder:'',//订单信息
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
    wx.showLoading({
      title: '加载中...',
      mask: true
    }) 
    this.load();
  },
  load(){
    const that = this;
    db.collection('personal_order').where({ _openid: app.globalData.userID, state: 1 }).orderBy('times','desc').get({
      success: res => {        
        if(res.data.length == 0) {
          that.setData({
            order: []
          })
        }
        that.getOrderList(res);
      },
    })
  },
  //async执行selectOrder
  async getOrderList(res) {
    let orderList = await this.selectOrder(res.data);
    this.setData({
      personorder: res.data,      
      order : orderList
    })
    wx.hideLoading();
  },
  //promis获取orderlist
  selectOrder(idList=[]){
    let orderList = idList.map((item) => {
      let id = item.order_id;
      return new Promise(resolve =>{
        db.collection('public_order').where({ _id: id , state: 1 }).get({
          success:res=>{
            resolve(res.data[0]);
          }          
        })
      }) 
    });
    result = Promise.all(orderList).then((res) => {
      return res;
    }).catch((error) => {
      console.log(error);
    });
    return result;
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
    this.load();
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
  //签到页面
  navTOqiandao: function (res) {
    wx.navigateTo({
      url: '/pages/personProject/personProject?id=' + res.currentTarget.id + '&indexs=' + res.currentTarget.dataset.site,
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
      let nowX =  this.data.startX - moveX;
      let dBW = delBtnWidth;
      let txtStyle =  "";
      if (nowX <= 0 ) {//如果移动距离小于等于0，文本层位置不变
          txtStyle =  "left:0px";
      } else if(nowX > 0){
          //移动距离大于0，文本层left值等于手指移动距离
          txtStyle =  "left:-" + nowX + "rpx";
        if (nowX >= dBW) {
            //控制手指移动距离最大值为删除按钮的宽度
          txtStyle = "left:-" + dBW + "rpx";
          }
      }
      //获取手指触摸的是哪一项
      let index = e.currentTarget.dataset.index;
      let list =  this.data.order;
      list[index].txtStyle = txtStyle;
      //更新列表的状态
      this.setData({
        order: list
      });
    }
  },
  eTouch :function(e){
    if (e.changedTouches.length == 1) {
      //手指移动结束后水平位置
      let endX = e.changedTouches[0].clientX;
      //触摸开始与结束，手指移动的距离
      let nowX =  this.data.startX - endX;
      let dBW = delBtnWidth;
      //如果距离小于删除按钮的1/2，不显示删除按钮
      let txtStyle = nowX > dBW / 3 ? "left:-" + dBW + "rpx" : "left:0rpx";
      //获取手指触摸的是哪一项
      let index = e.currentTarget.dataset.index;
      let list =  this.data.order;
      list[index].txtStyle = txtStyle;
      //更新列表的状态
      this.setData({
        order: list
      });
    }
  },
  //取消订单
  unorder:function(e){
    const that = this;
    wx.showModal({
      title: '提示',
      content: '您确定取消订单吗？',
      success: res1 => {
        if (res1.confirm) {
          wx.showLoading({
            title: '努力删除中',
            mask:true
          })
          db.collection('personal_order').doc(e.target.id).remove({
            success: res => {
              if (res.stats.removed == 1) {
                wx.hideLoading();
                wx.showToast({
                  title: '订单取消成功,请联系客服获取退款',
                  icon: "none",
                  duration: 2000
                }) 
                wx.showLoading({
                  title: 'loading..',
                  mask: true
                })
              }
              //票数+1
              wx.cloud.callFunction({
                name: 'applyadmin',
                data: {
                  carclub_id: e.currentTarget.dataset.club,
                  orderid: e.currentTarget.dataset.orderid,
                  option: 'cancel',
                },
                success: res1 => {                  
                  that.load();                  
                },
                fail: err => {
                  console.error('[云函数] [sum] 调用失败：', err)
                }
              });         
            }
          });
        }
      }
    })
  },
  //返回首页
  toIndex: function(e){
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
})