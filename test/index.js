/**
 * remove-ps-dir - A module to remove directory's that are named after their process id
 * @version v1.0.0
 * @link https://github.com/ecasilla/remove-ps-dir
 * @license MIT
 * @author Ernie Casilla - ecasilla@icloud.com
 */
'use strict';
var expect      = require('chai').expect;
var sinon       = require('sinon');
var fs          = require('fs');
var path        = require('path');
var _           = require('lodash');
var async       = require('async');
var helper      = require('./helpers');
var RemovePsDir = require('../lib');
var root        = process.cwd();
var tmpPath     = path.join(root, '/test/fixtures/tmp');

describe('remove-ps-dir', function () {
  var sandbox;
  var fakePidDirs;
  var runningPidDirs;
  before(function (done){
    helper.createFakeDirs(10, function (err, fakePs) {
      fakePidDirs = fakePs;
      done(err);
    });
  });

  before(function (done){
    helper.createRunningDirs(10, function (err, running) {
      runningPidDirs = running;
      done(err);
    });
  });
  after(function (done){
    var totalPaths = runningPidDirs.concat(fakePidDirs);
    async.each(totalPaths, fs.rmdir, function () {
      done();
    });
  });
  beforeEach(function (){
    sandbox = sinon.sandbox.create();
  });
  afterEach(function (){
    sandbox.restore();
  });

  context('Interface', function () {
    it('RemovePsDir should be a singleton object', function (){
      expect(RemovePsDir).to.be.an('object');
    });
    it('should have a private remove fn', function (){
      expect(RemovePsDir.remove).to.be.an('function');
    });
    it('should have a private gatekeeper fn', function (){
      expect(RemovePsDir.__gateKeeper).to.be.an('function');
    });
    it('should have a private getPsDir fn', function (){
      expect(RemovePsDir.__getPsDir).to.be.an('function');
    });
    it('should have a private Filter Paths fn', function (){
      expect(RemovePsDir.__filterPaths).to.be.an('function');
    });
    it('should have a private Map fn', function (){
      expect(RemovePsDir.__map).to.be.an('function');
    });
    it('should have a private Running Processes fn', function (){
      expect(RemovePsDir.__runningProcess).to.be.an('function');
    });
    it('should have a private Remove Dir fn', function (){
      expect(RemovePsDir.__rmdir).to.be.an('function');
    });
    it('should have a private Reduce fn', function (){
      expect(RemovePsDir.__reduce).to.be.an('function');
    });
    it('should have a private Done fn', function (){
      expect(RemovePsDir.__done).to.be.an('function');
    });
  });
  context('Implementation', function () {
    it('should guard against bad args being passed by calling the gatekeeper', function (){
      var spy = sandbox.spy(RemovePsDir, '__gateKeeper');
      RemovePsDir.remove();
      expect(spy.called).to.eql(true);
    });
    it('should kick off the running process fn', function (){
      var stub = sandbox.stub(RemovePsDir, '__runningProcess');
      RemovePsDir.__gateKeeper(tmpPath, _.noop);
      expect(stub.called).to.eql(true);
      expect(stub.calledCount).to.eql();
    });
    it('should set the users callback on the singleton', function (){
      var cb = sandbox.spy();
      RemovePsDir.__gateKeeper(tmpPath, cb);
      expect(RemovePsDir.cb.isSinonProxy).to.be.eql(true);
      expect(RemovePsDir.pidPath).to.eql(tmpPath);
    });
    it('should return an Error if path is not defined', function (){
      expect(RemovePsDir.__gateKeeper()).to.be.an.instanceof(Error);
    });
    it('should return an Error if path is not valid', function (){
      expect(RemovePsDir.__gateKeeper('idontexist')).to.be.an.instanceof(Error);
    });
    it('should return an Error if a callback is not passed', function (){
      expect(RemovePsDir.__gateKeeper('', undefined)).to.be.an.instanceof(Error);
    });
    it('should return false when there\'s letters in path', function (){
      expect(RemovePsDir.__filterPaths()('hello')).to.eql(false);
    });
    it('should return false when there\'s letters and numbers in the path', function (){
      expect(RemovePsDir.__filterPaths()('he11o')).to.eql(false);
    });
    it('should return true when there\'s only numbers in the path', function (){
      expect(RemovePsDir.__filterPaths()('12345')).to.eql(true);
    });
    it('should remove a dir with vaild args', function (done){
      var fakePath = fakePidDirs.shift();
      var fakePid = fakePath.split(path.sep).splice(-1, 1).join();
      RemovePsDir.pidPath = tmpPath;
      var fullpath = RemovePsDir.__rmdir(fakePid);
      expect(fullpath).to.eql(fakePath);
      done();
    });
    it('should return an error if args are invalid', function (done){
      RemovePsDir.pidPath = tmpPath;
      var err = RemovePsDir.__rmdir('');
      expect(err).to.be.an.instanceof(Error);
      done();
    });
    it('should call the users fn once finished', function (){
      var __done = RemovePsDir.__done(null);
      var cb = sandbox.spy();
      RemovePsDir.cb = cb;
      __done();
      expect(cb.withArgs(null).calledOnce).to.be.eql(true);
    });
    it('should call the users fn with error if any once finished', function (){
      var __done = RemovePsDir.__done();
      var cb = sandbox.spy();
      RemovePsDir.cb = cb;
      __done(new Error('Ooops'));
      expect(cb.calledOnce).to.be.eql(true);
      expect(cb.getCall(0).args[0]).to.be.an.instanceof(Error);
    });
    it('should return an array of paths', function (done){
      RemovePsDir.remove(tmpPath, function (err, paths) {
        expect(err).to.be.eql(null);
        expect(paths).to.be.instanceof(Array);
        done();
      });
    });
  });//context
});//describe

