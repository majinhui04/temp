
define('module/forumdisplay', [], function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge"; // yui 压缩配置，不混淆这三个变量
    module.exports = {
        init:function() {
            var loadMoreReply = function() {
                var moreObj = jq(this);
                var moreA = moreObj.find('a');
                var url = moreA.attr('href');
                if (moreA.html() == '更多') {
                    url = url + '?fromList=1&start=0';
                    var opts = {
                        'success': function(re) {
                            var status = parseInt(re.errCode);
                            if (status == 0) {
                                var tmpl = template.render('tmpl_reply', {replyList:re.data.dataList});
                                moreObj.parent().find('ul').append(tmpl);
                                moreA.html('全部');
                                var rCount = moreObj.attr('rCount');
                                // 列表页回复数大于15时显示全部链接
                                if (rCount <= 15) {
                                    moreObj.hide();
                                }
                            }
                        }
                    };
                    try {
                        pgvSendClick({hottag:'QUAN.SITE.LIST.MORE'});
                    } catch(e) {}
                    jq.DIC.ajax(url, '', opts);
                } else {
                    try {
                        pgvSendClick({hottag:'QUAN.SITE.LIST.ALL'});
                    } catch(e) {}
                    jq.DIC.open(url);
                }
                return false;
            }

            // 邀请
            jq('.inviteQQ').on('click', function() {
                if (inviteUrl.length > 1) {
                    inviteUrl = inviteUrl.replace(/&amp;/g, '&');
                    jq.DIC.reload(inviteUrl);
                }
                return false;
            });

            // 更多按钮
            jq('#allThreadList').on('click', '.more', loadMoreReply);

            // 点击态
            jq.DIC.touchState('.more a', 'on', '#allThreadList');
            jq.DIC.touchState('.shareBtn', 'on', '#allThreadList');

            // 晒图
            jq('.warp').on('click', '.showPicBox', function() {
                var tId = jq(this).attr('_tId'),
                    url = DOMAIN + window.sId + '/v/' + tId;
                jq.DIC.open(url);
            });

            // 晒图标签
            jq('.warp').on('click', '.filterPic', function(e) {
                e.stopPropagation();
                var url = DOMAIN + sId + '?filterType=showPic';
                jq.DIC.open(url);
            });
            // 分享按钮
            // jq.DIC.handleLink('.shareBtn', '#allThreadList');
        }
    };
    module.exports.init();
});
