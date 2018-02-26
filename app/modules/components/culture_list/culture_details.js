// 文化详情
// handlebars
var handlebars = require('../../../../node_modules/handlebars/dist/handlebars.min.js');
// 初始化
var common = require('../common/common.js');
// 评论初始化
var Comment = require('../comment/comment.js');
// 图片延时加载
var lazyload = require('../../../../bower_components/jieyou_lazyload/lazyload.min.js');
// 微信jssdk
var wx = require('weixin-js-sdk');

$(document).on('pageInit','.culture_details', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  var share_data = {
    title: '黑市 | 美好而操蛋的东西',
    desc: '这里能让好事自然发生',
    link: GV.HOST+location.pathname,
    img: '//jscache.ontheroadstore.com/tpl/simplebootx_mobile/Public/i/logo.png'
  };
  init.wx_share(share_data);
  // 检查是否关注
  init.checkfollow();
  // 检查是否有新的消息
  init.msg_tip();

  // 打开ios对应页面
  var system_query = init.system_query();
  if(system_query == 'android'){
    var system_query_url = GV.app_url;
  }else if(system_query == 'ios'){
    var system_query_url = GV.api_url + '/ios/subject/' + $('.culture_details').attr('data-id');
  }
  $('.open_app').find('.open_app_btn').attr('href', system_query_url);


  //适配pc端换行间距
  if(location.href.indexOf('culture') > 0 && IsPC()){
    $('.content_bd').find('p').css('line-height','0.5rem');
    // $('.content_bd').find('p').each(function(){
    //   if($(this).html().length < 10){
    //     $(this).css('height','10px');
    //   }
    // })
  }
  function IsPC() {
    var userAgentInfo = navigator.userAgent;
    var Agents = ["Android", "iPhone",
                "SymbianOS", "Windows Phone",
                "iPad", "iPod"];
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
            flag = false;
            break;
        }
    }
    return flag;
  }
  // 文化视频适配  目前 视频上传时 固定 670 502
  var iframe_ratio = ($('.content_bd').width()*(1-0.826666/10))/670;
  page.find('iframe').css({'transform': 'scale('+iframe_ratio+')', 'transform-origin': 'top left'});
  page.find('iframe').parent().css({'height': iframe_ratio*502+'px'});
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
    var comment_id = $(this).data('id');
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

  // 遍历文章中关联的商品，对价格，图片标题进行更新
  $('.article_content').each(function(i, item){
    var id = $(item).attr('data-id');
    $.get("/index.php?g=Portal&m=HsArticle&a=get_post_info&id="+id, function(data){
      if(data.status == 1){
        $(item).find('img').attr('src', GV.img_url + data.code.img + '@640w_1l');
        $(item).find('.article_title').text(data.code.post_title);
        $(item).find('.article_price').text('￥'+ data.code.price);
      }
    });
  })

  //统计进入次数
  var user_id = $(".praise_btn").data("id");
  setTimeout(function(){
    $.ajax({
        type: 'GET',
        url: '/index.php?g=restful&m=HsArticle&a=ajax_hits&id='+user_id
    });
  },300)
});
