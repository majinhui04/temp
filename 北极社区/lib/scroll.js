/**
 * @filename scroll
 * @description
 * 作者: yixizhou(yixizhou@tencent.com)
 * 创建时间: 2014-04-18 09:06:03
 * 修改记录:
 *
 * $Id$
 **/

define('lib/scroll', [], function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge"; // yui 压缩配置，不混淆这三个变量
    module.exports = {
        // initScroll('.slideBoxWrapper ul', false, '.container');
        initScroll: function(ulSelector, isFlip, containerSelector, pageOnClass) {
            var cSelector = containerSelector || 'body';
            var isFlip = isFlip || false;
            var pageOnClass = pageOnClass || 'on';
            // 图片横滑
            var x, y, endX, endY, offsetX, offsetY, objLeft, left = 0, tabIndex = 0;

            var ulObj = jq(ulSelector);

            var minX = 0 ;
            jq(cSelector).on('touchstart', ulSelector, function(e) {
                jq(this).css({'position':'relative'});
                x = endX = e.originalEvent.touches[0].pageX;
                y = endY = e.originalEvent.touches[0].pageY;
                objLeft = left;
            });
            jq(cSelector).on('touchmove', ulSelector, function(e) {
                // document.ontouchmove = function(e){ e.preventDefault();}
                endX = e.originalEvent.touches[0].pageX;
                endY = e.originalEvent.touches[0].pageY;
                offsetX = endX - x;
                offsetY = endY - y;
                // 图片上竖滑不明显时禁用上下滑
                if (Math.abs(offsetY) < Math.abs(offsetX)) {
                    if (e.preventDefault) {
                        e.preventDefault();
                    }
                    //document.ontouchmove = function(e){ e.preventDefault();}
                } else {
                    return true;
                    //document.ontouchmove = function(e){ return true;}
                }
                var obj = jq(this);
                left =  objLeft + parseInt(offsetX);
                // 防止左滑过头
                if (left > 0) {
                    left = 0;
                    offsetX = 0;
                    offsetY = 0;
                }
                if (!isFlip) {
                    minX = 0;
                    obj.find('li').each(function(i, e) {
                        minX += jq(e).width();
                    });
                    var parentObj = obj.parent();
                    minX = minX - parentObj.width() + parentObj.offset().left;
                    minX *= -1;
                } else {
                    var liObj = obj.find('li');
                    minX = -1 * liObj.width() * (liObj.length - 1);
                }
                // 防止左滑过头
                if (left <= minX) {
                    left = minX;
                    offsetX = 0;
                    offsetY = 0;
                }
                jq(this).css("left", left);

            });
            jq(cSelector).on('touchend', ulSelector, function(e) {
                if (!isFlip) {
                    objLeft = left;
                    document.ontouchstart = function(e){ return true;}
                } else {
                    changeTab(this.id, -1, offsetX);
                    offsetX = 0;
                }
            });

            /*
            if (isFlip) {
                jq('.expreList .pNumCon a').on('click', function() {
                    var thisObj = jq(this);
                    var ulId = 'exp' + thisObj.parent().attr('id').replace('page', '');
                    changeTab(ulId, thisObj.index());
                });
            }
            */

            // 表情滑动效果
            var changeTab = function (ulId, index, offsetX) {

                var pObj = jq('#' + ulId + '_page a');
                var len = pObj.length;

                if(index < 0) {
                    if(offsetX > 10) {
                        index = tabIndex - 1;
                    } else if(offsetX < -10) {
                        index = tabIndex + 1;
                    } else {
                        index = tabIndex;
                    }
                }

                if(index > len - 1 || index < 0) {
                    return;
                }

                var pageWidth = jq('#' + ulId + ' li').width();
                var le = -1 * pageWidth * index;
                var le_px =  le + "px";

                left = le;

                jq('#' + ulId).stop().animate({
                    "left": le_px
                }, 100, function(){
                    // 修改 Left
                    left = le;
                });

                pObj.removeClass(pageOnClass);
                pObj.eq(index).addClass(pageOnClass);

                tabIndex = index;
            };

        }
    };
});

