'use strict';

var expect = require('chai').expect;
var removePsDir = require('../lib');

describe('remove-ps-dir', function () {
  context('Interface', function () {
    it('should be an object', function (){
      expect(removePsDir).to.be.an('object');
    });
  });
});
