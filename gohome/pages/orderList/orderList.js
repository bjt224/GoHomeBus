// pages/orderList/orderList.js

const db = wx.cloud.database();
const app = getApp();
var privateOrder=[];

Page({

  /**
   * 页面的初始数据
   */
  // name：车社名称 logo：车社logo summary：车社简介 phone：车社电话  address：车社地址 hot：车社热度 state：车社状态 tag：车社标记
  data: {
    carclubid:'',//选中车社的ID
    name:'',
    logo:'',
    curNav: -1,
    order:'',//订单信息
    markStatus:'nomark',//是否收藏本车社
    mark_id:'',//收藏ID
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
    that.setData({
      carclubid: options.id
    });
    data = {
      _id: options.id,
      state: 1 //状态正常
    };
    //显示车社信息
    db.collection('carclub').where(data)
    .get({
      success: function (res) {
        // console.log(res);
        that.setData({
          name: res.data["0"].carclubname,
          logo: res.data["0"].logo,
        });
      }
    });
    //显示是否已经收藏
    db.collection('collection').where({ _openid: app.globalData.userID, carclub_id: that.data.carclubid}).get({
      success:e=>{
        that.setData({
          mark_id: e.data["0"]._id
        });
        if (e.data.length!=0){
          that.setData({
            markStatus: 'mark'
          })
        }
      }
    });

    //显示订单信息
    db.collection('public_order').where({ carclub_id: options.id,state:1,tag:0}).orderBy('times','desc').get({
      success:function(res){
        wx.hideLoading();
        that.setData({
          order:res.data,
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
  onChangeShowState:function(e){
    let id = e.currentTarget.dataset.id;
    // 把点击到的某一项，设为当前index
    if (this.data.curNav==id){
      this.setData({
        curNav: -1,
      })
    }else{
      this.setData({
        curNav: id,
      })
    }
  },
  tap:function(e){
    if (!app.globalData.loginStatus){
      wx.showToast({
        title: '请先到个人页面授权！',
        icon:'none',
        duration:2000
      })
    }else{
      if (this.data.order[e.currentTarget.dataset.index].soldticket >= this.data.order[e.currentTarget.dataset.index].amount) {
        wx.showToast({
          title: '票已售空',
          icon: 'none',
          duration: 2000
        })
      } else {
        wx.showLoading({
          title: '查询是否已购票',
          mask: true
        })
        //查出是否已购买该订单
        db.collection('personal_order').where({
          order_id: e.currentTarget.dataset.oid,
          _openid: app.globalData.userID
        }).count({
          success: res => {
            wx.hideLoading();
            if (res.total == 0) {
              wx.navigateTo({
                url: '/pages/buyTicket/buyTicket?id=' + e.currentTarget.id
              })
            } else {
              wx.showToast({
                title: '请勿重复购买车票',
                icon: 'none',
                duration: 2000
              })
            }
          }
        })
      }
    }
   
  },
  navto_info:function(res){
    wx.navigateTo({
      url: '/pages/busIntro/busIntro?id='+this.data.carclubid,
    })
  },
  //收藏按钮
  changeMark : function(e){
    const that = this;
    let mask = this.data.markStatus;
    if(mask == 'nomark'){//收藏
      db.collection('collection').add({
        data:{
          carclub_id:that.data.carclubid
        },
        success:e=>{
          if (e._id){
            wx.showToast({
              title: '收藏成功',
            })
            that.setData({
              markStatus: 'mark'
            })
          }
        }
      });
    }else{
      //取消收藏
      db.collection('collection').doc(that.data.mark_id).remove({
        success: function (res) {
          if(res.stats.removed){
            wx.showToast({
              title: '已取消收藏',
            })
            that.setData({
              markStatus: 'nomark'
            })
          }
        }
      })
    }
  },
  //返回首页
  toIndex: function (e) {
    wx.switchTab({
      url: '/pages/index/index',
    })
  }
})