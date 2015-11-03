# remove-ps-dir [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> A module to remove directory&#39;s that are named after their process id.  
I created this module while needing a clean way for the clustered node processes to have a dedicated directory, but also have some clean up happen once they died.


## Install

```sh
$ npm install --save remove-ps-dir
```


## Usage

```js
var ps = require('remove-ps-dir');

// A valid path to a folder I want to remove dead
// workers usually a temp folder
ps.remove('/tmp', function(err,removedPaths){
  if (err) {
    return err;
  }
});

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
