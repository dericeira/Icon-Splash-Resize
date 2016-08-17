//init
var fs = require('fs')
  , gm = require('gm')
  , async = require('async');


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
const icon = gm('resources/icon.png');
const splash = gm('resources/splash.png');

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


// the script will resize and remove EXIF profile data

async.series([
	function(callback) {
		if (!fs.existsSync('resources/icon.png')) {
		    console.log("ERROR: Missing 'icon.png' file in resources folder.");
		}
		else if (!fs.existsSync('resources/splash.png')) {
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
	}
],
// optional callback
function(err, results) {
    console.log("\nDone!");
});