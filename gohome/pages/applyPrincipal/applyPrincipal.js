// pages/applyPrincipal/applyPrincipal.js

const db = wx.cloud.database();
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    carclub_info:'',//选择器
    objectCarclub_info: '',//选择器总数据  //选择的车社是objectCarclub_info[index]
    carclub_length:'',//一共有几个车社
    msg:'',//提示信息 
    index:0,//我选择的位置
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    //显示车社
    db.collection('carclub').get({
      success: function (res) {
        var carclub = new Array();
        const carclub_length = res.data.length;
        for (var i = 0; i < carclub_length;++i){
          carclub[i] = res.data[i].carclubname;
        }
        carclub[carclub_length] = '';
        that.setData({
          index: carclub_length,
          objectCarclub_info: res.data,
          carclub_info:carclub,
          carclub_length: carclub_length
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
  //表单提交
  apply_personal_submit: function (res) {
    const that = this;
    var car = '';
    if (res.detail.value.busName == '' || that.data.carclub_length == that.data.index) {
      wx.showModal({
        title: '输入提示',
        content: '车社名称不能为空！或者没有该车社',
      })
    } else {
      car = that.data.objectCarclub_info[that.data.index];
      if (res.detail.value.name == ''){
        wx.showModal({
          title: '输入提示',
          content: '请输入你的名字',
        })
      }else{
        if(res.detail.value.identity == ''){
          wx.showModal({
            title: '输入提示',
            content: '您是什么职业呢？？？',
          })
        }else{
          if (res.detail.value.phone == ''){
            wx.showModal({
              title: '输入提示',
              content: '本人的电话是必填的哦！',
            })
          } else if (res.detail.value.phone.length != 11) {
            wx.showModal({
              title: '输入提示',
              content: '请输入正确手机号码',
            })
          } else {
            if (res.detail.value.introduction == '') {
              wx.showModal({
                title: '输入提示',
                content: '让别人去了解你吧',
              })
            } else {
              const data = {
                photo: app.globalData.userPhoto,
                busname: res.detail.value.busName,
                carclub_id: car._id,
                name: res.detail.value.name,
                identity: res.detail.value.identity,
                introduction: res.detail.value.introduction,
                phone: res.detail.value.phone,
                type1:1,//1代表负责人 0：代表用户
                state: 0,//待审核
                tag: 0
              };
              const result = that.admin_add(data);
            }
          }
        }

      } 
    }
  },

  /**
     *  负责人表（管理员）
      * adminid：id1
      * name：姓名
      * identity: 职业
      * phone：电话
      * type1:身份
      * state：状态
      * tag：标记
     */
  admin_add: function ($data) {
    const that = this;
    db.collection('admin').add({
      // data 字段表示需新增的 JSON 数据
      data: $data,
      success: function (res) {
        // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
        if (res._id) {
          wx.showToast({
            title: '申请成功',
            success:res=>{
              wx.navigateBack({
                url: '/pages/person/person'
              })
            }
          })
        }
      }
    })
  },
  //选择器
  bindPickerChange: function (e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value,
    })
  },
})