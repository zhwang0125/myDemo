//var sql = "select user.objectId, sum(changNumber) as `total`,count(*) as `num` from DonutCoin where coinInfo='邀请好友' and user is not null and changNumber not in (20, 50) group by user order by total desc";
//var tem = "select user.objectId, sum(changNumber) as `total`,count(*) as `num` from DonutCoin where coinInfo='邀请好友' and user is not null and changNumber not in (20, 50) group by user order by total desc";


// 每日统计
var dayIn = "select sum(changNumber) as `total` from DonutCoin where createdAt>='2017-08-01T16:00.00.000Z' and createdAt<'2017-08-02T16:00.00.000Z' and changNumber>0";
var dayOut = "select sum(changNumber) as `total` from DonutCoin where createdAt>='2017-08-01T16:00.00.000Z' and createdAt<'2017-08-02T16:00.00.000Z' and changNumber<0";
var sqlCate = "select coinInfo,sum(changNumber) as `total`,count(*) as `num` from DonutCoin where createdAt>='2017-08-01T16:00.00.000Z' and createdAt<'2017-08-02T16:00.00.000Z' and changNumber>0 group by coinInfo order by `total` desc";
var sqlCate02 = "select coinInfo,sum(changNumber) as `total`,count(*) as `num` from DonutCoin where createdAt>='2017-08-01T16:00.00.000Z' and createdAt<'2017-08-02T16:00.00.000Z' and changNumber<0 group by coinInfo order by `total` asc";

// 5.	检索评价我们纳币明细
var sql5 = "select user.objectId, coinInfo, count(*) as `total` from DonutCoin where coinInfo='%给多纳评分%' group by user,coinInfo having `total`>=2";

// 6.	检索注册多纳账号纳币明细
var sql6 = "select user.objectId,count(*) as `total` from DonutCoin where coinInfo='注册多纳账号' group by user having `total`>=2";

// 7.	检索每日登录纳币明细
var sql7 = "select user.objectId,substr(createdAt, 1, 10) as `dateTime`, count(*) as `total` from DonutCoin where coinInfo='每日登录' group by user,substr(createdAt, 1, 10) having `total`>=2";

// 8.	检索每日分享纳币明细
var sql8 = "select user.objectId,substr(createdAt, 1, 10) as `dateTime`, count(*) as `total` from DonutCoin where coinInfo='每日分享' group by user,substr(createdAt, 1, 10) having `total`>=2";

// 9.	检索每周公开课相关纳币明细（含看视频、练口语、玩游戏）
var sql9_01 = "select  user.objectId, sum(changNumber) as `total` from DonutCoin where createdAt>'2017-06-08 00:00:00' and (coinInfo like '%-看视频%' or coinInfo like '%-玩游戏%' or coinInfo like '%-练口语%') and changNumber!=0 group by user";
var sql9_02 = "select user.objectId, coinInfo, count(*) as `total` from DonutCoin where createdAt<'2017-06-08 00:00:00' and (coinInfo like '%-看视频%' or coinInfo like '%-玩游戏%' or coinInfo like '%-练口语%') group by user,coinInfo having `total`>=2";


var sql = "select * from DonutCoin where createdAt>='2017-06-09T16:00.00.000Z' and createdAt<'2017-06-10T16:00.00.000Z' and changNumber>0 and coinInfo='18元购买180个纳币' order by createdAt desc";

// 非法纳币数据查询
// 2017年6月8日 10点 至 6月15日 10点
// 非法数据
var cql1 = "select user.objectId, sum(changNumber) as `total`, count(*) as `num` from DonutCoin " +
  "where createdAt >= '2017-06-08T02:00.00.000Z' and createdAt < '2017-06-15T02:00.00.000Z' " +
  "and coinInfo like '%解锁level%' and changNumber not in (-20, -50, -800) group by user order by `total` desc";

// 查你ip, 系统奖励
var cql2 = "select user.objectId, sum(changNumber) as `total`, count(*) as `num` from DonutCoin " +
  "where createdAt >= '2017-06-08T02:00.00.000Z' and createdAt < '2017-06-15T02:00.00.000Z' " +
  "and coinInfo='系统奖励' group by user order by `total` desc";

// 受邀注册账号
var cql3 = "select user.objectId, sum(changNumber) as `total`, count(*) as `num` from DonutCoin " +
  "where createdAt >= '2017-06-08T02:00.00.000Z' and createdAt < '2017-06-15T02:00.00.000Z' " +
  "and coinInfo='受邀注册账号' group by user order by `total` desc";

// 邀请好友注册, 邀请好友, 邀请注册帐号, 受邀注册帐号
var cql4 = "select user.objectId, sum(changNumber) as `total`, count(*) as `num` from DonutCoin " +
  "where createdAt >= '2017-06-08T02:00.00.000Z' and createdAt < '2017-06-15T02:00.00.000Z' " +
  "and coinInfo='邀请好友注册' and changNumber not in (20, 50) group by user order by `total` desc";

// 每日分享
var cql5 = "select user.objectId, sum(changNumber) as `total`, count(*) as `num` from DonutCoin " +
  "where createdAt >= '2017-06-08T02:00.00.000Z' and createdAt < '2017-06-15T02:00.00.000Z' " +
  "and coinInfo='每日分享' and changNumber!=3 group by user order by `total` desc";

// 每日登录
var cql6 = "select user.objectId, sum(changNumber) as `total`, count(*) as `num` from DonutCoin " +
  "where createdAt >= '2017-06-08T02:00.00.000Z' and createdAt < '2017-06-15T02:00.00.000Z' " +
  "and coinInfo='每日登录' and changNumber>5 group by user order by `total` desc";

// 描述项为空白
var cql7 = "select user.objectId, sum(changNumber) as `total`, count(*) as `num` from DonutCoin " +
  "where createdAt >= '2017-06-08T02:00.00.000Z' and createdAt < '2017-06-15T02:00.00.000Z' " +
  "and coinInfo is null and changNumber>5 group by user order by `total` desc";


/**
 *
 */