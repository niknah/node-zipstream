
function testHash(test,zip,expectedHash,callback) {
  var crypto = require('crypto');
  var hash = crypto.createHash('sha1');
  zip.on('data', function(data) {
    hash.update(data);
  });

  zip.on('end', function() {
    var digest = hash.digest('hex');
    test.equals(digest, expectedHash, 'data hex values should match.');
    callback();
  });
}

 

// For testing with external zip program.
function pipeToFile(zip) {
  var fs=require('fs');
  zip.pipe(fs.createWriteStream('/tmp/zipstream_test.zip'));
}



module.exports = {
  buffer: function(test) {
    test.expect(1);

    var zipstream = require('../zipstream');

    var zip = zipstream.createZip({level: 1});

    // create a buffer and fill it
    var buf = new Buffer(20000);

    for (var i = 0; i < 20000; i++) {
      buf.writeUInt8(i&255, i);
    }

    zip.addFile(buf, {name: 'buffer.out', date: new Date('April 13, 2011 UTC')}, function() {
      zip.finalize();
    });

    testHash(test,zip, 'a3d400024a4b52707dab49a90eb2e87f17482012',function() {
      test.done();
    });
  },

  string: function(test) {
    test.expect(2);
    var zipstream = require('../zipstream');
    var zip = zipstream.createZip({});
    testHash(test,zip, 'd3a75ebe0bdf6b200c622a57c05f668a73251c76',function() { });
    // dates before 1980 will be set to 1980
    zip.addFile("string test", {name: 'buffer.out', date: new Date('April 13, 1979 UTC')}, function() {
      zip.finalize(function() {
        test.ok(true);
        test.done();
      });
    });
  },
  noFiles: function(test) {
    var zipstream = require('../zipstream');
    var zip = zipstream.createZip({});
    zip.on('error',function(e) {
      test.ok(e.toString().indexOf('no files')>=0);
      test.done();
    });
    zip.finalize();
  },
  errorNotFinished: function(test) {
    var zipstream = require('../zipstream');
    var zip = zipstream.createZip({});
    zip.addFile("string test1", {name: 'buffer.out', date: new Date('April 13, 2011 UTC')}, function() {
    });
    zip.on('error',function(e) {
      test.ok(e.toString().indexOf('not finished')>=0);
      test.done();
    });

    zip.addFile("string test2", {name: 'buffer.out', date: new Date('April 13, 2011 UTC')}, function() {
    });
  },
  pauseResume: function(test) {
    test.expect(2);
    var stream = require('stream');
    var zipstream = require('../zipstream');

    var zip = zipstream.createZip({});

    var slowStream=new stream.Stream();
    var slowDataCount=0;
    function slowData() {
      if(slowDataCount==3 || slowDataCount==7) zip.pause();
      if(slowDataCount==9 || slowDataCount==5) zip.resume();
      if(slowDataCount++<10) {
        setTimeout(function() {
          slowStream.emit('data',new Buffer('qwerty'+slowDataCount));
          slowData();
        },50);
      } else {
        slowStream.emit('end');
      }
    }

    pipeToFile(zip);
    testHash(test,zip, '677897ba171d0b6eacce3e1c6f26a38fbefdea6d',function() { });
    zip.addFile(slowStream,{name:'test', date: new Date('April 13, 2011 UTC')},function() {
      zip.finalize(function() {
        test.ok(true);
        test.done();
      });
    });
    slowData();
  },
  store: function(test) {
    test.expect(1);

    var zipstream = require('../zipstream');

    var zip = zipstream.createZip({level: 1});

    // create a buffer and fill it
    var buf = new Buffer(20000);

    for (var i = 0; i < 20000; i++) {
      buf.writeUInt8(i&255, i);
    }

    testHash(test,zip, 'a8e0cd2ac80d7c66363fb5322179df144cfcb4be',function() {
      test.done();
    });
    zip.addFile(buf, {name: 'buffer.out', date: new Date('April 13, 2011 UTC'), store: true}, function() {
      var stream = require('stream');
      var tstream=new stream.Stream();
      zip.addFile(tstream, {name: 'buffer.out', date: new Date('April 13, 2011 UTC'), store: true}, function() {
        zip.finalize();
      });
      tstream.emit('data',new Buffer('qwerty'));
      tstream.emit('end');
    });
  }
};
