var fs = require('fs');
var path = require('path');
var AV = require('leanengine');
var EventProxy = require('eventproxy');
var async = require('async');
var data_128 = require('../stat_data/user_phone_04');
var TABLE_NAME = 'DonutCoin';
var TABLE_NAME_USER = '_User';
var contrl = {};

/**
 * 统计128用户消费
 * @param req
 * @param res
 */
contrl.expend_128 = function (req, res) {
  console.log(path.join(__dirname, '../stat_data/data/stat_04.js'));
  fs.appendFile(path.join(__dirname, '../stat_data/data/stat_04.js'), JSON.stringify({mobile: 18510078549, total: -500}) + '\n');

  // var i = 0;
  // var len = 2;
  //
  // _statExpend(i, len, function (err) {
  //   if (!err) {
  //     console.log('----------->finish');
  //   }
  // });

  res.json({ok: false});
};

function _select(){
  var i = 1;
  var m = 0;

  async.eachSeries(data_128, function(mobile, cb) {
    console.log('-------------------->' + i);
    if(i < m){
      return cb();
    }

    // 查询用户
    _selectUser(mobile + '', function(err, user){
      if(err || !user){
        console.log('not user------------------------->' + i);
        console.log('not user------------------------->' + mobile);
        i++;
        return cb();
      }

      // 查询消费纳币
      _selectLog(user, function(err, total){
        if(err){
          console.log('err------------------------->' + i);
          console.log('err------------------------->' + mobile);
          i++;
          return cb(err);
        }

        fs.appendFile(path.join(__dirname, '../stat_data/data/stat_04.js'),
          JSON.stringify({mobile: mobile, total: total}) + '\n');
        i++;
        cb();
      });
    });

  }, function(err){
    console.log('=======================> 完毕');
  });
}

/**
 * 查询用户信息
 * @param mobile
 * @param cb
 * @private
 */
function _selectUser(mobile, cb){
  var query = new AV.Query(TABLE_NAME_USER);
  query.equalTo('mobilePhoneNumber', mobile);

  query.first().then(function (user) {
    cb(null, user);
  }, function (err) {
    cb(err);
  });
}

/**
 * 查询用户消费纳币数
 * @param user
 * @param cb
 * @private
 */
function _selectLog(user, cb){
  var query = new AV.Query(TABLE_NAME);
  query.equalTo('user', user);
  query.lessThan('changNumber', 0);

  query.find().then(function (results) {
    if (!results || results.length === 0) {
      return cb(null, 0);
    }

    var total = 0;
    _.forEach(results, function (item) {
      total += item.get('changNumber');
    });

    cb(null, total);
  }, function (err) {
    cb(err);
  });
}

/**
 * 查询结果保存到文件
 * @param i
 * @param len
 * @param cb
 * @private
 */
function _statExpend(i, len, cb ) {
  var mobile = data_128[i];
  var query = new AV.Query(TABLE_NAME_USER);
  var ep = new EventProxy();

  console.log(mobile);

  ep.fail(function (err) {
    console.log(i + '----------->出错');
    console.log(err);
    cb(err);
  });

  query.equalTo('mobilePhoneNumber', mobile + '');
  query.first().then(function (user) {
    if (user) {
      return ep.emit('getUser', user);
    }

    i++;
    _statExpend(i, len, cb);
  }, function (err) {

    ep.emit('error', err);
  });

  ep.all('getUser', function (user) {
    _findExpend(user, ep.done('result'));
  });

  ep.all('result', function (total) {
    console.log('------------------->' + i);
    console.log(mobile + '--------' + total);
    fs.appendFile(path.join(__dirname, '../stat_data/data/stat_04.js'),
      JSON.stringify({mobile: mobile, total: total}) + '\n');
    i++;

    if (i < len) {
      _statExpend(i, len, cb);
    } else {
      cb();
    }
  });
}

/**
 * 查询用户消费总纳币
 * @param user
 * @param cb
 * @private
 */
function _findExpend(user, cb) {
  var query = new AV.Query(TABLE_NAME);
  query.equalTo('user', user);
  query.lessThan('changNumber', 0);

  query.find().then(function (results) {
    if (!results || results.length === 0) {
      return cb(null, 0);
    }

    var total = 0;
    _.forEach(results, function (item) {
      total += item.get('changNumber');
    });

    cb(null, total);
  }, function (err) {
    console.log('----------->1');
    cb(err);
  });
}


/**
 * 统计充值大于128的用户
 * @param req
 * @param res
 */
contrl.statMoney_128 = function (req, res) {
  var maxPage = 3;
  var page = 1;

  _updateDate(page, maxPage, function () {
    console.log('com.koolearn.donutenglish.003=============>完毕');
  });

  res.json({ok: 2});
};


function _updateDate(page, maxPage, fn) {
  if (page > maxPage) {
    return fn();
  }

  var i = 0;
  var query = new AV.Query('CoinOrder');
  query.equalTo('ProductId', 'com.koolearn.donutenglish.004');
  query.equalTo('Status', 4);
  query.descending('createdAt');
  query.limit(1000);
  query.skip((page - 1) * 1000);

  query.find().then(function (result) {
    async.eachSeries(result, function (item, cb) {
      item.set('money', 118);
      item.save().then(function () {
        i++;
        console.log(page + '------------>' + i);
        cb();
      });
    }, function (err) {
      console.log('nowPage finish----------->' + page);
      page++;
      _updateDate(page, maxPage, fn);
    });
  }, function (err) {
    console.log('-------->1');
    console.log(err);
  });
}

exports = module.exports = contrl;