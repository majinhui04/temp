/**
 * @filename appBar
 * @description
 * 作者: vissong(vissong@tencent.com)
 * 创建时间: 2013-6-5 14:56:03
 * 修改记录:
 *
 * $Id$
 **/

define('module/appBar', [], function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge"; // yui 压缩配置，不混淆这三个变量
    module.exports = {
        init: function() {
            var package =  (new Function('', 'return ' + window.package))() || {};
            var packageName = package['pkgname'];
            require.async('lib/jsbridge', function() {

                if (/http:\/\/mq.wsq.qq.com\/(\d)+\/t\/(\d+)/.test(location.href) || /http:\/\/mq.wsq.qq.com\/(\d+)/.test(location.href)) {
                    // 初始化分享
                    JsBridge.setShareInfo({
                        allowShare : 1,
                        iconUrl : window.shareImgUrl,
                        jumpUrl : window.shareUrl,
                        title : window.shareTitle,
                        summary : window.shareDesc
                    });
                } else {
                    // 初始化分享
                    JsBridge.setShareInfo({
                        allowShare : 0,
                    });
                }

                // 看图
                jq(document).on('click', '.slideBox li', function() {
                    FastClick.attach(this);
                    var pics = [];
                    var thisObj = jq(this);
                    thisObj.parent().find('img').each(function(e, i) {
                        pics.push(jq(i).attr('data-original').replace(/\/150$/g, '\/1280'));
                    });
                    JsBridge.showPictures(pics, thisObj.index());
                });

                // block avatar click
                jq(document).on('click', '.bImg', function() {
                    return false;
                });

                // 未登录
                if (authUrl) {
                    // sdk中未登录弹登录
                    if (window.showLogin && JsBridge.SCENE == JsBridge.SCENE_DOWNLOADER_SDK) {
                        JsBridge.login(function () {jq.DIC.reload();});
                        return false;
                    }
                    var replyId = '.threadReply';
                    jq('.warp,.bottomBar').on('click', replyId, function() {
                        JsBridge.login(function () {jq.DIC.reload();});
                        return false;
                    });
                    jq('.container').on('click', '.topicList ul li', function(e) {
                        JsBridge.login(function () {jq.DIC.reload();});
                        return false;
                    });
                    // 赞
                    jq('.warp').on('click', '.like', function() {
                        JsBridge.login(function () {jq.DIC.reload();});
                        return false;
                    });
                    jq('.bottomBar').on('click', '.publish, #followButton', function() {
                        JsBridge.login(function () {jq.DIC.reload();});
                        return false;
                    });
                }

                // 帖子详情页弹出分享菜单
                if (window.tId && window.location.search.indexOf('action=share') !== -1) {
                    setTimeout(function() {
                        JsBridge.share(JsBridge.SHARE_USER_SELECTION);
                    }, 20);
                    // 详情页不出应用的安装状态
                    return false;
                }

                // 应用详情页,回复打开新webview
                if (JsBridge.SCENE == JsBridge.SCENE_DOWNLOADER_DETAIL) {
                    jq('.warp').off('click', '.threadReply');
                    jq('.warp').on('click', '.threadReply', function() {
                        var tId = jq(this).attr('tid');
                        var url = DOMAIN + sId + '/t/' + tId + '?action=reply';

                        if (authUrl) {
                            JsBridge.login(function () {
                                JsBridge.openNewWindow(url);
                            });
                        } else {
                            JsBridge.openNewWindow(url);
                        }
                    });
                }

                // 应用详情页 不检测应用状态
                if (JsBridge.SCENE == JsBridge.SCENE_DOWNLOADER_DETAIL) {
                    return false;
                }

                if (!package) {
                    return false;
                }

                // 列表页点头部到应用详情页
                if (!window.tId && packageName) {
                    // 判断是否安装应用宝
                    JsBridge.getAppInstalledVersion(['com.tencent.android.qqdownloader'], function (result) {
                        var currVer = result['com.tencent.android.qqdownloader'];
                        var jumpUrl = 'tmast://appdetails?appid=5848&pname=' + packageName;
                        // 已安装应用宝跳到详情页
                        if (!currVer) {
                            var jumpUrl = 'http://down.myapp.com/myapp/smart_ajax/com.tencent.android.qqdownloader/992353_17762885_1397538044600.apk';
                            if (window.sId) {
                                // 根据渠道下载应用宝
                                switch(window.sId) {
                                    case 159718216:
                                        jumpUrl = 'http://down.myapp.com/myapp/smart_ajax/com.tencent.android.qqdownloader/992356_17762885_1397550725347.apk';
                                        break;
                                    case 209905331:
                                        jumpUrl = 'http://down.myapp.com/myapp/smart_ajax/com.tencent.android.qqdownloader/992357_17762885_1397550734481.apk';
                                        break;
                                }
                            }
                        }

                        // 头部点击下载
                        jq('.header').on('click', function(e) {
                            if (!currVer || currVer <= 4210000) {
                                return false;
                            }

                            window.location.href = jumpUrl;
                            return false;
                        });

                        // 显示下载按纽
                        if (!currVer) {
                            jq('.appBtn').html('下载')
                            .off()
                            .on('click', function(e) {
                                e.stopPropagation();
                                window.location.href = jumpUrl;
                                return false;
                            })
                            .show();
                        }
                    });
                }

                var pkgNames = [];
                pkgNames.push(packageName);

                // 检查安装应用安装版本
                JsBridge.getAppInstalledVersion(pkgNames, function (result) {
//                    var pkgInfo = JSON.stringify(result);
                    var version = result[packageName];
                    // 已安装 且为最新版本 显示启动应用
                    if (version && version >= package['versioncode']) {
                        module.exports.initStart(packageName);
                    } else {
                        // 已安装，但有新版本
                        if (package['versioncode'] > version) {
                            package.isUpdate = true;
                        }
                        // 初始化下载
                        module.exports.initDownload(package);
                    }
                });

                /*
                JsBridge.onReady(function () {
                   alert(typeof window.JsBridge.SCENE);
                });
                */

          });

        },
        // 启动按纽事件
        initStart: function(packageName) {
            jq('.appBtn').html('启动')
            .off()
            .on('click', function(e) {
                e.stopPropagation();
                JsBridge._call("report", {
                    scene : 'YYB.APPBAR.HOME',
                    sourceScene : '',
                    slotId : 0,
                    action : 500,
                    params : ''
                });
                JsBridge.startApp(packageName, null);
                return false;
            })
            .show();
        },
        // 下载事件
        initDownload: function(package) {
            if (JsBridge.SCENE == JsBridge.SCENE_DOWNLOADER_SDK) {
                return false;
            }
            var appReady = true;
            var appDownStart = false;
            var btnTitle = '正在下载';
            var appBtn = jq('.appBtn');

            var downloadParam = {
                'hnAppId': package['ma_appid'],                        // 即通appid
                'sngAppId': package['open_appid'],                      // 应用宝appid（海纳appid）
                'versionCode': package['versioncode'],                         // 应用版本号
                'url': package['apkurl'],                                 // .apk安装包路径
                'packageName': package['pkgname'],                 // 包名
                'alias': package['appname'],                        // 应用中文名
                'md5': package['file_md5'],  // 安装包MD5
                'isUpdate': package['isUpdate'] || false                           // 是否为升级
            };

            /*
            var url = "http://dd.myapp.com/16891/5E47F7DBF0B0E7CB0A1ED8013D961DD0.apk?fsname=com%2Etencent%2Epao%5F1%2E0%2E8%2E0%5F108.apk";
            var downloadParam = {
                hnAppId : 10099632,
                sngAppId : 100692648,
                versionCode : 108,
                url : url,
                packageName : "com.tencent.pao",
                alias : "天天酷跑",
                md5 : "5E47F7DBF0B0E7CB0A1ED8013D961DD0"
            };
            */
            var download = new JsBridge.Download(downloadParam, function(state, percentage, context) {
                // 实例化，时应用宝调用检查应用状态

                appReady = state;
                switch (state) {
                    case JsBridge.Download.STATE_FAILED:
                        if (appDownStart) {
                            btnTitle = '下载失败';
                        } else {
                            btnTitle = '无法下载';
                            appReady = false;
                        }
                        break;
                    case JsBridge.Download.STATE_QUEUING:
                        btnTitle = '等待下载';
                        break;
                    case JsBridge.Download.STATE_DOWNLOADING:
                        btnTitle = '正在下载';
                        break;
                    case JsBridge.Download.STATE_PAUSED:
                        btnTitle = '已暂停';
                        break;
                    case JsBridge.Download.STATE_INSTALLING:
                        btnTitle = '正在安装';
                        break;
                    case JsBridge.Download.STATE_INSTALLED:
                        if (package['isUpdate']) {
                            btnTitle = '升级';
                        } else {
                            btnTitle = '启动';
                        }
                        break;
                    case JsBridge.Download.STATE_DOWNLOADED:
                        btnTitle = '安装';
                        break;
                    default:
                        btnTitle = '下载';
                }

                appBtn.html(btnTitle).show();
                // todo 进度条？
//                console.log("下载状态回调, this: ", this, ", identifier: ", this.identifier, ", state: ", state, ", percentage: ", percentage, ", context: ", context);
            }, {});

            // 正常状态
            if (appReady) {
                appBtn.off().on('click', function(e) {
                    e.stopPropagation();
                    appDownStart = true;
                    switch (appReady) {
                        case JsBridge.Download.STATE_INSTALLED:
                            if (package['isUpdate']) {
                                JsBridge._call("report", {
                                    scene : 'YYB.APPBAR.HOME',
                                    sourceScene : '',
                                    slotId : 0,
                                    action : 2000,
                                    params : ''
                                });
                                // todo 这块测试环境状态和应用包不同，显示逻辑等有问题
                                download.start();
                            } else {
                                JsBridge._call("report", {
                                    scene : 'YYB.APPBAR.HOME',
                                    sourceScene : '',
                                    slotId : 0,
                                    action : 500,
                                    params : ''
                                });
                                setTimeout(function() {
                                    JsBridge.startApp(packageName, null);
                                }, 20);
                            }
                            break;
                        case JsBridge.Download.STATE_DOWNLOADED:
                            JsBridge._call("report", {
                                scene : 'YYB.APPBAR.HOME',
                                sourceScene : '',
                                slotId : 0,
                                action : 300,
                                params : ''
                            });
                            setTimeout(function() {
                                download.install();
                            }, 20);
                            break;
                        case JsBridge.Download.STATE_DOWNLOADING:
                        case JsBridge.Download.STATE_QUEUING:
                            download.stop();
                            break;
                        default:
                            JsBridge._call("report", {
                                scene : 'YYB.APPBAR.HOME',
                                sourceScene : '',
                                slotId : 0,
                                action : 900,
                                params : ''
                            });
                            download.start();
                    }
                    return false;
                });
            } else {
                appBtn.html('无法下载').show();
            }
        }
    };
    module.exports.init();
});
