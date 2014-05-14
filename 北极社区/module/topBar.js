/**
 * @filename topBar
 * @description
 * 作者: yixizhou(yixizhou@tencent.com)
 * 创建时间: 2014-04-09 14:56:03
 * 修改记录:
 *
 * $Id$
 **/

define('module/topBar', ['module/followSite'], function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge"; // yui 压缩配置，不混淆这三个变量
    var followSite = require('module/followSite');
    module.exports = {
        init: function() {
            // 关注
            jq('#followButton').on('click', function() {
                var thisObj = jq(this);
                followSite.followSite.call(thisObj, 'site_index');
            });

            var re = /^http(s)?:\/\/((mq|wx)\.wsq\.qq\.com)(\/.*)*/;
            var qqReg= /^http(s)?:\/\/(([^\/\.]+\.)*)?(qq|qzone)\.com(\/.*)*$/;
            // 看帖页后退按纽
            jq('#goback').on('click', function() {
                if (isForceReload == 1) {
                    if (!sId && isWX) {
                        return false;
                    }
                    if (!sId && isMQ) {
                        jq.DIC.showLoading(null, null, true);
                        jq.DIC.reload('/my/sites');
                        return false;
                    }
                    jq.DIC.showLoading(null, null, true);
                    jq.DIC.reload('/' + sId);
                } else {
                    if (qqReg.test(document.referrer)) {
                        history.go(-1);
                    } else {
                        if (!sId) {
                            return false;
                        }
                        if (isMQ) {
                            jq.DIC.showLoading(null, null, true);
                            jq.DIC.reload('/portal');
                            return false;
                        }
                        jq.DIC.showLoading(null, null, true);
                        jq.DIC.reload('/' + sId);
                    }
                }
            });

            jq('#mqOption').on('click', function() {
                var html = template.render('optionMenu', {'inviteUrl': inviteUrl, 'sId': sId, 'isLiked': isLiked, 'isWX': isWX, 'isMQ': isMQ, 'newMsgCount': newMsgCount});
                var opts = {
                    'id': 'optionMenu',
                    'isHtml':true,
                    'isMask':true,
                    'content':html,
                    'callback': function() {
                        jq('.g-mask,.manageLayer').on('click', function(e) {
                            jq.DIC.dialog({id:'optionMenu'});
                        });

                        jq.DIC.touchState('#optionLayer li', 'on');
                    }
                };
                jq.DIC.dialog(opts);
            });
//            jq.DIC.touchState('#mqOption');
        }

    };
    module.exports.init();
});
