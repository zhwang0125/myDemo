var sql_01 = "select userPhone, sum(amount) as `total` from DonutOrder where createdAt<'2017-08-16T16:00.00.000Z' and orderState=1 group by userPhone having `total`>128";
var sql_02 = "select userPhone, sum(amount) as `total` from HuaWeiOrder where createdAt<'2017-08-16T16:00.00.000Z' and orderState=1 group by userPhone having `total`>128";
var sql_03 = "select UserName, sum(getcoin) as `total` from CoinOrderNew where createdAt<'2017-08-16T16:00.00.000Z' and Status=1 group by UserName having `total`>1280";
var sql_04 = "select UserName, sum(money) as `total` from CoinOrder where createdAt<'2017-08-16T16:00.00.000Z' and Status=4 group by UserName having `total`>128";




var test = "select t.userPhone, sum(t.amount) as `total` from" +
  " (select * from DonutOrder where createdAt<`2017-08-16T16:00.00.000Z` and orderState=1) t" +
  " group by t.userPhone having `total`>128";