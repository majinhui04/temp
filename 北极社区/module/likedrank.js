/**
 * @filename viewthread
 * @description
 * 作者: jeffjzhang(jeffjzhang@tencent.com)
 * 创建时间: 2013-6-5 14:56:03
 * 修改记录:
 *
 * $Id$
 **/

define('module/likedrank', [], function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge"; // yui 压缩配置，不混淆这三个变量
    module.exports = {
        init: function() {
            module.exports.initShareBtn();
            // 分享图片
            var shareImg = siteLogo;
            // 分享内容
            var content = jq('meta[name="description"]').attr('content');
            var shareDesc = content.substr(0, content.indexOf('。') + 1);
            if (jq.DIC.mb_strlen(shareDesc) < 60 || jq.DIC.mb_strlen(shareDesc) > 105) {
                shareDesc = jq.DIC.mb_cutstr(content, 105);
            }

            module.exports.initWXShare({
                'sId': sId,
                'img': shareImg,
                'desc': shareDesc,
                'title': jq(document).attr('title')
            });

            jq('.header').on('click', function() {
                jq.DIC.reload('/' + sId);
            });
            // user redirect
            jq('.rankBox dd').on('click', function() {
                var uId = jq(this).attr('_uId'),
                    url = DOMAIN + 'my/thread?uId=' + uId;
                jq.DIC.reload(url);
            });
        },

        bindWXMenu: function(opts) {
            WeixinJSBridge.on('menu:share:appmessage', function(argv){
                var url = opts.url;
                url = url.replace(/\&source\=[^\&]+/g, '') + '&source=appmessage';
                WeixinJSBridge.invoke('sendAppMessage',{
                    'appid': module.exports.appId,
                    'img_url': opts.img,
                    'img_width': opts.width || '120',
                    'img_height': opts.height || '120',
                    'link': url,
                    'desc': opts.desc,
                    'title': opts.title
                }, function(res){(opts.callback)();});

                module.exports.reportShareStat('appmessage');
            });
            WeixinJSBridge.on('menu:share:timeline', function(argv){
                var url = opts.url;
                url = url.replace(/\&source\=[^\&]+/g, '') + '&source=timeline';
//                (dataForWeixin.callback)();
                WeixinJSBridge.invoke('shareTimeline',{
                    'img_url': opts.img,
                    'img_width': opts.width || '120',
                    'img_height': opts.height || '120',
                    'link': url,
                    'desc': opts.desc,
                    'title': opts.desc
                }, function(res){(opts.callback)();});

                module.exports.reportShareStat('timeline');
            });
            WeixinJSBridge.on('menu:share:weibo', function(argv){
                var url = opts.url;
                url = DOMAIN + 'reflow/' + opts.sId;
                if (opts.tId) {
                    url += '-' + opts.tId;
                }
                url += '?'
                url = url.replace(/\&source\=[^\&]+/g, '') + '&source=weibo';
                WeixinJSBridge.invoke('shareWeibo',{
                    'img_url': opts.img,
                    'img_width': opts.width || '120',
                    'img_height': opts.height || '120',
                    'link': url,
                    'url': url,
                    'content': opts.desc,
                    'desc': opts.desc,
                    'title': opts.title
                }, function(res){(opts.callback)();});

                module.exports.reportShareStat('weibo');
            });
            WeixinJSBridge.on('menu:share:facebook', function(argv){
                url = url.replace(/\&source=[^\&]+/g, '') + '&source=facebook';
                (dataForWeixin.callback)();
                WeixinJSBridge.invoke('shareFB',{
                    'img_url': opts.img,
                    'img_width': opts.width || '120',
                    'img_height': opts.height || '120',
                    'link': url,
                    'desc': opts.desc,
                    'title': opts.title
                }, function(res){(opts.callback)();});
            });
        },


        initWXShare: function(opts) {
            if (!isWX) {
                return false;
            }
            opts = opts || {};
            opts.url = opts.url || window.location.href;
            opts.url = opts.url.indexOf('?') === -1 ? opts.url + '?' : opts.url;
            opts.url = opts.url.replace(/\&?code\=[^\&]+/g, '');
            if (typeof WeixinJSBridge != 'undefined') {
                module.exports.bindWXMenu(opts);
            } else {
                jq(document).bind('WeixinJSBridgeReady', function() {
                    module.exports.bindWXMenu(opts);
                });
            }
        },

        initShareBtn: function () {
            jq('.showbtn').on('click', function() {
                var qqShareLink = jq(this).attr('_qq');
                var qzoneShareLink = jq(this).attr('_qzone');
                if (qqShareLink) {
                    var html = template.render('tmpl_share', {qqShareLink: qqShareLink, qzoneShareLink: qzoneShareLink});
                    jq.DIC.dialog({
                        id: 'share',
                        content: html,
                        isHtml: true,
                        isMask: true,
                        callback: function() {
                            jq('#fwin_mask_share, #cancleShare, .shareLayer a').on('click', function() {
                                jq.DIC.dialog({id: 'share'});
                            });
                        }
                    });
                }

                return true;
            });
        }
    };
    module.exports.init();
});
