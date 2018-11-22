// 商品列表 首页
// 初始化
var common = require('../common/common.js');
// 搜索
// var SearchInit = require('../search_list/search_list.js');

$(document).on('pageInit','.index_list', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);

    var ApiBaseUrl = init.getApiBaseUrl();
    var PHPSESSID = init.getCookie('PHPSESSID');
    var ajaxHeaders = {
        'phpsessionid': PHPSESSID
    };

  // 调用微信分享sdk
  var share_data = {
    title: '公路商店 — 为你不着边际的企图心',
    desc: '这里能让好事自然发生',
    link: window.location.href,
    img: 'http://jscache.ontheroadstore.com/tpl/simplebootx_mobile/Public/i/logo.png'
  };
  init.wx_share(share_data);
  init.checkfollow();

  var loginStatus = init.ifLogin();

  // 搜索初始
  // SearchInit();

  var mySwiper = new Swiper('.swiper-container',{
    loop: true,
    pagination: '.swiper-pagination',
    lazyLoading: true,
    autoplay: 3000,
    speed:300,
    autoplayDisableOnInteraction : false
  })
  var myHitposts = new Swiper('.swiper-hitposts',{
    slidesPerView: 1.15,
    spaceBetween: '2.67%',
    lazyLoading: true,
    centeredSlides: true,
    autoplay: 3000,
    speed:300,
    autoplayDisableOnInteraction: false,
    loop: true,
    loopAdditionalSlides: 1
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
  $('.attentionUser').click(function(){
    var that = this;
    var isAtten = $(this).data('isatten');
    if(!loginStatus){
        init.toLogin();
        return;
    }
    if(isAtten == 0){
      $.ajax({
        type: 'POST',
        url: '/index.php?g=user&m=HsFellows&a=ajax_add',
        data: {
          uid:$(that).data('uid')
        },
        success: function(data){
          $.toast(data.info);
          $(that).text('已关注').attr('data-isatten', 1);
        },
        error: function(xhr, type){
          console.log(xhr);
        }
      });
        init.sensors.track('subscribe', {
            pageType : '推荐页',
            operationType : '关注',
            sellerID : $(this).data('data-uid'),
            storeName : $(this).parents('.item').find('.user_nicename').html(),
        })
    } else {
      $.confirm('确定取消吗？', function () {
          init.sensors.track('subscribe', {
              pageType : '推荐页',
              operationType : '取关',
              sellerID : $(this).data('data-uid'),
              storeName : $(this).parents('.item').find('.user_nicename').html(),
          })

        $.ajax({
          type: 'POST',
          url: '/index.php?g=user&m=HsFellows&a=ajax_cancel',
          data: {
            uid:$(that).data('uid')
          },
          success: function(data){
            $.toast(data.info);
            $(that).text('关注').attr('data-isatten', 0);
          },
          error: function(xhr, type){
            console.log(xhr);
          }
        });
      });
    }
  })
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
  // var next_page_status = true;
  // $('.next_page').click(function(){
  //   if(next_page_status){
  //     next_page_status = false;
  //     var num = $('.recomm').length;
  //     if(num > 0){
  //       $('.recomm1').removeClass('recomm1').addClass('recomm');
  //       $('.recomm2').removeClass('recomm2').addClass('recomm1');
  //       $('.recomm3').removeClass('recomm3').addClass('recomm2');
  //     }else{
  //       $('.recomm1').removeClass('recomm1').addClass('recomm');
  //       $('.recomm2').removeClass('recomm2').addClass('recomm1');
  //       $('.recomm3').removeClass('recomm3').addClass('recomm2');
  //       setTimeout(function(){
  //         $('.recomm').removeClass('recomm').addClass('recomm3');
  //         next_page_status = true;
  //       },300)
  //     }
  //   }
  // })
  $('.all_topic').click(function(){
    location.href = '/Portal/Index/cultureall.html';
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


    //  神策埋点事件
    sensorsEvent();
    function sensorsEvent() {
        $(page).find('.go_to_search').on('click',function(){
            init.sensors.track('buttonClick', {
                pageType : '首页',
                buttonName : '搜索',
            })
        });
        init.sensorsFun.bottomNav();
        var $swoperBulletWrap = $(page).find('.swiper-pagination');
        //首页banner
        $(page).find('.banner').on('click','.swiper-slide',function(){
            var url = $(this).find('a').attr('href');
            var index = $(this).attr('data-swiper-slide-index');
            init.sensorsFun.mkt('banner','首页',url,index,'','');
        });
        //首页大专题
        $(page).find('.classification_content').on('click','a',function(){
            var url = $(this).attr('href');
            var index = $(this).index();
            var title = $(this).find('.project_name').html();
            init.sensorsFun.mkt('专题','首页',title,index,'','');
        });
        //首页新品
        $(page).find('.newposts .goods_content').on('click','a',function(){
            var $this = $(this);
            var $li = $this.parents('.goods_list');
            var url = $this.attr('href');
            var index = $li.index();
            var title = '';
            var desc = '';
            var id = '';
            if($this.hasClass('filepath')||$this.hasClass('post_title')){
                //商品
                title = $li.find('.post_title').html();
                desc = '商品';
                id = init.sensorsFun.getUrlId(url);
            }else if($this.hasClass('keywords')){
                //标签
                if($this.hasClass('keywords_none')){
                    return;
                }
                title = $this.html();
            }else{
                //卖家id
                title = init.sensorsFun.getUrlId(url);
                desc = '店铺'
            }

            init.sensorsFun.mkt('新品','首页',title,index,desc,id);
        });
        //首页top10
        $(page).find('.hitposts .goods_list').on('click','a',function(){
            var $this = $(this);
            var $li = $this.parents('.swiper-slide');
            var url = $this.attr('href');
            var index = $li.attr('data-swiper-slide-index');
            var title = '';
            var desc = '';
            var id = '';
            if($this.hasClass('filepath')||$this.hasClass('post_title')){
                //商品
                title = $li.find('.post_title').html();
                desc = '商品';
                id = init.sensorsFun.getUrlId(url);
            }else if($this.hasClass('keywords')){
                //标签
                if($this.hasClass('keywords_none')){
                    return;
                }
                title = $this.html();
            }else{
                //卖家id
                title = init.sensorsFun.getUrlId(url);
                desc = '店铺'
            }

            init.sensorsFun.mkt('新品','首页',title,index,desc,id);
        });
        //首页专题精选
        $(page).find('.topic_list .culture_list').on('click','a',function(){
            var url = $(this).attr('href');
            var index = $(this).index();
            var title = $(this).find('.culture_name').html();
            init.sensorsFun.mkt('专题精选','首页',title,index,'','');
        });
        //卖家推荐
        $(page).find('.recommend_user .user_list').on('click','a',function(){
            var $li = $(this).parents('.item');
            var url = $(this).attr('href');
            var index = $li.index();
            var title = $li.find('.attentionUser').attr('data-uid');
            init.sensorsFun.mkt('卖家推荐','首页',title,index,'','');
        });
        //热门分类
        $(page).find('.categories .categories_list').on('click','a',function(){
            var url = $(this).attr('href');
            var index = $(this).index();
            var title = $(this).find('div').html();
            init.sensorsFun.mkt('热门分类','首页',title,index,'','');
        });
        //首页 商品列表
        $(page).find('.goods_list_ul').on('click','a',function(){
            var $this = $(this);
            var $li = $this.parents('li');
            var url = $this.attr('href');
            var index = $li.index();
            var title = '';
            var desc = '';
            var id = '';
            if($this.hasClass('articles')){
                //商品
                title = $li.find('.title').html();
                desc = '商品';
                id = init.sensorsFun.getUrlId(url);
            }else if($this.hasClass('classify_keyword')){
                //标签
                title = $this.html();
            }else{
                //卖家id
                title = init.sensorsFun.getUrlId(url);
                desc = '店铺'
            }

            init.sensorsFun.mkt('商品列表','首页',title,index,desc,id);
        });

    }



});
