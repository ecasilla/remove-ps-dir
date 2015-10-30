'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');
var fs = require('fs');
var RemovePsDir = require('../lib');

describe('remove-ps-dir', function () {
  context('Interface', function () {
    it('RemovePsDir should be a object', function (){
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
      var spy = sinon.spy(RemovePsDir, '__gateKeeper');
      RemovePsDir.remove();
      expect(spy.called).to.eql(true);
    });
    it('should return an Error if path is not defined', function (){
      expect(RemovePsDir.__gateKeeper()).to.be.an.instanceof(Error);
    });
    it('should return an Error if a callback is not passed', function (){
      expect(RemovePsDir.__gateKeeper('', undefined)).to.be.an.instanceof(Error);
    });
    it('should ignore char named directorys', function (){
       var root = process.cwd();
       expect(RemovePsDir.__getPsDir(root + '/test/fixtures/tmp')).to.not.include(['helloo']);
    });
    it('should remove directorys', function (done){
      fs.mkdirSync(process.cwd() + '/test/fixtures/tmp/55555');
      RemovePsDir.remove(process.cwd() + '/test/fixtures/tmp',function(err) {
        expect(err).to.eql(null);
      });
  });
});
