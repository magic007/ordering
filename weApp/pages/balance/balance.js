var Bmob=require("../../utils/bmob.js");
var that;
Page( {
    onLoad:function(){
        that=this;
    },
    onShow:function(){
        wx.getStorage({
            key: 'orderResult',
            success: function(res) {
                that.setData({
                    sumMon:res.data.sumMon,
                    detail:res.data.detail
                })

            } 
        })
    },
    settlement:function(event){
        var tableNum=event.detail.value.tableNum;
        var peopleNum=event.detail.value.peopleNum;
        var remarks=event.detail.value.remarks;
        var sumMon=that.data.sumMon;
        var orderDetail=that.data.detail;
        if(!tableNum){
            wx.showToast({
                title: '请输入餐桌号',
                icon: 'loading',
                duration: 500,
                complete:function(){
                    return;
                }
            })
        }
        else{
            wx.getStorage({
                key: 'user_openid',
                success: function(res) {
                   var openId =res.data;
                    if (!openId) {
                        console.log('未获取到openId请刷新重试');
                    }


                    //传参数金额，名称，描述,openid
                    Bmob.Pay.wechatPay(0.01, '点餐小程序', '描述', openId).then(function (resp) {
                        
                        //服务端返回成功
                        var timeStamp = resp.timestamp,
                            nonceStr = resp.noncestr,
                            packages = resp.package,
                            orderId = resp.out_trade_no,//订单号，如需保存请建表保存。
                            sign = resp.sign;

                        //打印订单号
                        console.log(orderId);
                        //发起支付
                        wx.requestPayment({
                            'timeStamp': timeStamp,
                            'nonceStr': nonceStr,
                            'package': packages,
                            'signType': 'MD5',
                            'paySign': sign,
                            'success': function (res) {
                                console.log(res)
                            //付款成功,这里可以写你的业务代码
                                wx.getStorage({
                                    key: 'user_id',
                                    success: function(ress) {
                                        console.log(ress.data)
                                        var Order = Bmob.Object.extend("Order");
                                        var Order = new Order();
                                        var me = new Bmob.User();
                                        me.id=ress.data;
                                        console.log(tableNum)
                                        console.log(peopleNum)
                                        console.log(remarks)
                                         console.log(parseInt(sumMon))
                                         console.log(parseInt(orderDetail))
                                         console.log(parseInt(orderId))
                                        Order.set("tableNum",tableNum);
                                        Order.set("peopleNum",peopleNum);
                                        Order.set("remarks",remarks);
                                        Order.set("orderUser",me);
                                        Order.set("amount",parseInt(sumMon));
                                        Order.set("isPay",true);
                                        Order.set("orderDetail",orderDetail);
                                        Order.set("orderId",orderId);
                                        Order.save(null, {
                                            success: function(result) {
                                                wx.redirectTo({
                                                    url: '../transaction/transaction'
                                                })
                                            },
                                            error: function(result, error) {

                                            }
                                        });
                                    }
                                })
                            },
                            'fail': function (res) {
                                wx.getStorage({
                                    key: 'user_id',
                                    success: function(ress) {
                                        var Order = Bmob.Object.extend("Order");
                                        var Order = new Order();
                                        var me = new Bmob.User();
                                        me.id=ress.data;
                                        Order.set("tableNum",tableNum);
                                        Order.set("peopleNum",peopleNum);
                                        Order.set("remarks",remarks);
                                        Order.set("orderUser",me);
                                        Order.set("amount",parseInt(sumMon));
                                        Order.set("isPay",false);
                                        Order.set("failReson",false);
                                        Order.set("orderDetail",res.data);
                                        Order.save(null, {
                                            success: function(result) {
                                                console.log(result.id)
                                            },
                                            error: function(result, error) {

                                            }
                                        });
                                    }
                                })
                            }
                        })

                    }, function (err) {
                    console.log('服务端返回失败');
                    console.log(err);
                    }); 

                } 
            })
            
            
            
            
            
        }
    }
})