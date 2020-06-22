// pages/sendOrder/sendOrder.js
var map = require('../../assets/amap-wx.js');

const app = getApp();

const db = wx.cloud.database();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    lists :[],//相片描述
    words : 0,//textarea字数
    content:'',//上车描述内容
    name: '',//这里是车社的名称，也是订单的名称
    carclub_id:'',
    photo:'',//头像
    phone:'',//联系方式
    phones: '',//司机联系方式
    jiage:'',//票价
    date: '2018/10/01',
    time:'09:10',
    amount:45,//一车人数
    carnum: '',//车牌
    start:{
      name:'请输入上车地点',
      latitude:'',
      longitude:'',
    },
    num:'',//班次'
    polyline:'',//选择的路线
    radioChange:false,//是否跟车
    offSite:[{
      name: '请输入下车地点',
      jiage: ''
    }],//下车站点列表
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    //获取订单名称
    db.collection('admin').where({
      _openid: app.globalData.userID
    }).get({
      success:function(res){        
        db.collection('carclub').where({_id:res.data["0"].carclub_id}).get({
          success:function(res1){            
            that.setData({
              name: res1.data["0"].carclubname,
              carclub_id: res1.data["0"]._id,
              photo: res1.data["0"].logo
            });
          }
        });
      }
    });
    //获取当前时间
    var myDate = new Date();
    var hour = myDate.getHours();
    var minutes = myDate.getMinutes();
    if (hour < 10){
      hour = '0'+hour;
    }
    if(minutes < 10){
      minutes='0' + minutes;
    }
    this.setData({
      date: myDate.getFullYear() + "-" + (myDate.getMonth() + 1) + "-" + (myDate.getDate() + 2),
      time: hour + ':' + minutes,
      num: myDate.getFullYear() + "" + (myDate.getMonth() + 1) + "" + myDate.getDate() + '' + hour + '' + minutes,
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
  
  //日期选择器
  bindDateChange: function(e){
    this.setData({
      date: e.detail.value
    })
  },
  //时间选择器
  bindTimeChange: function (e) {
    this.setData({
      time: e.detail.value
    })
  },
  //发布订单，表单提交
  sendorder_submit: function (res) {
    var that = this;
    //获取票数
    const num = res.detail.value.amount;//票数
    const carnum = res.detail.value.carnum;//车牌
    const phone = res.detail.value.phone;//你的联系方式
    const phones = res.detail.value.phones;//司机联系方式
    if (num <= 0 || num == '') {
      wx.showModal({
        title: '输入提示',
        content: '票数不能小于等于0,并且不能为空'
      });
    } else {
      if (carnum == '') {
        wx.showModal({
          title: '输入提示',
          content: '车牌号不能为空！'
        });
      } else {
        if (phone == '' || phone.length != 11) {
          wx.showModal({
            title: '输入提示',
            content: '您的联系方式错误！'
          });
        } else {
          if (phones == '' || phones.length != 11) {
            wx.showModal({
              title: '输入提示',
              content: '司机的联系方式错误！'
            });
          } else {
            if (that.data.start.name == '请输入上车地点' || that.data.start.name == '') {
              wx.showModal({
                title: '输入提示',
                content: '上车地点不能为空！'
              });
            } else {  
              wx.showLoading({
                title:'数据上传中',
                mask:true,
              })                     
              that.setData({                             
                amount: num,
                carnum: carnum,
                phone: phone,
                phones: phones,
              });
              if (that.data.radioChange) {
                that.data.amount = that.data.amount - 1
              }
              var data1 = {
                name: that.data.name,//班次名称
                carclub_id: that.data.carclub_id,//车社ID
                photo: that.data.photo,//车社logo
                content: that.data.content,
                num: that.data.num,//班次编号
                phone: that.data.phone,//负责人电话
                phones: that.data.phones,//司机电话
                date: that.data.date,//发布日期
                time: that.data.time,//发布时间
                times: new Date().getTime(),//发布订单时间戳
                amount: parseInt(that.data.amount),//人数
                carnum: that.data.carnum,//车牌
                start_name: that.data.start.name,//上车点
                start_latitude: that.data.start.latitude,//开始坐标
                start_longitude: that.data.start.longitude,
                end_list: that.data.offSite,//下车点列表
                state: 1,//发布正常，记录订单的状态
                tag: 0,//记录订单是否完成
                soldticket:0,//已售车票
                radioChange: that.data.radioChange,//是否跟车，默认不跟车
              };
              // 上传图片与增加数据  
              that.uploadImg(data1);      
            }
          }
        }
      }
    }
  },
  /**
   * 打开地图选择起点
   */
  choosestart: function (e) {
    var that = this;
    wx.chooseLocation({
      success: function (res) {
        //获取选择位置的地址，经纬度 ,地点名称
          that.setData({
              start: res
          });
          // console.log(res);
      },
      fail: function (res) {
      },
    })
  },
  /**
  * 打开地图选择终点
  */
  chooseend: function (e) {
    let that = this;
    let list = that.data.offSite;
    wx.chooseLocation({
      success: function (res) {
        //获取选择位置的地址，经纬度 ,地点名称
        let item = {
          jiage: list[e.currentTarget.dataset.index].jiage,
          name : res.name,
          latitude: res.latitude,
          longitude: res.longitude,
        };
        list[e.currentTarget.dataset.index] = item;
        that.setData({
          offSite : list
        });
        // console.log(that.data.offSite);
        // that.driving();
      },
      fail: function (res) {
      },
    })
  },

  //终点相应票价
  inputMoney :function (e){
    let list=this.data.offSite;
    list[e.currentTarget.dataset.index].jiage = e.detail.value;
    this.setData({
      offSite: list
    })
  },

  //路线
  //事件回调函数
  driving() {
    const that = this;
    var myAmapFun = new map.AMapWX({ key: app.globalData.key_gaode});
    myAmapFun.getDrivingRoute({
      origin: that.data.start.longitude + ',' + that.data.start.latitude,
      destination: that.data.end.longitude + ',' + that.data.end.latitude,
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
      },
    })
  },
  //是否跟车
  radioChange : function(e){
    // console.log(e.detail.value);
    const that = this;
    that.setData({
      radioChange: e.detail.value
    });
  },

  //删除下车点
  delSite :function(e){
    let lists=this.data.offSite;
    if(lists.length <= 1){
      wx.showToast({
        title: '至少填写1个下车点',
        icon: 'none',
        duration: 1000
      })
    }else{
      console.log(lists);
      lists.splice(e.currentTarget.dataset.index, 1);
      this.setData({
        offSite: lists
      })
    }
  
  },
  //增加下车点
  addSite :function(e){
    let lists=this.data.offSite;
    if(lists.length >=3){
      wx.showToast({
        title: '最多填写3个下车点',
        icon: 'none',
        duration: 1000
      })
    }else{
      lists.push({ name: '请输入下车地点' });
      this.setData({
        offSite: lists
      })
    }
  },
  //控制字数
  wordsChange: function (e) {
    // console.log(e);
    this.setData({
      words: e.detail.cursor,
      content: e.detail.value//这里是内容
    })
    if (this.data.words == 100) {
      wx.showToast({
        title: '字数不可超过100',
        icon: 'success',
        duration: 2000
      })
    }
  },
  //选择照片
  chooseImage: function () {
    const that = this;
    wx.chooseImage({
      count: 3 - that.data.lists.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        let photeList = that.data.lists;
        const filePath = res.tempFilePaths
        for (let i = 0; i < filePath.length; i++) {
          photeList.push(filePath[i]);
        }
        that.setData({
          lists: photeList,
        })
        }
      })
    },
  //调用上传
  async uploadImg(data) {
    uploadedImgs = await this.localImgs2webImgs(data);
  },
  //上传图片
  localImgs2webImgs(data) {
    const that = this;
    let item = that.data.lists;
    var photoList=[];
    let promiseList = item.map((item) => {
      return new Promise(resolve => {
        wx.cloud.uploadFile({
          cloudPath: 'describe/' + (new Date()).getTime(),
          filePath: item, // 小程序临时文件路径
          success: e => { 
            resolve(e);
          },
        });
      })
    });
    // 使用Primise.all来执行promiseList
    const result = Promise.all(promiseList).then((res) => {
      for(let i=0;i<res.length;i++){
        photoList.push(res[i].fileID)
      }
      data['photo_miaoshu'] = photoList;
      db.collection('public_order').add({
        // data 字段表示需新增的 JSON 数据
        data: data,
        success: function (res) {
          wx.hideLoading();
          wx.showToast({
            title: '发布成功！',
            duration: 1000,
            success: e => {
              wx.redirectTo({
                url: '/pages/ongoingOrder/ongoingOrder',
              });
            }
          });
        }
      });
      return res;
    }).catch((error) => {
      console.log(error);
    });
    return result;
  },
  
  //长按删除
  longDelete: function (e) {
    let that = this;
    let images = that.data.lists;
    let index = e.currentTarget.id;//获取当前长按图片下标
    wx.showModal({
      title: '提示',
      content: '确定要删除此图片吗？',
      success: function (res) {
        if (res.confirm) {
          // console.log('点击确定了');
          images.splice(index, 1);
        } else if (res.cancel) {
          // console.log('点击取消了');
          return false;
        }
        that.setData({
          lists: images
        });
      }
    })
  },
  //点击预览图片
  previewImg: function (e) {
    // console.log(e);
    let index = e.currentTarget.id;
    let imgArr = this.data.lists;
    wx.previewImage({
      current: imgArr[index],     //当前图片地址
      urls: imgArr,               //所有要预览的图片的地址集合 数组形式
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  }
})