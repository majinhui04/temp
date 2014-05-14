define('module/followSite', [], function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge"; // yui 压缩配置，不混淆这三个变量
    module.exports =  {
        followSite : function (pageType) {
            var sId, url;
            var thisObj = jq(this);

            // 默认 个人页面
            var pageType = pageType || 'my_sites';

            if (pageType == 'my_sites' || pageType == 'category_index') {
                var liObj = thisObj.parent().eq(0);
                sId = liObj.attr('sid');
            }  else if (pageType == 'site_index') {
                sId = thisObj.attr('sid');
            }

            url = '/' + sId + '/follow';
            jq.DIC.ajax(url, {'CSRFToken' : CSRFToken}, {
                'success' : function(result) {
                    var status = parseInt(result.errCode);
                    if (status == 0) {
                        isLiked = true;
                        thisObj.off();

                        // 如果是个人页面
                        if (pageType == 'my_sites') {
                            if (jq('#followdSites').size() < 1) {
                                jq('.interestNo').remove();
                                jq('div.interestBox').prepend('<h3>我加入的微社区</h3><ul id="followdSites" class="interestMy"></ul>');
                            }

                            thisObj.removeClass('iInco').addClass('iSucc');

                            var children = liObj.children();
                            var contentObj = jq('<span></span>');
                            for (var i = 0; i < children.length; i++) {
                                if (children[i].tagName == 'I') {
                                    var imgObj = jq(children[i]).find('img');
                                    imgObj.attr('class', 'iMImg');
                                    contentObj.append(imgObj);
                                } else if (children[i].tagName == 'H4') {
                                    jq(children[i]).attr('class', 'iMText');
                                    contentObj.append(children[i]);
                                }
                            }
                            liObj.html(contentObj.html());
                            jq('#followdSites').prepend(liObj[0]);

                            if (jq('#findSites li').size() < 1) {
                                jq('#findSites').prev('h3').remove();
                                jq('#findSites').remove();
                            }
                            if (jq('#hotSiteList li').size() < 1) {
                                jq('#hotSiteList').prev('h3').remove();
                                jq('#hotSiteList').remove();
                            }
                            if (jq('#newSiteList li').size() < 1) {
                                jq('#newSiteList').prev('h3').remove();
                                jq('#newSiteList').remove();
                            }
                            jq('#likeCount_' + sId).text(parseInt(jq('#likeCount_'+sId).text()) + 1);
                        } else if (pageType == 'site_index') {
                            thisObj.hide();
                            jq('#likeCount').text(parseInt(jq('#likeCount').text()) + 1);
                        } else if (pageType == 'category_index') {
                            thisObj.removeClass('iInco').addClass('iSucc');
                        }
                    }

                }

            });
        },
        unfollowSite : function (pageType) {
            var sId, url;
            var thisObj = jq(this);

            // 默认 个人页面
            var pageType = pageType || 'my_sites';

            if (pageType == 'my_sites') {

                var liObj = thisObj.parent().eq(0);
                sId = liObj.attr('sid');
            } else if (pageType == 'site_index') {
                sId = thisObj.attr('sid');
            }

            jq.DIC.dialog({
                id: 'confirmBox',
                content:'退出此微社区？',
                okValue:'确定',
                cancelValue:'取消',
                isMask:true,
                ok:function (){
                    url = '/' + sId + '/unfollow';
                    jq.DIC.ajax(url, {'CSRFToken' : CSRFToken}, {
                        'success' : function(result) {
                            var status = parseInt(result.errCode);
                            if (status == 0) {
                                thisObj.off();

                                if (pageType == 'my_sites') {
                                    if (jq('#findSites').size() < 1) {
                                        jq('div.interestBox').append('<h3>所有微社区</h3><ul id="findSites" class="interestList"></ul>');
                                    }

                                    thisObj.removeClass('iSucc').addClass('iInco');
                                    jq('#findSites').append(liObj[0]);

                                    if (jq('#followdSites li').size() < 1) {
                                        jq('#followdSites').prev('h3').remove();
                                        jq('#followdSites').remove();
                                        jq('div.interestBox').prepend('<P class="interestNo">*尚未加入微社区*</P>');
                                    }
                                    var result = parseInt(jq('#likeCount_'+sId).text()) - 1;
                                    if (result < 0) {
                                        result = 0;
                                    }
                                    jq('#likeCount_' + sId).text(result);
                                } else if (pageType == 'site_index') {
                                    // thisObj.removeClass('on');
                                    // thisObj.html('<i class="iInco"></i>加入');
                                    // jq('#likeCount').text(parseInt(jq('#likeCount').text()) - 1);
                                    jq.DIC.reload();
                                }
                            }

                        }
                    });
                }
            });
        }
    };
});
