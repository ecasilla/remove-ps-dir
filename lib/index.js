'use strict';
var fs        = require('fs');
var node_path = require('path');
var spawn     = require('child_process').spawn;
var es        = require('event-stream');
var reduce    = require("stream-reduce");
var _         = require('lodash');
var header    = null;

function RemovePsDir(){
  if (! (this instanceof RemovePsDir)){
    return new RemovePsDir();
  }
  return this;
}

RemovePsDir.prototype.remove = function remove(path,cb) {
  return this.__gateKeeper(path,cb);
}

RemovePsDir.prototype.__gateKeeper = function __gateKeeper(path, cb) {
  if (! _.isString(path)) {
    return new Error('path is required');
  }
  if (! _.isFunction(cb)) {
    return new Error('must give a callback function');
  }

  RemovePsDir.prototype.pid_path = path;
  this.cb = cb;
  this.ps_dir = this.__getPsDir(path);
  return this.__runningProcess();
};

RemovePsDir.prototype.__getPsDir = function __getPsDir(path) {
   var dir = fs.readdirSync(path);
   return _.sortBy( _.filter( dir, this.__filterPaths() ) );
}

RemovePsDir.prototype.__filterPaths = function __filterPaths() {
   var numbers_only_regex = /^[0-9]*$/;
   return function filterReturn(value){
     return !!value.match(numbers_only_regex);
   }
}

RemovePsDir.prototype.__runningProcess = function __runningProcess() {
  var self = this;
  return es.pipeline(
    spawn('ps', ['-A', '-o', 'pid']).stdout,
    es.split(),
    es.map(self.__map.bind(this)),
    es.split(','),
    reduce(__reduce,'').on('data',self.__done(null)) 
    ).on('error',self.__done())
}

RemovePsDir.prototype.__map = function __map(line,cb) {
  var running_pid = null;

  if (!header) {
    //remove PID Header from stream
    header = line.trim();
    return cb();
  }

  running_pid = line.trim();

  if(running_pid){
    // remove running pids that are currently
    // inside the directory's given path
    if(~this.ps_dir.indexOf(running_pid)){
    //binary search for the index of the running process to remove
      this.ps_dir.splice(_.indexOf(this.ps_dir,running_pid,true),1);
      //callback empty as to treat map like filter
      return cb();
    }else{
    //callback empty as to treat map like filter
      return cb();
    }
  }
  //finally return the array with all running ps removed
  return cb(null,this.ps_dir);
}


function __reduce(acc,val) {
  return RemovePsDir.prototype.__rmdir(val,function(err,_pidpath){
    if (err) {
      throw new Error(err); 
    }
    return acc; 
  });
};

RemovePsDir.prototype.__rmdir = function __rmdir(pid,cb) {
   if (pid) {
   var _pidpath = node_path.join(this.pid_path,pid);
     return fs.rmdir(_pidpath, function _rmdirps(err) {
        return cb(err, _pidpath);
     });
   }
   return cb();
}


RemovePsDir.prototype.__done = function __done(err) {
// reduce breaks normal nodeback arity so must 
// implement this in order to be node style compatible
   var self = this;
   return function ps_done(real_err){
    if (_.isNull(err)) {
      return self.cb(null)
    }
    return self.cb(real_err);
   }
}

module.exports = RemovePsDir;
