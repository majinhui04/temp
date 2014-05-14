define('module/gps', [], function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge"; // yui 压缩配置，不混淆这三个变量
    module.exports =  {
        getLocation: function(callback) {

            if (typeof callback != 'function') {
                callback = function(latitude, longitude) {
                    console.log([latitude, longitude]);
                }
            }

            mqq.sensor.getLocation(function(retCode, latitude, longitude) {
                if (retCode == 0) {
                    callback(latitude, longitude);
                } else {
                    var gps = navigator.geolocation;

                    if (!gps) {
                        console.log('not support gps');
                        callback(undefined, undefined);
                        return false;
                    }

                    // gps 感应器
                    gps.getCurrentPosition(
                        function(position) {
                            console.log(position);
                            if (position) {
                                callback(position.coords.latitude, position.coords.longitude);
                            } else {
                                console.log('position is null');
                                callback(undefined, undefined);
                            }
                        },
                        function(error) {
                            console.log('get gps info failed', error);
                            callback(undefined, undefined);
                        },
                        {maximumAge: 10000}
                    );

                }
            });
        }
    }
});
