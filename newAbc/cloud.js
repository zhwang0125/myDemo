var AV = require('leanengine');
var Commen = require("./Api/Api.commen")
var donutCoin = AV.Object.extend("DonutCoin");
var Order = AV.Object.extend("CoinOrder");
var RedeemLog = AV.Object.extend('RedeemLog');
var Api=require("./Api")
var AVController=Api.AVController
var async = require('async')
var eventproxy = require('eventproxy');
var moment = require('moment');

AV.Cloud.define('checkDonutCoin', function(request, response) {

  var query = new AV.Query('_User');
  query.get(request.params.userid, {
    success: function (result) {
        if(result){
            var datenow = new Date()
            var coinRelation = result.relation('myDonutCoin')//金币关联
            var query1 = coinRelation.query()
            query1.equalTo('coinInfo',request.params.coinInfo)
            query1.addDescending('createdAt')
            query1.find({
                success: function (list) {
                    if(list.length > 0){
                        var firstobj =  list[0]

                        if(request.params.coinInfo == "每日登录" || request.params.coinInfo == "每日分享"){
                            var changdate = firstobj.createdAt
                            if(changdate instanceof Date){
                                if(changdate.getFullYear()==datenow.getFullYear() && changdate.getMonth()==datenow.getMonth() &&changdate.getDate()==datenow.getDate()){
                                    return response.success({'ishave':true,'obj':firstobj})
                                }
                                else{
                                    return response.success({'ishave':false})
                                }
                            }
                            else{
                                return response.success({'ishave':false})
                            }
                        }
                        else{
                            return response.success({'ishave':true,'obj':firstobj})
                        }
                    }
                    else{
                        response.error({'ishave':false})
                    }
                },
                error: function (result, error) {
                    return response.error({'ishave':false})
                }
            });
        }
        else{
            return response.error({'ishave':false})
        }
    },
    error: function (result, error) {
      return response.error({'ishave':false})
    }
  })
});
AV.Cloud.define('getDate', function(request, response) {
    response.success({'severdate':Date()});
});
AV.Cloud.define('checkEveryDayLogin', function(request, response) {

  var query = new AV.Query('_User');
  query.get(request.params.userid, {
    success: function(result) {
      // 成功获得实例
      //获取user信息
      var lianxidenglu = result.get('landingDays')//连续登录天数
      var lasttime =  result.get('lastLoginTime')//上次登录时间
      var jinbi = result.get('coinnumber')//纳币数
      var coinRelation = result.relation('myDonutCoin')//金币关联
      var nowdate = new Date();
      var deltaDays = 0
      var newlianxuDays = 0
      if(lasttime == null){
        newlianxuDays = 1
        addcoinnumber = 1
      }
      else{
        var str1 = nowdate.getFullYear() + ',' +  nowdate.getMonth() + ',' + nowdate.getDate()
        var str2 = lasttime.getFullYear() + ',' +  lasttime.getMonth() + ',' + lasttime.getDate()
        var nowdate1 = new Date(str1);
        var lasttime1 =  new Date(str2);
        deltaDays = (nowdate1.getTime() - lasttime1.getTime())/ (1000 * 60 * 60 * 24)

        if(deltaDays == 0){
          response.success({'days':lianxidenglu,'coins':0})
          return
        }
        else{
          newlianxuDays = lianxidenglu
          if(deltaDays == 1){
            newlianxuDays = lianxidenglu + 1
          }else{
            newlianxuDays = 1
          }
          var addcoinnumber;
          if(newlianxuDays <= 5){
            addcoinnumber = newlianxuDays
          }
          else {
            addcoinnumber = 5
          }
        }
      }
      result.set('lastLoginTime',nowdate)
      result.set('landingDays',newlianxuDays)
      result.set('coinnumber',jinbi+addcoinnumber)
      result.save(null, {
        success: function(result) {
          // 成功保存之后，执行其他逻辑.
          var coinchang = new donutCoin()
          coinchang.set('changDate',nowdate)
          coinchang.set('coinInfo',"每日登录")
          coinchang.set('changNumber',addcoinnumber)
          coinchang.save(null,{
            success:function(coinchang){
              coinRelation.add(coinchang)
              result.save(null,{
                success: function (result) {
                  response.success({'days':newlianxuDays,'coins':addcoinnumber,'totalNumber':jinbi+addcoinnumber})
                },
                error: function(result, error) {
                  // 失败之后执行其他逻辑
                  // error 是 AV.Error 的实例，包含有错误码和描述信息.
                  response.error("user增加DonutCoin关联保存失败")
                }
              });
            },
            error: function(coinchang, error) {
              // 失败之后执行其他逻辑
              // error 是 AV.Error 的实例，包含有错误码和描述信息.
              response.error("金币明细保存失败")
            }
          });
        },
        error: function(result, error) {
          // 失败之后执行其他逻辑
          // error 是 AV.Error 的实例，包含有错误码和描述信息.
          response.error("user 保存失败")
        }
      });
    },
    error: function(object, error) {
      // 失败了.
      response.error("获取user失败")
    }
  });
});
AV.Cloud.define('donutCoinChange', function(request, response) {

  var query = new AV.Query('_User');
  query.get(request.params.userid, {
    success: function(result) {
      // 成功获得实例
      var orinalNum = result.get('coinnumber')
      var changnum
      if(request.params.coinInfo == "注册多纳账号"){
        changnum = 100
      }
      else if(request.params.coinInfo == "给多纳评分"){
        changnum = 5
      }
      else if(request.params.coinInfo == "把多纳分享给朋友"){
        changnum = 5
      }
      else if(request.params.coinInfo == "每日登录"){
        changnum = 1
      }
      else if(request.params.coinInfo == "每日任务"){
        changnum = 3
      }
      else if(request.params.coinInfo == "每日分享"){
        changnum = 2
      }
      else{
        changnum = request.params.changNumber
      }
      if(orinalNum+changnum < 0){
        response.success({'info':'金币不够'})
      }
      else{

        if(request.params.coinInfo == "解锁level1"){
          result.set('isBuyLevel1',1)
        }
        if(request.params.coinInfo == "解锁level2"){
          result.set('isBuyLevel2',1)
        }
        if(request.params.coinInfo == "解锁level3"){
          result.set('isBuyLevel3',1)
        }
        if(request.params.coinInfo == "解锁level4"){
          result.set('isBuyLevel4',1)
        }
        if(request.params.coinInfo == "解锁level5"){
          result.set('isBuyLevel5',1)
        }
        if(request.params.coinInfo == "解锁level6"){
          result.set('isBuyLevel6',1)
        }
        if(request.params.coinInfo == "解锁level1-level6"){
          result.set('isBuyLevel1',1)
          result.set('isBuyLevel2',1)
          result.set('isBuyLevel3',1)
          result.set('isBuyLevel4',1)
          result.set('isBuyLevel5',1)
          result.set('isBuyLevel6',1)
        }
        result.set('coinnumber',orinalNum+changnum)
        result.save(null,{

          success: function (result) {

            var nowdate = new Date()
            var coinRelation = result.relation('myDonutCoin')//金币关联
            var coinchang = new donutCoin()
            coinchang.set('changDate',nowdate)
            coinchang.set('coinInfo',request.params.coinInfo)
            coinchang.set('changNumber',changnum)
            coinchang.save(null,{
              success:function(coinchang){

                coinRelation.add(coinchang)
                result.save(null,{
                  success:function(coinchang){
                    response.success({'changNumber':changnum,'changDate':nowdate,'coinInfo':request.params.coinInfo,'totalNumber':orinalNum})
                  },
                  error:function(coinchang){
                    response.error("user创建金币关联失败")
                  }
                })
              },
              error:function(coinchang, error){
                response.error("donutCoin 保存失败")
              }
            })
          },
          error:function(result, error){
            response.error("user 保存失败")
          }
        })
      }
    },
    error: function(object, error) {
      response.error("获取user失败")
    }
  });
});
AV.Cloud.define('getMainCoinInfo', function(request, response) {

  var homepageQuery = new AV.Query('IOSHomePage')
  homepageQuery.include("themeNew")
  homepageQuery.first().then(function (data) {
    var theme = data.get("themeNew")
    var title = theme.get("title")
    var userquery = new AV.Query('_User');
    userquery.equalTo("objectId",request.params.userid)
    userquery.find().then(function(user){
      var oneuser = user[0]
      var s1 =  title + '-看视频'
      var s2 =  title + '-玩游戏'
      var s3 =  title + '-练口语'
      var datenow = new Date()
      var date = new Date(datenow.getFullYear(),datenow.getMonth(),datenow.getDate(),0,0,0,0)
      var coinRelation = oneuser.relation('myDonutCoin')//金币关联
      var query1 = coinRelation.query()
      query1.containedIn('coinInfo',['注册多纳账号','给多纳评分','给多纳评分3.1','给多纳评分3.2','给多纳评分3.3','给多纳评分3.4','给多纳评分3.5','给多纳评分3.6','把多纳分享给朋友','完善资料',s1,s2,s3])
      var query2 = coinRelation.query()
      query2.greaterThan('createdAt',date)
      var query = AV.Query.or(query1, query2);
      query.find().then(function(result){
        response.success(result)
      },function(error){
        response.error("获取金币记录失败")
      })
    },function(error){
      response.error("获取user失败")
    });
  }, function (error) {
    response.error("获取IOSHomePage失败")
  });
})
AV.Cloud.define('getRelation', function(request, response) {

  var query = new AV.Query(request.params.classname);
  query.get(request.params.objid, {
    success: function (result) {

      var relation = result.relation(request.params.objkey)

      var query = relation.query()

      query.find({
        success: function (list) {
          response.success(list)
        },
        error: function (result, error) {

        }
      });
    },
    error: function (result, error) {
      response.error("获取user失败")
    }
  })
})
AV.Cloud.define('IOSRestore', function(request, response) {

  var query = new AV.Query('_User');
  query.get(request.params.userid, {
    success: function(result) {
      // 成功获得实例
      var isresumeBuy = result.get('resumeBuy')
      var coinNumber = result.get('coinnumber')
      if(isresumeBuy == 1){
        response.success({'isFirstTimeResume':0})
      }
      else{
        result.set('resumeBuy',1)
        result.save(null,{
          success: function (result) {
            var nowdate = new Date()
            var coinRelation = result.relation('myDonutCoin')//金币关联
            var coinchang = new donutCoin()
            coinchang.set('changDate',nowdate)
            coinchang.set('coinInfo',"恢复购买")
            coinchang.set('changNumber',800+coinNumber)
            coinchang.save(null,{
              success:function(coinchang){
                coinRelation.add(coinchang)
                result.save(null,{
                  success:function(coinchang){
                    response.success({'isFirstTimeResume':1,'changNumber':800,'changDate':nowdate,'coinInfo':"恢复购买",'totalNumber':coinNumber})
                  },
                  error:function(coinchang){
                    response.error("user创建金币关联失败")
                  }
                })
              },
              error:function(coinchang, error){
                response.error("donutCoin 保存失败")
              }
            })
          },
          error:function(result, error){
            response.error("user 保存失败")
          }
        })
      }
    },
    error: function(object, error) {
      response.error("获取user失败")
    }
  });
});
AV.Cloud.define('generateOrder',function(request, response) {
  // body...
  var randomOrderCode = request.params.uuid + (new Date()).valueOf();
      var order = new Order();
      order.set('OrderCode',randomOrderCode);
      order.set('ProductId',request.params.productId);
      order.set('UserName',request.params.username);
      order.set('UDID',request.params.uuid);
      order.set('Status',0);//0-请求订单 1-请求验证收据 2-收据有效 3-收据无效
      order.set('Version',request.params.Version);
      order.set('platform',request.params.platform);
      order.save().then(function(order) {
        //成功
        response.success(randomOrderCode)
      }, function(err) {
        //失败
        response.error("请求订单失败")
      });
});
AV.Cloud.define('checkReceipt',function(request, response) {
 var queryCheck = new AV.Query('CoinOrder');
 queryCheck.equalTo('billcode',request.params.receiptStr);
 queryCheck.notEqualTo('Status',0);
 queryCheck.notEqualTo('Status',1);
 queryCheck.find().then(function(results) {
    if (results.length>0) {
      response.success(false);
    }else {
      var query = new AV.Query('CoinOrder');
      query.equalTo('OrderCode',request.params.orderCode);
      query.equalTo('ProductId',request.params.productId);
      query.equalTo('UserName',request.params.username);
      query.equalTo('UDID',request.params.uuid);
        query.notEqualTo('Status',2);
        query.notEqualTo('Status',3);
        query.notEqualTo('Status',4);
  query.equalTo('Version',request.params.Version);
  query.equalTo('platform',request.params.platform);
  query.find().then(function(results) {
    if (results.length>0) {
      var obj = results[0];
      obj.set('Status',1);
      obj.set('billcode',request.params.receiptStr);
      obj.save();

        AV.Cloud.httpRequest({
            method: 'POST',
            url: 'https://buy.itunes.apple.com/verifyReceipt',
            timeout: 10000,
            dataType: 'JSON',
            headers: {
                'Content-Type': 'application/json'
            },
            body: {
                'receipt-data': request.params.receiptStr
            },
            success: function(httpResponse) {
                var jsondata = JSON.parse(httpResponse.text);
                if (jsondata.status == 21007) {
                  //测试环境
                  AV.Cloud.httpRequest({
                  method: 'POST',
                  url: 'https://sandbox.itunes.apple.com/verifyReceipt',
                  timeout: 10000,
                  dataType: 'JSON',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: {
                      'receipt-data': request.params.receiptStr
                  },
                  success: function(httpResponse) {
                      var jsondata = JSON.parse(httpResponse.text);

                      if (jsondata.status == 0 && jsondata.receipt.in_app.length > 0) {
                          obj.set('Status',2);
                          obj.set('ReceiptString',httpResponse.text);
                          obj.save();

                          if (parseFloat(request.params.Version) > 3.4 && request.params.username != '未登录') {
                              var postdata = {
                                  phone:request.params.username,
                                  changNumber:request.params.changNumber,
                                  coinInfo:request.params.coinInfo,
                                  whfrom:"iosiap"
                              };
                              Commen.changeCoin(postdata,function(result){
                                    if (result.error == 0) {
                                        obj.set('Status',4);
                                        obj.save();
                                    }
                              })
                          }

                          response.success(true);
                      }else {
                          obj.set('Status',3);
                          obj.set('ReceiptString',httpResponse.text);
                          obj.save();

                          response.success(false);
                      }
                  },
                  error: function(httpResponse) {
                      console.error('Request failed with response code ' + httpResponse.status);
                  }
              });
                }else {
                    if (jsondata.status == 0 && jsondata.receipt.in_app.length > 0) {
                        obj.set('Status',2);
                        obj.set('ReceiptString',httpResponse.text);
                        obj.save();

                        if (parseFloat(request.params.Version) > 3.4 && request.params.username != '未登录') {
                            var postdata = {
                                phone:request.params.username,
                                changNumber:request.params.changNumber,
                                coinInfo:request.params.coinInfo,
                                whfrom:"iosiap"
                            };
                            Commen.changeCoin(postdata,function(result){
                                if (result.error == 0) {
                                    obj.set('Status',4);
                                    obj.save();
                                }
                            })
                        }

                        response.success(true);
                    }else {
                        obj.set('Status',3);
                        obj.set('ReceiptString',httpResponse.text);
                        obj.save();

                        response.success(false);
                    }
                }
            },
            error: function(httpResponse) {
                console.error('Request failed with response code ' + httpResponse.status);
            }
        });
    }else {
        response.success(false)
    }
  }, function(error) {

  });
    }
 }, function(error) {

  });
});
AV.Cloud.define('redeeming',function(req,res){//兑换码验证
  var redeemCodeInfo;
  var activity;
  var query = new AV.Query('RedeemCodeList');
  query.equalTo('redeemCode', req.params.clientRedeemCode);
  query.first().then(function(object) {
    if(object){
      redeemCodeInfo=object;
      var query1=new AV.Query('RedeemActivity');
      query1.equalTo('activityName',redeemCodeInfo.get('remarks'));
      query1.first().then(function(object1){
        if(object1){
          activity=object1;

          var nowDate=new Date();
          var codeType=redeemCodeInfo.get('codeType');//兑换码类型   1=服用型兑换码   2=一次性兑换码   3=补偿码
          var codeEndLine= new Date(redeemCodeInfo.get('endLine'));
          var activityDateStart=new Date(activity.get('activityStart'));
          var activityDateEnd=new Date(activity.get('activityEnd'));
          var activityRedeemPeriod=activity.get('redeemPeriod');
          var activityRedeemTimesPerPeriod=activity.get('timesPerUserPerPeriod');

          var boActNotStart=boIsOverTimeFunc(activityDateStart,nowDate);//判断活动是否开始了,未开始 true   已开始 false
          var boActAlready=boIsOverTimeFunc(nowDate,activityDateEnd);//判断活动是否结束了,已结束 true   未结束 false
          var boCodeIsDead=boIsOverTimeFunc(nowDate,codeEndLine);//当前时间与兑换码的生命周期结束时间对比,判断兑换码是否有效

          if (parseInt(redeemCodeInfo.get('countOfUsage')) - parseInt(redeemCodeInfo.get('codeUsage')) >= 0) {//兑换码被使用的次数-兑换码可使用次数
            returnMessageToClientAndServer(6,redeemCodeInfo,req,res);//兑换码使用次数用完
          }
          else{//兑换码有可用次数
            if (boCodeIsDead==true){//兑换码超过了兑换时效,已经失效
              returnMessageToClientAndServer(5,redeemCodeInfo,req,res);
            }
            else{//兑换码在生命周期内
              if (codeType=="1"||codeType=="2"){//复用码或者一次性码
                if(boActNotStart==false && boActAlready==false) {//活动期间
                  //判断用户兑换周期内是否可用
                  //思路:1)将活动开始时间/兑换周期/当前时间  三个时间分别利用时间戳换算成毫秒;
                  //    2)(当前时间-活动开始时间)/兑换周期=当前时间所在的兑换周期为第几周期(从0开始计算);
                  //    3)(将当前处在的周期数*兑换周期)+活动开始时间=周期开始的毫秒;
                  //    4)将周期开始的毫秒利用时间戳换算回正常日期;
                  //    5)提取所有这个日期之后的所有兑换记录,记录次数;
                  //    6)记录次数与activityRedeemTimesPerPeriod比较,如果大于,则兑换失败,如果小于,则可以正常兑换.
                  //1)
                  var activityStartMs=activityDateStart.getTime();//将活动开始时间换算成毫秒.
                  var activityRedeemPeriodMs=activityRedeemPeriod*3600*1000;//将活动周期(小时为单位)换算成毫秒.
                  var nowDateMs=nowDate.getTime();//将现在时间换算成毫秒.
                  //2)
                  var NumberN=parseInt((nowDateMs-activityStartMs)/activityRedeemPeriodMs);
                  //3)
                  var periodStartTimeMs=(NumberN*activityRedeemPeriodMs)+activityStartMs;
                  //4)
                  var d = new Date();
                  var periodStartDate=new Date(d.setTime(periodStartTimeMs));
                  //5)
                  var times=0;
                  var query = new AV.Query('RedeemLog');
                  query.equalTo('activityName',redeemCodeInfo.get('remarks'));
                  query.equalTo('cellphoneNumber', req.params.phone);
                  query.addDescending('createdAt');
                  query.find().then(function(results) {
                    // 处理返回的结果数据

                    for (var i = 0; i < results.length; i++) {
                      var object = results[i];
                      if(boIsOverTimeFunc(object.createdAt ,periodStartDate )){
                        times++;
                      }
                    }
                    if(parseInt(times)>=parseInt(activityRedeemTimesPerPeriod)){
                      returnMessageToClientAndServer(7,redeemCodeInfo,req,res);
                    }else{
                      returnMessageToClientAndServer(0,redeemCodeInfo,req,res);
                    }
                  }, function(error) {
                    returnMessageToClientAndServer(8,redeemCodeInfo,req,res);
                  });
                }
                else{//非活动期间
                  if(boActNotStart==true){
                    returnMessageToClientAndServer(3,redeemCodeInfo,req,res);
                  }
                  if(boActAlready==true){
                    returnMessageToClientAndServer(4,redeemCodeInfo,req,res);
                  }
                }
              }
              else if (codeType=="3"){//补偿码
                if(req.params.phone == redeemCodeInfo.get('zhiDingYongHu')){
                  returnMessageToClientAndServer(0,redeemCodeInfo,req,res);
                }
                else{
                  returnMessageToClientAndServer(2,redeemCodeInfo,req,res);
                }
              }
            }
          }
        }
        else{
          returnMessageToClientAndServer(1,redeemCodeInfo,req,res);
        }
      },function(error1){
        returnMessageToClientAndServer(8,redeemCodeInfo,req,res);
      });
    }
    else{
      returnMessageToClientAndServer(2,redeemCodeInfo,req,res);
    }
  }, function(error) {
    returnMessageToClientAndServer(8,redeemCodeInfo,req,res);
  });
});
AV.Cloud.define('send_verify', function(request, response) {
    //参与md5加密的参数 过滤
    var data={}
    _.each(request.params,function(v,k){
        if(k=="app_key"||k=="product_id"||k=="amount"||k=="app_uid"||k=="app_ext1"||k=="app_ext2"||k=="user_id"||k=="order_id"||k=="gateway_flag"||k=="sign_type"||k=="app_order_id"){
            data[k]=v
        }
    })
    //keys排序 生成加密字符
    var keys=_.sortBy(_.keys(data))
    var arr=[]
    _.each(keys,function(v){
        arr.push(data[v])
    })
    arr.push("donut")
    var md5str=arr.join("#")
    cc.log(md5str)
    //md5加密
    var md5 = require('crypto').createHash("md5");
    md5.update(md5str);
    var sign=md5.digest("hex")
    cc.log(sign)
    //将加密后的比较
    if(sign==request.params.sign){
        //        response.success("ok");
        //验证订单
        AV.Cloud.run('order_verify', request.params, {
                success: function (result) {
                    if(result.ret=="verified"){
                        response.success("ok");
                    }else{
                        response.success(result);
                    }
                },
                error: function (error) {
                }
            }
        )
    }else{
        response.success("fail");
    }
});
AV.Cloud.define('order_verify', function(request, response) {
    //参与md5加密的参数 过滤
    var data={}
    _.each(request.params,function(v,k){
        if(k=="app_key"||k=="product_id"||k=="amount"||k=="app_uid"||k=="order_id"||k=="app_order_id"||k=="app_ext1"||k=="app_ext2"||k=="is_sms"||k=="bank_code"||k=="pay_ext"||k=="sign_type"||k=="sign_return"){
            data[k]=v
        }
    })
    //keys排序 生成加密字符
    var keys=_.sortBy(_.keys(data))
    var arr=[]
    _.each(keys,function(v){
        arr.push(data[v])
    })
    var md5str=arr.join("#")
    //md5加密
    var md5 = require('crypto').createHash("md5");
    md5.update(md5str);
    data.sign=md5.digest("hex")
    var querystring=require("querystring")
    needle.get("http://mgame.360.cn/pay/order_verify.json?"+querystring.stringify(data),function(err,resp,body){
        response.success(body);
    })

});
function returnMessageToClientAndServer(stateOfRedeeming,redeemCodeInfo,req,res){
    //下面这个数组用于储存出错时要返回的错误信息
    var dataMessageArray = [
        "兑换失败，活动不存在",          //stateOfRedeeming==1
        "兑换码输入有误，请检查并修改。",  //2
        "活动还没有开始哦！",           //3
        "活动已经结束啦！",             //4
        "该兑换码已失效。",             //5
        "该兑换码兑换次数已用尽。",      //6
        "您本兑换周期兑换次数已用完。",   //7
        "请求失败，请稍后重试。",        //8
        "增加纳币失败，请联系客服人员",   //error1
        "获取user失败",               //error2
        "兑换失败,超时1",              //error3
        "兑换失败,超时2"               //error4
    ];
    //返回状态信息
    var data=
    {
        info:         "",
        amountOfMoney:0,
        message:      "兑换成功"
    };

    if(stateOfRedeeming==0){
        var post = new RedeemLog();
        post.save({
            cellphoneNumber:  req.params.phone,
            myUserId:         req.params.userId,
            platform:         req.params.platform,
            activityName:     redeemCodeInfo.get('remarks'),
            redeemCode:       req.params.clientRedeemCode
        }).then(function(post) {

            var post1 = new AV.Query("RedeemCodeList");

            post1.get(redeemCodeInfo.id).then(function(post){
                post.set('countOfUsage', (parseInt(redeemCodeInfo.get('countOfUsage'))+1));
                post.save();

                data=
                {
                    info:             "使用纳币兑换码",
                    info2:            redeemCodeInfo.get('redeemCode'),
                    amountOfMoney:    redeemCodeInfo.get('amountOfMoney'),
                    message:          "兑换成功，"+redeemCodeInfo.get('amountOfMoney')+"纳币已存入您的账号。"
                };

                //在myDonutCoin中写入兑换记录
                var query = new AV.Query('_User');
                query.get(req.params.userId,
                    {
                        success: function(result) {
                            var phoneStr = result.get('mobilePhoneNumber');

                            var postdata = {
                                phone:phoneStr,
                                changNumber:redeemCodeInfo.get('amountOfMoney'),
                                coinInfo:data.info,
                                coinInfo2:data.info2,
                                whfrom:"redeemcode"
                            };
                            Commen.changeCoin(postdata,function(result){
                                if (result.error == 0) {
                                    data.date = Date();
                                    res.success(data);
                                } else {
                                    changeDataMessage(8);
                                }
                            })
                        },
                        error: function(object, error) {
                            changeDataMessage(9);
                        }
                    });
            },function(err){
                changeDataMessage(10);
            });
        }, function(err) {
            changeDataMessage(11);
        });
    } else {//stateOfRedeeming = 1~8
        changeDataMessage(stateOfRedeeming-1);
    }
    function changeDataMessage (tempIndex) {
        data.message = dataMessageArray[tempIndex];
        res.error(data);
    }
}
function boIsOverTimeFunc(Time1,Time2){
  return Time1 > Time2;
}

/**
 * 首页弹出广告定时发布,
 */
AV.Cloud.define('ad_show_timer', function(request, response){
  console.log('----------->广告定时任务开始');
  var whereTags = [1, 2, 3, 6];
  var tableName = 'NewAds';
  var startAt = moment(moment().format('YYYY-MM-DD HH:mm:00')).toDate();
  var endAt = moment(moment().add(1, 'minutes').format('YYYY-MM-DD HH:mm:00')).toDate();

  async.eachSeries(whereTags, function(whereTag, cb) {
    var ep = new eventproxy();

    // 错误处理
    ep.fail(cb);

    // 是否有需要发布的广告
    AVController.queryFirst(ep.doneLater('isShowAd'), tableName, function(query){
      query.equalTo('whereTag', whereTag);
      query.equalTo('isShow', false);
      query.descending('showTime');
      query.greaterThanOrEqualTo('showTime', startAt);
      query.lessThan('showTime', endAt);
    });

    // 查询是否有已发布, 如果有,则把发布改为未发布
    ep.all('isShowAd', function(ad){
      if(ad){
        ep.emit('ad', ad);

        AVController.queryFirst(function(err, ad) {
          if (!ad) {
            return ep.emit('update');
          }

          AVController.update(ep.done('update'), ad, {isShow: false});
        }, tableName, function(query) {
          query.equalTo('whereTag', whereTag);
          query.equalTo('isShow', true);
        });
      } else {
        console.log(whereTag + '----------->暂无发布广告');
        cb();
      }
    });

    // 发布广告
    ep.all('ad', 'update', function(ad){
      AVController.update(ep.doneLater('publish'), ad, {isShow: true});
    });

    // 结束
    ep.all('publish', function(){
      console.log(whereTag + '----------->定时发布成功');
      cb();
    });
  }, function(err){
    if(err){
      console.log('----------->广告定时发布任务出错');
      console.log(error);
      response.error({code: -1});
      return;
    }

    console.log('----------->广告定时发布任务执行完毕');
    response.success({code: 0});
  });
});

module.exports = AV.Cloud;