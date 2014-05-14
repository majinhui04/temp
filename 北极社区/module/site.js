/**
 * @filename viewthread
 * @description
 * 作者: vissong(vissong@tencent.com)
 * 创建时间: 2013-6-5 14:56:03
 * 修改记录:
 *
 * $Id: viewthread.js 21874 2013-09-11 07:55:29Z danvinhe $
 **/

define('module/site', ['lib/scroll'], function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge"; // yui 压缩配置，不混淆这三个变量
    var libScroll = require('lib/scroll');
    module.exports = {
        reply: '',
        appId: 'wx9324b266aa4818d0',
        reportShareStat: function(shareTo) {
            if (!shareTo) {
                return false;
            }

            var url = '/' + sId + '/share?isAjax=1&resType=json';
            var data = {
                'tId': tId,
                'CSRFToken': CSRFToken,
                'shareTo': shareTo,
            };

            jq.DIC.ajax(url, data);
        },
        deleteThread: function(tId) {
            var opts = {
                'id':'opertionConfirm',
                'isMask':true,
                'content':'确定删除吗？',
                'okValue':'确定',
                'cancelValue':'取消',
                'ok':function() {
                    jq('#delThreadForm').attr('action', jq('#delThreadForm').attr('path') + '?t=' + Date.now());
                    jq('#delThreadForm [name="tIds[]"]').val(tId);
                    var opt = {
                        success:function(re) {
                            jq.DIC.dialog({id:'operationMenu'});
                            var status = parseInt(re.errCode);
                            if(status == 0) {
                                jq("#t_" + tId).remove();
                            }
                        },
                        'noJump':true
                    };
                    jq.DIC.ajaxForm('delThreadForm', opt, true);
                }
            };
            jq.DIC.dialog(opts);
        },
        banUser: function(uId, author) {
             var content = '确认将“'+author+'”禁言吗';
             var opts = {
                 'id':'opertionConfirm',
                 'isMask':true,
                 'content':content,
                 'okValue':'确定',
                 'cancelValue':'取消',
                 'ok':function() {
                     jq('#banUserForm').attr('action', jq('#banUserForm').attr('path') + '?t=' + Date.now());
                     jq('#banUserForm [name="uId"]').val(uId);
                     var opt = {
                         success:function(re) {
                             jq.DIC.dialog({id:'operationMenu'});
                             var status = parseInt(re.errCode);
                             if(status == 0) {
                                 //todo del list
                             }
                         },
                         'noJump':true
                     };
                     jq.DIC.ajaxForm('banUserForm', opt, true);
                 }
             };
             jq.DIC.dialog(opts);
        },
        cleanPost: function(uId, author) {
             var content = '确认清理“'+author+'”的所有帖子吗';
             var opts = {
                 'id':'opertionConfirm',
                 'isMask':true,
                 'content':content,
                 'okValue':'确定',
                 'cancelValue':'取消',
                 'ok':function() {
                     jq('#cleanPostForm').attr('action', jq('#cleanPostForm').attr('path') + '?t=' + Date.now());
                     jq('#cleanPostForm [name="uId"]').val(uId);
                     var opt = {
                         success:function(re) {
                             jq.DIC.dialog({id:'operationMenu'});
                             var status = parseInt(re.errCode);
                             if(status == 0) {
                                 //todo del list
                             }
                         },
                         'noJump':true
                     };
                     jq.DIC.ajaxForm('cleanPostForm', opt, true);
                 }
             };
             jq.DIC.dialog(opts);
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
        foldSwith: function(e) {
            var text = jq(this).html();
            var height = '', returnTop = false;
            if (text == '收起') {
                returnTop = true;
                height = '150px';
                text = '全文';
            } else {
                height = 'none';
                text = '收起';
            }
            jq(this).parent().find('p').css('max-height', height);
            jq(this).html(text);
            // 收起的时候，回文章处
            if (returnTop) {
                scroll(0, jq(this).parent().parent().parent().position().top);
            }
        },
        initViewBtn: function() {
            jq('.detailCon').each(function(e) {
                if (jq(this).find('p')[0]) {
                    if (jq(this).find('p')[0].scrollHeight > 165) {
                        jq(this).find('.viewBtn').show();
                    }
                }
            });
        },
        initShareBtn: function () {
            jq('.warp').on('click', '.shareBtn', function() {
                var qqShareLink = jq(this).attr('_qq');
                var qzoneShareLink = jq(this).attr('_qzone');
                // 存在链接 接管默认按纽点击
                if (qqShareLink || qzoneShareLink) {
                    if (qqShareLink && qzoneShareLink) {
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
                    } else {
                        var jumpUrl = qqShareLink || qzoneShareLink;
                        jq.DIC.reload(jumpUrl);
                    }
                    return false;
                }
                return true;
            });
        },
        // 初始化滚动图片，如果宽度小于滚动宽度则不显示张数
        initScrollImage :function() {
            jq('.slideBox').each(function(e) {
                var liArray = jq(this).find('li');
                var liWidth = 0;
                for (var i = 0; i< liArray.length; i++) {
                    liWidth += jq(liArray[i]).width();
                }
                // console.log(liWidth);
                // console.log(liWidth, jq(this).width());
                if (jq(this).width() < liWidth) {
                    jq(this).find('.pageNum').show();
                }
            });
        },
        checkReplyForm: function() {
            var content = jq('textarea[name="content"]').val();
            var contentLen = jq.DIC.mb_strlen(jq.DIC.trim(content));
            if (contentLen <= 0) {
                jq.DIC.dialog({content:'回复内容不能为空', autoClose:true});
                return false;
            }

            return true;
        },
        isLoadingNew: true,
        isNoShowToTop: false,
        initLazyload: function() {
            // 图片 lazyload
            jq('.warp img').lazyload({
                skip_invisible : false,
                threshold : 500
            });
        },
        getThreadList: function() {
            var query = '';
            if (window.location.search.indexOf('?') !== -1) {
                query = window.location.search.replace(/\?/g, '&');
            }

            isLoading = true;
            // jq.DIC.reload();
            var url = '/' + sId + '?start=0' + query;
            if (isLive) {
                var url = '/' + sId + '?start=0&live=1' + query;
            }
            // 详情页不需要下拉刷新
            if (tId) {
                return false;
            }
            var opts = {
                'beforeSend': function() {
                    if (!jq('#waitForLoad').is(':visible')) {
                        jq('#refreshWait').show();
                    }
                    jq('#showAll').hide();
                    module.exports.isLoadingNew = true;
                },
                'complete': function() {
                    jq('#waitForLoad').hide();
                    jq('#refreshWait').hide();
                },
                'success': function(re) {
                    var status = parseInt(re.errCode);
                    if (status == 0) {
                        // 先把内容清空，否则主题已经存在就不渲染模板
                        jq('.container #allThreadList').html('');
                        re.data.isLive = isLive || 0;
                        var tmpl = template.render('tmpl_thread', re.data);
                        // console.log(tmpl);
                        jq('.container #allThreadList').html(tmpl);
                        window.nextStart = nextStart = re.data.nextStart;

                        if (re.data.newMsgCount > 0) {
                            newMsgCount = re.data.newMsgCount;
                            if (re.data.newMsgCount > 99) {
                                jq('#navMsgNum').html('');
                                jq('#navMsgNum').addClass('redP');
                            } else {
                                jq('#navMsgNum').removeClass('redP');
                                jq('#navMsgNum').html(re.data.newMsgCount);
                            }
                            jq('#navMsgNum').show();
                        } else {
                            jq('#newMsgCount').html(0);
                            jq('#navMsgNum').hide();
                        }

                        if (re.data.threadCount >= 0) {
                            jq('#threadCount').html(re.data.threadCount);
                        }

                        if (re.data.sitePv >= 1) {
                            jq('#sitePv').html(re.data.sitePv);
                        }
                        // console.log(nextStart);
                        module.exports.initViewBtn();
                        // 图片张数初始化
                        module.exports.initScrollImage();
                    }
                    module.exports.initLazyload();
                    isLoading = false;
                },
                error: function() {
                    isLoading = false;
                }
            };
            jq.DIC.ajax(url, '', opts);
        },
        init: function(nextStart, tId) {
//            module.exports.getThreadList();

            module.exports.initShareBtn();
            // 分享图片
            var shareImg = siteLogo;
            if (tId && jq('.detailCon img:not(.expimg)')[0]) {
                shareImg = jq('.detailCon img:not(.expimg)')[0].src;
            }
            // 分享内容
            var content = jq('meta[name="description"]').attr('content');
            if (tId) {
                content = jq.DIC.trim(jq('.detailCon p').text());
            }
            var shareDesc = content.substr(0, content.indexOf('。') + 1);
            if (jq.DIC.mb_strlen(shareDesc) < 60 || jq.DIC.mb_strlen(shareDesc) > 105) {
                shareDesc = jq.DIC.mb_cutstr(content, 105);
            }

            module.exports.initWXShare({
                'sId': sId,
                'tId': tId,
                'img': shareImg,
                'desc': shareDesc,
                'title': jq(document).attr('title')
            });
            template.helper('isDOMExist', function (id) {
                if (jq('#' + id)[0]) {
                    return true;
                } else {
                    return false;
                }
            });

            if (tId) {
                jq('.header').on('click', function() {
                    if (sId) {
                        jq.DIC.reload('/' + sId);
                    }


                    return false;
                });
            }

            // 消息点击态
            jq('.header').on('touchstart', '.infoTips', function() {
                jq(this).addClass('infoOn');
            }).on('touchend', '.infoTips', function() {
                jq(this).removeClass('infoOn');
            });

            jq('.warp').on('click', '.studioBtn', function(e) {
                e.stopPropagation();
                return true;
            });

            // 内容点击态
            if(isManager) {
                jq('.warp').on('click', 'p[id^="content_"]', function(e) {
                    e.stopPropagation();
                    var obj = jq(this);
                    obj.addClass('commBg');
                    setTimeout(function() {
                        obj.removeClass('commBg');
                    }, 200);

                    var delTid = obj.attr("tId");
                    var tmpl = template.render('manage', {'tid':delTid, 'isReply':0});
                    var opts = {
                        'id': 'operationMenu',
                        'isHtml':true,
                        'isMask':true,
                        'content':tmpl,
                        'callback':function() {
                            jq('.g-mask').on('click', function(e) {
                                jq.DIC.dialog({id:'operationMenu'});
                            });

                            jq('.manageLayer a[btnType="delThread"]').on('click', function() {
                                module.exports.deleteThread(delTid);
                            });
                            jq('.manageLayer a[btnType="banUser"]').on('click', function() {
                                module.exports.banUser(obj.attr("uId"), obj.attr("author"));
                            });
                            jq('.manageLayer a[btnType="cleanPost"]').on('click', function() {
                                module.exports.cleanPost(obj.attr("uId"), obj.attr("author"));
                            });
                        }
                    };

                    jq.DIC.dialog(opts);
                });
            }

            // 底部按钮模态
            jq('#navBtn').bind('touchstart', function() {
                jq(this).addClass('on');
            });
            jq('#navBtn').bind('touchend', function() {
                jq(this).removeClass('on');
            });

            // 全文展开显隐初始化
            module.exports.initViewBtn();
            // 图片张数初始化
            module.exports.initScrollImage();

            // 全文展开切换
            // jq('.container').on('click', '.viewBtn', module.exports.foldSwith);
            jq('.warp').on('click', '.viewBtn', function(e) {
                e.stopPropagation();
                var thisObj = jq(this);
                thisObj.addClass('commBg');
                setTimeout(function(){
                    thisObj.removeClass('commBg');
                    module.exports.foldSwith.call(thisObj);
                }, 50);

                pgvSendClick({hottag:'QUAN.SITE.LIST.QUANWEN'});
            });

            libScroll.initScroll('.slideBox ul', false, '.container');

            // 点击看大图
            require.async('module/imageviewCommon', function(imageviewCommon) {
                imageviewCommon.init('.slideBox li');
            });
            module.exports.initLazyload();

            var query = '';
            if (window.location.search.indexOf('?') !== -1) {
                query = window.location.search.replace(/\?/g, '&');
            }

            var level = /Android 4.0/.test(window.navigator.userAgent) ? -10 : -100;
            var isLoading = false;
            // 全屏触摸
            jq.DIC.initTouch({obj:jq('.warp')[0], end:function(e, offset) {
                document.ontouchmove = function(e){ return true;}
                var loadingObj = jq('#loadNext');
                var loadingPos = jq('#loadNextPos');
                // var loadingObjTop = loadingObj.offset().top + loadingObj.height() - jq(window).scrollTop();
                var loadingObjTop = loadingPos.offset().top - document.body.scrollTop - window.screen.availHeight;
                // 向上滑
                if (offset.y > 10 && loadingObjTop <= 10 && module.exports.isLoadingNew && !isLoading) {
                    isLoading = true;
                    if (tId) {
                        var url = '/' + sId + '/t/' + tId + '?start=' + window.nextStart + query;
                    } else {
                        var url = '/' + sId + '?start=' + window.nextStart + query;
                        if (isLive) {
                            var url = '/' + sId + '?start=' + window.nextStart + '&live=1' + query;
                        }
                    }
                    var opts = {
                        'beforeSend': function() {
                            loadingObj.show();
                        },
                        'complete': function() {
                            loadingObj.hide();
                        },
                        'success': function(re) {
                            var status = parseInt(re.errCode);
                            if (status == 0) {
                                if (tId) {
                                    var tmpl = template.render('tmpl_reply', re.data);
                                    jq('.topicList ul').append(tmpl);
                                    window.nextStart = nextStart = re.data.nextStart;
                                    // 最后无数据不再加载
                                    if (jq.DIC.isObjectEmpty(re.data.dataList)) {
                                        module.exports.isLoadingNew = false;
                                        jq('#showAll').show();
                                    }
                                } else {
                                    re.data.isLive = isLive || 0;
                                    var tmpl = template.render('tmpl_thread', re.data);
                                    jq('.container #allThreadList').append(tmpl);
                                    window.nextStart = nextStart = re.data.nextStart;
                                    module.exports.initViewBtn();
                                    // 图片张数初始化
                                    module.exports.initScrollImage();
                                    // 最后无数据不再加载
                                    if (jq.DIC.isObjectEmpty(re.data.threadList)) {
                                        module.exports.isLoadingNew = false;
                                        jq('#showAll').show();
                                    }
                                }
                            }
                            module.exports.initLazyload();
                            isLoading = false;
                        },
                        error: function() {
                            isLoading = false;
                        }
                    };
                    jq.DIC.ajax(url, '', opts);
                }
                // 向下拉刷新
                if (offset.y < level && document.body.scrollTop <= 0) {
                    module.exports.getThreadList();
                }
            }
            });

            var delReply = function (tId, pId) {
                jq.DIC.dialog(
                    {
                        content:'确定删除这条回复吗？',
                        okValue:'确定',
                        cancelValue:'取消',
                        isMask:true,
                        ok:function (){
                            var url = '/' + sId + '/r/del';
                            if(isManager) {
                                url = '/cp' + url;
                            }
                            jq.DIC.ajax(url, {'CSRFToken': CSRFToken, 'tId':tId, 'pId':pId}, {
                                'success': function (re) {
                                    var status = parseInt(re.errCode);
                                    if (status == 0) {
                                        jq('#p_' + tId + '_' + pId).remove();
                                        //如果replylist中不存在回复item，则删除该父容器
                                        var replyList = jq('#replyList_' + tId);
                                        if(replyList.children().length < 1){
                                            replyList.parent().hide();
                                        }
                                    }
                                },
                                'noJump':true,
                                'error' : function () {}
                                }
                            );
                        }
                    }
                );
                return true;
            }

            var reply = function () {
                // 未登录且是应用吧页
                var reapp = /qqdownloader\/([^\s]+)/i;
                if (authUrl && reapp.test(navigator.userAgent)) {
                    return false;
                }
                // 未登录
                if (authUrl) {
                    jq.DIC.reload(authUrl);
                    return false;
                }

                var tId = jq(this).attr('tId');
                var pId = 0;

                var ismah = jq(this).attr('ismah');
                // 判断是不是回复一条回复
                var divId = jq(this).attr('id') || '';
                var match = divId.match(/p_(\d+)_(\d+)/);

                if (match) {
                    pId = match[2];
                    tId = match[1];
                    // 如果点击的是自己的回复，跳转到删除
                    if (jq(this).attr('uid') == uId) {
                        return delReply(tId, pId);
                    }
                }

                var replyForm = template.render('tmpl_replyForm', {data:{'tId':tId, 'pId':pId}});
                var replyTimer = null;
                var storageKey = sId + "reply_content";
                // 弹出回复框
                jq.DIC.dialog({
                    content:replyForm,
                    id:'replyForm',
                    isHtml:true,
                    isMask:true,
                    top: 23,
                    // 弹出后执行
                    callback:function() {
                        // 表情开关
                        var reInit = true;
                        require.async('module/emotion', function(emotion) {
                            emotion.init(reInit);

                            //此种写法兼容ios7
                            jq('.expreSelect').on('touchstart', emotion.toggle);
                            //jq('.expreSelect').on('click', emotion.toggle);

                            jq('#content').on('focus', emotion.hide);
                        });

                        if (pId) {
                            // 显示作者
                            var author = jq.trim(jq('#' + divId).find('span').eq(0).text());
                            if (author.charAt(author.length - 1) == '：') {
                                author = author.slice(0, -1);
                            }

                            jq('textarea[name="content"]').attr('placeholder', '回复 ' + author + '：');
                        } else {
                            // 信息恢复
                            jq('textarea[name="content"]').val(localStorage.getItem(storageKey));
                        }

                        // 发送按纽绑定
                        var isSendBtnClicked = false;
                        jq('.sendBtn').on('click', function() {
                            if(isSendBtnClicked){
                                return false;
                            }
                            var opt = {
                                success:function(re) {
                                    var status = parseInt(re.errCode);
                                    if (status == 0) {
                                        if (!jq.DIC.isObjectEmpty(re.data.authorUid)) {
                                            localStorage.removeItem(storageKey);
                                            // 直接显示回复的内容到页面
                                            var tmpl = template.render('tmpl_reply', {replyList:{0:re.data}});
                                            jq('#replyList_' + tId).append(tmpl);
                                            var rCount = parseInt(jq('#rCount_' + tId).attr('rCount')) + 1;
                                            jq('#rCount_' + tId).attr('rCount', rCount);
                                            jq('#rCount_' + tId).html('<a href="/' + sId + '/t/' + tId + '">更多</a>共计' + rCount + '条回复');
                                            jq('#replyList_' + tId).parent().show();
                                        }
                                        if(ismah) {
                                            jq.DIC.reload('/' + sId + '/t/' + tId);
                                        }
                                    }
                                    clearInterval(replyTimer);
                                    // 关闭弹窗
                                    module.exports.isNoShowToTop = false;
                                    jq.DIC.dialog({id:'replyForm'});
                                    jq('.bNav').show();
                                    jq('.floatLayer').show();
                                },
                                error:function(re) {
                                    isSendBtnClicked = false;
                                }
                            };
                            if (!module.exports.checkReplyForm()) {
                                return false;
                            }
                            isSendBtnClicked = true;
                            jq.DIC.ajaxForm('replyForm', opt, true);
                            return false;
                        });

                        // 输入框文字计算
                        replyTimer = setInterval(function() {
                            jq.DIC.strLenCalc(jq('textarea[name="content"]')[0], 'pText', 280);
                            if (jq('textarea[name="content"]').val()) {
                                localStorage.removeItem(storageKey);
                                localStorage.setItem(storageKey, jq('textarea[name="content"]').val());
                            }
                        }, 1000);

                        module.exports.isNoShowToTop = true;
                        // 隐藏底部导航和向上
                        jq('.bNav').hide();
                        jq('.floatLayer').hide();

                        // 文本框焦点
                        // var t = setTimeout(function() {
                            // jq('#replyForm .sInput').click();
                            // jq('#replyForm .sInput').focus();
                        // }, 300);
                        jq('#fwin_dialog_replyForm').css('top', '23px');

                        jq('#cBtn').bind('touchstart', function() {
                            jq(this).addClass('cancelOn');
                        }).bind('touchend', function() {
                            jq(this).removeClass('cancelOn');
                            if(jq.os.android && parseInt(jq.os.version) <= 2){
                                jq(this).click();
                            }
                        });

                        jq('#comBtn').bind('touchstart', function() {
                            jq(this).addClass('sendOn');
                        }).bind('touchend', function() {
                            jq(this).removeClass('sendOn');
                        });
                    },
                    // 关闭回复框
                    close: function() {
                        // 内容非空确认
                        clearInterval(replyTimer);
                        module.exports.isNoShowToTop = false;
                        jq('.bNav').show();
                        jq('.floatLayer').show();
                        return true;

                        // 文本框焦点
                        jq('#replyForm .sInput').blur();
                    }
                });
                return true;
            }
            module.exports.reply = reply;

        // 点击回复//点击效果操作和点击逻辑操作分开
        // jq(document).on('click', '.threadReply', reply);

        var replyId = '.threadReply';
        jq.DIC.touchState(replyId, 'incoBg', '.warp');

        jq('.warp,.bottomBar').on('click', replyId, function() {
            reply.call(jq(this));//click 负责响应逻辑事件
        });

        // 点击回复内容，回复一条回复
        // jq('.warp').on('click', '.topicList ul li', reply);
        jq('.container').on('click', '.topicList ul li', function(e) {

            var thisObj = jq(this);
            /*
            thisObj.find('a').addClass('on');
            setTimeout(function(){
                thisObj.find('a').removeClass('on');
                reply.call(thisObj);
            }, 50);
            */

             var delTid = thisObj.attr("tId");
             var allowDel = false;
             // 如果点击的是自己的回复，跳转到删除
             if(!isManager || thisObj.attr('uId') == uId) {
                 reply.call(thisObj);
                 return false;
             }
             var tmpl = template.render('manage', {'tid':delTid, 'isReply':1, 'allowDel':true});
             var opts = {
                 'isHtml':true,
                 'isMask':true,
                 'content':tmpl,
//                 'top':e.clientY,
//                 'left':e.clientX/2,
                 'callback':function() {
//                    var dialogTop = e.clientY-jq('#fwin_dialog_tips').height();
//                    if(dialogTop < 0){
//                        dialogTop = e.clientY + 12;
//                    }
//                    jq("#fwin_dialog_tips").css({ "top": dialogTop + "px"});

                    jq("#fwin_mask_tips").on('click', function() {
                        jQuery('#fwin_mask_tips').hide();
                        jQuery('#fwin_mask_tips').remove();
                        jQuery('#fwin_dialog_tips').hide();
                        jQuery('#fwin_dialog_tips').remove();
                    });

                    jq('.manageLayer a[btnType="reply"]').on('click', function() {
                        reply.call(thisObj);
                    });

                    jq('.manageLayer a[btnType="delReply"]').on('click', function() {
                        // 判断是不是回复一条回复
                        var divId = thisObj.attr('id');
                        if (/p_\d+_\d+/.test(divId)) {
                            var lastSepIndex = divId.lastIndexOf('_');
                            pId = divId.substring(lastSepIndex + 1);
                            tId = divId.substring(2, lastSepIndex);
                            delReply(tId, pId);
                        }

                    });

                    jq('.manageLayer a[btnType="banUser"]').on('click', function() {
                        module.exports.banUser(thisObj.attr("uId"), thisObj.attr("author"));
                    });
                 }
             };

             jq.DIC.dialog(opts);

        }).on('click', '.topicList ul li',function(){
            var thisObj = jq(this);
            thisObj.find('a').addClass('on');
            setTimeout(function() {
                thisObj.find('a').removeClass('on');
            }, 150);
        });

        // Pop菜单

        var perPop = function () {
                var tId = jq(this).attr('tId');
                if(jq('#t_' + tId + ' .perPop').css('display') == 'none') {
                    jq('#t_' + tId + ' .perPop').show();
                    setTimeout(function(){
                        jq(document).attr('perPopId', tId);
                    }, 50);
                } else {
                    jq('#t_' + tId + ' .perPop').hide();
                    jq(document).attr('perPopId', '');
                }
        };

        jq(document).bind("click", function(){
            var perPopId = jq(document).attr('perPopId');
            if(perPopId) {
               jq('#t_' + perPopId + ' .perPop').hide();
               jq(document).attr('perPopId', '');
            }
        });

        jq('.warp').on('click', '.PerPopBtn', function() {
            var thisObj = jq(this);
            perPop.call(thisObj);
        });

        jq('.warp').on('click', '.perPop .perBCon', function() {
            var thisObj = jq(this);
            var tId = thisObj.parent().attr('tId');
            thisObj.addClass('perH');
            setTimeout(function(){
                thisObj.removeClass('perH');
                 jq('#t_' + tId + ' .perPop').hide();
            }, 50);
        });

        // 广告标记
        jq('.warp').on('click', '.perPop .banThread', function() {
            var thisObj = jq(this);
            var tId = thisObj.parent().attr('tId');
            var opts = {
                'success': function() {
                    jq('#t_' + tId).hide();
                }
            }
            jq.DIC.ajax('/' + sId + '/markads', {'CSRFToken': CSRFToken, 'tId':tId}, opts);
        });

        // 删除自已主题
        jq('.warp').on('click', '.perPop .deleteThread', function() {
            var thisObj = jq(this);
            var tId = thisObj.parent().attr('tId');
            jq('#threadForm [name="tId"]').val(tId);
            jq('#threadForm').attr('action', '/' + sId + '/t/del');

            jq.DIC.dialog({
                'content':'确定删除这个主题吗？',
                'okValue':'确定',
                'cancelValue':'取消',
                'isMask':true,
                'ok':function () {
                    var opt = {
                        success:function(re) {
                            jq.DIC.dialog({id:'operationMenu'});
                            var status = parseInt(re.errCode);
                            if(status == 0) {
                                jq("#t_" + tId).remove();
                            }
                        },
                        'noJump':true
                    };
                    jq.DIC.ajaxForm('threadForm', opt, true);
                }
            });
        });

        // like
        jq.DIC.touchState('.like', 'incoBg', '.warp');
        jq('.warp').on('click', '.like', function() {
            // 未登录且是应用吧页
            var reapp = /qqdownloader\/([^\s]+)/i;
            if (authUrl && reapp.test(navigator.userAgent)) {
                return false;
            }
            // 未登录
            if (authUrl) {
                jq.DIC.reload(authUrl);
                return false;
            }
            var thisObj = jq(this);
            if(thisObj.children('i').attr('class') == 'praise') {
                return;
            }
            var tId = thisObj.attr('tId');
            var opts = {
                'success': function(result) {
                    if (result.errCode == 0 && result.data && result.data.likeNumber) {
                        thisObj.html('<i class="praise"></i>' + result.data.likeNumber);
                    }
                },
                'noShowLoading' : true,
                'noMsg' : true
            }
            jq.DIC.ajax('/' + sId + '/like?tId=' + tId, '', opts);
        });

        jq('.topicRank').on('click', function() {
            jq.DIC.reload('/likedrank/' + sId);
        });

        }
    };
    module.exports.init(window.nextStart, tId);
});
