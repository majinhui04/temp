define("module/mySiteIndex",["module/followSite"],function(require,exports,module){var a=require("module/followSite");module.exports={init:function(){jq(".interestBox img").lazyload({skip_invisible:false,threshold:100});jq(".warp").on("click","#findSites li a",function(){var b=jq(this);b.off("click");b.addClass("iBtnOn");a.followSite.call(b);setTimeout(function(){b.removeClass("iBtnOn")},50)});jq(".warp").on("click","#followdSites li a",function(){var b=jq(this);b.off("click");b.addClass("iBtnOn");a.unfollowSite.call(b);setTimeout(function(){b.removeClass("iBtnOn")},50)});jq(".warp").on("click","#hotSiteList li a",function(){var b=jq(this);b.off("click");b.addClass("iBtnOn");a.followSite.call(b);setTimeout(function(){b.removeClass("iBtnOn")},50)});jq(".warp").on("click","#newSiteList li a",function(){var b=jq(this);b.off("click");b.addClass("iBtnOn");a.followSite.call(b);setTimeout(function(){b.removeClass("iBtnOn")},50)});jq("#findSites li h4, #findSites li i, #findSites li .subTitle").on("click",function(){sId=jq(this).parent().attr("sid");jq.DIC.reload("/"+sId)});jq(".warp").on("click","#followdSites li h4, #followdSites li img, #followdSites li .subTitle",function(){sId=jq(this).parent().attr("sid");jq.DIC.reload("/"+sId)});jq("#hotSiteList li h4, #hotSiteList li i, #hotSiteList li .subTitle").on("click",function(){sId=jq(this).parent().attr("sid");jq.DIC.reload("/"+sId)});jq("#newSiteList li h4, #newSiteList li i, #newSiteList li .subTitle").on("click",function(){sId=jq(this).parent().attr("sid");jq.DIC.reload("/"+sId)})}};module.exports.init()});