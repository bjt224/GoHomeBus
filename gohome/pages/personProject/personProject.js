// pages/personProject/personProject.js
var map = require('../../assets/amap-wx.js');

const db = wx.cloud.database();

const app=getApp();

var QQMapWX = require('../../assets/qqmap-wx-jssdk.min.js');
var qqmapsdk = new QQMapWX({
  key: app.globalData.key // 必填
});
var timeInterval='';
let animationShowHeight = app.globalData.animationShowHeight;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    circles:[{
      radius:200,
      strokeWidth:1,
      fillColor: '#BFEFFF80',
      color:'#b3a4ee80'
    }],//上车点范围
    personorder:[],//订单信息
    indexs:0,
    order: {},//用户的订单
    longitude:'',
    latitude:'',
    marker:[{
      iconPath: "../../image/on-site.png",
      width: 50,
      height: 50,
    }],
    
    or:'',//路线的起点
    de:'',//路线的重点
    distances:200,//限制200米开始可以签到
    qiandaoanniu:'',//是否显示签到按钮
    is_sign_in:0,
    animationData: "",//上车点详细信息动画
    showModalStatus: false,//是否显示上车点详细信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getLocation();
    wx.showLoading({
      title: '努力加载中...',
      mask:true
    })
    //测试：读取订单
    const that = this;
    db.collection('public_order').where({
      _id: options.id//订单的ID号
    }).get({
      success: res => {        
        that.setData({
          indexs: options.indexs,
          order: res.data["0"],
          or: res.data["0"].start_longitude + ',' + res.data["0"].start_latitude,
          de: res.data["0"].end_list[options.indexs].longitude + ',' + res.data["0"].end_list[options.indexs].latitude,
        });
        //获取个人订单信息
        db.collection('personal_order').where({
          order_id: options.id,
          _openid: app.globalData.userID,
          xianlu_i: parseInt(options.indexs) 
        }).get({
          success:res=>{           
            that.setData({
              personorder:res.data,
              is_sign_in: res.data["0"].tag == 1 ? 1 : 0
            });
            wx.hideLoading();
          }
        });
        //路线
        // that.driving(that.data.or,that.data.de);
        that.gotoStartAddress();
        timeInterval = setInterval(function () {
          that.gotoStartAddress();
        }, 2000)
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
 * 生命周期函数--监听页面卸载
 */
  onUnload: function () {
    clearInterval(timeInterval);
  },
  //返回用户坐标点
  backUserLocation:function() {
    this.getLocation();
  },
  //打电话
  getphone:function(res){
    wx.makePhoneCall({
      phoneNumber: res.target.id //仅为示例，并非真实的电话号码
    })
  },
  //去到出发点按钮
  gotoStartAddress:function(e){
    const that = this;
    wx.getLocation({
      type: 'gcj02',
      success: function(res) {
        //计算距离
        that.calculateJourney(res);
        const froms = res.longitude + ',' + res.latitude;
        const to = that.data.order.start_longitude + ',' + that.data.order.start_latitude;
        //去到出发点位置
        let circles = that.data.circles;
        circles[0].longitude = that.data.order.start_longitude;
        circles[0].latitude = that.data.order.start_latitude;
        that.setData({
          circles: circles,
        })
        that.driving(froms, to);
      },
    })    
  },
  //签到按钮
  sign_in:function(res){
    const that = this;
    let nowDate = new Date();
    let date = nowDate.getFullYear() + "-" + (nowDate.getMonth() + 1) + "-" + (nowDate.getDate())
    console.log(that.data.order.date),
      console.log(date);
    if(that.data.order.date != date){
      wx.showToast({
        title:'尚未到发车日期',
        icon:'none',
        duration:1000
      })
    }
    //判断是否已付款
    else if (that.data.personorder.payStatus){
      wx.showModal({
        title: '提示',
        content: '请确认已上车再签到',
        success: res => {
          wx.showLoading({
            title: '正在签到...',
            mask: true
          })
          if (res.confirm && that.data.personorder.length > 0) {
            db.collection('personal_order').doc(that.data.personorder._id).update({
              data: {
                tag: 1
              },
              success: function (res) {
                if (res.stats.updated == 1) {
                  that.setData({
                    is_sign_in: 1
                  });
                  wx.hideLoading();
                  wx.showToast({
                    title: '签到成功',
                    duration:1000
                  })
                  
                } else {
                  wx.showToast({
                    title: '签到失败',
                  })
                }
              },
              fail: res => {
                console.log("更新失败：" + res);
              }
            })
          }
        }
      })
    }else{
      //没付款
      wx.showModal({
        title: '暂未付款',
        content: '请先付款并联系代理人进行确认，付款完成后再进行签到',
        success:function(res){
          if(res.confirm){
            wx.redirectTo({
              url: '/pages/pay/pay'
            })
          }else{
            wx.showToast({
              title: '请尽快付款',
              icon:"none"
            })
          }
        }
      })
    }
  },
  order_detail:function(e){
    wx.navigateTo({
      url: '/pages/userOrderDetail/userOrderDetail?order_id=' + this.data.order._id + '&indexs=' + e.target.dataset.index,
    })
  },
  //,路线
  //事件回调函数//i   0：去到出发点标志 1：去到终点标志
  driving(or,de) {
    const that = this;
    var myAmapFun = new map.AMapWX({ key: app.globalData.key_gaode });
    myAmapFun.getDrivingRoute({
      origin: or,//e.data["0"].start_longitude + ',' + e.data["0"].start_latitude,
      destination: de,//e.data["0"].end_longitude + ',' + e.data["0"].end_latitude,
      success: function (data) {
        // console.log(data);
        var points = [];
        if (data.paths && data.paths[0] && data.paths[0].steps) {
          var steps = data.paths[0].steps;
          for (var i = 0; i < steps.length; i++) {
            var poLen = steps[i].polyline.split(';');
            for (var j = 0; j < poLen.length; j++) {
              points.push({
                longitude: parseFloat(poLen[j].split(',')[0]),
                latitude: parseFloat(poLen[j].split(',')[1])
              })
            }
          }
        }
        that.setData({
          polyline: [{
            points: points,
            color: "#0091ff",
            width: 6
          }]
        });
        //去到出发点位置
        let mark = that.data.marker;
        mark[0].longitude = points[points.length-1].longitude;
        mark[0].latitude = points[points.length-1].latitude;
        that.setData({
          marker: mark
        })
      },
    })
  },
/**
*  获取用户位置
*/
  getLocation() {
    const _this = this;
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        _this.setData({
          longitude: res.longitude,
          latitude: res.latitude,
        })
      }
    })
  },
  //改变上车地点详细情况模块显示状态
  showModal: function () {
    // 显示遮罩层
    let animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
    })
    animation.translateY(-animationShowHeight).step()
    this.setData({
      animationData: animation.export(),
      showModalStatus: true
    })
    setTimeout(function () {
      animation.translateY(0).step()    
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 200)
  },
  hideModal: function () {
    // 隐藏遮罩层
    let animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
    })
    animation.translateY(animationShowHeight).step()
    this.setData({
      animationData: animation.export(), 
    })
    setTimeout(function () {
      this.setData({
        showModalStatus: false
      })
    }.bind(this), 200)
  },
  //用户距离起点的距离
  //带参数
  calculateJourney(res) {   
    const that = this;
    const to = {
      latitude: that.data.order.start_latitude,
      longitude: that.data.order.start_longitude
    };
    const froms = {
      latitude: res.latitude,
      longitude: res.longitude
    }
    qqmapsdk.calculateDistance({
      to: [froms, to],
      success: function (res) {
        that.setData({
          qiandaoanniu: that.data.distances >= res.result.elements["1"].distance ? true : false
        });
      },
      fail: function (res) {
        console.log(res);
      },
    });
  }
})