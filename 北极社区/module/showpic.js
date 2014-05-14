/**
 * @filename showpic
 * @description
 * 作者: jeffjzhang(jeffjzhang@tencent.com)
 * 创建时间: 2013-6-5 14:56:03
 * 修改记录:
 *
 * $Id$
 **/

define('module/showpic', [], function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge"; // yui 压缩配置，不混淆这三个变量
    module.exports = {
        isLoadingNew: true,
        isLoading: false,
        isNoShowToTop: false,
        picTId: 0,
        isEnd: 0,
        nextStart: 0,
        order: '',
        initLazyload: function() {
            // 图片 lazyload
            jq('.warp img').lazyload({
                skip_invisible : false,
                threshold : 500
            });
        },
        initNav: function() {

            module.exports.order = jq.DIC.getQuery('order') || 'hot';
            module.exports.load(0, false);

            jq('#listHot').on('click', function() {
                module.exports.order = 'hot'
                module.exports.load(0, false);
            });
            jq('#listNew').on('click', function() {
                module.exports.order = 'new'
                module.exports.load(0, false);
            });
            jq('.topicTab a').on('click', function() {
                jq('.topicTab a').removeClass('on');
                jq(this).addClass('on');
            });
        },
        // load data,all in one
        load: function(start, action) {
            start = start || 0;
            action = action || '';

            if (start == 0) {
                jq('#showAll').hide();
                module.exports.isLoadingNew = true;
            }

            module.exports.isLoading = true;
            var url = DOMAIN + window.sId + '/v/' + module.exports.picTId
                + '?start=' + start + '&order=' + module.exports.order;
            var opts = {
                'beforeSend': function() {
                    switch(action) {
                        case 'pull':
                            jq('#refreshWait').show();
                            jq('#showAll').hide();
                            module.exports.isLoadingNew = true;
                            break;
                        case 'drag':
                            jq('#loadNext').show();
                            module.exports.isLoadingNew = true;
                            break;
                        default:
                            jq.DIC.showLoading();
                    }
                },
                'complete': function() {
                },
                'success': function(re) {
                    jq('#refreshWait').hide();
                    jq('#loadNext').hide();
                    jq.DIC.showLoading('none');
                    if (re.errCode == 0) {
                        module.exports.isEnd = re.data.isEnd;
                        module.exports.renderList(re, !start);
                    } else {
                        jq.DIC.dialog({content: '拉取数据失败，请重试', autoClose: true});
                    }
                    module.exports.isLoading = false;
                }
            };
            jq.DIC.ajax(url, '', opts);
        },
        // render data
        renderList: function(re, clear) {
            if (clear) {
                jq('.container #allThreadList').html('');
            }

            // 最后无数据不再加载
            if (jq.DIC.isObjectEmpty(re.data.threadList)) {
                module.exports.isLoadingNew = false;
                jq('#showAll').show();
                return false;
            }

            var tmpl = template.render('tmpl_thread', re.data);
            jq('.container #allThreadList').append(tmpl);
            module.exports.nextStart = re.data.nextStart;

            if (clear) {
                if (module.exports.order == 'hot') {
                    jq('.badge').show();
                } else {
                    jq('.badge').hide();
                }
            }
            module.exports.initLazyload();
        },
        init: function() {

//            window.isForceReload = 1;
            module.exports.picTId = window.picThreadTId;

            template.helper('isDOMExist', function (id) {
                if (jq('#' + id)[0]) {
                    return true;
                } else {
                    return false;
                }
            });

            module.exports.initNav();

            // 翻页相关
            var query = '';
            if (window.location.search.indexOf('?') !== -1) {
                query = window.location.search.replace(/\?/g, '&');
            }

            var level = /Android 4.0/.test(window.navigator.userAgent) ? -10 : -100;
            // 全屏触摸
            jq.DIC.initTouch({
                obj: jq('.warp')[0],
                end: function(e, offset) {
                    document.ontouchmove = function(e){ return true;}
                    var loadingObj = jq('#loadNext');
                    var loadingPos = jq('#loadNextPos');
                    // var loadingObjTop = loadingObj.offset().top + loadingObj.height() - jq(window).scrollTop();
                    var loadingObjTop = loadingPos.offset().top - document.body.scrollTop - window.screen.availHeight;
                    var readTIdsArr = [];
                    // 向上滑
                    if (offset.y > 10 && loadingObjTop <= 10 && module.exports.isLoadingNew && !module.exports.isLoading) {
                        module.exports.load(module.exports.nextStart, 'drag');
                    }
                    // 向下拉刷新
                    if (offset.y < level && document.body.scrollTop <= 0) {
                        module.exports.load(0, 'pull');
                    }
                }
            });

            // content && summary
            if (jq('.detailShow')[0].scrollHeight > 26) {
                jq('.detailShow a.incoA').show();
            }
            jq.DIC.touchState('.detailShow');
            jq('.detailShow').on('click', function() {
                var obj = jq(this);
                var aObj = obj.find('a');
                if (aObj.hasClass('iBtnOn1')) {
                    aObj.removeClass('iBtnOn1');
                    obj.css('height', '26px');
                    obj.removeClass('dsOn');
                } else {
                    aObj.addClass('iBtnOn1');
                    aObj.parent().css('height', 'auto');
                    obj.addClass('dsOn');
                }
            });

            // see one
            jq('.listShow').on('click', 'li', function() {
                var tId = jq(this).attr('_tId'),
                    url = DOMAIN + window.sId + '/v/' + module.exports.picTId + '/t/' + tId;
                jq.DIC.open(url);
            });

            // like
            jq.DIC.touchState('.like', 'incoBg', '.warp');
            jq('.listShow').on('click', '.like', function(e) {
                e.stopPropagation();
                if (module.exports.isEnd) {
                    jq.DIC.dialog({content: '活动已结束，请不要再顶了', autoClose: true});
                    return false;
                }

                var thisObj = jq(this);
                if(thisObj.children('i').attr('class') == 'praise') {
                    return;
                }
                var tId = thisObj.attr('tId'),
                    parentId = thisObj.attr('parentId');
                var opts = {
                    'success': function(result) {
                        if (result.errCode == 0 && result.data && result.data.likeNumber) {
                            thisObj.html('<i class="praise"></i>' + result.data.likeNumber);
                        }
                    },
                    'noShowLoading' : true,
                    'noMsg' : true
                }
                jq.DIC.ajax('/' + sId + '/like?tId=' + tId + '&parentId=' + parentId, '', opts);
            });

            // 微信分享
            require.async('module/wxshare', function(wxshare) {
                // 分享图片
                var shareImg, content;
                if (jq('.showImg img')[0]) {
                    shareImg = jq('.showImg img').first().attr('data-original');
                } else {
                    shareImg = siteLogo;
                }
                // 分享内容
                content = jq.DIC.trim(jq('.detailShow').text());
                var shareDesc = content.substr(0, content.indexOf('。') + 1);
                if (jq.DIC.mb_strlen(shareDesc) < 60 || jq.DIC.mb_strlen(shareDesc) > 105) {
                    shareDesc = jq.DIC.mb_cutstr(content, 105);
                }
                wxshare.initWXShare({
                    'sId': sId,
                    'tId': tId,
                    'img': shareImg,
                    'desc': shareDesc,
                    'title': jq(document).attr('title')
                });
            });
        }
    };
    module.exports.init();
});
