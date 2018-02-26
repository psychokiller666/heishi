// 商品列表
// 初始化
var common = require('../common/common.js');
var lazyload = require('../../../../bower_components/jieyou_lazyload/lazyload.min.js');


$(document).on('pageInit','.index_list', function (e, id, page) {
  require('../../../../node_not/SUI-Mobile/dist/js/sm-extend.min.js');
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);

  // 调用微信分享sdk
  var share_data = {
    title: '黑市 | 美好而操蛋的东西',
    desc: '这里能让好事自然发生',
    link: GV.HOST+location.pathname,
    img: '//jscache.ontheroadstore.com/tpl/simplebootx_mobile/Public/i/logo.png'
  };
  init.wx_share(share_data);
  init.checkfollow();
  // 横向滚动懒加载
  $('[data-layzr]').lazyload({
    effect: "fadeIn",
    data_attribute:'layzr',
    container: $(".culture_content")
  });

  // 打开ios对应页面
  var system_query = init.system_query();
  if(system_query == 'android'){
    var system_query_url = GV.app_url;
  }else if(system_query == 'ios'){
    var system_query_url = GV.api_url + '/ios/index/0';
  }
  $('.open_app').find('.open_app_btn').attr('href', system_query_url);


  // 检查是否有新的消息
  init.msg_tip();
  // 检测用户是否产生跨号支付留有待购买商品
  $.ajax({
    type: 'GET',
    url: '/index.php?g=restful&m=HsArticle&a=ajax_check_last_goods',
    success: function(data){
      if(data.status == 1){
        var id = data.data.id;
        var post_title = data.data.post_title;
        var filepath = data.data.filepath;
        var img_url = $('.img_url').val() + filepath + '@640w_1l';
        $('.hint_purchase').find('img').attr('src', img_url);
        $('.hint_purchase').find('h3').text(post_title);
        $('.hint_purchase').find('.btn').on('click',function(){
          delete_last_goods();
          var url = '/Portal/HsArticle/index/id/'+id+'.html';
          location.href = url;
        })
        $('.hint_purchase').find('.close').on('click',function(){
          delete_last_goods();
          $('.hint_purchase').css('display','none');
        })
        $('.hint_purchase').css('display','block');
      }
    }
  });
  function delete_last_goods(){
    $.ajax({
      type: 'GET',
      url: '/index.php?g=restful&m=HsArticle&a=ajax_delete_last_goods',
      timeout: 4000,
      success: function(data){
        if(data.status == 1){
          console.log(data);
        }
      }
    });
  }

  // 系统公告
  // var placard = $('.placard');
  // var placard_content;
  // var placard_id;
  // if(placard.attr('data-placard').length){
  //   placard.show();
  //   placard_content = placard.attr('data-placard').split('|')[1];
  //   placard_id = placard.attr('data-placard').split('|')[0];
  //   placard.find('.placard_content').text(placard_content);
  // } else {
  //   placard.hide();
  // }
  // placard.on('click','.placard_close',function(){
  //   $.post('/index.php?g=restful&m=HsSystemNotice&a=disabled',{
  //     notice_id:placard_id
  //   },function(res){
  //     if(res.status == 1 ){
  //       placard.hide();
  //     } else {
  //       $.alert(res.info);
  //     }
  //   })
  // })
  
  // swiper配置 banner
  var mySwiper = new Swiper ('.swiper-container',{
    lazyLoading: true,
    autoplay : 3000,
    speed:300,
    autoplayDisableOnInteraction : false,
    loop: true,
    pagination : '.swiper-pagination',
    onSlideChangeStart: function(){
      $('[data-layzr]').lazyload({
        data_attribute:'layzr',
        container: $(".swiper-container")
      });
    }
  })
  // swiper配置 热卖
  var myHitposts = new Swiper ('.swiper-hitposts',{
    prevButton:'.swiper-button-prev',
    nextButton:'.swiper-button-next',
    lazyLoading: true,
    autoplay : 3000,
    speed:300,
    autoplayDisableOnInteraction : false,
    loop: true,
    onSlideChangeStart: function(swiper){
      var num = parseInt($('.swiper-hitposts').find('.swiper-slide-active').attr('data-swiper-slide-index')) + 1;
      var str = num + '/5';
      $('.hitposts_page').text(str);
      $('[data-layzr]').lazyload({
        data_attribute:'layzr',
        container: $(".swiper-hitposts")
      });
    }
  })
  // 获取卖家信息
  user_info();
  function user_info(){
    var arr = [];
    $('.store_list ul li').each(function() {
      var id = $(this).find('.title').attr('data-objectId');
      arr.push(id);
    })
    var data = {
      object_id: arr
    }
    $.post('/index.php?g=portal&m=index&a=get_img',data,function(res){
      if(res.status == 1){
        $('.store_list ul li').each(function() {
          var user_id = $(this).find('.user').attr('data-user_id');
          var that = this;
          $.each(res.data, function(index, item){
            var img_src = item.avatar;
            if(item.state == 0){
              img_src += '/64';
            }
            if(user_id == index){
              $(that).find('.user .user_info img').attr('src', img_src);
              $(that).find('.user .user_info span').text(item.name);
              return false;
            }
          })
        })
      } else {
        $.toast(res.info);
      }
    })
  }

  // 监听滚动增加返回顶部按钮
  var hs_footer_height = $('.hs-footer').height() + 'px';
  $(".content").on('scroll',function(){
    //当用户下拉时
    if($('.open_hs').height() != 0){
      contentScroll($('.open_hs').height());
    }else if( $('.open_app').height() != 0){
      contentScroll($('.open_app').height());
    }
    if($('.content').scrollTop() > 1000){
      $('.return_top').css('display', 'block');
    }else{
      $('.return_top').css('display', 'none');
    }
  });

  function contentScroll(height){
    if($('.content').scrollTop() < 0){
      return 1;
    }
    if($('.content').scrollTop() == 0){
      $('.show-list').css('top',0);
      $('.hs-main').css('bottom', hs_footer_height);
    }
    if(height >= $('.content').scrollTop()){
      var top = '-' + $('.content').scrollTop() +'px';
      var bottom = $('.content').scrollTop() +'px';
      $('.show-list').css('top',top);
      $('.hs-main').css('bottom', bottom);
    }else{
      var top = '-' + height +'px';
      $('.show-list').css('top',top);
      $('.hs-main').css('bottom', 0);
    }
  }

  $('.return_top').click(function(){
    $('.content').scrollTo();
  })
  // 卖家推荐
  var next_page_status = true;
  $('.next_page').click(function(){
    if(next_page_status){
      next_page_status = false;
      var num = $('.recomm').length;
      if(num > 0){
        $('.recomm1').removeClass('recomm1').addClass('recomm');
        $('.recomm2').removeClass('recomm2').addClass('recomm1');
        $('.recomm3').removeClass('recomm3').addClass('recomm2');
      }else{
        $('.recomm1').removeClass('recomm1').addClass('recomm');
        $('.recomm2').removeClass('recomm2').addClass('recomm1');
        $('.recomm3').removeClass('recomm3').addClass('recomm2');
        setTimeout(function(){
          $('.recomm').removeClass('recomm').addClass('recomm3');
          next_page_status = true;
        },300)
      }
    }
  })
  // 增加返回顶部动画
  $.fn.scrollTo = function (options) {
    var defaults = {
      toT: 0, //滚动目标位置  
      durTime: 300, //过渡动画时间  
      delay: 30, //定时器时间  
      callback: null //回调函数  
    };
    var opts = $.extend(defaults, options),
      timer = null,
      _this = this,
      curTop = _this.scrollTop(), //滚动条当前的位置  
      subTop = opts.toT - curTop, //滚动条目标位置和当前位置的差值  
      index = 0,
      dur = Math.round(opts.durTime / opts.delay),
      smoothScroll = function(t) {
        index++;
        var per = Math.round(subTop / dur);
        if(index >= dur) {
          _this.scrollTop(t);
          window.clearInterval(timer);
          if(opts.callback && typeof opts.callback == 'function') {
            opts.callback();
          }
          return;
        } else {
          _this.scrollTop(curTop + index * per);
        }
      };
    timer = window.setInterval(function() {
      smoothScroll(opts.toT);
    }, opts.delay);
    return _this;
  };
});
