// pages/applyBus/applyBus.js

const db = wx.cloud.database();
const app = getApp();


Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    idCard :[],//身份证明
    logo:[],//显示上传图片的logo
    inviteCode:'',//邀请码
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

  //表单提交
  application_carclub_submit: function (res) {
    const that = this;
    if (res.detail.value.inviteCode == ''){
      wx.showModal({
        title: '提示',
        content: '请输入邀请密钥',
      })
    }else{
      if (res.detail.value.username == '') {
        wx.showModal({
          title: '提示',
          content: '请问怎么称呼',
        })
      } else {
        if (res.detail.value.carclubname == '') {
          wx.showModal({
            title: '输入提示',
            content: '车社名称不能为空！',
          })
        } else {
          if (res.detail.value.phone == '') {
            wx.showModal({
              title: '输入提示',
              content: '车社的电话是必填的哦！',
            })
          } else {
            if (res.detail.value.content == '') {
              wx.showModal({
                title: '输入提示',
                content: '为车社写点简介吧！让更多的人了解你的车社',
              })
            } else {
              if (that.data.logo == '') {
                wx.showModal({
                  title: '输入提示',
                  content: '上传车社标志试试吧！',
                })
              } else {
                if (that.data.idCard.length < 2 ) {
                  wx.showModal({
                    title: '输入提示',
                    content: '请上传身份证正反面！',
                  })
                } else {    
                  wx.showLoading({
                    title: '提交中...',
                    mask:true,
                  })           
                  const data = {
                    username: res.detail.value.username,//用户姓名
                    carclubname: res.detail.value.carclubname,//车社名称
                    logo: that.data.logo,
                    card: that.data.card,
                    summary: res.detail.value.content,
                    phone: res.detail.value.phone,
                    address: res.detail.value.address,
                    taste: 100,//这是体验指数
                    num: 0,//服务人数
                    good: 0,//好评人数
                    commentnum: 1,//评论人数
                    hot: 0,
                    state: 1,
                    tag: 0
                  };
                  const result = that.carclub_add(data);
                }
              }
            }
          }
        }
      }
    }
  },
  // 选择LOGO
  chooseLogo: function () {
    const that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        that.setData({
          logo: res.tempFilePaths
        })
      }
    })
  },
  // 选择身份证
  chooseImage: function () {
    const that = this;
    wx.chooseImage({
      count: 2 - that.data.idCard.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        let photeList = that.data.idCard;
        const filePath = res.tempFilePaths
        for (let i = 0; i < filePath.length; i++) {
          photeList.push(filePath[i]);
        }
        that.setData({
          idCard: photeList,
        })
      }
    })
  },
  //长按删除
  longDelete: function (e) {
    let that = this;
    let images = that.data.idCard;
    let index = e.currentTarget.id;//获取当前长按图片下标
    wx.showModal({
      title: '提示',
      content: '确定要删除此图片吗？',
      success: function (res) {
        if (res.confirm) {
          images.splice(index, 1);
        } else if (res.cancel) {
          return false;
        }
        that.setData({
          idCard: images
        });
      }
    })
  },
  //点击预览图片
  previewImg: function (e) {
    let index = e.currentTarget.id;
    let imgArr = this.data.idCard;
    wx.previewImage({
      current: imgArr[index],     //当前图片地址
      urls: imgArr,               //所有要预览的图片的地址集合 数组形式
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  //上传图片
  

  /**
     * 增加车社
     *  //op:操作类型 carclubid：车社ID * name：车社名称 logo：车社logo summary：车社简介 phone：车社电话  address：车社地址 hot：车社热度 state：车社状态 tag：车社标记
     */
  carclub_add: function ($data) {
    const that = this;
    that.updateImg(that.data.logo, [], 'logo', '', $data);
  },
  updateImg(data, list = [],rout='image',logo='',$data) {
    var that = this;
    if (data.length > 0) {
      let i = data.i ? data.i : 0,//当前上传的哪张图片
      success = data.success ? data.success : 0,//上传成功的个数
      fail = data.fail ? data.fail : 0;//上传失败的个数
      wx.cloud.uploadFile({
        cloudPath: rout+'/' + (new Date).getTime() + '' + i,
        filePath: data[i], // 小程序临时文件路径
        success: e => {
          success++;//图片上传成功，图片上传成功的变量+1
          // console.log(e.fileID)
          list.push(e.fileID);
          // console.log(i);
        },        
        fail: err => {
          console.log(err)
          fail++;//图片上传失败，图片上传失败的变量+1
          console.log('fail:' + i + "fail:" + fail);
        },
        complete: (e) => {
          // console.log(i);
          i++;//这个图片执行完上传后，开始上传下一张
          if (i == data.length) {   //当图片传完时，停止调用          
            console.log('执行完毕');
            console.log('成功：' + success + " 失败：" + fail);
            console.log(list);
            if(logo==''){
              that.updateImg(that.data.idCard,[],'idCard',list,$data);
            }else{
            //   //list :身份证  logo :logo
              $data['list'] = list;
              $data['logo'] = logo; 
              db.collection('carclub').add({
                  // data 字段表示需新增的 JSON 数据
                  data:$data,
                  success: function (res) {
                    const admin_data = {
                      photo: app.globalData.userPhoto,
                      busname: $data.carclubname,
                      carclub_id: res._id,
                      name: $data.username,
                      identity: '',
                      introduction: $data.summary,
                      phone: $data.phone,
                      type1: 1,//1代表负责人 0：代表用户
                      state: 1,//待审核
                      tag: 0
                    }                      
                    db.collection('admin').add({
                      // data 字段表示需新增的 JSON 数据
                      data: admin_data,
                      success: function (res) {                   
                        wx.hideLoading();
                        wx.showToast({
                          title: '注册成功',
                          duration:1000,
                          success: res => {
                            wx.navigateBack({
                              url: '/pages/person/person'
                            })
                          }
                        })                                  
                      }
                    })
                  }
                })
            }
          } else {//若图片还没有传完，则继续调用函数
            console.log(i);
            data.i = i;
            data.success = success;
            data.fail = fail;
            that.updateImg(data,list,rout,logo,$data);
          }
        }
      })
    }
  },
  checkCode : function(e){
    if (e.detail.value != 'dg123'){
      wx.showToast({
        title: '请联系客服获取邀请码再进行申请',
        icon: 'none',
        duration: 2000
      })
      this.setData({
        inviteCode : ''
      })
    }
  }
})