// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {

  let delPO = new Promise(function(resolve,reject){
    db.collection('personal_order').doc(event.poid).remove()
  });
  let upCar = new Promise(function (resolve, reject){
    db.collection('carclub').where({
    _id: event.carClubid
    }).update({
      data: {
        num: _.inc(-1),
        hot: _.inc(-1),
      },
    })
  });
  let upPO = new Promise(function (resolve, reject){
    db.collection('public_order').doc(event.oid).update({
      data: {
        soldticket: _.inc(-1)
      },
    })
  });
  return await (Promise.all([delPO, upCar, upPO]).then((res) => { return 'yes' })); 
}

