// pages/userOrderDetail/userOrderDetail.js
const db = wx.cloud.database();
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    order:'',//订单信息
    carclub:'',//车社信息
    admin:'',//负责人信息
    taste:100,//体验信息有3种：100   80  60  体验指数等于：所有人评价的均值
    is_comment:0,//判断是哪一个100 80 60
    indexs:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    console.log(options);
    that.setData({
      indexs:options.indexs
    });
    //显示订单信息
    db.collection('public_order').where({ _id: options.order_id}).get({
      success:e=>{
        // console.log(e.data[0]._openid);
        db.collection('carclub').where({
          _id: e.data[0].carclub_id
        }).get({
          success:res=>{
            // console.log(res.data["0"]);
            db.collection('admin').where({_openid:e.data[0]._openid}).get({
              success:s=>{;
                that.setData({
                  order: e.data[0],
                  carclub: res.data["0"],
                  admin: s.data["0"]
                });
              }
            });
          }
        });
      }
    });
    //判断是否已经评价
    db.collection('comment').where({ _openid: app.globalData.userID, order_id: options.order_id,indexs:that.data.indexs}).get({
      success:e=>{
        const fenshu = e.data["0"].comment_num;
        if (e.data.length>0){
          that.setData({
            is_comment:fenshu
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
  getphone:function(e){
    wx.makePhoneCall({
      phoneNumber: e.target.id 
    })
  },
  //评价
  comment:function(ress){
    const that = this;
    var fenshu = ress.currentTarget.id;
    // console.log(ress.currentTarget.id);
    db.collection('comment').add({
      data:{
        carclub_id: that.data.carclub._id,
        order_id: that.data.order._id,
        indexs:that.data.indexs,
        comment_num: ress.currentTarget.id,//评价的分数
      },
      success:function(res){
        // console.log(res);
        if (res._id){
          wx.showToast({
            title: '评价成功',
          })
          that.setData({
            is_comment: fenshu
          });
        }
        //成功之后评论的人数+1
        wx.cloud.callFunction({
          name: 'applyadmin',
          data: {
            carclub: that.data.carclub,
            option: 'comment_add1',
            fenshu: ress.currentTarget.id
          },
          success: res1 => {
           console.log(res1);
          },
          fail: err => {
            console.error('[云函数] [sum] 调用失败：', err)
          }
        });
        //好评+1
        if(fenshu == 100){
          wx.cloud.callFunction({
            name: 'applyadmin',
            data: {
              carclub: that.data.carclub,
              option: 'comment_good1',
            },
            success: res1 => {
              console.log('好评加1');
            },
            fail: err => {
              console.error('[云函数] [sum] 调用失败：', err)
            }
          });
        }
        
      }
    });
  }
})