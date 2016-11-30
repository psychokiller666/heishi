// 商品内容页
// 页面初始化
var common = require('../common/common.js');
// 微信jssdk
var wx = require('weixin-js-sdk');
// handlebars
var handlebars = require('../../../../node_modules/handlebars/dist/handlebars.min.js');
// 百度上传组件
var WebUploader = require('../../../../node_modules/tb-webuploader/dist/webuploader.min.js');
// 过滤关键词
var esc = require('../../../../node_modules/chn-escape/escape.js');
// 图片延时加载
var lazyload = require('../../../../bower_components/jieyou_lazyload/lazyload.min.js');

$(document).on('pageInit','.store-show', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  var share_data = {
    title: page.find('.frontcover .title').text()+' | 黑市',
    desc: page.find('.content_bd').text(),
    link: GV.HOST+location.pathname,
    img: page.find('.frontcover .image').data('share')
  };
  init.wx_share(share_data);
  // 检查是否关注
  init.checkfollow(1);
  // 系统公告
  var placard = $('.placard');
  var placard_content;
  var placard_id;
  if(placard.attr('data-placard').length){
    placard.show();
    placard_content = placard.attr('data-placard').split('|')[1];
    placard_id = placard.attr('data-placard').split('|')[0];
    placard.find('.placard_content').text(placard_content);
  } else {
    placard.hide();
  }
  placard.on('click','.placard_close',function(){
    $.post('/index.php?g=restful&m=HsSystemNotice&a=disabled',{
      notice_id:placard_id
    },function(res){
      if(res.status == 1 ){
        placard.hide();
      } else {
        $.alert(res.info);
      }
    })
  })
  // 过滤关键词
  var text_list = [
  '燃料',
  '大麻',
  '叶子',
  '淘宝',
  'taobao.com',
  '共产党',
  '有飞',
  '想飞',
  '要飞',
  '微信',
  '加我',
  '大妈',
  '飞吗',
  '飞嘛',
  'qq',
  '拿货',
  'weed',
  '机长',
  'thc',
  'V信',
  'wechat',
  'VX',
  '蘑菇',
  '邮票',
  'LSD',
  'taobao',
  'tb',
  '操你妈',
  '草你妈',
  '🍃'
  ];
  // 过滤关键词插件esc初始化
  esc.init(text_list);
  if($('.hs-store-show-header').length){
    // 加关注
    // 检查用户关系
    var attention_btn = $('.attention-btn');
    if(attention_btn.data('myuid') != attention_btn.data('otheruid')) {
      $.post('/index.php?g=user&m=HsFellows&a=ajax_relations',{
        my_uid:attention_btn.data('myuid'),
        other_uid:attention_btn.data('otheruid')
      },function(data){
        if(data.relations == '2' || data.relations == '3') {
          attention_btn.addClass('active');
          attention_btn.text('取消关注');
          attention_btn.removeClass('hide');
        } else if(data.relations == '1' || data.relations == '0') {
          attention_btn.removeClass('active');
          attention_btn.html('<i class="hs-icon"></i>关注');
          attention_btn.removeClass('hide');
        }

      });
    } else {
      attention_btn.addClass('hide');
    }
    // 操作关注 & 取消关注
    page.on('click','.attention-btn',function(){
      var _this = $(this);
      if(_this.hasClass('active')){
        // 取消关注
        $.post('/index.php?g=user&m=HsFellows&a=ajax_cancel',{
          uid:_this.data('otheruid')
        },function(data){
          if(data.status == '1') {
            _this.html('<i class="hs-icon"></i>关注');
            _this.removeClass('active');
            $.toast(data.info);
          } else {
            $.toast(data.info);
          }
        });
      } else {
        // 关注
        $(".prompt").on('touchmove',function(e){
          e.preventDefault();
        })
        $(".prompt").css("display","block");
        $(".prompt button").click(function(){
          $.post('/index.php?g=user&m=HsFellows&a=ajax_add',{
            uid:_this.data('otheruid')
          },function(data){
            $(".prompt").css("display","none");
            if(data.status == '1') {
              _this.text('取消关注');
              _this.addClass('active');
              $.toast(data.info);
            } else {
              $.toast(data.info);
            }
          });
        })
      }
    });
  }
  // 微信预览图片
  var images = $('.images');
  page.on('click','.images ul li',function(){

    if(GV.device == 'any@weixin') {
      if($(this).hasClass('video')){
        $.photoBrowser({
          photos : [{html:'<video width="100%" controls="controls" autoplay="autoplay" poster＝"'+$(this).data('layzr')+'"><source src="'+$(this).data('video')+'" type="video/mp4">你那破鸡吧不支持播放</video>'}],
          container : '.container',
          type: 'popup'
        }).open();
        // $.popup('<div class="popup popup-video">'+
        //   '<div class="popup-header"><a class="hs-icon close-popup"></a></div>'+
        //   '<div class="content-block">'+
        //   '<video src="'+$(this).data('video')+'" width="100%" controls="controls" autoplay="autoplay"></video>'+
        //   '</div>'+
        //   '</div>', true)
      } else {
        var preview_list = [];
        $.each($('.images ul li'),function(index,item){
          preview_list.push($('.images ul li').eq(index).data('preview'));
        });
        wx.previewImage({
          current: $(this).data('preview'),
          urls: preview_list
        });
      }
    } else {
      var preview_lists = [];
      $.each($('.images ul li'),function(index,item){
        if($(item).hasClass('video')){
          preview_lists.push({html:'<video src="'+$('.images ul li').eq(index).data('video')+'" width="100%" controls="controls" autoplay="autoplay"></video>'});
        } else {
          preview_lists.push({url:$('.images ul li').eq(index).data('preview')});
        }
      });
      var previewimage = $.photoBrowser({
        photos : preview_lists,
        container : '.container',
        type: 'popup'
      })
      previewimage.open();
    }
  });

  // 打赏
  var dialog_reward = $('.dialog_reward');
  var reward_btn = $('.reward_btn');
  page.on('click','.reward_btn',function(){
    dialog_reward.find('input').val('');
    dialog_reward.show();
  });
  // 打赏框
  dialog_reward.on('click','.ui-dialog-close',function(){
    dialog_reward.hide();
  });
  dialog_reward.on('click','.submit',function(){
    var _this = $(this);

    if(dialog_reward.find('input').val() >= 1){
      $.ajax({
        type: 'POST',
        url: '/index.php?g=restful&m=HsOrder&a=add',
        data: {
          'order[object_id]': _this.data('id'),
          'order[counts]': parseInt(dialog_reward.find('input').val()),
          'order[type]': 0,
          'order[payment_type]': 0,
          'order[attach]': '打赏'
        },
        dataType: 'json',
        timeout: 4000,
        success: function(data){
          if (data.status == '1') {
            dialog_reward.hide();
            $.showPreloader();
            var ok_url = GV.pay_url+'hsadmire.php?order_number=' + data.order_number +
            '&object_id=' + _this.data('id') +
            '&quantity=' + parseInt(dialog_reward.find('input').val()) +
            '&seller_username=' + _this.data('username');
            setTimeout(function() {
              $.hidePreloader();
              window.location.href = ok_url;
            }, 2000);
          } else if(data.status == '0'){
            $.toast(data.info);
          }
        },
        error: function(xhr, type){
          $.toast('网络错误 code:'+xhr);
        }
      });
    } else {
      $.toast('😐 必须是整数');
      dialog_reward.find('input').trigger('focus');
    }
  });
  // 发送私信
  var dialog_chat = $('.dialog_chat');
  var image_list = dialog_chat.find('.image_list');
  page.on('click','.chat_btn',function(){
    dialog_chat.find('textarea').val('');
    dialog_chat.show();
  });

  dialog_chat.on('click','.submit',function(){
    var _this = $(this);
    var content;
    var content_type;
    if(dialog_chat.find('textarea').val().length) {
      content = dialog_chat.find('textarea').val();
      content_type = 0;
    } else {
      content = dialog_chat.find('textarea').attr('data-imgurl');
      content_type = 1;
    }

    if(!content) {
      $.toast('私信内容不能为空');
    } else if (esc.find(content).length) {
      dialog_chat.hide();
      $.toast('🚔 我要报警了');
    } else {
      $.post('/index.php?g=restful&m=HsMessage&a=send',{
        to_uid:_this.data('touid'),
        content_type:content_type,
        content:content
      },function(data){
        if(data.status == 1) {
          dialog_chat.hide();
          dialog_chat.find('textarea').val('');
          $.toast('私信成功');
        } else {
          $.toast(data.info);
        }
        chat_uploader.reset();
      })
    }
  })

  // 上传图片
  var chat_uploader = WebUploader.create({
    fileNumLimit: 1,
    // 自动上传。
    auto: true,
    // 文件接收服务端。
    server: '/index.php?g=api&m=HsFileupload&a=upload',
    // 二进制上传
    sendAsBinary: true,
    // 只允许选择文件，可选。
    accept: {
      title: 'Images',
      extensions: 'gif,jpg,jpeg,bmp,png,webp',
      mimeTypes: 'image/*'
    }
  });
  // 监听input file是否有文件添加进来
  dialog_chat.on("change",'.webuploader-element-invisible', function(e) {
    chat_uploader.addFiles(e.target.files);
    chat_uploader.upload();
  });
  // 图片列队
  chat_uploader.onFileQueued = function(file){
    // 控制提交按钮
    dialog_chat.find('.ui-dialog-close').attr('disabled','disabled');
    dialog_chat.find('.submit').attr('disabled','disabled');
    dialog_chat.find('.updata_image_btn').hide();
    // 控制回复框
    dialog_chat.find('textarea').attr('disabled','disabled');
    dialog_chat.find('textarea').attr('placeholder','图片和文字二选一！')
    // 生成缩略图
    chat_uploader.makeThumb(file,function(error,ret){
      image_list.empty();
      if(error){
        image_list.html('预览错误');
      } else {
        image_list.append('<img src="'+ret+'" />');
      }
    });
  }
  // 上传成功
  chat_uploader.onUploadSuccess = function(file,res) {
    if(res.status == 1){
      // 添加关闭按钮
      image_list.append('<button class="close" data-id="'+file.id+'"></button>');
      // 恢复提交按钮
      dialog_chat.find('.ui-dialog-close').removeAttr('disabled','disabled');
      dialog_chat.find('.submit').removeAttr('disabled','disabled');
      // 消除进度条
      image_list.find('.progress').remove();
      // 删除上传框
      dialog_chat.find('.updata_image_btn').remove();
      dialog_chat.find('textarea').attr('data-imgurl',res.data);
    } else {
      chat_uploader.reset();
      $.toast(res.info);
    }
  }
  image_list.on('click','.close',function(){
    chat_uploader.reset();
  });
  // 控制进度条
  chat_uploader.onUploadProgress = function(file,percentage) {
    image_list.append('<div class="progress"><span></span></div>');
    image_list.find('.progress span').css('width', percentage * 100 + '%');
  }
  // 上传出错
  chat_uploader.onUploadError = function(file,reason) {
    chat_uploader.reset();
    $.toast(reason);
  }
  // 当图片初始化
  chat_uploader.onReset = function(){
    dialog_chat.find('.updata_image_btn').remove();
    image_list.before('<div class="updata_image_btn"><button type="button" class="hs-icon"></button><input type="file" name="file" class="webuploader-element-invisible" accept="image/*" single></div>');
    image_list.empty();
    dialog_chat.find('textarea').removeAttr('disabled');
    dialog_chat.find('textarea').removeAttr('data-imgurl');
    dialog_chat.find('textarea').attr('placeholder','私信卖家')
    // 恢复提交按钮
    dialog_chat.find('.ui-dialog-close').removeAttr('disabled','disabled');
    dialog_chat.find('.submit').removeAttr('disabled','disabled');
  }
  // 选择时文件出错
  chat_uploader.onError = function(type){
    if(type == 'Q_EXCEED_NUM_LIMIT'){
      $.toast('最多可上传1张');
    } else if(type == 'Q_EXCEED_SIZE_LIMIT') {
      $.toast('太大了，不让传');
    } else if(type == 'Q_TYPE_DENIED') {
      $.toast('兄弟必须是图片');
    }
    chat_uploader.reset();
  }

  // 关闭按钮
  dialog_chat.on('click','.ui-dialog-close',function(){
    dialog_chat.hide();
    chat_uploader.reset();
  });
  // 点赞
  var praise = $('.praise');
  var praise_number = $('.praise .header').find('span');
  var praise_list_tpl = handlebars.compile($("#praise_list_tpl").html());

  page.on('click','.praise_btn',function(){
    var btn_data = {
      uid:$(this).data('uid'),
      username:$(this).data('username'),
      avatar:$(this).data('avatar')
    };
    $.ajax({
      type: 'POST',
      url: '/index.php?m=HsArticle&a=do_like',
      data: {
        id:$(this).data('id')
      },
      dataType: 'json',
      timeout: 10000,
      success: function(data){
        if(data.status == 1){
          $.toast(data.info);
          $('.praise_btn').parent('li').after(praise_list_tpl(btn_data));
          // 数字加1
          praise_number.text(parseInt(praise_number.text())+1);
          init.loadimg();
        } else {
          $.toast(data.info);
        }
      },
      error: function(xhr, type){
        $.toast('网络错误 code:'+xhr);
      }
    });
  });
  //收藏
  page.on('click','.collect',function(){
    var bool=$(".collect i").hasClass("nocollect");
    if(bool){
      $(".collect i").removeClass("nocollect").addClass("collect");
      collect(this)
    }
    function collect(that){
       $.ajax({
      type: 'POST',
      url: '/index.php?g=user&m=Favorite&a=do_favorite_new',
      data: {
        id:$(that).data('id')
      },
      dataType: 'json',
      timeout: 10000,
      success: function(data){
        console.log(data);
        if(data.status == 1){
          $.toast(data.info);
          init.loadimg();
        } else {
          $.toast(data.info);
        }
      },
      error: function(xhr, type){
        $.toast('网络错误 code:'+xhr);
      }
    });
    }
  });
  // 更多按钮
  var praise_more_tpl = handlebars.compile($("#praise_more_tpl").html());
  $('.store-show .praise ul li').each(function(index,item){
    if(index <= 7) {
      $('.store-show .praise ul').height('1.32rem');
    } else if (index >= 16){
      $('.store-show .praise ul li').eq(15).before(praise_more_tpl('更多'));
    } else {
      $('.store-show .praise ul').height('2.64rem');
    }
  });
  // 显示更多点赞列表
  $('.praise_more').live('click',function(){
    $('.praise_more').parent().remove();
    if($(this).hasClass('active')) {
      $(this).parent().remove();
      $('.store-show .praise ul li').eq(15).before(praise_more_tpl());
      $('.store-show .praise ul').height('2.64rem');
    } else {
      $(this).parent().remove();
      $('.store-show .praise ul').height('auto');
      $('.store-show .praise ul').append(praise_more_tpl());
      $('.praise_more').addClass('active');
    }
  });
  // 评论加载更多
  var comment = $('.comment');
  var comment_bd = $('.comment_bd');
  var loading = false;
  // 初始化下拉
  var is_load = true;
  var comment_list_tpl = handlebars.compile($("#comment_list_tpl").html());

  // 增加模板引擎判断
  handlebars.registerHelper('eq', function(v1, v2, options) {
    if(v1 == v2){
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });
  // 请求加载评论方法
  function add_data(post_id,cur_cid) {
    $.ajax({
      type: 'GET',
      url: '/index.php?g=Comment&m=Widget&a=ajax_more&table=posts',
      data: {
        post_id:post_id,
        cur_cid:cur_cid
      },
      dataType: 'json',
      timeout: 10000,
      success: function(data){
        console.log("requst in success function.");
        if(data.state == 'success'){
          if(data.status == '1'){
            if(data.comments.length == 0){
              // 加载完毕，则注销无限加载事件，以防不必要的加载
              $.detachInfiniteScroll($('.infinite-scroll'));
              // 删除加载提示符
              $('.infinite-scroll-preloader').remove();
              $.toast('😒 没有评论了');
            } else {
              // 删除刚刚添加的
              comment_bd.find('.new').remove();
              // 添加继续
              comment_bd.append(comment_list_tpl(data));
              comment.attr('data-cid',comment_bd.find('.father').last().data('id'));
              old_cid = comment_bd.find('.father').last().data('id');
              $('[data-layzr]').lazyload({
                data_attribute:'layzr',
                container: $(".comment")
              });
            }
          } else if(data.status == '0'){
              // 加载完毕，则注销无限加载事件，以防不必要的加载
              // 重置加载flag
              $.detachInfiniteScroll($('.infinite-scroll'));
              // 删除加载提示符
              $('.infinite-scroll-preloader').remove();
              $.toast('😒 没有评论了');

            }
          } else {
            $.toast(data.info);
          }
          loading = false;
        },
        error: function(xhr, type){
          loading = false;
          // $.toast('网络错误 code:'+type);
        }
      });
  }
  var old_cid="";
  var first_request = true;
  // 控制下拉加载评论
  page.on('infinite', function(){
    if (loading ){
        console.log("@infinite block loading return loading=" + loading);   
        return;
    } 
    // 设置flag
    // console.log("@infinite begin to loading loading=" + loading);
    loading = true;
    // 如果当前页面加载过。直接加载最后的cid
      // 请求数据
      var new_cid = comment.data('cid');
      if (new_cid=="" && first_request) {
        add_data(comment.data('id'),new_cid);
        first_request = false;
      } else if (new_cid != old_cid) {
        return;
      } else {
        add_data(comment.data('id'),new_cid);
      }
      //add_data(comment.data('id'),comment.data('cid'));
      $.refreshScroller();
  });

  // 添加评论
  var comment_btn = $('#comment-btn');
  var footer_nav = $('.footer_nav');
  var comment_bd = $('.comment_bd');
  var dialog_comment = $('.dialog_comment');
  var comment_count = $('.comment_count');
  var comment_input = $('#comment_input');
  var reply_tpl = handlebars.compile($("#reply_tpl").html());

  // 弹出回复框
  function comment_box(id,ispic,username,element,is_father,is_wxinput,comment_data) {
    // 初始化
    comment_input.val('').attr('placeholder','随便说点什么');
    dialog_comment.find('button').removeAttr('disabled');
    dialog_comment.show();
    comment_input.trigger('focus');
    var image_list = dialog_comment.find('.image_list');
    var image = dialog_comment.find('.image');
    var type =0;
    // 上传图片
    var uploader = WebUploader.create({
      fileNumLimit: 1,
      // 自动上传。
      auto: true,
      // 文件接收服务端。
      server: '/index.php?g=api&m=HsFileupload&a=upload',
      // 二进制上传
      sendAsBinary: true,
      // 只允许选择文件，可选。
      accept: {
        title: 'Images',
        extensions: 'gif,jpg,jpeg,bmp,png,webp',
        mimeTypes: 'image/*'
      }
    });
    // 判断是否是回复
    if (username.length) {
      comment_input.attr('placeholder','回复：'+username);
    } else {
      comment_input.attr('placeholder','随便说点什么');
    }
    // 控制是否上传图片
    if (ispic) {
      dialog_comment.find('.image').show();
    } else {
      dialog_comment.find('.image').hide();
    }
    // 禁止滑动
    dialog_comment.on('touchmove',function(e){
      e.stopPropagation();
    });
    // 提交评论
    dialog_comment.on('click','.submit', function() {
      dialog_comment.off('click','.submit');
      dialog_comment.find('button').attr('disabled','disabled');
      var comment_content;
      if(comment_input.attr('data-imgurl')){
        comment_content = comment_input.attr('data-imgurl');
      } else {
        comment_content = comment_input.val();
      }
      // 判断是否为空并且过滤关键词
      if(!comment_content.length){
        dialog_comment.hide();
        $.toast('评论不能为空');
      } else if (esc.find(comment_content).length) {
        // 如果为空
        dialog_comment.hide();
        $.toast('🚔 我要报警了');
      } else {
        if(is_father) {
          // 一级回复
          var post_data = {
            content:comment_content,
            post_table:comment.data('table'),
            post_id:id,
            to_uid:0,
            parentid:0,
            type:type,
            url:window.location.origin + window.location.pathname
          }
        } else {
          // 二级回复
          // 是否是从微信公众号里进来的
          if(is_wxinput) {
            var post_data = {
              content:comment_content,
              post_table:comment.data('table'),
              post_id:comment.data('id'),
              to_uid:comment_data.to_uid,
              parentid:comment_data.parentid,
              type:type,
              url:window.location.origin + window.location.pathname
            }
          } else {
            var post_data = {
              content:comment_content,
              post_table:comment.data('table'),
              post_id:comment.data('id'),
              to_uid:element.data('uid'),
              parentid:element.data('id'),
              type:type,
              url:window.location.origin + window.location.pathname
            }
          }
        }
        $.ajax({
          type: 'POST',
          url: '/index.php?g=comment&m=comment&a=post',
          data: post_data,
          dataType: 'json',
          timeout: 4000,
          success: function(data){
            if(data.status == 1){
              // 成功评论
              dialog_comment.hide();
              $.toast('😄 评论成功');
              dialog_comment.hide();
              comment_count.text(parseInt(comment_count.text())+1);
              // 添加评论dom
              if(is_wxinput) {
                return false;
              }
              if(is_father) {
                // 回复直接添加底部
                var reply_data = {
                 is_father:true,
                 type:type,
                 comment:comment_content,
                 username:comment.data('username'),
                 avatar:comment.data('avatar'),
                 uid:comment.data('uid'),
                 id:data.data.id};
                 comment_bd.append(reply_tpl(reply_data));
               } else {
                var reply_data = {
                 is_father:false,
                 type:type,
                 comment:comment_content,
                 username:comment.data('username'),
                 parent_full_name:element.data('username'),
                 uid:comment.data('uid'),
                 id:data.data.id};
                 if(element.hasClass('father')){
                  // 二级回复
                  if(!element.find('.comment-content .reply').length){
                    element.find('.comment-content').append('<ul class="reply"> </ul>');
                    element.find('.comment-content .reply').append(reply_tpl(reply_data));
                  }
                } else {
                  //一级回复
                  element.parent('.reply').append(reply_tpl(reply_data));
                }
              }
            } else {
              $.toast(data.info);
              uploader.reset();
              dialog_comment.hide();
            }
            uploader.reset();
            init.loadimg();
            $.refreshScroller();
          },
          error: function(xhr, type){
            $.toast('网络错误 code:'+xhr);
            uploader.reset();
            dialog_comment.hide();
          }
        });
      }
    });

    // 监听input file是否有文件添加进来
    dialog_comment.on("change",'.webuploader-element-invisible', function(e) {
      if(comment_input.val().length){
        $.confirm('图片和文字二选一', '提示', function () {
          uploader.addFiles(e.target.files);
          uploader.upload();
        });
      } else {
        uploader.addFiles(e.target.files);
        uploader.upload();
      }
    });
    // 图片列队
    uploader.onFileQueued = function(file){
      // 控制回复按钮
      dialog_comment.find('.cancel').attr('disabled','disabled');
      dialog_comment.find('.submit').attr('disabled','disabled');
      // 控制回复框
      comment_input.attr('disabled','disabled');
      comment_input.val('').attr('placeholder','图片和文字二选一！');
      // 生成缩略图
      uploader.makeThumb(file,function(error,ret){
        image_list.empty();
        if(error){
          image_list.html('预览错误');
        } else {
          image_list.append('<img src="'+ret+'" />');
        }
      });
    }
    // 上传成功
    uploader.onUploadSuccess = function(file,response) {
      // 添加关闭按钮
      image_list.append('<button class="close" data-id="'+file.id+'"></button>');
      // 恢复提交按钮
      dialog_comment.find('.cancel').removeAttr('disabled','disabled');
      dialog_comment.find('.submit').removeAttr('disabled','disabled');
      // 消除进度条
      image_list.find('.progress').remove();
      // 删除上传框
      dialog_comment.find('.image .updata_image_btn').remove();
      // type状态等于4
      type = 4;
      if(response.status == 1) {
       // comment_input.val(response.data);
       comment_input.attr('data-imgurl',response.data);
     } else {
      uploader.reset();
      $.toast(response.info);
    }
  }
    // 控制进度条
    uploader.onUploadProgress = function(file,percentage) {
      image_list.append('<div class="progress"><span></span></div>');
      image_list.find('.progress span').css('width', percentage * 100 + '%');
    }
    // 上传出错
    uploader.onUploadError = function(file,reason) {
      uploader.reset();
      $.toast(reason);
    }
    // 当图片初始化
    uploader.onReset = function(){
      image.find('.updata_image_btn').remove();
      image_list.before('<div class="updata_image_btn"><button type="button" class="hs-icon"></button><input type="file" name="file" class="webuploader-element-invisible" accept="image/*" single></div>');
      image.find('.image_list').empty();
      comment_input.val('');
      comment_input.removeAttr('data-imgurl');
      comment_input.removeAttr('disabled');
      comment_input.attr('placeholder','随便说点什么');
      comment_input.show();
      type = 0;
    }
    // 选择时文件出错
    uploader.onError = function(type){
      if(type == 'Q_EXCEED_NUM_LIMIT'){
        $.toast('最多可上传1张');
      } else if(type == 'Q_EXCEED_SIZE_LIMIT') {
        $.toast('太大了，不让传');
      } else if(type == 'Q_TYPE_DENIED') {
        $.toast('兄弟必须是图片');
      }
      uploader.reset();
    }
    // 删除图片按钮
    image_list.on('click','.close',function(){
      dialog_comment.find('#comment_input').removeAttr('disabled');
      uploader.reset();
    })
    // 关闭按钮
    dialog_comment.on('click','.cancel', function() {
      dialog_comment.off('click','.cancel');
      dialog_comment.off('click','.submit');
      dialog_comment.off("change",'.webuploader-element-invisible');
      dialog_comment.hide();
      // 上传图片初始化
      uploader.reset();
    });
  }

  // 点击回复框
  page.on('click','.comment_bd li',function(e){
    var comment_id = $(this).data('id');
    var username = $(this).data('username');
    // 图片
    if(e.srcElement.className == 'comment_image') {
      // 调用微信图片
      wx.previewImage({
        current: $(e.srcElement).data('preview'),
        urls: [$(e.srcElement).data('preview')]
      });
    } else {
      comment_box(comment_id,false,username,$(this),false,false);
    }
  });

  page.on('click','.comment-btn',function(){
    var comment_id = $(this).data('id');
    comment_box(comment_id,true,'',$(this),true,false);
  });
  if(page.find('.comment').data('fast') == 1){
    comment_box(page.find('.comment').data('id'),false,page.find('.comment').data('commenttouser'),'',false,true,{
      to_uid:page.find('.comment').data('commenttouid'),
      parentid:page.find('.comment').data('commentparentid')
    });
  }
});
