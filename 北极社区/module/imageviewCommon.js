/**
 * @filenamea imageviewCommon
 * @description
 * 作者: vissong
 * 创建时间: 2013-6-5 14:56:03
 * 修改记录:
 *
 * $Id$
 **/

define('module/imageviewCommon', [], function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge"; // yui 压缩配置，不混淆这三个变量
    module.exports = {
        init: function(rule) {
            // 点击看大图
            jq('.warp').on('click', rule, function() {
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
                } else if (!isAppBar)  {
                    //手Q图片放大
                    if (!jq('#imageView')[0]) {
                        jq('body').append('<div id="imageView" class="slide-view" style="display:none;"></div>');
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
        }
    }
});
