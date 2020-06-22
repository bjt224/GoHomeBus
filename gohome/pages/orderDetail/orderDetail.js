// pages/orderDetail/orderDetail.js


const db = wx.cloud.database();
const delBtnWidth = 160;//删除块的宽度
const app = getApp().globalData;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    order:'',//订单信息
    personal:[],//买票的用户
    siteNum:[],
    allmoney:0,
    sumOnBus:0,
    sumPay:0,
    changeAmount:false,//修改总票数
    changePlateNumber:false,//修改车牌号码
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    db.collection('public_order').where({
      _id:options.id
    }).get({
      success:function(order){
        that.setData({
          order: order.data["0"]
        });
        that.personalMan(order.data[0])
      }
    });
  },
  personalMan(order){
    const that=this;
    //已签到人数
    db.collection('personal_order').where({
      order_id: order._id, 
      state: 1,
      tag:1
    }).count({
      success:res=>{
        that.setData({
          sumOnBus:res.total
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
  //更改付款状态
  changePayStatus: function(e){
    const that = this;
    if(that.checkAdmin()){
      let tempPersonal = this.data.personal;
      wx.showModal({
        title: '提示',
        content: tempPersonal[e.currentTarget.dataset.index].paystatus ? '请确认已成功退款给 ' + tempPersonal[e.currentTarget.dataset.index].nickname + ' 乘客!' : '请确认 ' + tempPersonal[e.currentTarget.dataset.index].nickname + ' 乘客已付款吗！',
        success: res => {
          if (res.confirm) {
            wx.cloud.callFunction({
              name: 'payStatus',
              data: {
                status: !tempPersonal[e.currentTarget.dataset.index].paystatus,
                orderid: e.currentTarget.dataset.orderid,
              },
              success: res => {
                tempPersonal[e.currentTarget.dataset.index].paystatus = !tempPersonal[e.currentTarget.dataset.index].paystatus;
                that.setData({
                  personal: tempPersonal
                })
              },
              fail: err => {
                console.error('[云函数] [payStatus] 调用失败：', err)
              }
            })
          }
        }
      })
    }else{
      wx.showToast({
        title: '权限不足，请联系发单代理人修改订单详情',
        icon: 'none',
        duration: 2000
      })
    }
   
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
      let list = this.data.personal;
      list[index].txtStyle = txtStyle;
      //更新列表的状态
      this.setData({
        personal: list
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
      let list = this.data.personal;
      list[index].txtStyle = txtStyle;
      //更新列表的状态
      this.setData({
        personal: list
      });
    }
  },
  //取消订单
  unorder: function (e) {
    const that = this;
    if(that.checkAdmin()){
      if (that.data.personal[e.currentTarget.dataset.index].paystatus) {
        wx.showToast({
          title: '请先退款再取消该乘客订单',
          icon: 'none',
          duration: 2000
        })
      } else {
        wx.showModal({
          title: '提示',
          content: '确定取消 ' + that.data.personal[e.currentTarget.dataset.index].nickname + ' 该订单吗？',
          success: res1 => {
            if (res1.confirm) {
              wx.cloud.callFunction({
                name: 'delOrder',
                data: {
                  carClubid: that.data.order.carclub_id,//订单所属车社
                  poid: that.data.personal[e.currentTarget.dataset.index]._id,//个人订单号
                  oid: that.data.personal[e.currentTarget.dataset.index].order_id,//车社订单号
                },
                success: res => {
                  that.personalMan(that.data.order);
                  that.data.order.soldticket--;
                  that.setData({
                    order: that.data.order
                  })
                }
              })
            }
          }
        })
      }
    }else{
      wx.showToast({
        title: '权限不足，请联系发单代理人修改订单详情',
        icon: 'none',
        duration: 2000
      })
    }
  },
  //订单完成
  finishOrder:function(){
    let that = this;
    if (that.checkAdmin()){
      wx.showModal({
        title: '提示',
        content: '确认订单已完成吗！！！',
        success: res => {
          if (res.confirm) {
            db.collection('personal_order').where({
              order_id: that.data.order._id,
              tag: 1
            }).count({
              success: res => {
                if (res.total == that.data.order.soldticket) {
                  console.log(res);
                  db.collection('public_order').doc(that.data.order._id).update({
                    data: {
                      tag: 1
                    },
                    success: res => {
                      if (res.stats.updated == 1) {
                        wx.redirectTo({
                          url: "/pages/orderHistory/orderHistory",
                        })
                      }
                    }
                  })
                }else{
                  wx.showToast({
                    title: '还有乘客未上车',
                    icon: 'none',
                    duration: 2000
                  })
                }
              }
            })
          }
        }
      })  
    }else{
      wx.showToast({
        title: '权限不足，请联系发单代理人修改订单详情',
        icon:'none',
        duration:2000
      })
    }
    
  },
  //检查是否是发起者
  checkAdmin(){
    if(this.data.order._openid == app.userID){
      return true
    }else{
      return false
    }
  },
  //更换总数状态
  changeAmount:function(){
    if(this.checkAdmin()){
      this.setData({
        changeAmount: this.data.changeAmount ? false : true
      })
    }else{
      wx.showToast({
        title: '权限不足，请联系发单代理人修改订单详情',
        icon: 'none',
        duration: 2000
      })
    }
  },
  //修改成功保存
  changeAmountSucc:function(e){
    const that = this;
    this.changeAmount();
    wx.showModal({
      title: '提醒',
      content: '确定把可售乘车票 \'' + that.data.order.amount + '\' 张修改为 \'' + e.detail.value +'\' 张吗！',
      success:res=>{
        if(res.confirm){
          wx.showLoading({
            title: '更新数据...',
            mask:true
          })
          that.data.order.amount = parseInt(e.detail.value)
          that.setData({
            order: that.data.order
          })
          db.collection('public_order').doc(that.data.order._id).update({
            data:{
              amount: parseInt(e.detail.value)
            },
            success:res=>{
              wx.hideLoading();
              wx.showToast({
                title: '修改成功!',
                duration:1000
              })
            }
          })
        }
      }
    })
  },
  //修改车牌号码
  changePlateNumber:function(){
    if (this.checkAdmin()) {
      this.setData({
        changePlateNumber: this.data.changePlateNumber ? false : true
      })
    } else {
      wx.showToast({
        title: '权限不足，请联系发单代理人修改订单详情',
        icon: 'none',
        duration: 2000
      })
    }
  },
  //修改成功保存
  changePlateNumberSucc: function (e) {
    const that = this;
    this.changePlateNumber();
    wx.showModal({
      title: '提醒',
      content: '确定把车牌号码 \'' + that.data.order.carnum + '\' 修改为 \'' + e.detail.value + '\' 吗！',
      success: res => {
        if (res.confirm) {
          wx.showLoading({
            title: '更新数据...',
            mask: true
          })
          that.data.order.carnum = e.detail.value
          that.setData({
            order: that.data.order
          })
          db.collection('public_order').doc(that.data.order._id).update({
            data: {
              carnum: e.detail.value
            },
            success: res => {
              wx.hideLoading();
              wx.showToast({
                title: '修改成功!',
                duration: 1000
              })
            }
          })
        }
      }
    })
  },
  //复制乘客列表
  async copyList(){
    const that = this;
    wx.showLoading({
      title: '复制中..',
    })
    wx.setClipboardData({
      data: await that.copyPersongList(),
      success(res) {
        wx.hideLoading();
        wx.showToast({
          title: '已复制至剪贴板',
        })
      }
    })
  },
  copyPersongList(){
    const that =this;
    return new Promise(function (resolve, reject){
      let personal ='姓 名\t电话号码\t付款状态\n'
      for (let p of that.data.personal) {
        personal = personal + p.nickname+'\t'+p.phone+'\t'+p.paystatus+'\n'
      }
      resolve(personal)
    })    
  }
})

