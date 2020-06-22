const app = getApp();

var QQMapWX = require('../../assets/qqmap-wx-jssdk.min.js');
var qqmapsdk = new QQMapWX({
  key: app.globalData.key // 必填
});

const db = wx.cloud.database();//数据库操作

Page({
  /**
   * 页面的初始
   * */
  data: {
    scale:14,
    status: false,
    latitude: '',
    longitude: '',
    mapCtx: "",
    input_placeholder:'请输入上车详细区域',
    location:'珠海市',
    carclub_all:'',//所有车社信息
    markers: '',//地图小标志
    //订单储存
    order:[],
    first:true,//第一次加载地图
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //定位
    this.getlocation();
    this.mapCtx = wx.createMapContext('myMap',this); 
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
    //判断是否有进行中订单
    const that = this;
    that.is_order();
    //显示车社
    that.showcarclub();
    
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
  // /**
  //  * 打开地图选择地点
  //  */
  chooseLocation:function(res){
    var that = this;
    wx.chooseLocation({
      success: function(res) {
        //获取选择位置的地址，经纬度 ,地点名称
        let choose_latitude = res.latitude;
        let choose_longitude = res.longitude;
        let choose_name = res.name;
        // 根据经纬度显示在什么市
        // 调用接口
        that.is_city(choose_longitude, choose_latitude);
        // 把搜索框中的文字变成，定位
        that.setData({
          input_placeholder: choose_name,
          longitude: choose_longitude ,
          latitude: choose_latitude
        });
      },
    })
  },
  //返回用户坐标点
  backUserLocation:function() {
    this.getlocation();
  },
  //拖拽地图时显示附近的建筑地址在搜索栏
  showArchitecture:function(e) {
    const that = this;
    //地图层级 大于12级才能显示订单起点
    //版本比较
    if(e.causedBy == 'scale' || that.data.first) {
      that.mapCtx.getScale({
        success: e => {
          that.data.first = false;
          if (e.scale > 13) {
            //订单查询
            var marker = new Array();
            var temp = '';
            db.collection('public_order').where({ state: 1 }).get({
              success: res => {
                for (var i = 0; i < res.data.length; i++) {
                  temp = {
                    iconPath: "../../image/bus-club.png",
                    id: res.data[i].carclub_id,
                    latitude: res.data[i].start_latitude,
                    longitude: res.data[i].start_longitude,
                    width: 50,
                    height: 50,
                    callout :{
                      content: res.data[i].name,
                      display: 'BYCLICK',
                      borderRadius: '20',
                      borderWidth: '20',
                      fontSize:'25'
                    }
                  }
                  marker.push(temp);
                }
                that.setData({
                  markers: marker
                });
              }
            });
          } else {
            that.setData({
              markers: ''
            });
          }
        }
      });
    }
   if(e.causedBy = 'drag'){
     //拖拽地图时显示附近的建筑地址在搜索栏
     if (e.type == "end") {
       this.mapCtx.getCenterLocation({
         success: function (res) {
           let choose_latitude = res.latitude;
           let choose_longitude = res.longitude;
           qqmapsdk.reverseGeocoder({
             location: {
               latitude: choose_latitude,
               longitude: choose_longitude
             },
             success: function (res) {
               that.setData({
                 input_placeholder: res.result.formatted_addresses.recommend
               })
               that.is_city(choose_longitude, choose_latitude);
             },
             fail: function (res) {
               console.log(res);//待完善
             },
           });
         }
       })
     }
   }
  },
  // 车社详情页
  navTOinfo:function(e){
    //获取选中车社的ID
    const carclubid = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/orderList/orderList?id=' + carclubid ,
      success:res=>{
        // console.log('ok');
      },
      fail:res=>{
        console.log(res);
      }
    })
  },
  calloutTap: function (e) {
    wx.navigateTo({
      url: '/pages/orderList/orderList?id=' + e.markerId ,
      success: res => {
        // console.log('ok');
      },
      fail: res => {
        console.log(res);
      }
    })
  },
  //定位
  getlocation(){
    const that = this;
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        that.setData({
          longitude: res.longitude,
          latitude: res.latitude,
        })
        app.globalData.latitude = res.latitude;
        app.globalData.longitude = res.longitude;
      }
    });
  },
  //显示车社
  showcarclub(){
    const that = this;
    //显示车社
    db.collection('carclub').orderBy('taste', 'asc').get({
      success: function (res) {
        that.setData({
          carclub_all: res.data
        }),
        wx.hideLoading();
      }
    })
  },
  //判断是否有进行中订单
  is_order(){
    const that = this;
    db.collection('personal_order').where({
      _openid: app.globalData.userID,
      state:1
    }).get({
      success: function (res) {
        if (res.data.length > 0) {
          that.setData({
            status: false//这里应该是true
          })
        } else {
          that.setData({
            status: false
          })
        }
      }
    })
  },
  // 根据经纬度显示在什么市
  is_city(lo,la){
    // 根据经纬度显示在什么市
    // 调用接口
    const that = this;
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: la,
        longitude: lo
      },
      success: function (res) {
        that.setData({
          location: res.result.address_component.city
        });
      },
      fail: function (res) {
        console.log('城市选择错误as' + res);
      }
    });               
  },
  //付款页面  
  toPay :function(){
    wx.navigateTo({
      url: '/pages/pay/pay',
      fail: res => {
        console.log(res);
      }
    })
  }
})