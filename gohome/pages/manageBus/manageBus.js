// pages/manageBus/manageBus.js
const app = getApp();

var QQMapWX = require('../../assets/qqmap-wx-jssdk.min.js');
var qqmapsdk = new QQMapWX({
  key: app.globalData.key // 必填
})

const db = wx.cloud.database();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    lists:[],//站点列表
    carclub:'',//车社信息
    currentData: 0,
    admin:'',//已任职负责人
    unadmin:'',//待审核负责人
    saveSucc: true,//站点保存
    changeIntro:false,//修改简介
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    db.collection('carclub').where({_openid:app.globalData.userID}).get({
      success:e=>{
        if(e.data['0'].lists !=undefined){
          that.setData({
            carclub: e.data["0"],
            lists: e.data['0'].lists
          });
        }else{
          that.setData({
            carclub: e.data["0"],
          });
        }
        
        //管理员负责人这个是管理员知道了
        db.collection('admin').where({ carclub_id: e.data["0"]._id,state:1}).get({
          success:e=>{
            that.setData({
              admin: e.data
            });
          }
        });
        //待审核管理员负责人
        db.collection('admin').where({ carclub_id: e.data["0"]._id, state: 0 }).get({
          success: e => {
            // console.log(e.data);
            that.setData({
              unadmin: e.data
            });
          }
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
    //管理员负责人这个是管理员知道了
    const that =  this;
    db.collection('admin').where({ carclub_id: that.data.carclub._id, state: 1 }).get({
      success: e => {
        that.setData({
          admin: e.data
        });
      }
    });
    //待审核管理员负责人
    db.collection('admin').where({ carclub_id: that.data.carclub._id, state: 0 }).get({
      success: e => {
        that.setData({
          unadmin: e.data
        });
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
  //获取当前滑块的index
  swiperchange: function (e) {
    const that = this;
    if(e.detail.source=='touch'){
      that.setData({
        currentData: e.detail.current
      })
    }
    return false;
  },
  //点击切换，滑块index赋值
  checkCurrent: function (e) {
    const that = this;
    if (that.data.currentData == e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentData: e.target.dataset.current
      })
    }    
  },
  //新增节点
  addItem: function () {
    let lists = this.data.lists;
    lists.push(new Array());//实质是添加lists数组内容，使for循环多一次
    this.setData({
      lists: lists,
      saveSucc: false
    })
  },
  //删除节点
  deleteItem: function (e) {
    // console.log(e);
    let _index = e.currentTarget.dataset.id;
    let _List = this.data.lists;
    _List.splice(_index, 1);
    this.setData({
      lists: _List,
      saveSucc: false
    });
  },
  //选择站点
  choiceSite: function (e) {
    const _that=this;
    // console.log(e);
    wx.chooseLocation({
      success: function (res) {
        let _List = _that.data.lists;
        let list = {
          latitude: res.latitude,
          longitude: res.longitude,
          name: res.name,
        }
        let item=list;
        _List[e.currentTarget.dataset.id] = item;
        _that.setData({
          lists : _List,
          saveSucc :false
        })
        
      },
    })
  },
  //保存站点信息
  saveSucc : function(e){
    const that = this;
    that.is_recity(that.data.lists);
    const _ = db.command
    db.collection('carclub').doc(that.data.carclub._id).update({
      data: {
        lists: that.data.lists
      },
      success: res => {
        wx.showToast({
          icon: 'success',
          title: '保存成功',
        })
        that.setData({
          saveSucc: true
        })
      },
    })
   
  },
  //跳转审核负责人
  toCheck:function(e){
    wx.navigateTo({
      url: '/pages/checkPrincipal/checkPrincipal?id=' + e.currentTarget.dataset.id,
    })
  },
  //查看负责详细信息
  toPriDetail: function (e) {
    wx.navigateTo({
      url: '/pages/principalDetail/principalDetail?id=' + e.currentTarget.dataset.id,
    })
  },
  
  //判断是否有重复data:是一个数组，
  async is_recity(data){
    const that = this;

    db.collection('carclub').doc(that.data.carclub._id).update({
      data: {
        city: await that.checkCity(data)
      },
    })
  },
  //剔除重复城市
  checkCity(data){
    return new Promise(reslove=>{
      var city = new Array();
      if (data.length != 0){
        for (var i = 0; i < data.length; i++) {
          qqmapsdk.reverseGeocoder({
            location: {
              latitude: data[i].latitude,
              longitude: data[i].longitude
            },
            success: function (res) {
              var j = 0;
              city.push(res.result.address_component.city);
              if (city.length == data.length) {
                //剔除重复数据
                var a = {};
                for (var k = 0; k < city.length; k++) {
                  var v = city[k];
                  if (typeof (a[v]) == 'undefined') {
                    a[v] = 1;
                  }
                };
                city.length = 0;
                for (var k in a) {
                  city[city.length] = k;
                };
                reslove(city);
              }
            },
            fail: function (res) {
              console.log('城市选择错误' + res);
            }
          });
        }
      }else{
        reslove([]);
      }
    })
  },
  //选择添加付款二维码
  chooseCode: function(){
    const that = this;
    wx.chooseImage({
      count: 3 - that.data.payCode.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        let photeList = that.data.payCode;
        const filePath = res.tempFilePaths
        for (let i = 0; i < filePath.length; i++) {
          photeList.push(filePath[i]);
        }
        that.setData({
          payCode: photeList,
          codeSave: false
        })
      }
    })
  },
  //修改车社简介
  changeIntro:function(){
    this.setData({
      changeIntro: this.data.changeIntro ? false : true
    })
  },
  //保存修改
  changeIntroSucc:function(e){
    const that = this;
    this.changeIntro();
    wx.showModal({
      title: '提醒',
      content: '确定保存修改吗！',
      success: res => {
        if (res.confirm) {
          wx.showLoading({
            title: '更新数据...',
            mask: true
          })
          that.data.carclub.summary = e.detail.value
          that.setData({
            carclub: that.data.carclub
          })
          db.collection('carclub').doc(that.data.carclub._id).update({
            data: {
              summary: e.detail.value
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
  }
})