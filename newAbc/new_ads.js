/**
 * 首页弹屏公告Dao层
 * @date 2017/06/29
 */
var eventproxy = require('eventproxy');
var _ = require('lodash');
var ApiAv = require('../Api/Api.AV');
var AV = require('leanengine');
var TABLE_NAME = 'NewAds';
var FILE_TABLE_NAME = '_File';

// whereTag 取值范围
var whereTagObj = {
  'HOME_NOTICE': 1,
  'STUDY_GIFT': 2,
  'WELFARE_GIFT': 3,
  'FIRST_BUY': 4,
  'SIGN_IN': 5,
  'PICTURE_BOOK': 6,
  'SEAL_NUMBER': 7,
  'MAINTENANCE': 8,
  'SUGGEST_UPDATE': 9,
  'FORCE_UPDATE': 10
};

/**
 * 分页
 * @param page      第几页
 * @param limit     每条多少条
 * @param summary   摘要
 * @param whereTag  公告类型
 * @param callback  回调
 */
exports.listAd = function(page, limit, summary, whereTag, callback) {
  if (_.isFunction(page)) {
    callback = page;
    page = 1;
    limit = 10;
    summary = null;
    whereTag = null;
  }

  if (_.isFunction(limit)) {
    callback = limit;
    limit = 10;
    summary = null;
    whereTag = null;
  }

  if (_.isFunction(summary)) {
    callback = summary;
    summary = null;
    whereTag = null;
  }

  if (_.isFunction(whereTag)) {
    callback = whereTag;
    whereTag = null;
  }

  var skip = (page - 1) * limit;
  var ep = new eventproxy();
  ep.fail(callback);

  // 组装数据
  ep.all('count', 'ads', function(count, ads) {
    var result = {
      pageInfo: {
        total: count,
        currentPage: page,
        totalPage: Math.ceil(count / limit)
      },
      items: ads
    };

    callback(null, result);
  });

  // 条数
  ApiAv.queryCount(ep.done('count'), TABLE_NAME, function(query) {
    if (whereTag) {
      query.equalTo('whereTag', parseInt(whereTag));
    }

    if (summary) {
      query.contains('summary', summary);
    }
  });

  // 数据
  ApiAv.queryByCondition(ep.done('ads'), TABLE_NAME, function(query) {
    if (whereTag) {
      query.equalTo('whereTag', parseInt(whereTag));
    }

    query.descending('createdAt');
    query.limit(limit);
    query.skip(skip);

    if (summary) {
      query.contains('summary', summary);
    }
  });
};

/**
 * 下架指定类型的公告
 * @param whereTag
 * @param callback
 * @private
 */
exports._noticeNoShow = function(whereTag, callback) {
  ApiAv.queryFirst(function(err, ad) {
    if (err) {
      return callback(err);
    }

    if (!ad) {
      return callback(null);
    }

    ApiAv.update(callback, ad, {isShow: false});
  }, TABLE_NAME, function(query) {
    query.equalTo('whereTag', whereTag);
    query.equalTo('isShow', true);
  });
};

/**
 * 查询指定类型公告, 最大adNo编号
 * @param whereTag
 * @param callback
 * @private
 */
exports._findAdNo = function(whereTag, callback) {
  ApiAv.queryFirst(function(err, ad) {
    var adNo = (ad && parseInt(ad.get('adNo')) > 0)
      ? (parseInt(ad.get('adNo')) + 1)
      : 1;
    callback(err, adNo);
  }, TABLE_NAME, function(query) {
    query.equalTo('whereTag', whereTag);
    query.descending('adNo');
  });
};

/**
 * 增加首页弹出广告
 * @param newAd
 * @param callback
 */
exports.createAd = function(newAd, callback) {
  if (!_.isObject(newAd)) {
    return callback(new Error('newAd not is object'));
  }

  var that = this;
  var ep = new eventproxy();
  ep.fail(callback);

  // 1.如果是立即发布, 则把当前已发布改为未发布
  if (newAd.isShow) {
    that._noticeNoShow(newAd.whereTag, ep.doneLater('getAdNo'));
  } else {
    ep.emitLater('getAdNo');
  }

  // 2.查询adNo号码
  ep.all('getAdNo', function() {
    that._findAdNo(newAd.whereTag, ep.done('findFile'));
  });

  // 3.查找上传文件信息
  ep.all('findFile', function(adNo) {
    newAd.adNo = adNo;

    newAd.img
      ? ApiAv.queryById(ep.done('getFile'), FILE_TABLE_NAME, newAd.img)
      : ep.emit('getFile');

    newAd.img2_phone
      ? ApiAv.queryById(ep.done('getImg2_phone'), FILE_TABLE_NAME, newAd.img2_phone)
      : ep.emit('getImg2_phone');

    newAd.img2_phone
      ? ApiAv.queryById(ep.done('getImg2_pad'), FILE_TABLE_NAME, newAd.img2_phone)
      : ep.emit('getImg2_pad');
  });

  // 4.查询图片文件, 关联数据
  ep.all('getFile', 'getImg2_phone', 'getImg2_pad', function(file, imgPhone, imgPad) {
    if (!file) {
      return ep.emit('error', new Error('img file not found'));
    }

    // 大图 + h5
    if (newAd.whereTag === 1 && newAd.typeTag === 2 && (!imgPhone || !imgPad)) {
      return ep.emit('error', new Error('img2 file not found'));
    }

    if (file) newAd.img = file;
    if (imgPhone) newAd.img2_phone = imgPhone;
    if (imgPhone) newAd.img2_pad = imgPad;

    ApiAv.create(callback, TABLE_NAME, newAd);
  });
};

/**
 * 修改
 * @param id
 * @param newAd
 * @param callback
 */
exports.updateAd = function(id, newAd, callback) {
  if (!_.isObject(newAd)) {
    return callback(new Error('newAd not is object'));
  }

  var that = this;
  var ep = new eventproxy();
  ep.fail(callback);

  // 1.如果是立即发布, 则把当前已发布改为未发布
  if (newAd.isShow) {
    that._noticeNoShow(newAd, ep.doneLater('findFile'));
  } else {
    ep.emitLater('findFile');
  }

  // 2.查找上传文件信息
  ep.all('findFile', function() {
    newAd.img
      ? ApiAv.queryById(ep.done('getFile'), FILE_TABLE_NAME, newAd.img)
      : ep.emit('getFile');

    newAd.img2_phone
      ? ApiAv.queryById(ep.done('getImg2_phone'), FILE_TABLE_NAME, newAd.img2_phone)
      : ep.emit('getImg2_phone');

    newAd.img2_phone
      ? ApiAv.queryById(ep.done('getImg2_pad'), FILE_TABLE_NAME, newAd.img2_phone)
      : ep.emit('getImg2_pad');
  });

  // 3.查询图片文件, 关联数据
  ep.all('getFile', 'getImg2_phone', 'getImg2_pad', function(file, imgPhone, imgPad) {
    if (!file) {
      return ep.emit('error', new Error('img file not found'));
    }

    // 大图 + h5
    if (newAd.whereTag === 1 && newAd.typeTag === 2 && (!imgPhone || !imgPad)) {
      return ep.emit('error', new Error('img2 file not found'));
    }

    if (file) newAd.img = file;
    if (imgPhone) newAd.img2_phone = imgPhone;
    if (imgPhone) newAd.img2_pad = imgPad;

    ApiAv.queryById(function(err, ad) {
      if (err) {
        return ep.emit('error', err);
      }

      ApiAv.update(callback, ad, newAd);
    }, TABLE_NAME, id)
  });
};

/**
 * 移除
 * @param id
 * @param callback
 */
exports.removeAd = function(id, callback) {
  if (!id) {
    return callback(new Error('id not found'));
  }

  var ep = new eventproxy();
  ep.fail(callback);

  ep.all('remove', function(ad) {
    if (!ad) {
      return callback(new Error('newAd not found'));
    }

    ApiAv.destroy(callback, ad);
  });

  ApiAv.queryById(ep.done('remove'), TABLE_NAME, id);
};

/**
 * 上传图片
 * @param name
 * @param data
 * @param callback
 */
exports.imgUpload = function(name, data, callback) {
  if (!name || !data) {
    return callback(new Error('缺少必要参数'));
  }

  var file = new AV.File(name, data);

  file.save().then(function(file) {
    callback(null, file);
  }, function(err) {
    callback(err)
  });
};

/**
 * 是否发布
 * @param id
 * @param whereTag
 * @param isShow
 * @param callback
 */
exports.updateIshow = function(id, whereTag, isShow, callback) {
  if (!id || !whereTag) {
    return callback(new Error('缺少必要参数'));
  }

  var ep = new eventproxy();
  ep.fail(callback);

  if (isShow) {
    // 查询发布的公告, 修改为未发布
    ApiAv.queryFirst(function(err, ad) {
      if (!ad) {
        return ep.emitLater('publish');
      }

      ApiAv.update(ep.doneLater('publish'), ad, {isShow: false});
    }, TABLE_NAME, function(query) {
      query.equalTo('whereTag', whereTag);
      query.equalTo('isShow', true);
    });
  } else {
    ep.emitLater('publish');
  }

  // 查询是否有结果,然后再修改
  ep.all('publish', function() {
    ApiAv.queryById(function(err, ad) {
      if (err) {
        return callback(new Error('查询无数据'));
      }

      ApiAv.update(callback, ad, {isShow: isShow});

    }, TABLE_NAME, id);
  });
};

/**
 * 获取广告详情
 * @param id
 * @param callback
 */
exports.getById = function(id, callback) {
  ApiAv.queryById(callback, TABLE_NAME, id);
};

/**
 * 获取whereTag选项
 * @returns {{}}
 */
exports.whereTagObj = whereTagObj;

/**
 * 格式化活动类型
 * @param whereTag
 * @returns {*}
 */
exports.whereTagToString = function(whereTag) {
  var str;

  switch (whereTag) {
    case whereTagObj.HOME_NOTICE:
      str = '首页弹屏公告';
      break;
    case whereTagObj.STUDY_GIFT:
      str = '学习有礼(成就页)';
      break;
    case whereTagObj.WELFARE_GIFT:
      str = '福利礼盒(视频页)';
      break;
    case whereTagObj.FIRST_BUY:
      str = '首次购买纳币后';
      break;
    case whereTagObj.SIGN_IN:
      str = '社区打卡';
      break;
    case whereTagObj.PICTURE_BOOK:
      str = '精读广告(绘本页)';
      break;
    case whereTagObj.SEAL_NUMBER:
      str = '封号通知';
      break;
    case whereTagObj.MAINTENANCE:
      str = '停机维护';
      break;
    case whereTagObj.SUGGEST_UPDATE:
      str = '建议更新';
      break;
    case whereTagObj.FORCE_UPDATE:
      str = '强制更新';
      break;
    default:
      str = '未知';
      break;
  }

  return str;
};