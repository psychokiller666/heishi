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
// 评论初始化
var Comment = require('../comment/comment.js');


$(document).on('pageInit','.store-show', function (e, id, page) {
  var sm_extend = require('../../../../node_not/SUI-Mobile/dist/js/sm-extend.min.js');

  if (page.selector == '.page'){
    return false;
  }
  $('title').text('公路商店Store');

  // 设置分享url 
  var share_url = window.location.href;
  // 需要解锁商品在分享时添加字段 当出现解锁字段时请求
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
          var article_id = $('.disabled_btn').attr('data-article_id');
          var uid = $('.disabled_btn').attr('data-uid');
          share_url = GV.HOST+'index.php?g=Portal&m=HsArticle&a=index&id='+article_id+'&user_id='+uid+'&object_push='+data.code;
        }
      }
    });
  }


  var init = new common(page);
  var share_data = {
    title: page.find('.frontcover .title').text(),
    desc: page.find('.content_details').find('div').text(),
    link: share_url,
    img: page.find('.frontcover .image').data('share')
  };
  init.wx_share(share_data);
  // 检查是否关注
  init.checkfollow();
  
  // 如果有视频就放在封面图位置
  var video_status = 0;
  if($('.video_bg').length > 0){
    $('.video_bg').click(function(){
      if(video_status == 0){
        video_status = 1;
        $('.video_el')[0].play();
        $('.video_loading').css('display','block');
        $('.video_bg').css('opacity',0);
      }
    })
    $('.video_el')[0].addEventListener('playing',function(){
      $('.video_loading').css('display','none');
    })
    $('.video_el')[0].addEventListener('pause',function(){
      video_status = 0;
      $('.video_bg').css('opacity',1);
    })
  }

  // 初始输入框
  $('.dialog_comment').css('display', 'none');
  // 选款
  // 初始化
  var type_items_span = $('.type_item').find('span');
  var single = type_items_span.eq(0);
  if(type_items_span.length == 1){
    $('.select').remove();
    update_status(single.data('price'), single.data('postage'), single.data('remain'), single.data('presell'), single.data('special'));
    if(single.hasClass('no_repertory')){
      $('.footer_nav').find(".buy_btn").attr("data-remain",single.data('remain')).addClass('no_repertory');
      $('.footer_nav').find(".add_chart").attr("data-remain",single.data('remain')).addClass('no_repertory');
    }else{
      var str = "/User/HsOrder/add/object_id/"+single.attr('data-articleid')+"/mid/"+single.attr('data-id')+"/number/1.html";
      $('.footer_nav').find(".buy_btn").attr("data-url",str);
      $('.footer_nav').find(".add_chart").attr("data-id", single.attr('data-id')).attr("data-articleid", single.attr('data-articleid'));
    }
  }
  page.on("click",".select_type",function(){
    $('.buy').css('display', 'block');
    $('.buy').find('.countNum').attr('data-num',1).text(1);
    $('.content').css('overflow-y', 'hidden');
  })
  page.on("click",".buy",function(e){
    var el = $(e.target).hasClass('buy');
    if(el){
      $('.content').css('overflow-y', 'auto');
      $(this).css('display', 'none');
      $('.buy').find('.confirm').removeClass('add_chart').removeClass('buy_btn');
      if($('.buy .type_item').find('.active').length == 1){
        var id = $('.buy .type_item').find('.active').eq(0).attr('data-id');
        var articleid = $('.buy .type_item').find('.active').eq(0).attr('data-articleid');
        var num = $('.buy').find('.countNum').attr('data-num');
        var str = "/User/HsOrder/add/object_id/"+articleid+"/mid/"+id+"/number/"+num+".html";
        $('.footer_nav').find(".buy_btn").attr("data-url",str);
      }
    }
  })

  $('.footer_nav').on("click",".buy_btn",function() {
    var url = $(this).attr('data-url');
    if($(this).hasClass('no_repertory')){
      return $.toast('当前商品没有库存');
    }
    if(type_items_span.length == 1){
      location.href = url;
    }else{
      $('.buy').css('display', 'block');
      $('.content').css('overflow-y', 'hidden');
      $('.buy').find('.countNum').attr('data-num',1).text(1);
      $('.buy').find('.confirm').addClass('buy_btn');
    }
  })
  $('.footer_nav').on("click",".add_chart",function() {
    if($(this).hasClass('no_repertory')){
      return $.toast('当前商品没有库存');
    }
    if(type_items_span.length == 1){
      // 直接加入购物车
      var styles_id = $(this).data("id");
      var article_id = $(this).data("articleid");
      shopping(article_id, styles_id, 1);
    }else{
      $('.buy').css('display', 'block');
      $('.content').css('overflow-y', 'hidden');
      $('.buy').find('.countNum').attr('data-num',1).text(1);
      $('.buy').find('.confirm').addClass('add_chart');
    }
  })
  $('.buy').on("click",".add_chart",function() {
    operation(this, 0);
  })
  $('.buy').on("click",".buy_btn",function() {
    operation(this, 1);
  })

  // 选中款式
  $('.style .type_item').on("click","span",function(){
    if($(this).hasClass('no_repertory')){
      return $.toast('当前款式已没有库存');
    }
    $('.type_item').find('span').removeClass('active');
    $(this).addClass('active');
    var price = $(this).attr('data-price');
    var postage = $(this).attr('data-postage');
    var remain = $(this).attr('data-remain');
    var presell = $(this).attr('data-presell');
    var special = $(this).attr('data-special');
    var type_desc = $(this).text();
    $('.select').find('.select_type').text(type_desc);
    $('.buy').find('.add').attr('data-remain', remain);
    update_status(price, postage, remain, presell, special);
    // 设置立即购买跳转链接
    var id = $(this).data("id");
    var article_id = $(this).data("articleid");
    $('.buy').find(".buy_btn").attr("data-id",id).attr("data-articleid",article_id);
    $('.buy').find(".add_chart").attr("data-id",id).attr("data-articleid",article_id);
    $('.buy').find(".confirm").attr("data-id",id).attr("data-articleid",article_id);
    $('.buy').find('.countNum').attr('data-num', 1);
    $('.buy').find('.countNum').text(1);
  })


  // 加减
  $('.buy').find('.min').click(function() {
    if($('.buy .type_item').find('.active').length == 0){
      return $.toast('请选择款式');
    }
    var num = parseInt($('.buy').find('.countNum').attr('data-num'));
    if(num <= 1){
      return $.toast('最少选择1个');
    }
    num = num - 1;
    $('.buy').find('.countNum').attr('data-num', num);
    $('.buy').find('.countNum').text(num);
  })
  $('.buy').find('.add').click(function() {
    if($('.buy .type_item').find('.active').length == 0){
      return $.toast('请选择款式');
    }
    var num = parseInt($('.buy').find('.countNum').attr('data-num'));
    var remain = $(this).attr('data-remain');
    if(num >= remain){
      return $.toast('当前库存为' + remain + '件');
    }
    num = num + 1;
    $('.buy').find('.countNum').attr('data-num', num);
    $('.buy').find('.countNum').text(num);
  })

  function operation(that, type) {
    if($('.buy .type_item').find('.active').length == 0){
      return $.toast('请选择款式');
    }
    var styles_id = $(that).data("id");
    var article_id = $(that).data("articleid");
    var num = $('.buy').find('.countNum').attr('data-num');
    if(num <= 0){
      return $.toast('请输入正确的数量');
    }
    $('.buy').css('display', 'none');
    $('.content').css('overflow-y', 'auto');
    if(type == 0){
      shopping(article_id, styles_id, num);
    }else if(type == 1){
      location.href = "/User/HsOrder/add/object_id/"+article_id+"/mid/"+styles_id+"/number/"+num+".html";
    }
    if($(that).hasClass('confirm')){
      $(that).removeClass('add_chart');
      $(that).removeClass('buy_btn');
    }
  }
  // 状态更新
  // 如果商品当中有款式为特价 则其他状态不显示
  $('.types').find('span').each(function(){
    if($(this).attr('data-special') == 1){
      $('.special_offer').css('display', 'block');
    }
  })
  function update_status(price, postage, remain, presell, special) {
    $('.postage').css('display', 'none');
    $('.remain_tension').css('display', 'none');
    $('.remain').css('display', 'none');
    $('.presell_status').css('display', 'none');
    $('.presell').css('display', 'none');
    $('.special_offer').css('display', 'none');
    $('.presell_item').css('display', 'none');
    // 如果是特价，其他状态不显示
    if(price){
      $('.price').find('.font_din').text(price);
    }
    if(presell){
      $('.presell').css('display', 'block').find('.time').text(presell);
      $('.presell_item').css('display', 'block').find('.time').text(presell);
    }
    if(special == 1){
      return $('.special_offer').css('display', 'block');
    }
    if(postage == 0){
      $('.postage').css('display', 'block');
    }
    if(remain > 5 && remain < 10){
      $('.remain_tension').css('display', 'block');
    }else if(remain >= 1 && remain <= 5){
      $('.remain').css('display', 'block').find('span').text(remain);
    }
    if(presell){
      $('.presell_status').css('display', 'block');
    }
  }
  // 加入购物车
  function shopping( object_id,styles_id, num) {
    $.ajax({
      type: 'POST',
      url: '/index.php?g=restful&m=HsShoppingCart&a=add',
      data: {
        object_id: object_id,
        mid: styles_id,
        nums: num
      },
      success: function(data){
        if(data.status == 1){
          shoppingSuccess();
          $.toast(data.info);
        } else {
          $.toast(data.info);
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

  

  //预留狠人说中图片的宽高
  setDescImgWH();
  function setDescImgWH(){
    var $imgWrap = $('.post_desc_img');

    if($imgWrap.length>0){
      var $descWrap = $imgWrap.parents('.js_desc_wrap');
      var descW = $descWrap.width();
      if(descW>0){
          $imgWrap.each(function(){
              var $this = $(this);
              var imgW = $this.attr('imgwidth');
              var imgH = $this.attr('imgheight');
              // var width = imgW < descW ? imgW : descW; //如果最大宽度大于父元素宽度，则显示为父元素宽度，否则为自身宽度。
              var width = descW; //应要求改为100%宽
              var height = width * imgH / imgW;
              this.style.width = width + 'px';
              this.style.height = height + 'px';
          });
      }
    }
  }












  //收藏
  page.on('click','.collect',function(e){
    var bool=$(".collect ").hasClass("active");
    if(bool){
      closeCollect(this);
    }else{
      collect(this);
    }
    function collect(that){
       $.ajax({
        type: 'POST',
        url: '/index.php?g=user&m=Favorite&a=do_favorite_new',
        data: {
          id:$(that).data('id')
        },
        success: function(data){
          if(data.status == 1){
            $.toast(data.info);
            $(".collect").addClass("active");
          } else {
            $.toast(data.info);
          }
        }
      });
    }
    function closeCollect(that){
       $.ajax({
        type: 'POST',
        url: '/index.php?g=user&m=Favorite&a=delete_favorite',
        data: {
          id:$(that).data('id')
        },
        success: function(data){
          if(data.status == 1){
            $.toast(data.info);
            $(".collect").removeClass("active");
          } else {
            $.toast(data.info);
          }
        }
      });
    }
  });

  // 点赞
  $('.like_list').on('click', '.praise_btn', function(){
    var id = $(this).data('id');
    if($(this).hasClass('praise_btn_success')){
      $.ajax({
        type: 'POST',
        url: '/index.php?g=user&m=HsLike&a=cancel_like',
        data: {
          id: id
        },
        success: function(data){
          if(data.status == 1){
            $.toast('取消点赞');
            reast_user(data);
            $('.praise_btn').removeClass('praise_btn_success');
          } else {
            $.toast(data.info);
          }
        }
      });
    }else{
      $.ajax({
        type: 'POST',
        url: '/index.php?m=HsArticle&a=do_like',
        data: {
          id: id
        },
        success: function(data){
          if(data.status == 1){
            $.toast(data.info);
            reast_user(data);
            $('.praise_btn').addClass('praise_btn_success');
          } else {
            $.toast(data.info);
          }
        }
      });
    }
    function reast_user(data) {
      $('.like_list').find('a').remove();
      var str = '<a class="praise_btn hs-icon" data-id="'+ id +'"></a>';
      if(data.data.data){
        $.each(data.data.data ,function(index, item){
          if(item && index < 6){
            str += '<a href="/User/index/index/id/'+item.uid+'.html" data-layzr="'+item.avatar+'" data-layzr-bg class="external"></a>';
          }else if(item && index == 6){
            str += '<a href="/Portal/HsArticle/like_list/id/'+ id +'.html" class="more"></a>';
          }else{
            str += '<a></a>';
          }
        })
      }
      $('.like_list').append(str);
      $('.praise h2').find('span').text(data.data.total_likes);
      init.loadimg();
    }
  })



  // 特价跳转
  $('.special_offer').click(function(){
    location.href= GV.app_url;
  })
  // 卖家全部商品
  $('.user_img').click(function(){
    location.href= '/User/index/index/id/'+$(this).attr('data-id')+'.html';
  })
  // 卖家全部商品
  $('.user_name').click(function(){
    location.href= '/User/index/index/id/'+$(this).attr('data-id')+'.html';
  })
  // 卖家全部商品
  $('.user_signature').click(function(){
    location.href= '/User/index/index/id/'+$(this).attr('data-id')+'.html';
  })

  // 是否关注当前卖家
  var attention = $('.attention');
  $.post('/index.php?g=user&m=HsFellows&a=ajax_relations',{
    my_uid: attention.data('meid'),
    other_uid: attention.data('uid')
  },function(data){
    if(data.relations == '2' || data.relations == '3') {
      $('.cancel_attention').show();
    } else if(data.relations == '1' || data.relations == '0') {
      attention.show();
    }
  });
  attention.click(function(){
    // 关注
    $.post('/index.php?g=user&m=HsFellows&a=ajax_add',{
      uid: $(this).data('uid')
    },function(data){
      if(data.status == '1') {
        $('.cancel_attention').show();
        $('.attention').hide();
        $.toast(data.info);
      } else {
        $.toast(data.info);
      }
    });
  })
  $('.cancel_attention').click(function(){
    // 取消关注
    $.post('/index.php?g=user&m=HsFellows&a=ajax_cancel',{
      uid: $(this).data('uid')
    },function(data){
      if(data.status == '1') {
        $('.cancel_attention').hide();
        $('.attention').show();
        $.toast(data.info);
      } else {
        $.toast(data.info);
      }
    });
  })

  // 微信预览图片
  var images = $('.images');
  page.on('click','.images ul li',function(){

    if(GV.device == 'any@weixin') {
        var preview_list = [];
        $.each($('.images ul li'),function(index,item){
          preview_list.push($('.images ul li').eq(index).data('preview'));
        });
        wx.previewImage({
          current: $(this).data('preview'),
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



  // 评论
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
    comment_bd.empty();
    if(data.status == 1){
      if(data.comments != null){
        var newList = {};
        newList.comments = [];
        for (var i = 0; i < data.comments.length; i++) {
          data.comments[i]['classname'] = 'allCommentList';
          if(i < 5){
            newList.comments.push(data.comments[i]);
          }
        }
        comment_bd.append(comment_list_tpl(newList));
        if(data.comments.length >= 5){
          $('.comment_all').css('display', 'block');
        }
        init.loadimg();
        // commentTab(1);
      }
    }
  },function(xhr, type){
    console.log(type);
  })
  // 点击comment_btn回复
  var reply_tpl = handlebars.compile($("#reply_tpl").html());
  page.on('click','.comment_btn',function(){
    comment_manage.open_comment_box({
      ispic: true,
      username: '',
      is_father: true,
      is_wxinput: false,
      element: $(this),
      reply_tpl: reply_tpl,
      callback: function(data){
        comment_bd.prepend(reply_tpl(data));
        init.loadimg();
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
      arr.push($(e.srcElement).data('preview'));
      wx.previewImage({
        current: $(e.srcElement).data('preview'),
        urls: arr
      });
    }
  });
  // 初始不不屏蔽哆嗦
  // $('.comment_all').attr('href', $('.comment_all').attr('data-href'));
  // var post_id = $('.shiver').attr('data-id');
  // $.ajax({
  //   type: 'GET',
  //   url: '/index.php?g=Comment&m=Widget&a=ajax_more&table=posts',
  //   data: {
  //     post_id: post_id,
  //     type: 2
  //   },
  //   success: function(data){
  //     if(data.status == 1){
  //       var newList = {};
  //       newList.comments = [];
  //       for (var i = 0; i < data.comments.length; i++) {
  //         data.comments[i]['classname'] = 'shieldCommentList';
  //         if(i < 5){
  //           newList.comments.push(data.comments[i]);
  //         }
  //       }
  //       comment_bd.append(comment_list_tpl(newList));
  //       init.loadimg();
  //       commentTab(1);
  //     }
  //   }
  // });


  // 屏蔽显示哆嗦
  // $('.shiver').click(function(){
  //   var bool = $(this).hasClass('checked');
  //   if(bool){
  //     $(this).text('屏蔽哆嗦').removeClass('checked');
  //     $('.comment_all').attr('href', $('.comment_all').attr('data-href'));
  //     commentTab(1);
  //   }else{
  //     $(this).text('显示哆嗦').addClass('checked');
  //     $('.comment_all').attr('href', $('.comment_all').attr('data-shieldurl'));
  //     commentTab(2);
  //   }
  // })

  // function commentTab(n) {
  //   if(n == 1){
  //     // 未屏蔽哆嗦评论隐藏
  //     comment_bd.find('.allCommentList').css('display', 'block');
  //     comment_bd.find('.shieldCommentList').css('display', 'none');
  //   }
  //   if(n == 2){
  //     // 屏蔽哆嗦评论隐藏
  //     comment_bd.find('.allCommentList').css('display', 'none');
  //     comment_bd.find('.shieldCommentList').css('display', 'block');
  //   }
  // }



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

});