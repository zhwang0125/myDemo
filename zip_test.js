var AV = require('leanengine');
var request = require('request');
var fs = require('fs');
var admZip = require('adm-zip');
var eventproxy = require('eventproxy');
var async = require('async');
var archiver = require('archiver');
var zipRoot = __dirname + '/public/zip';

/**
 * 链接leancloud
 */
AV.init({
  appId: process.env.LEANCLOUD_APP_ID || "0fp663d00686fc25lrxa9nco3gvm1lj7vidg683n5pvpsedg",
  appKey: process.env.LEANCLOUD_APP_KEY || "vkndqfc195hbd27ou5d18yt718tf9qzwje91rv5naqw2py9k",
  masterKey: process.env.LEANCLOUD_APP_MASTER_KEY || "2r5718u4x0128vifvpo7ywcfmn7tisd00j1218kx3fg95cri",
});

/**
 * @param uri 网络文件地址
 * @param filename 文件名
 * @param callback 回调函数
 */
var downloadFile = function(uri, filename, callback) {
  var stream = fs.createWriteStream(filename);
  request(uri).pipe(stream).on('close', callback);
};

/**
 * 压缩文件
 * @param srcFolder
 * @param zipFilePath
 * @param callback
 */
var zipFolder = function(srcFolder, zipFilePath, callback) {
  var output = fs.createWriteStream(zipFilePath);
  var zipArchive = archiver('zip');

  output.on('close', function() {
    callback();
  });

  zipArchive.pipe(output);

  zipArchive.bulk([{
    cwd: srcFolder,
    src: ['**/*'],
    expand: true
  }]);

  zipArchive.finalize(function(err, bytes) {
    if (err) {
      callback(err);
    }
  });
};

/**
 * 移除文件夹(同步)
 * @param path
 */
var deleteFolderSync = function(path) {
  var files = [];

  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);

    files.forEach(function(file, index) {
      var curPath = path + "/" + file;

      if (fs.statSync(curPath).isDirectory()) {
        deleteFolderSync(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    // delete dir
    fs.rmdirSync(path);
  }
};

/**
 * 移动文件(同步)
 * @param path
 * @param toPath
 */
var moveFileSync = function(path, toPath) {
  var files = fs.readdirSync(path);

  if (!fs.existsSync(toPath)) {
    fs.mkdirSync(toPath);
  }

  files.forEach(function(item) {
    var tmpPath = path + '/' + item;
    var stats = fs.statSync(tmpPath);

    if (!/^\./.test(item) && !/^__/.test(item)) {
      if (stats.isDirectory()) {
        moveFileSync(tmpPath, toPath);
      } else {
        fs.renameSync(tmpPath, toPath + '/' + item);
      }
    }
  });
};

/**
 * 下载并解压, 压缩
 * @param audioZipUrl
 * @param imgZipUrl
 * @param objectId
 * @param orderNumber
 * @param fn
 */
var downloadAndUnZip = function(audioZipUrl, imgZipUrl, objectId, orderNumber, fn) {
  var downEp = new eventproxy();
  var audioName = zipRoot + '/audio_' + objectId + '.zip';
  var imgName = zipRoot + '/img_' + objectId + '.zip';

  if (!fs.existsSync(zipRoot)) {
    fs.mkdirSync(zipRoot);
  }

  // audio.zip 和 img.zip 文件下载完毕
  downEp.all('audioEnd', 'imgEnd', function() {
    var fileUrl = zipRoot + '/unzip';
    var toFileUrlRoot = zipRoot + '/read_' + orderNumber;
    var toFileUrl = toFileUrlRoot + '/read_' + orderNumber;
    var saveUrl = zipRoot + '/read_' + orderNumber + '.zip';

    if (!fs.existsSync(toFileUrlRoot)) {
      fs.mkdirSync(toFileUrlRoot);
    }

    // 把audio和img文件移动到一个文件夹
    moveFileSync(fileUrl, toFileUrl);

    // 开始打包zip
    zipFolder(toFileUrlRoot, saveUrl, function(err) {
      if (err) {
        console.log('zip压缩出错------------->');
        return;
      }

      console.log('下载完毕, 开始压缩zip------------->');

      // 打包完毕, 移除临时文件
      deleteFolderSync(fileUrl);
      deleteFolderSync(toFileUrlRoot);

      // 异步移除
      fs.unlink(audioName);
      fs.unlink(imgName);
      fn(saveUrl);
    });
  });

  console.log('正在下载------------->');

  // 下载audio.zip
  downloadFile(audioZipUrl, audioName, function() {
    var unzip = new admZip(audioName);
    unzip.extractAllTo(zipRoot + '/unzip', true);
    downEp.emit('audioEnd', null);
  });

  // 下载img.zip
  downloadFile(imgZipUrl, imgName, function() {
    var unzip = new admZip(imgName);
    unzip.extractAllTo(zipRoot + '/unzip', true);
    downEp.emit('imgEnd', null);
  });
};

// 脚本开始
var ep = new eventproxy();
var query = new AV.Query('PictureBook');
//query.equalTo('objectId', '57c6754579bc440063f91d8d');
//query.equalTo('objectId', '57ce48d40e3dd90069ac0552');

// 查询到结果
ep.all('pBooks', function(pBooks) {
  var index = 1;

  async.eachSeries(pBooks, function(item, cb) {
    console.log('=========================【' + index + ' start】===============================');

    var audioZipUrl = item.get('audioZip').attributes.url;
    var imgZipUrl = item.get('imgZip').attributes.url;
    var orderNumber = item.get('orderNumber');
    var objectId = item.id;

    downloadAndUnZip(audioZipUrl, imgZipUrl, objectId, orderNumber, function(saveUrl) {
      console.log('zip压缩完毕, 开始上传------------->');

      fs.readFile(saveUrl, function(err, data) {
        if (err) {
          console.log('saveImgError:');
          return cb();
        }
        var base64Data = data.toString('base64');
        var avFile = new AV.File('read_' + orderNumber + '.zip', {base64: base64Data});
        avFile.save().then(function(file) {

          var pbook = AV.Object.createWithoutData('PictureBook', objectId);
          pbook.set('appZip', file);
          pbook.save();

          // 移除zip包
          //fs.unlinkSync(saveUrl);

          console.log('上传完毕, 进入下次循环------------->');
          console.log('=========================【' + index + ' end】===============================');

          index++;
          cb();
        })
      });
    });
  }, function(err) {
    if (err) {
      return console.log(err);
    }

    console.log('全部结束------------->');
  });
});

query.find().then(function(result) {
  if (result && result.length > 0) {

    // 查询到结果, 开始循环下载
    ep.emit('pBooks', result);
  } else {

    console.log('查询结束, 结束------------->');
  }
}, function(err) {

  console.log('查询出错------------->');
});





