/**
 * 首页弹屏公告(后台)
 * @date 2017/06/29
 */

var moment = require('moment');
var _ = require('lodash');
var multiparty = require('multiparty');
var fs = require('fs');
var NewAdsProxy = require('../../proxy').NewAds;
var whereTagObj = NewAdsProxy.whereTagObj;

/**
 * 列表
 * @param req
 * @param res
 */
exports.list = function(req, res) {
  var page = req.query.page || req.body.page || 1;
  var limit = req.query.limit || req.body.limit || 10;
  var keyWord = req.query.keyword || req.body.keyword || '';
  var whereTag = req.query.whereTag || req.body.whereTag || '';

  NewAdsProxy.listAd(page, limit, keyWord, whereTag, function(err, result) {
    if (err) {
      console.log(err);
      return res.json({code: -1, message: '获取列表失败'});
    }

    // 格式化数据
    result.items = _formatList(result.items);
    res.json({code: 0, message: '获取列表成功', data: result});
  });
};

/**
 * 创建
 * @param req
 * @param res
 */
exports.add = function(req, res) {
  var newAd = _getAddOrUpdateReqParams(req);
  var check = _checkAddData(newAd);

  if (check.code === -1) {
    return res.json(check);
  }

  NewAdsProxy.createAd(newAd, function(err, result) {
    if (err) {
      console.log(err);
      return res.json({code: -1, message: '创建失败'});
    }

    res.json({code: 0, message: '创建成功'});
  });
};

/**
 * 修改
 * @param req
 * @param res
 */
exports.update = function(req, res) {
  var id = req.body.id;

  if (!id) {
    return res.json({code: -1, message: 'id not found'});
  }

  var newAd = _getAddOrUpdateReqParams(req);
  var check = _checkAddData(newAd);

  if (check.code === -1) {
    return res.json(check);
  }

  NewAdsProxy.updateAd(id, newAd, function(err, result) {
    if (err) {
      console.log(err);
      return res.json({code: -1, message: '修改失败'});
    }

    res.json({code: 0, message: '修改成功'});
  });
};

/**
 * 发布
 * @param req
 * @param res
 */
exports.show = function(req, res) {
  var id = req.body.id;
  var isShow = req.body.isShow;
  var whereTag = req.body.whereTag;

  if (!id || _.trim(isShow) === '' || !whereTag) {
    return res.json({code: -1, message: '缺少必要参数'});
  }

  isShow = (isShow === 'true' || isShow === true);
  whereTag = parseInt(whereTag);
  if (isNaN(whereTag)) {
    return res.json({code: -1, message: '请输入有效类型'});
  }

  NewAdsProxy.updateIshow(id, whereTag, isShow, function(err, result) {
    if (err) {
      console.log(err);
      return res.json({code: -1, message: '失败'});
    }

    res.json({code: 0, message: '成功'});
  });
};

/**
 * 移除
 * @param req
 * @param res
 */
exports.remove = function(req, res) {
  var id = req.body.id;

  if (!id) {
    return res.json({code: -1, message: 'id not found'});
  }

  NewAdsProxy.removeAd(id, function(err) {
    if (err) {
      console.log(err);
      return res.json({code: -1, message: '删除失败'});
    }

    res.json({code: 0, message: '删除成功'});
  });
};

/**
 * 详情
 * @param req
 * @param res
 */
exports.detail = function(req, res) {
  var id = req.body.id || req.query.id;

  if (!id) {
    return res.json({code: -1, message: 'id not found'});
  }

  NewAdsProxy.getById(id, function(err, ad) {
    if (err) {
      console.log(err);
      return res.json({code: -1, message: '获取详情失败'});
    }

    var result = _formatDetail(ad);
    res.json({code: 0, message: '获取成功', data: result})
  });
};

/**
 * 图片上传
 * @param req
 * @param res
 */
exports.imgUpload = function(req, res) {
  var form = new multiparty.Form();

  form.parse(req, function(err, fields, files) {
    var myImg = files.myImg[0];

    if (myImg.size !== 0) {
      fs.readFile(myImg.path, function(err, data) {
        if (err) {
          return res.json({code: -1, message: '读取文件失败'});
        }

        NewAdsProxy.imgUpload(myImg.originalFilename, data, function(err, file) {
          if (err) {
            return res.json({code: -1, message: err.message});
          }

          var result = {
            id: file.get('id'),
            url: file.get('url')
          };
          res.json({code: 0, message: '上传成功', data: result});
        });
      });
    } else {

      res.json({code: -1, message: '请选择上传文件'});
    }
  });
};

/**
 * 格式化列表数据
 * @private
 */
var _formatList = function(ads) {
  var result = [];

  ads.forEach(function(item) {
    var ad = {
      id: item.get('id'),
      isShow: item.get('isShow') || false,
      summary: item.get('summary') || '',
      createdAt: moment(item.get('createdAt')).format("YYYY-MM-DD")
    };

    var whereTag = item.get('whereTag');
    ad.whereTagString = NewAdsProxy.whereTagToString(whereTag);

    // 类型
    var typeTag = item.get('typeTag');
    var urlTag = item.get('urlTag');
    ad.adType = '未知';

    if (parseInt(typeTag) === 1 && parseInt(urlTag) === 1) {
      ad.adType = '社区'
    } else if (parseInt(typeTag) === 1 && parseInt(urlTag) === 2) {
      ad.adType = 'h5'
    } else if (parseInt(typeTag) === 2 && parseInt(urlTag) === 2) {
      ad.adType = '大图介绍+h5';
    }

    result.push(ad);
  });

  return result;
};

/**
 * 格式化详情
 * @param ad
 * @private
 */
var _formatDetail = function(ad) {
  var result = {
    id: ad.get('id'),
    whereTag: ad.get('whereTag'),
    typeTag: ad.get('typeTag') || '',
    urlTag: ad.get('urlTag') || '',
    isShow: ad.get('isShow') || false,
    summary: ad.get('summary') || '',
    createdAt: moment(ad.get('createdAt')).format("YYYY-MM-DD"),
    title: ad.get('title') || '',
    text: ad.get('text') || '',
    buttonWord: ad.get('buttonWord') || '',
    url: ad.get('url') || '',
    urlPad: ad.get('urlPad') || '',
    img: ad.get('img') ? ad.get('img').get('id') : '',
    img_url: ad.get('img') ? ad.get('img').get('url') : '',
    img2_phone: ad.get('img2_phone') ? ad.get('img2_phone').get('id') : '',
    img2_phone_url: ad.get('img2_phone') ? ad.get('img2_phone').get('url') : '',
    img2_pad: ad.get('img2_pad') ? ad.get('img2_pad').get('id') : '',
    img2_pad_url: ad.get('img2_pad') ? ad.get('img2_pad').get('url') : '',
    buttonWord2: ad.get('buttonWord2') || '',
    showTime: ad.get('showTime') ? moment(ad.get('showTime')).format("YYYY-MM-DD HH:mm") : '',
  };

  return result;
};

/**
 * 检查创建数据
 * @param newAd
 * @private
 */
var _checkAddData = function(newAd) {
  var result = {code: -1, message: ''};
  var whereTag = newAd.whereTag;

  // 1.活动类型
  if (isNaN(whereTag)) {
    result.message = '缺少跳转类型';
    return result;
  }

  // 2.跳转类型
  if (whereTag <= whereTagObj.PICTURE_BOOK
    || whereTag === whereTagObj.FORCE_UPDATE) {
    if (isNaN(newAd.typeTag)) {
      result.message = '缺少跳转类型';
      return result;
    }
  }

  // 3.urlTag 类型
  if (whereTag <= whereTagObj.PICTURE_BOOK
    || whereTag === whereTagObj.FORCE_UPDATE) {
    if (isNaN(newAd.urlTag)) {
      result.message = '缺少链接类型';
      return result;
    }
  }

  // 4.摘要
  if (whereTag <= whereTagObj.PICTURE_BOOK) {
    if (_.trim(newAd.summary) === '') {
      result.message = '缺少广告摘要';
      return result;
    }
  }

  // 5.标题
  if (whereTag !== whereTagObj.WELFARE_GIFT
    && whereTag !== whereTagObj.PICTURE_BOOK) {
    if (_.trim(newAd.title) === '') {
      result.message = '缺少标题';
      return result;
    }
  }

  // 6.补充说明
  if (whereTag !== whereTagObj.WELFARE_GIFT
    && whereTag !== whereTagObj.PICTURE_BOOK) {
    if (_.trim(newAd.text) === '') {
      result.message = '缺少补充说明';
      return result;
    }
  }

  // 7.按钮1
  if (whereTag !== whereTagObj.WELFARE_GIFT
    && whereTag !== whereTagObj.PICTURE_BOOK
    && whereTag !== whereTagObj.SEAL_NUMBER
    && whereTag !== whereTagObj.MAINTENANCE) {
    if (_.trim(newAd.buttonWord) === '') {
      result.message = '缺少按钮文字';
      return result;
    }
  }

  // 8.phone链接
  if (whereTag !== whereTagObj.SEAL_NUMBER
    && whereTag !== whereTagObj.MAINTENANCE
    && whereTag !== whereTagObj.SUGGEST_UPDATE) {
    if (_.trim(newAd.url) === '') {
      result.message = '缺少iphone链接';
      return result;
    }
  }

  // 9.pad链接
  if (whereTag !== whereTagObj.STUDY_GIFT
    && whereTag !== whereTagObj.SEAL_NUMBER
    && whereTag !== whereTagObj.MAINTENANCE
    && whereTag !== whereTagObj.SUGGEST_UPDATE
    && whereTag !== whereTagObj.FORCE_UPDATE) {
    if (_.trim(newAd.urlPad) === '') {
      result.message = '缺少pad链接';
      return result;
    }
  }

  // 10.图片
  if (whereTag !== whereTagObj.WELFARE_GIFT
    && whereTag !== whereTagObj.PICTURE_BOOK) {
    if (_.trim(newAd.img) === '') {
      result.message = '缺少图片链接';
      return result;
    }
  }

  // 11.phone图片
  if ((whereTag === whereTagObj.HOME_NOTICE && newAd.typeTag === whereTagObj.STUDY_GIFT)
    || whereTag === whereTagObj.PICTURE_BOOK) {
    if (_.trim(newAd.img2_phone) === '') {
      result.message = '缺少phone2图片';
      return result;
    }
  }

  // 12.pad图片
  if ((whereTag === whereTagObj.HOME_NOTICE && newAd.typeTag === whereTagObj.STUDY_GIFT)
    || whereTag === whereTagObj.PICTURE_BOOK) {
    if (_.trim(newAd.img2_pad) === '') {
      result.message = '缺少pad图片';
      return result;
    }
  }

  // 13.按钮2
  if (whereTag === whereTagObj.HOME_NOTICE
    && newAd.typeTag === whereTagObj.STUDY_GIFT) {
    if (_.trim(newAd.buttonWord2) === '') {
      result.message = '缺少图片按钮文字';
      return result;
    }
  }

  // 14 是否立即发布
  if (whereTag <= whereTagObj.PICTURE_BOOK) {
    if (newAd.isShow === false) {
      var regStr = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\s+(20|21|22|23|[0-1]\d):[0-5]\d$/;
      var regExp = new RegExp(regStr);

      if (_.trim(newAd.showTime) === '' || !regExp.test(newAd.showTime)) {
        result.message = '缺少定发布时时间';
        return result;
      } else {
        newAd.showTime = moment(newAd.showTime).toDate();
      }
    }
  }

  return {code: 0, message: '验证通过'}
};

/**
 * 修改或者删除获取请求参数
 * @param req
 * @returns {{}}
 * @private
 */
function _getAddOrUpdateReqParams(req) {
  var whereTag = req.body.whereTag;
  var typeTag = req.body.typeTag;
  var urlTag = req.body.urlTag;
  var summary = req.body.summary;
  var title = req.body.title;
  var text = req.body.text;
  var buttonWord = req.body.buttonWord;
  var url = req.body.url;
  var urlPad = req.body.urlPad;
  var isShow = req.body.isShow;
  var showTime = req.body.showTime;
  var img = req.body.img;
  var img2_phone = req.body.img2_phone;
  var img2_pad = req.body.img2_pad;
  var buttonWord2 = req.body.buttonWord2;

  var newAd = {
    isShow: (isShow === 'true' || isShow === true)
  };
  if (whereTag) newAd.whereTag = parseInt(whereTag);
  if (typeTag) newAd.typeTag = parseInt(typeTag);
  if (urlTag) newAd.urlTag = parseInt(urlTag);
  if (summary) newAd.summary = summary;
  if (title) newAd.title = title;
  if (text) newAd.text = text;
  if (buttonWord) newAd.buttonWord = buttonWord;
  if (url) newAd.url = url;
  if (urlPad) newAd.urlPad = urlPad;
  if (!newAd.isShow && showTime) newAd.showTime = showTime;
  if (img) newAd.img = img;
  if (img2_phone) newAd.img2_phone = img2_phone;
  if (img2_pad) newAd.img2_pad = img2_pad;
  if (buttonWord2) newAd.buttonWord2 = buttonWord2;

  return newAd;
}






