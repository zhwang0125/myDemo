var list = require('./data');
var _ = require('lodash');
var fs = require('fs');

var tempList = _.map(list, function(item){
  return item.userPhone;
});
tempList = _.union(tempList);
fs.appendFile(__dirname + '/data/user_phone_60.js', tempList.toString());


console.log(list.length);
console.log(tempList.length);