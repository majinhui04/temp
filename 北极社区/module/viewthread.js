/**
 * @filename viewthread
 * @description
 * 作者: vissong
 * 创建时间: 2013-6-5 14:56:03
 * 修改记录:
 *
 * $Id$
 **/

define('module/viewthread', ['lib/scroll'], function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge"; // yui 压缩配置，不混淆这三个变量
    var libScroll = require('lib/scroll');
    module.exports = {
        initViewBtn: function() {
            jq('.tt .detailCon').each(function(e) {
                if (jq(this).find('p')[0]) {
                    if (jq(this).find('p')[0].scrollHeight > 165) {
                        jq(this).find('.viewBtn').show();
                    }
                }
            });
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
        isLoadingNew: true,
        isLoading: false,
        isNoShowToTop: false,
        nextStart: 0,
        initLazyload: function() {
            // 图片 lazyload
            jq('.warp img').lazyload({
                skip_invisible : false,
                threshold : 500
            });
        },
        // 晒图图片滚动
        initShowPic: function() {
            if (jq(".slideShow ul li").length <= 1) {
                jq('.sNum a').hide();
                return false;
            }

            jq('.sNum a').first().addClass('on');

            // 滑动
            libScroll.initScroll('.slideShow ul', true, '.container');
        },
        // load data,all in one
        load: function(start, action) {
            start = start || 0;
            action = action || '';

            module.exports.isLoading = true;
            var url = DOMAIN + window.sId + '/t/' + window.tId
                + '?parentId=' + parentId
                + '&start=' + start;
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
                jq('.topicList ul').html('');
            }

            // 最后无数据不再加载
            if (jq.DIC.isObjectEmpty(re.data.dataList)) {
                module.exports.isLoadingNew = false;
                jq('#showAll').show();
                return false;
            }

            var tmpl = template.render('tmpl_reply', re.data);
            jq('#loadNext').before(tmpl);
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
        checkReplyForm: function() {
            var content = jq('textarea[name="content"]').val();
            var contentLen = jq.DIC.mb_strlen(jq.DIC.trim(content));
            if (contentLen <= 0) {
                jq.DIC.dialog({content:'回复内容不能为空', autoClose:true});
                return false;
            }

            return true;
        },
        init: function() {

            module.exports.initViewBtn();
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

            // 分享遮罩，一次性
            var action = jq.DIC.getQuery('action');
            var reapp = /qqdownloader\/([^\s]+)/i;
            // appbar no share mask
            if (action == 'share' && !reapp.test(navigator.userAgent)) {
                var hadShowShareMask = localStorage.getItem('hadShowShareMask');
                if (!hadShowShareMask) {
                    jq.DIC.dialog({
                        id: 'shareMask',
                        content: ' ',
                        isHtml: true,
                        isMask: true,
                        callback: function() {
                            jq('.g-mask').on('click', function() {
                                jq.DIC.dialog({id:'shareMask'});
                            });
                        }
                    });
                    jq('.tipInfo p').css('z-index', 10010);
                    localStorage.setItem('hadShowShareMask', 1);
                }
            }

            // 默认展开回复
            if (action == 'reply') {
                module.exports.reply.call(jq('.threadReply')[0]);
            }

            jq('.header').on('click', function() {
                if (sId && parentId != 0) {
                    jq.DIC.open('/' + sId + '/v/' + parentId);
                    return false;
                }
                if (sId) {
                    jq.DIC.open('/' + sId);
                    return false;
                }
            });

            if (parentId > 0) {
                module.exports.initShowPic();
            } else {
                libScroll.initScroll('.slideBox ul', false, '.container');
            }

            jq.DIC.touchState('#support');
            jq('#support').click('on', function() {
                jq('#showShare').show();
                scroll(0,0);
            });

            // module.exports.picTId = window.picThreadTId;
            module.exports.nextStart = window.nextStart;
            var replyId = '.threadReply';
            jq.DIC.touchState(replyId, 'incoBg', '.warp');

            jq('.container, .bottomBar').on('click', replyId, function(e) {
                e.stopPropagation();
                module.exports.reply.call(jq(this));//click 负责响应逻辑事件
            });


            template.helper('isDOMExist', function (id) {
                if (jq('#' + id)[0]) {
                    return true;
                } else {
                    return false;
                }
            });

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
                    }
                }
            });

            // content && summary
            jq.DIC.touchState('.detailShow');
            jq('.detailShow').on('click', function() {
                var obj = jq(this);
                var aObj = obj.find('a');
                if (aObj.hasClass('iBtnOn1')) {
                    aObj.removeClass('iBtnOn1');
                    obj.removeClass('dsOn');
                    obj.css('height', '26px');
                } else {
                    aObj.addClass('iBtnOn1');
                    obj.addClass('dsOn');
                    aObj.parent().css('height', 'auto');
                }
            });

            // like
            jq.DIC.touchState('.like', 'incoBg', '.warp');
            jq('.like').on('click', function(e) {
                e.stopPropagation();
                var thisObj = jq(this),
                    parentId = thisObj.attr('parentId') || 0;
                if(thisObj.children('i').attr('class') == 'praise') {
                    return;
                }

                // 晒图结束不能定
                if (parentId && thisObj.attr('isEnd') == 1) {
                    jq.DIC.dialog({content: '活动已结束，请不要再顶了', autoClose: true});
                    return false;
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
                jq.DIC.ajax('/' + sId + '/like?tId=' + tId + '&parentId=' + parentId, '', opts);
            });

            require.async('module/imageviewCommon', function(imageviewCommon) {
                imageviewCommon.init('.slideShow li');
                imageviewCommon.init('.slideBox li');
            });

            // 管理
            jq('.container').on('click', '.detailCon p', function(e) {
                e.stopPropagation();

                var contentNode = jq(this).parent();

                var divId = contentNode.attr('id'),pId,tId;
                if (divId) {
                    if (match = divId.match(/dp_(\d+)_(\d+)/)) {
                        pId = match[2];
                        tId = match[1]
                    }
                }

                if (isManager) {
                    var obj = jq(this);
                    obj.addClass('commBg');
                    setTimeout(function() {
                        obj.removeClass('commBg');
                    }, 200);

                    var tmpl = template.render('manage');
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
                                module.exports.delReply(tId, pId);
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
                } else {
                    // 如果点击的是自己的回复，跳转到删除
                    if (contentNode.attr('uId') == uId && pId && tId) {
                        return module.exports.delReply(tId, pId);
                    }
                }
            });

            require.async('module/wxshare', function(wxshare) {
                // 分享图片
                var shareImg, content;
                if (jq('.detailCon img:not(.expimg)')[0]) {
                    shareImg = jq('.detailCon img:not(.expimg)')[0].src;
                } else if (jq('.slideShow li img:not(.expimg)')[0]) {
                    shareImg = jq('.slideShow li img:not(.expimg)').first().attr('data-original');
                }
                // 分享内容
                content = jq.DIC.trim(jq('.detailCon p').text()) || jq.DIC.trim(jq('.detailShow').text());
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
        },
        reply: function () {
            if (authUrl) {
                jq.DIC.reload(authUrl);
                return false;
            }

            var tId = jq(this).attr('tId');
            var pId = 0;

            var ismah = jq(this).attr('ismah');
            // 判断是不是回复一条回复
            var divId = jq(this).attr('id');
            if (/p_\d+_\d+/.test(divId)) {
                var lastSepIndex = divId.lastIndexOf('_');
                pId = divId.substring(lastSepIndex + 1);
                tId = divId.substring(2, lastSepIndex);
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
                        var author = jq('#' + divId).attr('author');
                        if (author) {
                            if (author.charAt(author.length - 1) == '：') {
                                author = author.slice(0, -1);
                            }
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
                                                // 结构变了与列表不同
                                                jq('#loadNext').before(tmpl);
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
        },
        delReply: function (tId, pId) {
            jq.DIC.dialog({
                content:'确定删除这条回复吗？',
                okValue:'确定',
                cancelValue:'取消',
                isMask:true,
                ok:function (){
                    var url = '/' + sId + '/r/del';
                    if(isManager) {
                        url = '/cp' + url;
                    }
                    jq.DIC.ajax(url, {'CSRFToken': CSRFToken, 'tId':tId, 'pId':pId, parentId: window.parentId}, {
                        'success': function (re) {
                            jq.DIC.dialog({id:'operationMenu'});
                            var status = parseInt(re.errCode);
                            if (status == 0) {
                                jq('#dp_' + tId + '_' + pId).parent().parent().remove();
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
            });
            return true;
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
        }
    };
    module.exports.init();
});
