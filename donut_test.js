var fs = require('fs');

function walk(path, toPath) {
  var files = fs.readdirSync(path);

  files.forEach(function(item) {
    var tmpPath = path + '/' + item;
    var stats = fs.statSync(tmpPath);

    if (stats.isDirectory()) {
      // 过滤已下划线__开头的文件夹
      if(!/^__/.test(item)){
        walk(tmpPath, toPath);
      }
    }
    else {
      if(!/^\./.test(item)){
        fs.renameSync(tmpPath, toPath + '/' + item);
      }
    }
  });
}

var nUrl = __dirname + '/public/zip/read_111';
var path = __dirname + '/public/zip/unzip';

walk(path, nUrl);
console.log('------>');