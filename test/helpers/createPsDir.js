var fs        = require('fs');
var nodePath  = require('path');
var spawn     = require('child_process').spawn;
var es        = require('event-stream');
var path      = nodePath.join(process.cwd(),'test/fixtures/tmp');
var header    = null;
var count     = 0;

function createRunningDirs(cb){
 return es.pipeline(
  spawn('ps', ['-A', '-o', 'pid']).stdout,
  es.split(),
  es.map(createRunning)
 ).on('error',cb);
}

function createRunning(line,cb) {

  var runningPid = null;
  count++;

  if (!header) {
    //remove PID Header from stream
    header = line.trim();
    return cb();
  }

  runningPid = line.trim();

  if (runningPid && count <= 10){
    return fs.mkdir(path,cb)
    } else {
      //callback empty as to treat map like filter
      return cb();
    }
  }
  return cb();
}

function randomNumber() {
   return Math.floor(Math.random() * 4000);
}

function createFakeDirs(amount,cb) {
   var count = 0;
   return async.whilst(
     function () { return count <= amount; },
     function (callback) {
       count++;
       return fs.mkdir(path + randomNumber(),callback);
     },
     function (err) {
      cb(err);
     }
   )
}

module.exports = {
 createRunningDirs:createRunningDirs,
 createFakeDirs:createFakeDirs
};

