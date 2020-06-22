// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command
// 云函数入口函数

exports.main = async (event, context) => {
  if (event.option == 'yes'){
    //成为管理员
    try {
      return await db.collection('admin').where({
        _id: event.admin['_id']
      })
        .update({
          data: {
            state: 1
          },
        })
    } catch (e) {
      console.error(e)
    }
  } else if (event.option == 'no'){
    //管理员离职
    try {
      return await db.collection('admin').where({
        _id: event.admin['_id']
      }).remove()
    } catch (e) {
      console.error(e)
    }
  } else if (event.option == 'comment_add1') {//成功之后评论的人数+1
    try {
      return await db.collection('carclub').where({
        _id: event.carclub['_id']
      })
        .update({
          data: {
            commentnum: _.inc(1),
            taste: _.inc(parseInt(event.fenshu,10)),
          },
        })
    } catch (e) {
      console.error(e)
    }
  } else if (event.option == 'comment_good1'){
    //评价
    try {
      return await db.collection('carclub').where({
        _id: event.carclub['_id']
      })
        .update({
          data: {
            good: _.inc(1),
          },
        })
    } catch (e) {
      console.error(e)
    }
  } else if (event.option == 'hot'){
    //买票
    try {
      return await db.collection('carclub').where({
        _id: event.carclub_id
      })
        .update({
          data: {
            num: _.inc(1),
            hot:_.inc(1),
          },
        }), db.collection('public_order').doc(event.orderid).update({
          data: {
            soldticket: _.inc(1)
          }
        })
    } catch (e) {
      console.error(e)
    }
  } else if (event.option == 'cancel'){
    //退票
    try {
      return await db.collection('carclub').where({
        _id: event.carclub_id
      })
        .update({
          data: {
            num: _.inc(-1),
            hot: _.inc(-1),
          },
        }),db.collection('public_order').doc(event.orderid).update({
          data: {
            soldticket: _.inc(-1)
          }
        })
    } catch(e) {
      console.error(e)
    }
  }
}