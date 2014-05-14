/**
 * @filename portal
 * @description
 * 作者: yixizhou(yixizhou@tencent.com)
 * 创建时间: 2014-04-08 11:56:03
 * 修改记录:
 *
 * $Id$
 **/
define('module/portal', ['module/gps', 'module/followSite'], function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge"; // yui 压缩配置，不混淆这三个变量
    var gps = require('module/gps');
    module.exports = {
        init: function() {
//            jq.DIC.dialog({'content':'正在加载', 'id':'waitForLoad'});

            // 检查地理信息
            gps.getLocation(function(latitude, longitude) {
                jq.DIC.ajax('/checkcity', {
                    'CSRFToken' : CSRFToken,
                    'latitude' : latitude,
                    'longitude' : longitude
                }, {
                    'noShowLoading' : true,
                    'noMsg': true,
                    'success' : function(re) {
                    }
                });
            });

            jq('.topicTab a').on('click', function() {
                if (!jq('#loading').is(':visible')) {
                    jq.DIC.dialog({'content':'正在加载', 'id':'waitForLoad'});
                }
                // tab 切换
                jq('.topicTab a').removeClass('on');
                var thisObj = jq(this);
                thisObj.addClass('on');

                // 不同模块调用
                var qzModule = thisObj.attr('data-module') || 'MySites';
                var rQzModule = 'module/portal' + qzModule;
                window.location.hash = 'm=' + qzModule;
                require.async(rQzModule, function(m) {
                    jq('#loading').hide();
                    jq.DIC.dialog({'id':'waitForLoad'});
                    m.init(qzModule);
                    // 显隐不同模块div
                    jq('.interestBox').hide();
                    jq('.container').hide();
                    jq('.interestBox').html();
                    jq.DIC.dialog({'id':'waitForLoad'});
                    jq('#' + qzModule).show();
                });
            });

            // 简单处理hash标识页面 返回时显示对应页面
            var hash = window.location.hash.substr(1).split('=');
            var m = hash[1] || 'MySites';
            jq('.topicTab a[data-module="' + m + '"]').click();
        }
    };
    module.exports.init();
});
