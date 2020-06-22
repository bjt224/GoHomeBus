// pages/feedback/feedback.js
const db = wx.cloud.database();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    lists : [],//凭证列表
    phone:'',//电话号码
    content:'',//建议
    words : 0,
    tijiao:0,
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
  //选择图片
  chooseImage : function(){
    const that = this;
    that.doupdate('feedback');
  },
  //获取电话号码
  phone:function(e){
    if (e.detail.value == ''){
      wx.showModal({
        title: '提示',
        content: '电话号码不能为空',
      })
    }else{
      this.setData({
        phone: e.detail.value
      });
    }
  },
  //提交订单
  feedback_form:function(e){
    const that = this;
    console.log(that.data);
    that.setData({
      tijiao:1
    });
    if (that.data.phone == ''){
      wx.showModal({
        title: '提示',
        content: '电话号码不能为空',
      })
    }else{
      if (that.data.content == ''){
        wx.showModal({
          title: '提示',
          content: '建议反馈不能为空不能为空',
        })
      }else{
        if (that.data.lists == '') {
          wx.showModal({
            title: '提示',
            content: '至少上传一张凭证',
          })
        }else{
          that.updateImg(that.data.lists);
        }
      }
    }
  },
  doupdate(filename) {
    const that = this;
    // 选择图片
    wx.chooseImage({
      count: 3 - that.data.lists.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        let photeList = that.data.lists;
        const filePath = res.tempFilePaths
        console.log(res);
        for(let i=0;i<filePath.length;i++){
          photeList.push(filePath[i]);
        }
        that.setData({
          lists : photeList,
        })
      }
    })
  },
  //控制字数
  wordsChange: function (e) {
    this.setData({
      words: e.detail.cursor,
      content: e.detail.value
    })
    if (this.data.words == 300) {
      wx.showToast({
        title: '字数不可超过300',
        icon: 'success',
        duration: 2000
      })
    }
  },
  //长按删除
  longDelete : function(e) {
    let that = this;
    let images = that.data.lists;
    let index = e.currentTarget.id;//获取当前长按图片下标
    wx.showModal({
      title: '提示',
      content: '确定要删除此图片吗？',
      success: function (res) {
        if (res.confirm) {
          console.log('点击确定了');
          images.splice(index, 1);
        } else if (res.cancel) {
          console.log('点击取消了');
          return false;
        }
        that.setData({
          lists : images
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
  },

  updateImg(data,list=[]) {
    var that = this;
    if (data.length > 0) {
      i = data.i ? data.i : 0,//当前上传的哪张图片
        success = data.success ? data.success : 0,//上传成功的个数
        fail = data.fail ? data.fail : 0;//上传失败的个数

      wx.cloud.uploadFile({
        cloudPath: 'feedback/' +(new Date).getTime()+''+ i,
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
          console.log(i);
          i++;//这个图片执行完上传后，开始上传下一张
          if (i == data.length) {   //当图片传完时，停止调用          
            console.log('执行完毕');
            console.log('成功：' + success + " 失败：" + fail);
            console.log(list);
            db.collection('feedback').add({
              data:{
                phone: that.data.phone,
                content: that.data.content,
                lists: list
              },
              success:res=>{
                console.log(res._id);
                if (res._id){
                  wx.showModal({
                    title: '提示',
                    content: '提交成功',
                    success:res1=>{
                      wx.switchTab({
                        url: '/pages/person/person',
                      })
                    }
                  })
                }
              }
            });
            
          } else {//若图片还没有传完，则继续调用函数
            console.log(i);
            data.i = i;
            data.success = success;
            data.fail = fail;
            that.updateImg(data,list);
          }

        }
      })
    } else {
      db.collection('feedback').add({
        data: {
          phone: that.data.phone,
          content: that.data.content,
        },
        success: res => {
          console.log(res._id);
          if (res._id) {
            wx.showModal({
              title: '提示',
              content: '提交成功',
              success: res1 => {
                wx.switchTab({
                  url: '/pages/person/person',
                })
              }
            })
          }
        }
      });
    }
  },
})