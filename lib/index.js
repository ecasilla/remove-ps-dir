'use strict';
var fs        = require('fs');
var nodePath  = require('path');
var spawn     = require('child_process').spawn;
var es        = require('event-stream');
var reduce    = require('stream-reduce');
var _         = require('lodash');
var header    = null;

/**
 * @description A Singleton module created with the intention of removing
 * pid directorys created by node worker process using their own process.pid
 * as a dir name
 * @singleton
 * @returns{RemovePsDir}
 */
function RemovePsDir(){
  if (! (this instanceof RemovePsDir)){
    return new RemovePsDir();
  }
  return this;
}
/**
 * description
 *
 */
RemovePsDir.prototype.remove = function remove(path, cb) {
  return this.__gateKeeper(path, cb);
};

RemovePsDir.prototype.__gateKeeper = function __gateKeeper(path, cb) {
  if (! _.isString(path) || !fs.existsSync(path) ) {
    return new Error('a valid path is required');
  }
  if (! _.isFunction(cb)) {
    return new Error('must give a callback function');
  }

  RemovePsDir.prototype.pidPath = path;
  this.cb = cb;
  this.pidDir = this.__getPsDir(path);
  return this.__runningProcess();
};

RemovePsDir.prototype.__getPsDir = function __getPsDir(path) {
  var dir = fs.readdirSync(path);
  return _.sortBy(_.filter(dir, this.__filterPaths()));
};

RemovePsDir.prototype.__filterPaths = function __filterPaths() {
  var numbersOnlyRegex = /^[0-9]*$/;
  return function filterReturn(value){
    return !!value.match(numbersOnlyRegex);
  };
};

RemovePsDir.prototype.__runningProcess = function __runningProcess() {
  var self = this;
  return es.pipeline(
    spawn('ps', ['-A', '-o', 'pid']).stdout,
    es.split(),
    es.map(self.__map.bind(this)),
    es.split(','),
    reduce(self.__reduce.bind(this), '').on('data', self.__done(null))
    ).on('error', self.__done());
};

RemovePsDir.prototype.__map = function __map(line, cb) {
  var runningPid = null;

  if (!header) {
    //remove PID Header from stream
    header = line.trim();
    return cb();
  }

  runningPid = line.trim();

  if (runningPid){
    // remove running pids that are currently
    // inside the directory's given path
    if (~this.pidDir.indexOf(runningPid)){
    //binary search for the index of the
    //running process to remove then splice the array
      this.pidDir.splice(_.indexOf(this.pidDir, runningPid, true), 1);
      //callback empty as to treat map like filter
      return cb();
    } else {
    //callback empty as to treat map like filter
      return cb();
    }
  }
  //finally return the array with all running ps removed
  return cb(null, this.pidDir);
};


RemovePsDir.prototype.__reduce = function __reduce(acc, val) {
  return this.__rmdir(val, function (err){
    if (err) {
      throw new Error(err);
    }
    return acc;
  });
};

RemovePsDir.prototype.__rmdir = function __rmdir(pid, cb) {
  if (pid) {
    var _pidpath = nodePath.join(this.pidPath, pid);
    return fs.rmdir(_pidpath, function _rmdirps(err) {
      return cb(err, _pidpath);
    });
  }
  return cb();
};


RemovePsDir.prototype.__done = function __done(err) {
  // reduce breaks normal nodeback arity so must
  // implement this in order to be node style compatible
  var self = this;
  return function psDone(realErr){
    if (_.isNull(err)) {
      return self.cb(null);
    }
    return self.cb(realErr);
  };
};

module.exports = RemovePsDir();
