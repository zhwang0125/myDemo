'use strict';
var router = require('express').Router();
var AV = require('leanengine');

var Todo = AV.Object.extend('Todo');

// 查询 Todo 列表
router.get('/', function(req, res, next) {
  //var user = new AV.User();
  //user.setUsername('zhwang');
  //user.setPassword('123456');
  //user.setEmail('wangzhihua2017@qq.com');
  //user.signUp().then(function(result){
  //  console.log(result);
  //});

  //console.log(req.sessionToken);
  //console.log(req.currentUser);

  //var cql = "select content,count(*) from Todo group by content";
  var cql = "SELECT content,count(*) FROM Todo where createdAt > date('2017-06-05T00:00:00.000Z') group by content";
  AV.Query.doCloudQuery(cql).then(function (data) {
    // results 即为查询结果，它是一个 AV.Object 数组
    console.log(data);
  }, function(err){
    console.log(err);
  });

  var query = new AV.Query(Todo);
  query.descending('createdAt');
  query.limit(3);
  //query.ascending('createdAt');
  //query.skip(2);
  query.find().then(function(results) {
    res.render('todos', {
      title: 'TODO 列表',
      todos: results
    });
  }, function(err) {
    if (err.code === 101) {
      // 该错误的信息为：{ code: 101, message: 'Class or object doesn\'t exists.' }，说明 Todo 数据表还未创建，所以返回空的 Todo 列表。
      // 具体的错误代码详见：https://leancloud.cn/docs/error_code.html
      res.render('todos', {
        title: 'TODO 列表',
        todos: []
      });
    } else {
      next(err);
    }
  }).catch(next);
});

// 新增 Todo 项目
router.post('/', function(req, res, next) {
  var content = req.body.content;
  var todo = new Todo();
  todo.set('content', content);
  todo.save().then(function(todo) {
    res.redirect('/todos');
  }).catch(next);
});

module.exports = router;
