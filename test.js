var _ = require('lodash');
var crypto = require('crypto');

var sign = function(params) {
  var keys = _.sortBy(_.keys(params));
  var arr = [];
  _.each(keys, function(v) {
    if (params[v] && v != 'sign') {
      arr.push(v + "=" + params[v])
    }
  });
  var md5str = arr.join("&");
  md5str = md5str + "&key=5968389c128fe155cef0da19";
  var md5 = crypto.createHash("md5").update(md5str, 'utf8');
  var sign = md5.digest("hex").toUpperCase();
  return sign
};

console.log(sign({mobilephone:18611718025, age: 18}));

console.log(_.sortBy(['name', 'age', 'sex']));
console.log(['mobilephone', 'age'].sort(function(a, b){
  return a-b;
}));


// 1).签名参数
var params = {name: '张三', age: 18, sex: '男'};
var keys = _.keys(params);

// 2).对参数名数组'keys'排序(正序)
keys = _.sortBy(keys);

// 3).循环数组'keys'拼接字符串, 最后末尾追加'&key=5968389c128fe155cef0da19'
var md5Str = 'age=18&name=张三&sex=男&key=5968389c128fe155cef0da19';

// 4).签名
var sign = md5(md5Str);


var aa ={
  "openid":"oPXnrjnRzu7emTwm15AZKWuu-Ung",
  "amount":10,
  "productId":"0001",
  "productName":"10元100纳币",
  "productDes":"10元100纳币",
  "getCoin":100,
  "userPhone":"18611718025",
  "createIp":"127.0.0.1"
}

