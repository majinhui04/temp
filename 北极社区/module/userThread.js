define('module/userThread', [], function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge"; // yui 压缩配置，不混淆这三个变量
    module.exports =  {
        initViewBtn: function() {
            jq('.detailCon').each(function(e) {
                if (jq(this).find('p')[0].scrollHeight > 165) {
                    jq(this).find('.viewBtn').show();
                }
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
        initLazyload: function() {
            // 图片 lazyload
            jq('.slideBox img').lazyload({
                skip_invisible : false,
                threshold : 500
            });
        },
        isLoadingNew: true,
        init: function(nextStart) {

            // 全文展开显隐初始化
            module.exports.initViewBtn();

            // 图片张数初始化
            module.exports.initScrollImage();

            // 全文展开切换
            jq('.container').on('click', '.viewBtn', function() {
                var thisObj = jq(this);
                thisObj.addClass('commBg');
                setTimeout(function(){
                    thisObj.removeClass('commBg');
                    module.exports.foldSwith.call(thisObj);
                }, 50);
            });

            // 图片横滑
            var x, y, endX, endY, offsetX, offsetY, objLeft, left = 0;
            jq('.container').on('touchstart', '.slideBoxWrapper', function(e) {
                x = endX = e.originalEvent.touches[0].pageX;
                y = endY = e.originalEvent.touches[0].pageY;
                objLeft = left;
            });
            var timer = null;
            jq('.container').on('touchmove', '.slideBoxWrapper', function(e) {
                endX = e.originalEvent.touches[0].pageX;
                endY = e.originalEvent.touches[0].pageY;
                offsetX = endX - x;
                offsetY = endY - y;
                // 图片上竖滑不明显时禁用上下滑
                if (Math.abs(offsetY) < Math.abs(offsetX)) {
                    if (e.preventDefault) {
                        e.preventDefault();
                    }
                } else {
                    return true;
                }
                var obj = jq(this);
                left =  objLeft + parseInt(offsetX);
                // 防止左滑过头
                if (left > 0) {
                    left = 0;
                    offsetX = 0;
                    offsetY = 0;
                }
                var min = -1 * (this.scrollWidth - jq(this).parent().width());
                // 防止左滑过头
                if (this.scrollWidth >= jq(this).parent().width() && left < min) {
                    left = min;
                    offsetX = 0;
                    offsetY = 0;
                }
                jq(this).css("left", left);

            });
            jq('.container').on('touchend', '#slidePicBox', function(e) {
                objLeft = left;
                document.ontouchstart = function(e){ return true;}
            });

            // 点击看大图
            jq(document).on('click', '.slideBox li', function() {
                FastClick.attach(this);
                var pics = [];
                jq(this).parent().find('img').each(function(e, i) {
                    pics.push(jq(i).attr('data-original').replace(/\/150$/g, '\/1280'));
                });

                if (isWX) {
                    WeixinJSBridge.invoke('imagePreview', {
                        "current": jq(this).find('img').attr('data-original').replace(/\/150$/g, '\/1280'),
                        "urls": pics
                    });
                }
                else{
                    //手Q图片放大
                    if (!jq('#imageView')[0]) {
                        jq('body').append('<div id="imageView" class="slide-view"></div>');
                    }
                    var index = 0;
                    //确定当前查看的图片是第几张
                    if(pics.length > 1){
                        var imgSrc = jq(this.innerHTML).attr('data-original').replace(/\/150$/g, '\/1280');
                        for(var i = 0; i < pics.length; i++){
                            if(imgSrc == pics[i]){
                                index = i;
                                break;
                            }
                        }
                    }
                    seajs.use(['zepto','imageview'],function($, imageview){
                        window.$ = $;
                        var view = imageview.get('./init');
                        view.init(pics,index);
                    });
                }
            });
            module.exports.initLazyload();

            var query = '';
            if (window.location.search.indexOf('?') !== -1) {
                query = window.location.search.replace(/\?/g, '&');
            }

            var isLoading = false;
            // 全屏触摸
            jq.DIC.initTouch({
                'obj': jq('.warp')[0],
                'end': function(e, offset) {
                    document.ontouchmove = function(e){ return true;}
                    var loadingObj = jq('#loadNext');
                    var loadingPos = jq('#loadNextPos');
                    // var loadingObjTop = loadingObj.offset().top + loadingObj.height() - jq(window).scrollTop();
                    var loadingObjTop = loadingPos.offset().top - document.body.scrollTop - window.screen.availHeight;
                    // 向上滑
                    if (offset.y > 10 && loadingObjTop <= 10 && module.exports.isLoadingNew && !isLoading) {
                        isLoading = true;
                        var url = '/my/thread?start=' + nextStart + query;
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
                                    var tmpl = template.render('tmpl_thread', re.data);
                                    jq('.container #allThreadList').append(tmpl);
                                    nextStart = re.data.nextStart;
                                    module.exports.initViewBtn();
                                    // 图片张数初始化
                                    module.exports.initScrollImage();
                                    // 最后无数据不再加载
                                    if (jq.DIC.isObjectEmpty(re.data.threadList)) {
                                        module.exports.isLoadingNew = false;
                                        jq('#showAll').show();
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
                }
            });
            jq('#cleanPost').on('click', function() {
                module.exports.cleanPost(jq(this).attr("uId"), jq(this).attr("author"));
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

            // 删除自已主题
            jq('.warp').on('click', '.perPop .deleteThread', function() {
                var thisObj = jq(this);
                var tId = thisObj.parent().attr('tId').split('_');
                jq('#threadForm [name="tId"]').val(tId[1]);
                jq('#threadForm').attr('action', '/' + tId[0] + '/t/del');

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
                                    jq("#t_" + thisObj.parent().attr('tId')).remove();
                                }
                            },
                            'noJump':true
                        };
                        jq.DIC.ajaxForm('threadForm', opt, true);
                    }
                });
            });

            jq('.topicRank').on('click', function() {
                var thisObj = jq(this);
                var sId = thisObj.attr('sId');
                jq.DIC.reload('/likedrank/' + sId);
            });
        }
    };
    module.exports.init(nextStart);
});
