
exports.parseAsync = function(input, cb){
  setTimeout(function(){
    var result;

    try{
      result = JSON.parse(input);
    }
    catch (err){
      return cb(err);
    }

    return cb(null, result);
  }, 1000)
};