define('module/common', [], function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge"; // yui 压缩配置，不混淆这三个变量
    require('lib/fastclick');
    module.exports = {
        init: function() {
            // 回到顶部
            setInterval(function() {
                if (window.pageYOffset > 500 && !window.isNoShowToTop) {
                    jq('#goTop').show();
                } else {
                    jq('#goTop').hide();
                }
            }, 300);
            jq('.upBtn').on('click', function() {
                scroll(0,0);
            });

            if (isNullNick) {
                jq.DIC.dialog({content:'对不起，暂不支持纯表情昵称登录，请调整微信昵称后登录', autoClose:false});
            }
        }
    };
    module.exports.init();
});

