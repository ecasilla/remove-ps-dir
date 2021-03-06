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
var async     = require('async');
var path      = nodePath.join(process.cwd(), '/test/fixtures/tmp/');
var header    = null;
var count     = 1;
var runningAmount = null;

function createRunningDirs(amount, cb){
  runningAmount = amount;
  return es.pipeline(
    spawn('ps', ['-A', '-o', 'pid']).stdout,
    es.split(),
    es.map(createRunning),
    es.pipe(es.writeArray(cb))
  ).on('error', cb);
}

function createRunning(line, cb) {

  var runningPid = null;

  if (!header) {
    //remove PID Header from stream
    header = line.trim();
    return cb();
  }

  runningPid = line.trim();

  if (runningPid && count <= runningAmount){
    count++;
    var dir = path + runningPid;
    return fs.mkdir(dir, function () {
      return cb(null, dir);
    });
  } else {
    //callback empty as to treat map like filter
    return cb();
  }
  return cb();
}

function randomNumber() {
  return Math.floor(Math.random() * 40000000);
}

/**
 * description creates an array from 1 to the end number
 *
 */
function createRange(end) {
  if (end === 0) {
    return [];
  }
  var results = [];
  var current = 1;
  var step = 0 <= end ? 1 : -1;

  results.push(current);

  while (current !== end) {
    current += step;
    results.push(current);
  }

  return results;
}

function __mapFake(value, callback) {
  var dir = path + randomNumber();
  return fs.mkdir(dir, function fsDirCb(err) {
    return callback(err, dir);
  });
}

function createFakeDirs(amount, cb) {
  var range = createRange(amount);
  return async.map(range, __mapFake, cb);
}

module.exports = {
  createRunningDirs: createRunningDirs,
  createFakeDirs: createFakeDirs,
  createRange: createRange,
  randomNumber: randomNumber
};

