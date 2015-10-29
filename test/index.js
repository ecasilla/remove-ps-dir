'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');
var RemovePsDir = require('../lib');
var removePsDir = RemovePsDir();

describe('remove-ps-dir', function () {
  context('Interface', function () {
    it('RemovePsDir should be a object', function (){
      expect(RemovePsDir()).to.be.an('object');
    });
    it('should be an instance of a RemovePsDir object', function (){
      expect(removePsDir).to.be.instanceof(RemovePsDir);
    });
    it('should have a private remove fn', function(){
      expect(removePsDir.remove).to.be.an('function');
    });
    it('should have a private gatekeeper fn', function(){
      expect(removePsDir.__gateKeeper).to.be.an('function');
    });
    it('should have a private getPsDir fn', function(){
      expect(removePsDir.__getPsDir).to.be.an('function');
    });
    it('should have a private Filter Paths fn', function(){
      expect(removePsDir.__filterPaths).to.be.an('function');
    });
    it('should have a private Map fn', function(){
      expect(removePsDir.__map).to.be.an('function');
    });
    it('should have a private Running Processes fn', function(){
      expect(removePsDir.__runningProcess).to.be.an('function');
    });
  });
  context('Implementation',function() {
    it('should guard against bad args being passed by calling the gatekeeper', function(){
      var spy = sinon.spy(removePsDir,'__gateKeeper');
      removePsDir.remove()
      expect(spy.called).to.eql(true);
    });
    it('should return an Error if path is not defined', function (){
      expect(removePsDir.__gateKeeper()).to.be.an.instanceof(Error);
    });
    it('should return an Error if a callback is not passed', function (){
      expect(removePsDir.__gateKeeper('',undefined)).to.be.an.instanceof(Error);
    });
    it('should return an a array of number only dirs for a given file path', function(){
       var root = process.cwd();
       expect(removePsDir.__getPsDir(root + '/test/fixtures/tmp')).to.eql(['12345','66609']);
    });
  });
});
