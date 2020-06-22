// pages/buyTicket/buyTicket.js
const db = wx.cloud.database();
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    order_id:'',//订单ID
    order_info:'',//订单信息
    userPhone:'',//用户手机号码
    userNickname:'',//用户称呼
    xianlu_i:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this ;
    that.setData({
      order_id: options.id.split('----')[0],
      xianlu_i: parseInt(options.id.split('----')[1]) 
    });
    db.collection('public_order').where({ _id: options.id.split('----')[0]}).get({
      success:res=>{
        that.setData({
          order_info: res.data['0']
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
  //输入手机号码
  UserPhone:function(res){
    // console.log(res.detail.value);
    const that = this;
    that.setData({
      userPhone: res.detail.value,
    });
  },
  UserNickname:function(res){
    const that = this;
    that.setData({
      userNickname: res.detail.value,
    });
  },
  //提交订单
  user_form:function(res){
    const that = this;
    if(that.data.userPhone == ''){
      wx.showModal({
        title: '输入不能为空',
        content: '手机号码不能为空',
      })
    }else if (that.data.userPhone.length != 11){
      wx.showModal({
        title: '请输入正确手机号码',
        content: '输入正确手机号码方便负责人联系',
      })
    }else{
      if (that.data.userNickname == ''){
        wx.showModal({
          title: '输入不能为空',
          content: '这位大侠，能否留下称号',
        })
      }else{
        wx.showLoading({
          title: '查询是否有票',
          mask: true
        })     
        db.collection('public_order').where({
          _id: that.data.order_id,
          soldticket: db.command.lt(that.data.order_info.amount)
        }).count({
          success: res => {
            if (res.total >= 1 ){
              wx.hideLoading();
              wx.showLoading({
                title: '购票中',
                mask:true
              })
              db.collection('personal_order').add({
                data: {
                  order_id: that.data.order_id,
                  xianlu_i: that.data.xianlu_i,
                  phone: that.data.userPhone,
                  nickname: that.data.userNickname,
                  times:new Date().getTime(),//时间戳
                  state: 1,//一般状态
                  tag: 0,//0代表还没有签到，1代表已签到
                  paystatus: false,//付款状态
                },
                success: function (res) {                             
                  // //成功之后评论的人数+1
                  wx.cloud.callFunction({
                    name: 'applyadmin',
                    data: {
                      carclub_id: that.data.order_info.carclub_id,
                      orderid: that.data.order_id,
                      option: 'hot',
                    },
                    success: res1 => {
                      wx.hideLoading();                             
                      wx.showModal({
                        title: '购票成功',
                        content: '请在5分钟内付款,否则自动取消订单',
                        success:res=>{  
                                          
                          wx.redirectTo({
                            url: '/pages/pay/pay'
                          })                          
                        }
                      })
                    },
                    fail: err => {
                      console.error('[云函数] [sum] 调用失败：', err)
                    }
                  });
                }
              });
            }else{
              wx.showToast({
                title: '票已售空',
                icon: 'none',
                duration: 2000
              })
            }
          }
        })
      }   
    }
  }
})