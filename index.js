//init
var fs = require('fs')
  , gm = require('gm')
  , async = require('async')
	, path = require('path');


//iOS Icons
const ios_icon_info = {
	"icon-40.png": 40,
	"icon-40@2x.png": 80,
	"icon-40@3x.png": 120,
	"icon-50.png": 50,
	"icon-50@2x.png": 100,
	"icon-60.png": 60,
	"icon-60@2x.png": 120,
	"icon-60@3x.png": 180,
	"icon-72.png": 72,
	"icon-72@2x.png": 144,
	"icon-76@2x.png": 152,
	"icon-83.5@2x.png": 167,
	"icon-small.png": 29,
	"icon-small@2x.png": 58,
	"icon-small@3x.png": 87,
	"icon.png": 57,
	"icon@2x.png": 114
};
//Android Icons
const android_icon_info = {
	"drawable-hdpi-icon.png": 72,
	"drawable-ldpi-icon.png": 36,
	"drawable-mdpi-icon.png": 48,
	"drawable-xhdpi-icon.png": 96,
	"drawable-xxhdpi-icon.png": 144,
	"drawable-xxxhdpi-icon.png": 192
};

//iOS Splash Screen
const ios_splash_info = {
	"Default-568h@2x~iphone.png": [640,1136,0.42], //width,height,scale factor
	"Default-667h.png": [750,1334,0.50],
	"Default-736h.png": [1242,2208,0.81],
	"Default-Landscape-736h.png": [2208,1242,0.81],
	"Default-Landscape@2x~ipad.png": [2048,1536,0.80],
	"Default-Landscape~ipad.png": [1024,768,0.40],
	"Default-Portrait@2x~ipad.png": [1536,2048,0.80],
	"Default-Portrait~ipad.png": [768,1024,0.40],
	"Default@2x~iphone.png": [640,960,0.36],
	"Default~iphone.png": [320,480,0.18]
};
//Android Splash Screen
const android_splash_info = {
	"drawable-land-hdpi-screen.png": [800,480,0.30],
	"drawable-land-ldpi-screen.png": [320,240,0.12],
	"drawable-land-mdpi-screen.png": [480,320,0.18],
	"drawable-land-xhdpi-screen.png": [1280,720,0.50],
	"drawable-land-xxhdpi-screen.png": [1600,960,0.60],
	"drawable-land-xxxhdpi-screen.png": [1920,1280,0.71],
	"drawable-port-hdpi-screen.png": [480,800,0.32],
	"drawable-port-ldpi-screen.png": [240,320,0.12],
	"drawable-port-mdpi-screen.png": [320,480,0.18],
	"drawable-port-xhdpi-screen.png": [720,1280,0.50],
	"drawable-port-xxhdpi-screen.png": [960,1600,0.61],
	"drawable-port-xxxhdpi-screen.png": [1280,1920,0.71]
};





//Default icon
const icon = gm('../../resources/icon.png');
const splash = gm('../../resources/splash.png');

var splash_width; //splash screen source width
splash.size(function (err, size) {
  if (!err) {
    splash_width = size.width;
  }
});



//Object Size function
var objSize = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

/**
 * Read from one file and copy to destination if destination folder exists
 * @param {src} source file
 * @param {dest} destination file
 * @param {callback} async callback
 */
var copyFile = function (src, dest, next) {
		fs.readFile(src, function (err, data) {
			if (err) {
				console.error(err);
				return next(err);
			}

			if (fs.existsSync(dest)) {
				fs.unlinkSync(dest);
			}
			var dest_folder = path.dirname(dest);
			if (fs.existsSync(dest_folder)) {
				fs.writeFile(dest, data, function (err) {
					if (err) {
						console.error(err);
						return next(err);
					}
					console.log("Copied %s to %s", src, dest);

					next(null);
				});
			}else {
				console.log('%s will not be copied', src);
				next(null);
			}

		});


};

/**
 * Attempt to copy generated files to mipmap folders
 * @param {keys} generated assets
 * @param {src} source where generated assets are
 * @param {dest} destination folder
 * @param {callback} async callback
 */
var copyAndroidMipMap = function (keys, src, dest, callback) {
	var reg = /\-(\w+)\-(\w+)\.png$/;
	async.each(keys, function (key, next) {
		var idx = key.lastIndexOf('-');

		var sourceFile = src + '/' + key;

		var file = key.substring(idx + 1);

		var size = (reg.exec(key))[1];

		var dest_folder = dest + '/mipmap-' + size;

		var dest_file = dest_folder  + '/' + file;

		if (fs.existsSync(dest_folder)) {
			copyFile(sourceFile, dest_file, next);
		}else {
			next(null);
		}
	}, callback);
};


/**
* Distribute assets to correct android folders
* @param {keys} the keys of one of the android asset map above\
* @param {src} the source folder where generated asset should be found e.g './resources/android/icon' or './resources/android/splash'
* @param {dest} the root folder for android resources. For ionic projects the relative is usually '../../platforms/android/res'
* @param {copy_mipmap} if true then attempt is made to copy generated asset to appropriate mipmap folder
* @param {callback} callback method from async
* */
var distributeFrom = function (keys, src, dest, copy_mipmap, callback) {
	async.each(keys, function (key, next) {
		var idx = key.lastIndexOf('-');

		var sourceFile = src + '/' + key;

		var file = key.substring(idx + 1);

		var dest_folder = dest + '/' + key.substring(0, idx);

		var dest_file = dest_folder  + '/' + file;

		console.log("Reading from %s to store at %s", sourceFile, dest_file);

		copyFile(sourceFile, dest_file, next);
	}, function (err) {
		if (err) {
			return callback(err);
		}

		if (copy_mipmap) {
			return copyAndroidMipMap(keys, src, dest, callback);
		}

		callback(null);
	});


};


var distributeAndroidAssets = function (callback) {
	console.log('Distributing android assets...');
	var dest_path = '../../platforms/android/res';
	distributeFrom(Object.keys(android_icon_info), './resources/android/icon', dest_path, true, function (err) {
		if (!err) {
			distributeFrom(Object.keys(android_splash_info), './resources/android/splash', dest_path, false, callback);
		}else {
			callback(err);
		}
	});
};

var distributeIOSAssetsForProject = function (project, done) {
    console.log('Distributing iOS assets for project: \'%s\'...', project);
    var collection = [
      {
          assets: Object.keys(ios_splash_info),
          src : './resources/ios/splash',
          dest: '../../platforms/ios/' + project + '/Images.xcassets/LaunchImage.launchimage'
      }, {
        assets: Object.keys(ios_icon_info),
        src : './resources/ios/icon',
        dest: '../../platforms/ios/' + project + '/Images.xcassets/AppIcon.appiconset'
      }
    ];
    async.each(collection, function (info, next) {
      async.each(info.assets, function (asset, nextAsset) {
        var src = info.src + '/' + asset,
            dest = info.dest + '/' + asset;
        copyFile(src, dest, nextAsset);
      }, next);
    }, done);
};


var distributeIOSAssets = function (callback) {
  var parser = require('sax').createStream(true, {
    trim: true,
    lowercase: true,
    xmlns: false,
    position: false
  });

  var stream;

  // first parse and locate the project name so that we can guess what the project name xcode will use
  var tag_path = '', handled = false;

  parser.on('opentag', function (tag) {
    if (!handled) {
        tag_path += '/' + tag.name;
    }
  });

  parser.on('text', function (text) {
    if (!handled) {
      if ('/widget/name' == tag_path) {
          handled = true;
          if (stream) {
            try {
              stream.close();
            }catch(ex) {}
          }

          distributeIOSAssetsForProject(text, callback);
      }
    }
  });

  stream = fs.createReadStream('../../config.xml')
  .pipe(parser);

  stream.on('close', function () {
    if (!handled) {
      callback(new Error('Could not find project name in config'));
    }
  });
};


// the script will resize and remove EXIF profile data

async.series([
	function(callback) {
		if (!fs.existsSync('../../resources/icon.png')) {
		    console.log("ERROR: Missing 'icon.png' file in resources folder.");
		}
		else if (!fs.existsSync('../../resources/splash.png')) {
		    console.log("ERROR: Missing 'splash.png' file in resources folder.");
		}
		else {
			callback(null,"SOURCE CHECK");
		}
	},
	function(callback) {
		if ((!fs.existsSync('resources/android/icon')) || (!fs.existsSync('resources/android/splash')) || (!fs.existsSync('resources/ios/icon')) || (!fs.existsSync('resources/ios/splash'))) {
		    console.log("ERROR: Missing 'resources' folder tree.");
		}
		else {
			callback(null,"FOLDER CHECK");
		}
	},
    function(callback) {
    	console.log("Generating iOS Icons");
		var keys = Object.keys(ios_icon_info);
		var ic = 0;
		async.whilst(function () {
		  return ic < objSize(ios_icon_info);
		},
		function (next) {
			var key = keys[ic];
			icon
			.resize(ios_icon_info[key], ios_icon_info[key])
			.noProfile()
			.write('resources/ios/icon/' + key, function (err) {
			  console.log("...Saving " + key);
			  ic++;
		 	  next();
			  if (err) console.log(err);
			});
		},
		function (err) {
		  callback(null, 'ICON IOS');
		});
    },
    function(callback) {
	    console.log("\nGenerating Android Icons");
		var keys = Object.keys(android_icon_info);
		var ic = 0;
		async.whilst(function () {
		  return ic < objSize(android_icon_info);
		},
		function (next) {
			var key = keys[ic];
			icon
			.resize(android_icon_info[key], android_icon_info[key])
			.noProfile()
			.write('resources/android/icon/' + key, function (err) {
			  console.log("...Saving " + key);
			  ic++;
		 	  next();
			  if (err) console.log(err);
			});
		},
		function (err) {
		  callback(null, 'ICON ANDROID');
		});
	},
	function(callback) {
		console.log("\nGenerating iOS Splash Screens");
		var keys = Object.keys(ios_splash_info);
		var ic = 0;
		async.whilst(function () {
		  return ic < objSize(ios_splash_info);
		},
		function (next) {
			var key = keys[ic];
		  	var sw = ios_splash_info[key][2] * splash_width;
			splash
			.resize(sw,sw)
			.gravity("Center")
			.crop(ios_splash_info[key][0],ios_splash_info[key][1],0,0)
			.noProfile()
			.write('resources/ios/splash/' + key, function (err) {
			  console.log("...Saving " + key);
			  ic++;
		 	  next();
			  if (err) console.log(err);
			});
		},
		function (err) {
		  callback(null, 'SPLASH IOS');
		});
	},
	function(callback) {
		console.log("\nGenerating Android Splash Screens");
		var keys = Object.keys(android_splash_info);
		var ic = 0;
		async.whilst(function () {
		  return ic < objSize(android_splash_info);
		},
		function (next) {
			var key = keys[ic];
		  	var sw = android_splash_info[key][2] * splash_width;
			splash
			.resize(sw,sw)
			.gravity("Center")
			.crop(android_splash_info[key][0],android_splash_info[key][1],0,0)
			.noProfile()
			.write('resources/android/splash/' + key, function (err) {
			  console.log("...Saving " + key);
			  ic++;
		 	  next();
			  if (err) console.log(err);
			});
		},
		function (err) {
		  callback(null, 'SPLASH ANDROID');
		});
	},
	distributeAndroidAssets,
  distributeIOSAssets
],
// optional callback
function(err, results) {
    console.log("\nDone!");
});
