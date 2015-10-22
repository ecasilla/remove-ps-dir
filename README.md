# remove-ps-dir [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> A module to remove directory&#39;s that are named after their process id


## Install

```sh
$ npm install --save remove-ps-dir
```


## Usage

```js
var removePsDir = require('remove-ps-dir');

removePsDir(options, function(err){
 if(err) return err;
});

options: 
 path: '/tmp', //Or what ever directory path you like
 tree: true //defaults to false but if you would like the return process tree
```

## License

MIT © [Ernie Casilla](www.erniecasilla.com)


[npm-image]: https://badge.fury.io/js/remove-ps-dir.svg
[npm-url]: https://npmjs.org/package/remove-ps-dir
[travis-image]: https://travis-ci.org/ecasilla/remove-ps-dir.svg?branch=master
[travis-url]: https://travis-ci.org/ecasilla/remove-ps-dir
[daviddm-image]: https://david-dm.org/ecasilla/remove-ps-dir.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/ecasilla/remove-ps-dir
[coveralls-image]: https://coveralls.io/repos/ecasilla/remove-ps-dir/badge.svg
[coveralls-url]: https://coveralls.io/r/ecasilla/remove-ps-dir
