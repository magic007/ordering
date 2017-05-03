var that;
var Bmob=require("../../utils/bmob.js");
var optionId;
Page( {
    data:{
        currentTab: 0,
        currentType:"one",
        showCart:false,
        sumNum:0,
        sumMon:0
    },
    onShareAppMessage: function () {
    var title = "点餐小程序";
    var path = "pages/order/order";
    console.log(path);
    return {
      title: title,
      path: path
    }
  },
    bindChange: function( e ) {

        that = this;
        that.setData( { currentTab: e.detail.current });

    },
    onLoad: function(options) {
        optionId=options.currentTab;
        that = this;
        that.setData({
           currentTab:optionId
        })
        wx.getSystemInfo( {
            success: function( res ) {
                that.setData( {
                    winWidth: res.windowWidth,
                    winHeight: res.windowHeight
                });
            }

        });
        var Menu = Bmob.Object.extend("Menu");
        var query = new Bmob.Query(Menu);    
        query.find({
            success: function(result) {
                that.setData({
                    menu:result[0].get("menu")
                })
            },
            error: function(error) {
                
            }
        })
        wx.getStorage({
            key: 'user_id',
            success: function(ress) {
                var me = new Bmob.User();
                console.log("拉拉"+ress.data)
                me.id=ress.data;
                var Order = Bmob.Object.extend("Order");
                var queryOrder = new Bmob.Query(Order); 
                queryOrder.equalTo("orderUser",me);   
                queryOrder.find({
                    success: function(result) {
                        var orderArray=new Array();
                        for(var i=0;i<result.length;i++){
                            var a={orderId:result[i].get("orderId"),orderDetail:result[i].get("orderDetail"),amount:result[i].get("amount"),createdAt:result[i].createdAt}
                            orderArray.push(a);
                        }
                        that.setData({
                            orderArray:orderArray
                        })
                        console.log(orderArray)
                    },
                    error: function(error) {
                        
                    }
                })
            }
        })
    },
    onShow:function(){
        
        wx.setStorage({
            key:"orderResult",
            data:{}
        })
    },
    swichNav: function( e ) {

        var that = this;

        if( this.data.currentTab === e.target.dataset.current ) {
            return false;
        } else {
            that.setData( {
                currentTab: e.target.dataset.current
            })
        }


    },
    chooseType:function(event){
        var foodType=event.target.dataset.foodtype;
        that.setData({
            currentType:foodType
        })
    },
    seeDetailCart:function(){
        that.setData({
            showCart:!that.data.showCart
        })
    },
    addFoodNum:function(e){
        var addFoodNum=e.target.dataset.num+1; 
        var idx=parseInt(e.target.dataset.idx);
        var jdx=parseInt(e.target.dataset.jdx);
        var foodName=e.target.dataset.foodName;
        var price=parseInt(e.target.dataset.price);
        var jsonA=that.data.menu;
        jsonA[idx]["data"][jdx]["num"]=addFoodNum;
        that.setData({
            menu:jsonA,
            sumNum:parseInt(that.data.sumNum)+1,
            sumMon:parseInt(that.data.sumMon)+price
        });
    },
    reduceFoodNum:function(event){
        var redFoodNum=event.target.dataset.num-1; 
        var foodName=event.target.dataset.foodName;
        var idx=parseInt(event.target.dataset.idx);
        var jdx=parseInt(event.target.dataset.jdx);
        var price=parseInt(event.target.dataset.price);
        var jsonB=that.data.menu;
        jsonB[idx]["data"][jdx]["num"]=redFoodNum;
        that.setData({
            menu:jsonB,
            sumNum:parseInt(that.data.sumNum)-1,
            sumMon:parseInt(that.data.sumMon)-price
        })
    },
    hiddenLayer:function(){
        that.setData({
            showCart:false
        })
    },
    clearCart:function(){
        var jsonC=that.data.menu;
        for(var i=0;i<jsonC.length;i++){
            for(var j=0;j<jsonC[i].data.length;j++){
                jsonC[i].data[j].num=0;
            }
        }
        that.setData({
            menu:jsonC,
            showCart:false
        })
    },
    placeOrder:function(){
        var detailArray=new Array();
        var jsonC=that.data.menu;
        for(var i=0;i<jsonC.length;i++){
            for(var j=0;j<jsonC[i].data.length;j++){
                if(jsonC[i].data[j].num>0){
                    var a={name:jsonC[i].data[j].name,num:jsonC[i].data[j].num,price:jsonC[i].data[j].price}
                    detailArray.push(a);
                }
                
            }
        }
        var orderResult={
            sumMon:that.data.sumMon,
            detail:detailArray
        }
        wx.setStorage({
            key:"orderResult",
            data:orderResult
        })
        wx.navigateTo({
            url: '../balance/balance'
        })
    }
})