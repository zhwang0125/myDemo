/**
 * 非法收入sql查询  截止06月16日 9时
 * create by 2017/06/16
 */

// 注册多纳账号
var cql1 = "select user.objectId, sum(changNumber) as `total`, count(*) as `num` from DonutCoin " +
  "where createdAt < '2017-06-16T01:00.00.000Z' and coinInfo='注册多纳账号'" +
  "and changNumber!=50 group by user order by `total` desc";

// 每日登录
var cql2 = "select user.objectId, sum(changNumber) as `total`, count(*) as `num` from DonutCoin " +
  "where createdAt < '2017-06-16T01:00.00.000Z' and coinInfo='每日登录' and changNumber>5 " +
  "group by user order by `total` desc";

// 受邀注册账号
var cql3 = "select user.objectId, sum(changNumber) as `total`, count(*) as `num` from DonutCoin " +
  "where createdAt < '2017-06-16T01:00.00.000Z' " +
  "and coinInfo='受邀注册账号' group by user order by `total` desc";




// 每日分享
var cql4 = "select user.objectId, sum(changNumber) as `total`, count(*) as `num` from DonutCoin " +
  "where createdAt < '2017-06-16T01:00.00.000Z' " +
  "and coinInfo='每日分享' and changNumber!=3 group by user order by `total` desc";

// 邀请注册帐号
var cql5 = "select user.objectId, sum(changNumber) as `total`, count(*) as `num` from DonutCoin " +
  "where createdAt < '2017-06-16T01:00.00.000Z' " +
  "and coinInfo='邀请注册帐号' and changNumber not in (20, 50) group by user order by `total` desc";

// 受邀注册帐号
var cql6 = "select user.objectId, sum(changNumber) as `total`, count(*) as `num` from DonutCoin " +
  "where createdAt < '2017-06-16T01:00.00.000Z' " +
  "and coinInfo='受邀注册帐号' and changNumber not in (20, 50) group by user order by `total` desc";



// 邀请好友注册
var cql7 = "select user.objectId, sum(changNumber) as `total`, count(*) as `num` from DonutCoin " +
  "where createdAt < '2017-06-16T01:00.00.000Z' " +
  "and coinInfo='邀请好友注册' and changNumber not in (20, 50) group by user order by `total` desc";

// 邀请好友
var cql8 = "select user.objectId, sum(changNumber) as `total`, count(*) as `num` from DonutCoin " +
  "where createdAt < '2017-06-16T01:00.00.000Z' " +
  "and coinInfo='邀请好友' and changNumber not in (20, 50) group by user order by `total` desc";

// 系统奖励
var cql9 = "select user.objectId, sum(changNumber) as `total`, count(*) as `num` from DonutCoin " +
  "where createdAt < '2017-06-16T01:00.00.000Z' " +
  "and coinInfo='系统奖励' group by user order by `total` desc";



// 受邀注册奖励
var cql10 = "select user.objectId, sum(changNumber) as `total`, count(*) as `num` from DonutCoin " +
  "where createdAt < '2017-06-16T01:00.00.000Z' " +
  "and coinInfo='受邀注册奖励' and changNumber not in (20, 50) group by user order by `total` desc";

// 查你ip
var cql11 = "select user.objectId, sum(changNumber) as `total`, count(*) as `num` from DonutCoin " +
  "where createdAt < '2017-06-16T01:00.00.000Z' " +
  "and coinInfo='查你ip' and changNumber>0 group by user order by `total` desc";

// 注册多纳用户
var cql12 = "select user.objectId, sum(changNumber) as `total`, count(*) as `num` from DonutCoin " +
  "where createdAt < '2017-06-16T01:00.00.000Z' " +
  "and coinInfo='注册多纳用户' group by user order by `total` desc";



// 注册多纳用户
var cql13 = "select user.objectId, sum(changNumber) as `total`, count(*) as `num` from DonutCoin " +
  "where createdAt < '2017-06-16T01:00.00.000Z' " +
  "and coinInfo='封号吊打' group by user order by `total` desc";

// 甜甜太美
var cql14 = "select user.objectId, sum(changNumber) as `total`, count(*) as `num` from DonutCoin " +
  "where createdAt < '2017-06-16T01:00.00.000Z' " +
  "and coinInfo='甜甜太美' group by user order by `total` desc";

// 给草莓评分4.0
var cql15 = "select user.objectId, sum(changNumber) as `total`, count(*) as `num` from DonutCoin " +
  "where createdAt < '2017-06-16T01:00.00.000Z' " +
  "and coinInfo='给草莓评分4.0' group by user order by `total` desc";



// 注册草莓账号
var cql16 = "select user.objectId, sum(changNumber) as `total`, count(*) as `num` from DonutCoin " +
  "where createdAt < '2017-06-16T01:00.00.000Z' " +
  "and coinInfo='注册草莓账号' group by user order by `total` desc";

// 每日登陆
var cql17 = "select user.objectId, sum(changNumber) as `total`, count(*) as `num` from DonutCoin " +
  "where createdAt < '2017-06-16T01:00.00.000Z' " +
  "and coinInfo='每日登陆' group by user order by `total` desc";







/**
 * 非法支出sql查询  截止06月16日 9时
 * create by 2017/06/16
 */

// 每日分享(小于0)
var sql1 = "select user.objectId, sum(changNumber) as `total`, count(*) as `num` from DonutCoin " +
  "where createdAt < '2017-06-16T01:00.00.000Z' " +
  "and coinInfo='每日分享' and changNumber<0 group by user order by `total` asc";

// 系统奖励(小于0)
var sql2 = "select user.objectId, sum(changNumber) as `total`, count(*) as `num` from DonutCoin " +
  "where createdAt < '2017-06-16T01:00.00.000Z' " +
  "and coinInfo='系统奖励' and changNumber<0 group by user order by `total` asc";

// 邀请好友(小于0)
var sql3 = "select user.objectId, sum(changNumber) as `total`, count(*) as `num` from DonutCoin " +
  "where createdAt < '2017-06-16T01:00.00.000Z' " +
  "and coinInfo='邀请好友' and changNumber<0 group by user order by `total` asc";

// 受邀注册账号
var sql4 = "select user.objectId, sum(changNumber) as `total`, count(*) as `num` from DonutCoin " +
  "where createdAt < '2017-06-16T01:00.00.000Z' " +
  "and coinInfo='受邀注册账号' and changNumber<0 group by user order by `total` asc";

// 查你ip
var sql5 = "select user.objectId, sum(changNumber) as `total`, count(*) as `num` from DonutCoin " +
  "where createdAt < '2017-06-16T01:00.00.000Z' " +
  "and coinInfo='查你ip' and changNumber<0 group by user order by `total` asc";