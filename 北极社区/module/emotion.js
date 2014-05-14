/**
 *  表情
 *
 *  作者: 刘卫锋 (kevonliu@tencent.com)
 *  创建时间: 2013-12-11
 *
 *  $Id: emotion.js 27544 2014-04-18 13:05:51Z yixizhou $
 */

define('module/emotion', ['lib/scroll'], function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge"; // yui 压缩配置，不混淆这三个变量
    var libScroll = require('lib/scroll');
    var smiley = {};
    smiley.s1 = {
        'title': '默认',
        'icon':{"\u5472\u7259":"e113.gif","\u8c03\u76ae":"e112.gif","\u6d41\u6c57":"e127.gif","\u5077\u7b11":"e120.gif","\u518d\u89c1":"e139.gif","\u6572\u6253":"e138.gif","\u64e6\u6c57":"e140.gif","\u732a\u5934":"e162.gif","\u73ab\u7470":"e163.gif","\u6d41\u6cea":"e105.gif","\u5927\u54ed":"e109.gif","\u5618..":"e133.gif","\u9177":"e116.gif","\u6293\u72c2":"e118.gif","\u59d4\u5c48":"e149.gif","\u4fbf\u4fbf":"e174.gif","\u70b8\u5f39":"e170.gif","\u83dc\u5200":"e155.gif","\u53ef\u7231":"e121.gif","\u8272":"e102.gif","\u5bb3\u7f9e":"e106.gif","\u5f97\u610f":"e104.gif","\u5410":"e119.gif","\u5fae\u7b11":"e100.gif","\u53d1\u6012":"e111.gif","\u5c34\u5c2c":"e110.gif","\u60ca\u6050":"e126.gif","\u51b7\u6c57":"e117.gif","\u7231\u5fc3":"e166.gif","\u793a\u7231":"e165.gif","\u767d\u773c":"e122.gif","\u50b2\u6162":"e123.gif","\u96be\u8fc7":"e115.gif","\u60ca\u8bb6":"e114.gif","\u7591\u95ee":"e132.gif","\u7761":"e108.gif","\u4eb2\u4eb2":"e152.gif","\u61a8\u7b11":"e128.gif","\u7231\u60c5":"e190.gif","\u8870":"e136.gif","\u6487\u5634":"e101.gif","\u9634\u9669":"e151.gif","\u594b\u6597":"e130.gif","\u53d1\u5446":"e103.gif","\u53f3\u54fc\u54fc":"e146.gif","\u62e5\u62b1":"e178.gif","\u574f\u7b11":"e144.gif","\u98de\u543b":"e191.gif","\u9119\u89c6":"e148.gif","\u6655":"e134.gif","\u5927\u5175":"e129.gif","\u53ef\u601c":"e154.gif","\u5f3a":"e179.gif","\u5f31":"e180.gif","\u63e1\u624b":"e181.gif","\u80dc\u5229":"e182.gif","\u62b1\u62f3":"e183.gif","\u51cb\u8c22":"e164.gif","\u996d":"e161.gif","\u86cb\u7cd5":"e168.gif","\u897f\u74dc":"e156.gif","\u5564\u9152":"e157.gif","\u74e2\u866b":"e173.gif","\u52fe\u5f15":"e184.gif","OK":"e189.gif","\u7231\u4f60":"e187.gif","\u5496\u5561":"e160.gif","\u6708\u4eae":"e175.gif","\u5200":"e171.gif","\u53d1\u6296":"e193.gif","\u5dee\u52b2":"e186.gif","\u62f3\u5934":"e185.gif","\u5fc3\u788e":"e167.gif","\u592a\u9633":"e176.gif","\u793c\u7269":"e177.gif","\u8db3\u7403":"e172.gif","\u9ab7\u9ac5":"e137.gif","\u6325\u624b":"e199.gif","\u95ea\u7535":"e169.gif","\u9965\u997f":"e124.gif","\u56f0":"e125.gif","\u5492\u9a82":"e131.gif","\u6298\u78e8":"e135.gif","\u62a0\u9f3b":"e141.gif","\u9f13\u638c":"e142.gif","\u6eb4\u5927\u4e86":"e143.gif","\u5de6\u54fc\u54fc":"e145.gif","\u54c8\u6b20":"e147.gif","\u5feb\u54ed\u4e86":"e150.gif","\u5413":"e153.gif","\u7bee\u7403":"e158.gif","\u4e52\u4e53":"e159.gif"
        },
        'liClass': 'bg',
        'perPage': 23,
        'delBtn':true,
        'minPx': '32'
    };
    smiley.s2 = {
        'title': '范冰冰',
        'icon': {
            '冰冰调皮':''
            ,'冰冰脸红':''
            ,'冰冰疑问':''
            ,'冰冰说NO':''
            ,'冰冰干杯':''
            ,'冰冰好样的':''
            ,'冰冰加油':''
            ,'冰冰赞美':''
            ,'冰冰委屈':''
            ,'冰冰飞吻':''
            ,'冰冰好喜欢':''
            ,'冰冰搞怪':''
            ,'冰冰小恶魔':''
            ,'冰冰花痴':''
            ,'冰冰流泪':''
            ,'冰冰害羞':''
            ,'冰冰流汗':''
            ,'冰冰无语':''
            ,'冰冰卖萌':''
            ,'冰冰唱K':''
            ,'冰冰思考':''
            ,'冰冰献吻':''
            ,'冰冰撒娇':''
            ,'冰冰可爱':''
            ,'冰冰悠闲':''
            ,'冰冰好心情':''
            ,'冰冰晚安':''
        },
        'ulClass': 'fanE',
        'liClass': 'fan',
        'perPage': 10,
        'minPx': '51'
    };
    module.exports =  {
        init : function(reInit) {
            // 如果不指定，则只初始化一次
            if(!reInit && window.expreInit == true) {
                return;
            }

            window.expreInit = true;
            window.expreConTab = 0;

            var enabledSmiley = window.enabledSmiley || '';
            var siteSmiley = enabledSmiley.split('|');
            var smileyLen = siteSmiley.length;
            if (enabledSmiley === '' || smileyLen < 1) {
                siteSmiley = [1];
            }
            var cate = [],
                emo = [];
                minPx = [];
            for (var i = 0; i < siteSmiley.length; ++i) {
                var key = 's' + siteSmiley[i];
                if (typeof smiley[key] == 'undefined') {
                    continue;
                }
                minPx.push(smiley[key]['minPx']);
                cate.push(smiley[key]['title']);
                emo.push(smiley[key]);
            }

            var html = template.render('tmpl_expreBox', {'cate':cate, 'emo':emo});

                if(jq(".tipLayer").size() > 0) {
                    jq(".tipLayer").append(html);
//                    jq('.expreCon li').css('background-size', '296px auto');
//                    jq('.expreCon li').width('296');
//                    jq('.expreBox').width('296');
//                    jq('.expreCon li a').css({'margin':'0', width:'37px', height:'37px'});
                    jq('.expreCon li').css('background-position', 'center center');
                } else if(jq("#replyForm").size() > 0) {
                    html = "<div class=\"tipLayer mt10\" style=\"display:none\">" + html + "</div>";
                    jq("#replyForm").append(html);

                    jq('.expreCon li').css('background-size', '256px auto');
//                    jq('.expreCon li a').css({'margin':'0', width:'32px', height:'32px'});
//                    jq('#exp0 li a').css({'margin':'0', width:'32px', height:'32px'});
//                    jq('#exp1 li a').css({'margin':'0', width:'51px', height:'51px'});
                    var minPxLen = minPx.length;
                    for (var i = 0; i < minPxLen; ++i) {
                        jq('#exp_emo' + i + ' li a').css({'margin':'0', width: minPx[i] + 'px', height: minPx[i] + 'px'});
                    }
                    jq('.expreCon li').height('97');
                    jq('.expreCon li').width('256');
                    jq('.expreBox').width('256');
                    jq('.expreCon li').css('background-position', 'center center');
                } else {
                    return;
                }

                // 点击输入框下发表情开关
                // jq(".expreSelect").on("click", module.exports.toggle);

                // 点击输入框隐藏表情框
                // jq("#content").on("focus", module.exports.hide);

                // 分组标签卡点击
                jq('.expreList .expressionTab a').on('click', function() {
                    var obj = jq(this);
                    // 分组标签显隐
                    jq('.expreList .expressionTab a').removeClass('on');
                    obj.addClass('on');
                    // 表情组显隐
                    jq('.expreList .expreBox ul').hide();
                    jq('#exp_' + this.id).show();
                    // todo 分页小点显隐
                    jq('.pNumCon').hide();
                    jq('#exp_' + this.id + '_page').show();
                });

                libScroll.initScroll('.expreBox ul', true, 'body', 'pNumOn');
                var expreBox = jq(".expreList .expreBox ul");
                expreBox.on('click', function(e) {
                    return false;
                });

                // 点击每个小表情
                jq.DIC.touchState('.expreList .expreCon li a', 'on');
                jq(".expreList .expreCon li a").each(function(i){
                    jq(this).on("click", function() {
                        var title = jq(this).attr("title");
                        if(jq("#content")) {
                            var content = jq("#content").val();
                            if(!title) {
                                if(content && content.lastIndexOf(']') == content.length - 1) {
                                    var LeftIndex = content.lastIndexOf('[');
                                    content = content.substring(0, LeftIndex);
                                } else {
                                    content = content.substring(0, content.length - 1);
                                }
                            } else {
                                content = content + "[" + title + "]";
                            }
                            jq("#content").val(content);
                        }
                    });
                });

            },

            show : function() {
                // epOn
                jq('.expreSelect').addClass('epOn');
                jq('.photoSelect').removeClass('epOn');
                jq('.photoList').hide();
                jq('.expreList').show();
                jq('.tagBox').hide();
                jq('.locationCon').hide();

                // 如果是回复框
                if(jq('#replyForm').size() > 0) {
                    jq('.tipLayer').show();
                }
            },

            hide : function() {
                // 如果是回复框
                if(jq('#replyForm').size() > 0) {
                    jq('.tipLayer').hide();
                }

                jq('.expreSelect').removeClass('epOn');
                jq('.photoSelect').addClass('epOn');
                jq('.expreList').hide();
                jq('.photoList').show();
                jq('.tagBox').show();
                jq('.locationCon').show();
            },

            toggle : function() {
                if(jq('.expreList').css('display') == 'none') {
                    module.exports.show();
                } else {
                    module.exports.hide();
                }
            }

    }
});
