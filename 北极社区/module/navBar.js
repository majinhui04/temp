/**
 * @filename navBar
 * @description
 * 作者: vissong(vissong@tencent.com)
 * 创建时间: 2013-6-5 14:56:03
 * 修改记录:
 *
 * $Id: viewthread.js 21874 2013-09-11 07:55:29Z danvinhe $
 **/

define('module/navBar', ['module/followSite'], function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge"; // yui 压缩配置，不混淆这三个变量
    var followSite = require('module/followSite');
    module.exports = {
        init: function() {
            if(jq('.bNav')) {
                jq('.bNav').slideDown();
            }

            // 关注
            jq('#followButton').on('click', function() {
                if (!isAppBar || !authUrl) {
                    var thisObj = jq(this);
                    followSite.followSite.call(thisObj, 'site_index');
                }
            });

            // 应用宝逻辑
            var reapp = /qqdownloader\/([^\s]+)/i,
                re = /^http(s)?:\/\/(([^\/\.]+\.)*)?(qq|qzone)\.com(\/.*)*$/,
                isAppBar = reapp.test(navigator.userAgent);
            if (isAppBar && !re.test(document.referrer)) {
                jq('#goback').hide();
            }

            // 邀请
            jq('.inviteQQ').on('click', function() {
                if (inviteUrl.length > 1) {
                    inviteUrl = inviteUrl.replace(/&amp;/g, '&');
                    jq.DIC.reload(inviteUrl);
                }
            });

            // 看帖页后退按纽
            jq('#goback').on('click', function() {
                if (typeof(WeixinJSBridge) != 'undefined') {
                    WeixinJSBridge.call('showOptionMenu');
                }
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
                    if (re.test(document.referrer)) {
                        history.go(-1);
                    } else {
                        if (!sId && isWX) {
                            return false;
                        }
                        if (isMQ) {
                            jq.DIC.goBack();
//                            jq.DIC.showLoading(null, null, true);
//                            jq.DIC.reload('/my/sites');
                            return false;
                        }
                        jq.DIC.showLoading(null, null, true);
                        jq.DIC.reload('/' + sId);
                    }
                }
            });

            jq('#mqOption').on('click', function(){
                var html = template.render('optionMenu', {'inviteUrl': inviteUrl, 'sId': sId, 'isLiked': isLiked, 'isWX': isWX, 'isMQ': isMQ, 'newMsgCount': newMsgCount});
                var opts = {
                    'id': 'optionMenu',
                    'isHtml':true,
                    'isMask':true,
                    'content':html,
                    'callback': function() {

                        // 应用吧隐藏menu
                        if (isAppBar) {
                            jq('.manageLayer li').hide();
                            jq('.manageLayer li #myMessage').parent().show();
                            jq('.manageLayer li #siteManager').parent().show();
                            jq('.manageLayer li #siteManager').text('应用吧管理');
                        }

                        jq('.g-mask,.manageLayer').on('click', function(e) {
                            jq.DIC.dialog({id:'optionMenu'});
                        });

                        jq.DIC.touchState('#optionLayer li', 'on');
                    }
                };
                jq.DIC.dialog(opts);
            });
            jq.DIC.touchState('#mqOption');
        }
    };
    module.exports.init();
});
