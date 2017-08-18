/**
 * 暂时选查询数据(存疑), 数据查询到2017-06-16 9:00
 *
 */

/**************** 支出 **********************/
// 解锁level05-unit4
var sql1 = "select user.objectId, sum(changNumber) as `total`, count(*) as `num` from DonutCoin " +
  "where createdAt < '2017-06-16T01:00.00.000Z' " +
  "and coinInfo='解锁level05-unit4' and changNumber<0 group by user order by `total` asc";

// 解锁level10-unit4
var sql2 = "select user.objectId, sum(changNumber) as `total`, count(*) as `num` from DonutCoin " +
  "where createdAt < '2017-06-16T01:00.00.000Z' " +
  "and coinInfo='解锁level10-unit4' and changNumber<0 group by user order by `total` asc";

// 解锁level09-unit4
var sql3 = "select user.objectId, sum(changNumber) as `total`, count(*) as `num` from DonutCoin " +
  "where createdAt < '2017-06-16T01:00.00.000Z' " +
  "and coinInfo='解锁level09-unit4' and changNumber<0 group by user order by `total` asc";

// %E5%90%8A%E6%89%93%E6%8A%80%E6%9C%AF%E5%91%98%E5%B0%81%E6%88%91%E%58F%B7(吊打技术员封我号)
var sql4 = "select user.objectId, sum(changNumber) as `total`, count(*) as `num` from DonutCoin " +
  "where createdAt < '2017-06-16T01:00.00.000Z' " +
  "and coinInfo='%E5%90%8A%E6%89%93%E6%8A%80%E6%9C%AF%E5%91%98%E5%B0%81%E6%88%91%E%58F%B7' and changNumber>0 group by user order by `total` asc";

