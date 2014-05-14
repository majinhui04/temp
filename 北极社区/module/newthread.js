/**
 * @filename newthread
 * @description
 * 作者: vissong(vissong@tencent.com)
 * 创建时间: 2013-6-5 14:56:03
 * 修改记录:
 *
 * $Id: viewthread.js 21874 2013-09-11 07:55:29Z danvinhe $
 **/

define('module/newthread', ['module/emotion', 'module/gps'], function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge"; // yui 压缩配置，不混淆这三个变量
    var gps = require('module/gps');
    var emotion = require('module/emotion');
    module.exports = {
        maxUpload : 8,
        // 上传信息 主要是 id 对应信息
        uploadInfo: {},
        // 上传队列，里面保存的是 id
        uploadQueue: [],
        // 预览队列，里面保存的是 id
        previewQueue: [],
        // 请求对象
        xhr: {},
        // 是否有任务正在上传
        isBusy: false,
        // 获取地理位置状态
        getgps: 1,
        countUpload: function() {

            var num = 0;
            jq.each(module.exports.uploadInfo, function(i, n) {
                if (n) {
                    ++ num;
                }
            });

            return num;
        },
        // 图片预览
        uploadPreview: function(id) {

            var reader = new FileReader();
            var uploadBase64;
            var conf = {}, file = module.exports.uploadInfo[id].file;

            reader.onload = function(e) {
                var result = this.result;

                // 如果是jpg格式图片，读取图片拍摄方向,自动旋转
                if (file.type == 'image/jpeg'){
                    // console.log(result);
                    // console.log(file.name);
                    try {
                        var jpg = new JpegMeta.JpegFile(result, file.name);
                    } catch (e) {
                        jq.DIC.dialog({content: '图片不是正确的图片数据',autoClose:true});
                        jq('#li' + id).remove();
                        return false;
                    }
                    if (jpg.tiff && jpg.tiff.Orientation) {
                        //设置旋转
                        conf = jq.extend(conf, {
                            orien: jpg.tiff.Orientation.value
                        });
                    }
                }

                // 压缩
                if (ImageCompresser.support()) {
                    var img = new Image();
                    img.onload = function() {
                        console.log(conf);
                        try {
                            uploadBase64 = ImageCompresser.getImageBase64(this, conf);
                        } catch (e) {
                            jq.DIC.dialog({content: '压缩图片失败',autoClose:true});
                            jq('#li' + id).remove();
                            return false;
                        }
                        if (uploadBase64.indexOf('data:image') < 0) {
                            jq.DIC.dialog({content: '上传照片格式不支持',autoClose:true});
                            jq('#li' + id).remove();
                            return false;
                        }

                        module.exports.uploadInfo[id].file = uploadBase64;
                        jq('#li' + id).find('img').attr('src', uploadBase64);
                        module.exports.uploadQueue.push(id);
                    }
                    img.onerror = function() {
                        jq.DIC.dialog({content: '解析图片数据失败',autoClose:true});
                        jq('#li' + id).remove();
                        return false;
                    }
                    img.src = ImageCompresser.getFileObjectURL(file);
                    // console.log('compress');
                } else {
                    uploadBase64 = result;
                    if (uploadBase64.indexOf('data:image') < 0) {
                        jq.DIC.dialog({content: '上传照片格式不支持',autoClose:true});
                        jq('#li' + id).remove();
                        return false;
                    }

                    module.exports.uploadInfo[id].file = uploadBase64;
                    jq('#li' + id).find('img').attr('src', uploadBase64);
                    module.exports.uploadQueue.push(id);
                }
            }

            reader.readAsBinaryString(module.exports.uploadInfo[id].file);
        },
        // 创建上传请求
        createUpload: function(id) {

            if (!module.exports.uploadInfo[id]) {
                return false;
            }

            // 图片posturl
            var uploadUrl = DOMAIN + sId + '/pic/upload?isAjax=true&resType=json';
            // 产生进度条
            var progressHtml = '<div class="progress" id="progress'+id+'"><div class="proBar" style="width:0%;"></div></div>';
            jq('#li' + id).find('.maskLay').after(progressHtml);

            var formData = new FormData();
            formData.append('pic', module.exports.uploadInfo[id].file);
            formData.append('CSRFToken', CSRFToken);
            formData.append('sId', sId);
            formData.append('id', id);

            var progress = function(e) {
                if (e.target.response) {
                    var result = jq.parseJSON(e.target.response);
                    if (result.errCode != 0) {
                        // jq('#content').val(result.errCode);
                        jq.DIC.dialog({content:'网络不稳定，请稍后重新操作',autoClose:true});
                        removePic(id);
                    }
                }

                var progress = jq('#progress' + id).find('.proBar');
                if (e.total == e.loaded) {
                    var percent = 100;
                } else {
                    var percent = 100*(e.loaded / e.total);
                }
                // 控制进度条不要超出
                if (percent > 100) {
                    percent = 100;
                }
                progress.css('width', percent + '%');

                if (percent == 100) {
                    jq('#li' + id).find('.maskLay').remove();
                    jq('#li' + id).find('.progress').remove();
                }
            }

            var removePic = function(id) {
                donePic(id);
                jq('#li' + id).remove();
            }

            var donePic = function(id) {
                module.exports.isBusy = false;

                if (typeof module.exports.uploadInfo[id] != 'undefined') {
                    module.exports.uploadInfo[id].isDone = true;
                }
                if (typeof module.exports.xhr[id] != 'undefined') {
                    module.exports.xhr[id] = null;
                }
            }

            var complete = function(e) {
                var progress = jq('#progress' + id).find('.proBar');
                progress.css('width', '100%');
                jq('#li' + id).find('.maskLay').remove();
                jq('#li' + id).find('.progress').remove();
                // 上传结束
                donePic(id);

                var result = jq.parseJSON(e.target.response);
                if (result.errCode == 0) {
                    var input = '<input type="hidden" id="input' + result.data.id + '" name="picIds[]" value="' + result.data.picId + '">';
                    jq('#newthread').append(input);
                } else {
                    // jq('#content').val(result.errCode);
                    jq.DIC.dialog({content:'网络不稳定，请稍后重新操作',autoClose:true});
                    removePic(id);
                }
            }

            var failed = function() {
                jq.DIC.dialog({content:'网络断开，请稍后重新操作',autoClose:true});
                removePic(id)
            }

            var abort = function() {
                jq.DIC.dialog({content:'上传已取消',autoClose:true});
                removePic(id)
            }

            // 创建 ajax 请求
            module.exports.xhr[id] = new XMLHttpRequest();
            module.exports.xhr[id].addEventListener("progress", progress, false);
            // xhr.addEventListener("loadstart", loadStart, false);
            module.exports.xhr[id].addEventListener("load", complete, false);
            module.exports.xhr[id].addEventListener("abort", abort, false);
            module.exports.xhr[id].addEventListener("error", failed, false);
            module.exports.xhr[id].open("POST", uploadUrl + '&t=' + Date.now());
            module.exports.xhr[id].send(formData);
        },
        // 上传相关
        initUpload: function() {
            // 上传图片的绑定
            // jq('#addPic').on('click', function() {
                // console.log(1);
            // });

            jq('#uploadFile').on('click', function() {
                if (module.exports.isBusy) {
                    jq.DIC.dialog({content:'上传中，请稍后添加', autoClose:true});
                    return false;
                }
            });

            // 文件表单发生变化时
            jq('body').on('change', '#uploadFile', function(e) {

                e = e || window.event;
                var fileList = e.target.files;
                if (!fileList.length) {
                    return false;
                }

                for (var i = 0; i<fileList.length; i++) {
                    if (module.exports.countUpload() >= module.exports.maxUpload) {
                        jq.DIC.dialog({content:'你最多只能上传8张照片',autoClose:true});
                        break;
                    }

                    var file = fileList[i];

                    // console.log(file);
                    if (!module.exports.checkPicSize(file)) {
                        jq.DIC.dialog({content: '图片体积过大', autoClose:true});
                        continue;
                    }
                    if (!module.exports.checkPicType(file)) {
                        jq.DIC.dialog({content: '上传照片格式不支持',autoClose:true});
                        continue;
                    }

                    var id = Date.now() + i;
                    // 增加到上传对象中, 上传完成后，修改为 true
                    module.exports.uploadInfo[id] = {
                        file: file,
                        isDone: false,
                    };

                    var html = '<li id="li' + id + '"><div class="photoCut"><img src="http://dzqun.gtimg.cn/quan/images/defaultImg.png" class="attchImg" alt="photo"></div>' +
                            '<div class="maskLay"></div>' +
                            '<a href="javascript:;" class="cBtn spr db " title="" _id="'+id+'">关闭</a></li>';
                    jq('#addPic').before(html);

                    module.exports.previewQueue.push(id);
                }

                // 图片已经上传了 8 张，隐藏 + 号
                if (module.exports.countUpload() >= module.exports.maxUpload) {
                    jq('#addPic').hide();
                }

                // 把输入框清空
                jq(this).val('');
            });

            jq('.photoList').on('click', '.cBtn', function() {
                // var result = confirm('取消上传这张图片?');
                // if (!result) {
                    // return false;
                // }
                var id = jq(this).attr('_id');
                // 取消这个请求
                if (module.exports.xhr[id]) {
                    module.exports.xhr[id].abort();
                }
                // 图片删除
                jq('#li' + id).remove();
                // 表单中删除
                jq('#input' + id).remove();
                module.exports.uploadInfo[id] = null;

                // 图片变少了，显示+号
                if (module.exports.countUpload() < module.exports.maxUpload) {
                    jq('#addPic').show();
                }
            });

            setInterval(function() {
                // 预览
                setTimeout(function() {
                    if (module.exports.previewQueue.length) {
                        var jobId = module.exports.previewQueue.shift();
                        module.exports.uploadPreview(jobId);
                    }
                }, 1);
                // 上传
                setTimeout(function() {
                    if (!module.exports.isBusy && module.exports.uploadQueue.length) {
                        // console.log(module.exports.isBusy);
                        // console.log(module.exports.uploadQueue);
                        var jobId = module.exports.uploadQueue.shift();
                        module.exports.isBusy = true;
                        module.exports.createUpload(jobId);
                    }
                }, 10);
            }, 300);
        },
        init: function() {
            // 发帖的本地存储 key
            var storageKey = sId + "thread_content";
            // 本地存储 + 输入框文字计算
            jq('#content').val(localStorage.getItem(storageKey));
            timer = setInterval(function() {
                jq.DIC.strLenCalc(jq('textarea[name="content"]')[0], 'pText', 1000);
                localStorage.removeItem(storageKey);
                localStorage.setItem(storageKey, jq('#content').val());
            }, 500);

            // 发送
            var isSubmitButtonClicked = false;
            jq('#submitButton').bind('click', function() {
                if (isSubmitButtonClicked || !module.exports.checkForm()) {
                    return false;
                }
                var opt = {
                    success:function(re) {
                        var status = parseInt(re.errCode);
                        if (status == 0) {
                            clearInterval(timer);
                            localStorage.removeItem(storageKey);
                        } else {
                            isSubmitButtonClicked = false;
                        }
                    },
                    error:function(re) {
                        isSubmitButtonClicked = false;
                    }
                };
                isSubmitButtonClicked = true;
                jq.DIC.ajaxForm('newthread', opt, true);
                return false;
            });

            // 取消
            jq('.cancelBtn').bind('click', function() {
                // 如果有图片，提示
                if (jq('.photoList .attchImg').length > 0) {
                    jq.DIC.dialog({
                        content:'是否放弃当前内容?',
                        okValue:'确定',
                        cancelValue:'取消',
                        isMask:true,
                        ok:function (){
                            history.go(-1);
                        }
                    });
                } else {
                    history.go(-1);
                }

            });

            jq('#content').on('focus', function() {
                jq('.bNav').hide();
            }).on('blur', function() {
                jq('.bNav').show();
            });

            module.exports.initUpload();
            module.exports.initModal();

            // 表情开关
            emotion.init();
            jq(".expreSelect").on("click", function() {
                if (jq.os.ios) {
                    emotion.show();
                } else {
                    if (jq('.expreList').css('display') != 'none') {
                        emotion.hide();
                    } else {
                        emotion.show();
                    }
                }
            });
            jq(".photoSelect").on("click", emotion.hide);
            jq(".tagBox a").on("click", function() {
                jq(".tagBox").find('a').attr('class', '');
                var labelId = jq(this).attr('labelId');
                if(jq('input[name="fId"]').val() != labelId) {
                    jq(this).attr('class', 'on');
                    jq('input[name="fId"]').val(labelId);
                } else {
                    jq('input[name="fId"]').val(0);
                }
            });
            module.exports.checkLBS();
            jq(".locationCon").on('click', function() {
                if (module.exports.getgps == 1 || module.exports.getgps == 2) {
                    module.exports.getgps = 0;
                    jq('.locationCon').removeClass('curOn').html('<i class="locInco commF">' + '所有城市');
                    jq('#LBSInfoLatitude').val('');
                    jq('#LBSInfoLongitude').val('');
                    jq('#LBSInfoProvince').val('');
                    jq('#LBSInfoCity').val('');
                    jq('#LBSInfoStreet').val('');
                    jq('#cityCode').val('');
                } else if (module.exports.getgps == 0) {
                    module.exports.getgps = 1;
                    jq('.locationCon').html('<i class="locInco commF">' + '正在定位...');
                    module.exports.checkLBS();
                }
            });
        },
        // 获取当前地理位置
        checkLBS : function() {
            gps.getLocation(function(latitude, longitude) {

                if (latitude == undefined) {
                    module.exports.getgps = 0;
                    jq('#LBSInfoLatitude').val('');
                    jq('#LBSInfoLongitude').val('');
                    jq('#LBSInfoProvince').val('');
                    jq('#LBSInfoCity').val('');
                    jq('#LBSInfoStreet').val('');
                    jq('#cityCode').val('');
                    jq('.locationCon').html('<i class="locInco commF">' + '获取位置失败');
                    return;
                }
                jq.DIC.ajax('/checkLBS', {
                    'CSRFToken' : CSRFToken,
                    'latitude' : latitude,
                    'longitude' : longitude
                }, {
                    'noShowLoading' : true,
                    'noMsg': true,
                    'success' : function(result) {
                        var status = parseInt(result.errCode);
                        var LBSInfo = result.data.LBSInfo;
                        var cityCode = result.data.cityCode;
                        if (status == 0 && module.exports.getgps == 1) {
                            module.exports.getgps = 2;
                            jq('.locationCon').addClass('curOn').html('<i class="locInco commF">' + LBSInfo.city + (LBSInfo.street ? (' ' + LBSInfo.street) : ''));
                            if (cityCode) jq('#cityCode').val(cityCode);
                            if (LBSInfo) {
                                jq('#LBSInfoLatitude').val(LBSInfo.latitude);
                                jq('#LBSInfoLongitude').val(LBSInfo.longitude);
                                jq('#LBSInfoProvince').val(LBSInfo.province);
                                jq('#LBSInfoCity').val(LBSInfo.city);
                                jq('#LBSInfoStreet').val(LBSInfo.street);
                            }
                        } else if (module.exports.getgps == 1) {
                            module.exports.getgps = 0;
                            jq('#LBSInfoLatitude').val('');
                            jq('#LBSInfoLongitude').val('');
                            jq('#LBSInfoProvince').val('');
                            jq('#LBSInfoCity').val('');
                            jq('#LBSInfoStreet').val('');
                            jq('#cityCode').val('');
                            jq('.locationCon').html('<i class="locInco commF">' + '获取位置失败');
                        }
                    }
                });
            });
        },
        // 按钮模态相关
        initModal: function() {
            // 发送按钮模态
            jq('#submitButton').bind('touchstart', function() {
                jq(this).addClass('sendOn');
            }).bind('touchend', function() {
                jq(this).removeClass('sendOn');
            });
            jq('#cBtn').bind('touchstart', function() {
                jq(this).addClass('cancelOn');
            }).bind('touchend', function() {
                jq(this).removeClass('cancelOn');
            });
        },
        checkForm: function() {

            jq.each(module.exports.uploadInfo, function(i,n) {
                if (n && !n.isDone) {
                    jq.DIC.dialog({content:'图片上传中，请等待', autoClose:true});
                    return false;
                }
            });

            var content = jq('#content').val();
            var contentLen = jq.DIC.mb_strlen(jq.DIC.trim(content));
            if (contentLen < 15) {
                jq.DIC.dialog({content:'内容过短', autoClose:true});
                return false;
            }

            return true;
        },
        // 检查图片大小
        checkPicSize: function(file) {
            // 8M
            if (file.size > 10000000) {
                return false;
            }

            return true;
        },
        // 检查图片类型
        checkPicType: function(file) {
            return true;
        }
    };
    module.exports.init();
});
