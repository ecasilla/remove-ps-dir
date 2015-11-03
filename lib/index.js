/**
 * remove-ps-dir - A module to remove directory's that are named after their process id
 * @version v1.0.0
 * @link https://github.com/ecasilla/remove-ps-dir
 * @license MIT
 * @author Ernie Casilla - ecasilla@icloud.com
 */
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
 * @module RemovePsDir
 * @returns{RemovePsDir}
 */
function RemovePsDir(){
  if (! (this instanceof RemovePsDir)){
    return new RemovePsDir();
  }
  return this;
}
/**
 * @description The main fn that kicks off the entire workflow
 * @param{String} A valid directory path from which to start removing 
 * dead worker pid dir
 * @param{Function} The callback fn to call once finished
 */
RemovePsDir.prototype.remove = function remove(path, cb) {
  return this.__gateKeeper(path, cb);
};

/**
 * @description Thou shall not mess with the gatekeeper
 * @param{String} The path to been checked for validity
 * @param{Function} The callback fn to call once finished
 */
RemovePsDir.prototype.__gateKeeper = function __gateKeeper(path, cb) {
  if (! _.isString(path) || !fs.existsSync(path)) {
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

/**
 * @description This method returns a sorted array of all integer named directory inside the original path
 * @param{String} The original path
 * @returns{Array<String>} A sorted array of all pid based directory 
 * sorted for easy search later on
 */
RemovePsDir.prototype.__getPsDir = function __getPsDir(path) {
  var dir = fs.readdirSync(path);
  return _.sortBy(_.filter(dir, this.__filterPaths()));
};

/**
 * @description A function that returns a predicate
 * function to be tested on every element in an array 
 * against a Regular Expression
 * @returns{Function}
 */
RemovePsDir.prototype.__filterPaths = function __filterPaths() {
  var numbersOnlyRegex = /^[0-9]*$/;
  return function filterReturn(value){
    return !!value.match(numbersOnlyRegex);
  };
};

/**
 * @description A method that streams all 
 * output from the stdout call to ps and create a pipeline stream 
 * from which I operate on every number of the ps stream
 *
 */
RemovePsDir.prototype.__runningProcess = function __runningProcess() {
  var self = this;
  return es.pipeline(
    spawn('ps', ['-A', '-o', 'pid']).stdout,
    es.split(),
    es.map(self.__map.bind(this)),
    es.split(','),
    reduce(self.__reduce.bind(this), []).on('data', self.__done(null))
    ).on('error', self.__done());
};

/**
 * @description This function is called for every 
 * new line in the ps stdout stream
 * @params{String} The current line of text in the running stream
 * @params{Function} A callback fn to tell the stream we are done operating
 */
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

/**
 * @description The function takes every remaining pid and reduces it
 * to an array of completed paths its worked through.
 * @params{Array} The accumulator Array
 * @params{String} The current dead worker pid number
 * @returns{Array<String>}
 * @synchronous
 */
RemovePsDir.prototype.__reduce = function __reduce(acc, val) {
  if (val) {
    var _pidPath = this.__rmdir(val);
    acc.push(_pidPath);
    return acc;
  } else {
    return acc;
  }
};

/**
 * @description Sadly the stream-reduce interface is synchronous 
 * so I must use all the Sync api's from node
 * @param{String} A current dead workers pid
 * @returns{String} The complete path of the dead worker directory
 * @this RemovePsDir.prototype
 */
RemovePsDir.prototype.__rmdir = function __rmdir(pid) {
  var _pidpath = nodePath.join(this.pidPath, pid);
  if (fs.existsSync(_pidpath)) {
    try {
      fs.rmdirSync(_pidpath);
      return _pidpath;
    } catch (e) {
      return e;
    }
  }
  return _pidpath;
};

/**
 * @description This is the final fn called in the flow. 
 * From here we go back to user land
 * reduce breaks normal nodeback arity so must
 * implement this in order to be node style compatible
 * @params{Error} This might be an error or null depending on the caller
 * @returns{Function} This is event handler fn that 
 * will be called by reduce or error from the stream pipeline
 * @params{Array|Error} If successful an array of paths
 * otherwise and instance of Error
 */
RemovePsDir.prototype.__done = function __done(err) {
  var self = this;
  return function psDone(data){
    if (_.isNull(err)) {
      return self.cb(null, data);
    }
    return self.cb(data);
  };
};

module.exports = RemovePsDir();
