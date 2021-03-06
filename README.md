# zipstream-ctalkington

Creates ZIP output streams. Depends on Node's build-in zlib module for compression available since version 0.6.

*This is a fork of the original repo meant to resolve several issues and hopefully more active development.*

## Install
    npm install zipstream-ctalkington

## API
    createZip(options)

Creates a ZipStream object. Options are passed to Zlib.

    ZipStream.addFile(inputStream, options, callback)

Adds a file to the ZIP stream. At this moment, options must contain "name". If the "store" option is set to true, the file will be added uncompressed.

    ZipStream.finalize(callback(bytes written))

Finalizes the ZIP. When everything is done, callback is called with the total number of bytes in the ZIP archive.

## Example
```javascript
var fs = require('fs');

var zipstream = require('zipstream-ctalkington');

var out = fs.createWriteStream('out.zip');
var zip = zipstream.createZip({ level: 1 });

zip.pipe(out);

zip.addFile(fs.createReadStream('file1.js'), { name: 'file1.js' }, function() {
  zip.addFile(fs.createReadStream('file2.js'), { name: 'file2.js' }, function() {
    zip.finalize(function(written) { console.log(written + ' total bytes written'); });
  });
});
```

## Contributing

#### Code Style Guide

* code should be indented with 2 spaces
* single quotes should be used where feasible
* commas should be followed by a single space (function params, etc)
* variable declaration should include `var`, [no multiple declarations](http://benalman.com/news/2012/05/multiple-var-statements-javascript/)

#### Tests

* tests should be added to the nodeunit config in `test/tests.js`
* tests can be run with `npm test`
* see existing tests for guidance

## Credits
Originally written by Antoine van Wel ([website](http://wellawaretech.com)).