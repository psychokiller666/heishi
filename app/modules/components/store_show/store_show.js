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
// 评论初始化
var Comment = require('../comment/comment.js');


$(document).on('pageInit','.store-show', function (e, id, page) {
  var sm_extend = require('../../../../node_not/SUI-Mobile/dist/js/sm-extend.min.js');

  if (page.selector == '.page'){
    return false;
  }
  // 需要解锁商品在分享时添加字段 当出现解锁字段时请求
  var share_url = GV.HOST+location.pathname;
  if($('.disabled_btn').length){
    $.ajax({
      type: 'get',
      url: '/index.php?g=restful&m=HsBuyPush&a=buy_push_url',
      async: false,
      data: {
        user_id: $('.disabled_btn').attr('data-uid'),
        id: $('.disabled_btn').attr('data-article_id')
      },
      success: function(data){
        if(data.status == 1){
          share_url = GV.HOST+'/index.php?g=Portal&m=HsArticle&a=index&id='+$('.disabled_btn').attr('data-article_id')+'&user_id='+$('.disabled_btn').attr('data-uid')+'&object_push='+data.code;
        }
      }
    });
  }
  var init = new common(page);
  var share_data = {
    title: page.find('.frontcover .title').text()+' | 黑市',
    desc: page.find('.content_bd').text(),
    link: share_url,
    img: page.find('.frontcover .image').data('share')
  };
  init.wx_share(share_data);
  // 检查是否关注
  init.checkfollow();
  
  // 如果有视频就放在封面图位置
  var video_status = 0;
  $('.video').click(function(){
    if(video_status == 0){
      video_status = 1;
      $('.video').find('.image')[0].play();
      $.showPreloader('视频加载中');
    }
  })
  $('.image')[0].addEventListener('playing',function(){
    $.hidePreloader();
    $('.image').css('opacity', 1);
    $('.video').addClass('video_play');
  })
  $('.image')[0].addEventListener('pause',function(){
    $('.image').css('opacity', 0);
    $('.video').removeClass('video_play');
    video_status = 0;
  })

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
  //选款
  //商品类型id
  var styles_id = 0;
  function touchmove(e){
    e.preventDefault();
  }
  page.on("click",".select",function(e){
    var ev = e.target;
    if(ev == this){
      $(this).css("display","none");
      window.removeEventListener("touchmove",touchmove);
    }
  })

  page.on("click",".styles",function(){
    $(".select").css("display","block");
    $(".select").find(".now_buy").text('立刻购买');
    window.addEventListener("touchmove",touchmove);
  })
  page.on("click",".now_buy",function(){
    var n = $(".now_buy").attr("href");
    if(n == ""){
      $.toast("请选择款项",1000);
      return false;
    }
    if($(this).text().length != 4){
      //清空购买地址，调用添加商品到购物车接口
      shopping(this,styles_id);
      $(".now_buy").removeAttr("href");
      window.removeEventListener("touchmove",touchmove);
      return false;
    }
  })

  //选择款项
  page.on("click",".select_main li",function(){
      if(!$(this).find("div").attr("class")){ //判断是否有库存
        var id = $(this).data("id");
        var article_id = $(this).data("articleid");
        styles_id = id;
        var str = "/User/HsOrder/add/object_id/"+article_id+"/mid/"+id+".html";
        $(".now_buy").attr("href",str);

        $(".select_main li").find("div").removeClass('active');
        $(this).find("div").addClass('active');
      }
  })
  page.on("click",".close_select",function(){
      window.removeEventListener("touchmove",touchmove);
      $(".select").css("display","none");
  })
  //购物车
  page.on("click",".shopping_cart",function(){
    var ele = $(this).siblings('.styles');
    if(ele.length){
      $(".select").css("display","block");
      window.addEventListener("touchmove",touchmove);
      $(".select").find(".now_buy").text('添加到购物车');
    }else{
      //添加到购物车
      shopping(this);
    }
  })
  //商品添加至购物车接口
  function shopping (that,styles_id) {
    if(!styles_id){
      styles_id = $(that).data('mid')
    }
    $.ajax({
      type: 'POST',
      url: '/index.php?g=restful&m=HsShoppingCart&a=add',
      data: {
        object_id:$(that).data('object_id'),
        mid: styles_id,
        nums: 1
      },
      dataType: 'json',
      timeout: 4000,
      success: function(data){
        if(data.status == 1){
          shoppingSuccess();
          $(".select").css("display","none");
          $(".select li div").each(function(){
             $(this).removeClass('active');
          })
          $.toast(data.info,500);
        } else {
          $.toast(data.info,500);
        }
      },
      error: function(xhr, type){
        $.toast('网络错误 code:'+xhr,500);
      }
    })
  }
  //获取 更新购物车数量
  shoppingSuccess();
  function shoppingSuccess(){
    $.ajax({
      type: 'GET',
      url: '/index.php?g=restful&m=HsShoppingCart&a=counts',
      dataType: 'json',
      timeout: 4000,
      success: function(data){
        if(data.status != 1 ) return;
        if(data.numbers > 0 && $('.shopping-num').length == 1){
          $('.shopping-num').css('display','block');
        }
      }
    });
  }
  //收藏
  page.on('click','.collect',function(e){
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

  // 点赞
  $('.praise_btn').click(function(){
    var id = $(this).data('id');
    $.ajax({
      type: 'POST',
      url: '/index.php?m=HsArticle&a=do_like',
      data: {
        id: id
      },
      success: function(data){
        if(data.status == 1){
          $.toast(data.info);
          $('.praise_btn').addClass('success');
          var str = '<a class="praise_btn hs-icon" data-id="'+ id +'"></a>';
          $('.like_list').find('a').remove();
          $.each(data.data.data ,function(index, item){
            if(item){
              str += '<a href="/User/index/index/id/'+item.uid+'.html" data-layzr="'+item.avatar+'" data-layzr-bg class="external"></a>';
            }else if(item && index == 6){
              str += '<a href="/Portal/HsArticle/like_list/id/'+ id +'.html" class="more"></a>';
            }else{
              str += '<a></a>';
            }
          })
          $('.like_list').append(str);
          $('.praise h2').find('span').text(data.data.total_likes);
          $('[data-layzr]').lazyload({
            data_attribute:'layzr',
            container: $(".like_list")
          });
          $('.praise_btn').addClass('praise_btn_success');
        } else {
          $.toast(data.info);
        }
      },
      error: function(xhr, type){
        console.log(type);
      }
    });
  })

  // 微信预览图片
  var images = $('.images');
  page.on('click','.images ul li',function(){

    if(GV.device == 'any@weixin') {
        var preview_list = [];
        $.each($('.images ul li'),function(index,item){
          preview_list.push('http:' + $('.images ul li').eq(index).data('preview'));
        });
        wx.previewImage({
          current: 'http:'+ $(this).data('preview'),
          urls: preview_list
        });
    } else {
      var preview_lists = [];
      $.each($('.images ul li'),function(index,item){
        preview_lists.push({url:$('.images ul li').eq(index).data('preview')});
      });
      var previewimage = $.photoBrowser({
        photos : preview_lists,
        container : '.container',
        type: 'popup'
      })
      previewimage.open();
    }
  });

  var comment_box = $('#comment');
  var comment_bd = comment_box.find('.comment_bd');
  var comment_manage = new Comment();
  var comment_list_tpl = handlebars.compile($("#comment_list_tpl").html());
  // 增加模板引擎判断
  handlebars.registerHelper('eq', function(v1, v2, options) {
    if(v1 == v2){
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });

  // 获取评价显示前5条
  $('.infinite-scroll-preloader').remove();
  comment_manage.add_data_comment({
    post_id: comment_box.data('id'),
    pagesize: 20
  },function(data){
    if(data.status == 1){
      if(data.comments != null){
        comment_bd.append(comment_list_tpl(data));
        if(comment_bd.find('li').length >= 5){
          $('.comment_all').css('display', 'block');
        }
        comment_bd.find('.father').each(function(index){
          if(index >= 5){
            $(this).remove();
          }
        })
        $('[data-layzr]').lazyload({
          data_attribute:'layzr',
          container: $("#comment")
        });
      }
    }
  },function(xhr, type){
    console.log(type);
  })
  // 点击comment-btn回复
  var reply_tpl = handlebars.compile($("#reply_tpl").html());
  page.on('click','.comment-btn',function(){
    comment_manage.open_comment_box({
      ispic: true,
      username: '',
      is_father: true,
      is_wxinput: false,
      element: $(this),
      reply_tpl: reply_tpl,
      callback: function(data){
        comment_bd.prepend(reply_tpl(data));

        $('[data-layzr]').lazyload({
          data_attribute:'layzr',
          container: $("#comment")
        });
      }
    });
  });

  // 进行二级回复
  $('.comment_bd').on('click', 'li', function(e){
    var that = this;
    if(e.srcElement.className != 'comment_image'){
      comment_manage.open_comment_box({
        ispic: false,
        username: $(that).attr('data-username'),
        is_father: false,
        is_wxinput: false,
        element: $(that),
        reply_tpl: reply_tpl
      });
    }
  })
  // 图片预览
  page.on('click','.comment_bd li',function(e){
    e.stopPropagation();
    e.preventDefault();
    if(e.srcElement.className == 'comment_image') {
      // 调用微信图片
      var arr = [];
      arr.push('http:'+ $(e.srcElement).data('preview'));
      wx.previewImage({
        current: 'http:'+ $(e.srcElement).data('preview'),
        urls: arr
      });
    }
  });
  // 公众号进入回复
  $(document).ready(function(){
    if(page.find('#comment').data('fast') == 1){
      comment_manage.open_comment_box({
        ispic: false,
        username: $('#comment').data('commenttouser'),
        is_father: false,
        is_wxinput: true,
        element: '',
        reply_tpl: reply_tpl
      });
    }
  });

  // 打赏
  var dialog_reward = $('.dialog_reward');
  page.on('click', '.reward', function(){
    dialog_reward.find('input').val('');
    dialog_reward.show();
  })
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
          'order[seller_name]':$(this).data('username'),
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

  //统计进入次数
  var user_id = $(".praise_btn").data("id");
  setTimeout(function(){
    $.ajax({
        type: 'GET',
        url: '/index.php?g=restful&m=HsArticle&a=ajax_hits&id='+user_id
    });
  },300)

  // 指定商品 导流至app 判断是不是ios环境 安卓提示
  var navigator_activity = navigator.userAgent;
  var isiOS = !!navigator_activity.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
  $('.download_js').click(function(){
    if(!isiOS){
      $.toast('当前仅支持ios下载');
      return false;
    }
  })
});