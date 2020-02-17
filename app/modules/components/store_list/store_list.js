// 商品列表 首页
// 初始化
var common = require('../common/common.js');

// velocity动画插件，使用方法同jquery.animate。引入的原因是使用animate在ios上动画速度过快。
var velocity = require('../plugin/velocity.min.js');
// 搜索
// var SearchInit = require('../search_list/search_list.js');

//鬼市首页
var gsHome = require('../ghost_market_article_home/gs_home.js');

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
  var H5BaseUrl = ''
  if(ApiBaseUrl.indexOf('api.')>0){
    H5BaseUrl=`https://h5.ontheroadstore.com/`
  }else{
    H5BaseUrl=`https://h5test.ontheroadstore.com/`
  }

  // var myHitposts = new Swiper('.swiper-hitposts',{
  //   slidesPerView: 1.15,
  //   spaceBetween: '2.67%',
  //   lazyLoading: true,
  //   centeredSlides: true,
  //   autoplay: 3000,
  //   speed:300,
  //   autoplayDisableOnInteraction: false,
  //   loop: true,
  //   loopAdditionalSlides: 1
  // })
  initNewHomePage()
  function initNewHomePage(){
    $.ajax({
      type: 'POST',
      url: ApiBaseUrl+'/appv6_5/homepage',
      data: { 
        "HomepageAppBanner": [1],
        "HomepageAppSellerRecommend": [1],
        "HomepageAppSegmentGoodsList": [1],
        "HomepageAppFeatureList": [1],
        "HomepageAppNewGoodsList": [1],
        "HomepageAppLottery": [1],
        "HomepageAdvertisement": [1],
        "cid":7
      },
      success: function(data){
        initNewBanner(data.data.HomepageAppBanner.model_data)
        initSellerRecommend(data.data.HomepageAppSellerRecommend.model_data)
        initNewGoodsList(data.data.HomepageAppNewGoodsList.model_data)
        initNewTopicList(data.data.HomepageAppFeatureList.model_data.fang_list,1)
        initNewTopicList(data.data.HomepageAppFeatureList.model_data.chang_list,2)
        initRecomendAndOnly(data.data.HomepageAppSegmentGoodsList.model_data)
      },
      error: function(xhr, type){
        console.log(xhr);
      }
    });

  }
  //banner轮播
  function initNewBanner(data){
    if(!data||data.length==0){
      return
    }
    let str = ``
    data.forEach(v=>{
      str+=`<div class="swiper-slide">
        <a class="external" href='${genrateUrl(v.url,v.url_type)}'>
          <img src="${v.image}" />
        </a>
      </div>`
    })
    $('.banners').find('.swiper-wrapper').html(str)
    var mySwiper = new Swiper('.swiper-container-home',{ 
      pagination: '.swiper-pagination',
      // lazyLoading: true,
      loop: true,
      autoplay: 3000,
      speed:300,
      watchSlidesVisibility : true,
      autoplayDisableOnInteraction : false,
    })
  }
 //卖家推荐
  function initSellerRecommend(data){
    if(!data||data.length==0){
      return
    }
    let str = ``
    data.forEach((v,i)=>{
      str+=`<div class="seller_item" data-author="${v.userinfo.author}">
          <img class="un_active ${i==0?'active':''}" src="${v.userinfo.user_avatar}@160w_1l" />
          <p class="un_active ${i==0?'active':''}">${v.userinfo.user_name}</p>
          <span class="un_active ${i==0?'active':''}"></span>
      </div>`
      initSellerRecommendGoods(data[i].goods,i)
      if(i==0){
        $('.into_shop').attr('href',`/User/index/index/id/${v.userinfo.author}.html`)
      }
    })
    $('.seller_recommend').find('.seller_list').html(str)
   
  }
  function initSellerRecommendGoods(data,index){
    if(!data||data.length==0){
      return
    }
    if(!data||data.length==0){
      return
    }
    let str = ``
    data.forEach(v=>{
      str+=`<a  href="/Portal/HsArticle/index/id/${v.id}.html" class="seller_good seller_good_${index} external">
          <img src="${v.cover}@320w_1l" />
          <p>${v.title}</p>
          <span>¥${v.price[0]}</span>
      </a>`
    })
    $('.seller_recommend').find('.seller_goods_list').append(str)
    $('.seller_goods_list').find(`.seller_good`).hide()
    $('.seller_goods_list').find(`.seller_good_0`).css("display","inline-block")
  }
  //新品
  function initNewGoodsList(data){
    if(!data||data.length==0){
      $('.new_goods').hide()
      return
    }
    let str = ``
    data.forEach(v=>{
      str+=`<div class="swiper-slide">
        <a  href="/Portal/HsArticle/index/id/${v.id}.html" class="new_good external">
          <img src="${v.cover}@320w_1l" />
          <p>${v.title}</p>
          
      </a></div>`
    })
    str+=`
      <div class='swiper-slide'>
        <img class="jump_new_more" src="https://img8.ontheroadstore.com/H5_Icon/home_new_more.png" />
      </div>
    `
    $('.new_goods_list').find('.swiper-wrapper').html(str)
    var mySwiper = new Swiper('.swiper-container-new',{ 
      slidesPerView: 2.3,
      // lazyLoading: true,
      // loop: true,
      autoplay: 3000,
      speed:300,
      watchSlidesVisibility : true,
      autoplayDisableOnInteraction : false,
      autoplayStopOnLast: true
    })

    $('.new_goods_list').on('click','.jump_new_more',function(){
      location.href= `${H5BaseUrl}home/new`;
    })
  }
  //专题
  function initNewTopicList(data,status){
    if(!data||data.length==0){
      return
    }
    let str= ``
    data.forEach(v=>{
      str+=`<div   class="topic" data-type="${v.type}" data-id="${v.id}">
      <img src="${v.cover}@320w_1l" />
      <div class="shadow">
        <p class="tit">${v.title}</p>
        <p class="sub_tit">${v.subtitle}</p>
      </div>
    </div>`
    })
    if(status==1){
      $('.through_topic').html(str)
    }
    if(status==2){
      $('.vertical_topic').html(str)
    }
   
  }
 
  //专栏
  function initRecomendAndOnly(data){
    if(!data||data.length==0){
      return
    }
    let tab = ``
    $('.segment_list').html('')
    data.forEach((v,i)=>{
      tab+=`<span class="${i==0?'active':''}">${v.title}</span>`
      let list = `<div class="list_${i}" style="display:${i===0?'block':'none'}"><div class="list">`
      v.goodslist.forEach(t=>{
        if(t.type==1){
          list+=`<div  class="segment_good">
            <a href="/Portal/HsArticle/index/id/${t.id}.html"  class="external">
              <img class="cover" src="${t.cover}@320w_1l" />
            </a>
          <div class="txt">
            <div class="txt_top">
            <a href="/Portal/HsArticle/index/id/${t.id}.html"  class="external">
              <p class="tit">${t.title} </p>
            </a>
              <p class="sub_tit">${t.post_subtitle}</p>
            </div>
            <p class="txt_end" style="padding-top:.1rem;">
              <span>¥ ${t.price[0]}</span>`
              if(t.tag_list){
                if(t.tag_list.id==1){
                  list+=`<span class="tag" data-jump="1" data-id="${t.tag_list.id}"><span class="time" data-time="${t.tag_list.count_down}">${countDown(t.tag_list.count_down)}</span>${t.tag_list.title}</span>`
                }else{
                  list+=`<span class="tag" data-jump="2" data-id="${t.tag_list.id}" style="margin-top: -.1rem;"><img class="tag_icon" src="${t.tag_list.icon}" />${t.tag_list.title}</span>`
                }
              }
            list+= `</p>
          </div>
          
        </div>`
        }
        if(t.type==2){
          list+=`
            <a class="ad external" href='${genrateUrl(t.object_id,t.ad_type)}'>
              <img  src="${t.image}"/>
            </a>
          `
        }

      })
      list+=`</div></div>`
      $('.segment_list').append(list)
      //时间倒计时
      let listDom =  $('.segment_list').find('.time')
      listDom.forEach(v=>{
        setInterval(()=>{
          let time =  countDown($(v).attr('data-time'))
          $(v).html(time)
        },1000)
        
      })

    })
    $('.tab_recommend_only').html(tab)
  }
  //专栏点击事件
  $('.tab_recommend_only').on('click','span',function(){
    let idx = $(this).index()
    $(this).addClass('active').siblings().removeClass('active')
    $('.segment_list').find(`.list_${idx}`).show().siblings().hide()
  })
  //推荐卖家切换
  $('.seller_list').on('click','.seller_item',function(){
    let idx = $(this).index()
    let author = $(this).attr('data-author')
    $('.un_active').removeClass('active')
    $(this).find('img').addClass('active')
    $(this).find('p').addClass('active')
    $(this).find('span').addClass('active')
    $('.into_shop').attr('href',`/User/index/index/id/${author}.html`)
    $('.seller_goods_list').find(`.seller_good`).hide()
    $('.seller_goods_list').find(`.seller_good_${idx}`).css("display","inline-block")
  })
  //专题跳转
  $('.topic_selected').on('click','.topic',function(){
    let id = $(this).attr('data-id');
    let type = $(this).attr('data-type')
    switch(type){
      case  '1':
        location.href= `${H5BaseUrl}bookListDetail/${id}`;
        break;
      case '2':
        location.href= `${H5BaseUrl}wineFeature/${id}`;
        break;
      case '3':
        location.href= `${H5BaseUrl}miniFeature/${id}`;
        break;
      case '4':
        location.href= `/Portal/HsArticle/culture/id/${id}.html`;
        break;
      default :
        console.log('没有找到这个类型，小老弟，看看是哪里的bug')
        break;
    }
  })

  //广告跳转
  function genrateUrl(url, url_type) {
    if (url_type === 0 || url_type === '0') {
      return 'javascript:;';
    }
    if (url_type === 1 || url_type === '1') {
      return `/Portal/HsArticle/index/id/${url}.html`
    }
    if (url_type === 2 || url_type === '2') {
      return `/Portal/HsArticle/culture/id/${url}.html`
    }
    if (url_type === 3 || url_type === '3') {
      return `/HsProject/index/pid/${url}.html`
    }
    if (url_type === 5 || url_type === '5') {
      return url;
    }
    if (url_type === 6 || url_type === '6') {
      return `/HsCategories/category_index/id/${url}.html`
    }


  }
  $('.segment_list').on('click','.tag',function(){
    let jumpStatus = $(this).attr('data-jump')
    let id = $(this).attr('data-id')
    if(jumpStatus==1){
      return
    }
    location.href= `${H5BaseUrl}segment/${id}`;
  })
  function countDown(endTime){
    // let _endTime = new Date(endTime.replace(/-/g, "/")).getTime()
    let _endTime = endTime*1000
    let _startTime = new Date().getTime()
    let times = (_endTime - _startTime)/1000
    if(times<=0){
      return
    }
    var day=0,
      hour=0,
      minute=0,
      second=0;//时间默认值
      if(times > 0){
        day = Math.floor(times / (60 * 60 * 24));
        hour = Math.floor(times / (60 * 60)) - (day * 24);
        minute = Math.floor(times / 60) - (day * 24 * 60) - (hour * 60);
        second = Math.floor(times) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
      }
      if (day <= 9) day = '0' + day;
      if (hour <= 9) hour = '0' + hour;
      if (minute <= 9) minute = '0' + minute;
      if (second <= 9) second = '0' + second;
    return hour+":"+minute+":"+second
  }
  // 获取卖家信息
  // user_info();
  // function user_info(){
  //   var arr = [];
  //   $('.store_list ul li').each(function() {
  //     var id = $(this).find('.title').attr('data-objectId');
  //     arr.push(id);
  //   })
  //   var data = {
  //     object_id: arr
  //   }
  //   $.post('/index.php?g=portal&m=index&a=get_img',data,function(res){
  //     if(res.status == 1){
  //       $('.store_list ul li').each(function() {
  //         var user_id = $(this).find('.user').attr('data-user_id');
  //         var that = this;
  //         $.each(res.data, function(index, item){
  //           var img_src = item.avatar;
  //           if(user_id == index){
  //             $(that).find('.user .user_info img').attr('src', img_src);
  //             $(that).find('.user .user_info span').text(item.name);
  //             return false;
  //           }
  //         })
  //       })
  //     } else {
  //       $.toast(res.info);
  //     }
  //   })
  // }
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
            sellerID : $(that).data('uid'),
            storeName : $(that).parents('.item').find('.user_nicename').html(),
        })
    } else {
      $.confirm('确定取消吗？', function () {
          init.sensors.track('subscribe', {
              pageType : '推荐页',
              operationType : '取关',
              sellerID : $(that).data('uid'),
              storeName : $(that).parents('.item').find('.user_nicename').html(),
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


    // 鬼市首页入口
    if($('.ghost_store_ad_wrap').length>0){
        setGS();
    }
    function setGS(){
        var url = ApiBaseUrl + '/ghostmarket/getSetting';
        $.ajax({
            type: "GET",
            url: url,
            dataType: 'json',
            data: {},
            headers: ajaxHeaders,
            success: function (data) {
                if (data.status == 1) {
                    if(data.data.userCenterStatusH5){
                        $('.ghost_store_ad_img').css({'background':'url("'+ data.data.secondFloorBackgroundImgH5 +'@640w_1l") no-repeat center center','background-size': 'cover'});
                        $('.ghost_store_ad_wrap').show();
                        initGS();
                    }
                }
            },
            error: function (e) {
                console.log('getSetting err: ', e);
            }

        });
    }

    function initGS() {

        //初始化鬼市home页
        gsHome({gs_cd_back:gs_cd_back});

        var gsType = undefined;//鬼市状态

        var $ghost_store_iframe_wrap = $('.ghost_store_iframe_wrap');

        var gs_share_data = {
            title: '公路商店 — 鬼市',
            desc: '为你不着边际的企图心',
            link: window.location.origin + '/Portal/GhostMarket/home.html',
            img: 'http://jscache.ontheroadstore.com/tpl/simplebootx_mobile/Public/i/logo.png'
        };


        //鬼市首页泼墨动画

        var modalTrigger = $('.cd-modal-trigger'),
            transitionLayer = $('.ghost_store_animate_wrap'),
            transitionBackground = transitionLayer.children(),
            modalWindow = $('.cd-modal');

        var frameProportion = 1.78, //png frame aspect ratio
            frames = 25, //number of png frames
            resize = false;

        //设置过渡背景尺寸
        setLayerDimensions();
        $(window).on('resize', function(){
            if( !resize ) {
                resize = true;
                (!window.requestAnimationFrame) ? setTimeout(setLayerDimensions, 300) : window.requestAnimationFrame(setLayerDimensions);
            }
        });


        //close modal window
        modalWindow.on('click', '.modal-close', function(event){
            event.preventDefault();
            transitionLayer.addClass('closing');
            // modalWindow.removeClass('visible');
            transitionBackground.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(){
                transitionLayer.removeClass('closing opening visible');
                transitionBackground.off('webkitAnimationEnd oanimationend msAnimationEnd animationend');
            });
        });

        function setLayerDimensions() {
            var windowWidth = $(window).width(),
                windowHeight = $(window).height(),
                layerHeight, layerWidth;

            if( windowWidth/windowHeight > frameProportion ) {
                layerWidth = windowWidth;
                layerHeight = layerWidth/frameProportion;
            } else {
                layerHeight = windowHeight*1.2;
                layerWidth = layerHeight*frameProportion;
            }

            transitionBackground.css({
                'width': layerWidth*frames+'px',
                'height': layerHeight+'px',
            });

            resize = false;
        }


        $('.ghost_store_ad_wrap').on('click', '.ghost_store_ad_img', function () {
            var $img = $(this);

            //设置分享
            setShare();


            //对鬼市广告图做动画及打开鬼市home页

            transitionLayer.addClass('visible opening');

            var delay =  600;
            setTimeout(function(){
                $ghost_store_iframe_wrap.show().velocity({opacity: 1}, 600, 'linear', function () {});
            }, delay);

            //判断是否需要重启
            getGSstatus(changeStatus);

            $img.attr('openstatus', '1');

        });

        //关闭按钮事件
        $('.ghost_store_iframe_close').off('click').on('click', function () {

            //设置分享
            setShare(true);

            transitionLayer.addClass('closing');
            modalWindow.removeClass('visible');
            transitionBackground.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(){
                transitionLayer.removeClass('closing opening visible');
                transitionBackground.off('webkitAnimationEnd oanimationend msAnimationEnd animationend');
            });


            $ghost_store_iframe_wrap.velocity({opacity: 0}, 600, 'linear', function () {
                $ghost_store_iframe_wrap.hide();
            });
        });

        //设置分享信息
        function setShare(restore) {
            if (restore) {
                init.wx_share(share_data);
            } else {
                init.wx_share(gs_share_data);
            }
        }
        //如果鬼市正在进行，自动打开
        gsGoing();
        function gsGoing(){
            getGSstatus(function(type, data){
                if(type === false){
                    return;
                }

                gsType = type; //第一次设置gsType

                //ga_type 类型1 开市中 2活动未开始 3活动已结束 0没有活动
                if(type == 1){

                    if(localStorage.getItem('ga_id')==data.data.avtivity.ga_id){
                        return;
                    }

                    localStorage.setItem('ga_id', data.data.avtivity.ga_id);
                    //打开鬼市home页
                    $ghost_store_iframe_wrap.show().animate({opacity: 1}, 500, 'linear');
                }

            })



        }

        //获取当前gs状态
        function getGSstatus(callback){
            var url = ApiBaseUrl + '/ghostmarket/goods/getGhostMarketGoods';
            $.ajax({
                type: "GET",
                url: url,
                dataType: 'json',
                data: {},
                headers: ajaxHeaders,
                success: function (data) {
                    if (data.status == 1) {

                        //ga_type 类型1 开市中 2活动未开始 3活动已结束 0没有活动
                        if(data.data.avtivity){
                            callback(data.data.avtivity.ga_type, data);
                            return;
                        }
                    }
                    callback(false);
                },
                error: function (e) {
                    callback(false);
                    console.log('getGhostMarketGoods err: ', e);
                }

            });
        }

        //判断状态是否改变
        function changeStatus(newType){
            if(newType === false){
                return;
            }
            //每次打开鬼市弹窗都去检测状态是否变化，如果鬼市状态变化，重新加载鬼市页面
            if(gsType !== undefined && gsType !== newType){
                $ghost_store_iframe_wrap.show();
                $('.gs_home_con').scrollTop(10);
                gsHome({gs_cd_back:gs_cd_back});
            }
            gsType = newType;
        }

        //鬼市开市倒计时结束回调
        function gs_cd_back() {

            if($ghost_store_iframe_wrap.css('display')==='none'){
                $.modal({
                    text: '公路鬼市正式开市，去趟趟！',
                    title: '开市提醒',
                    buttons: [
                        {
                            text: '无聊', close: true,
                            onClick: function () {
                                gsType = null;
                            }
                        },
                        {
                            text: '去趟趟', bold: true, close: true,
                            onClick: function () {
                                window.location.href = '/Portal/GhostMarket/home.html';
                            }
                        }
                    ]
                });
            }else{
                window.location.href = '/Portal/GhostMarket/home.html';
            }
        }


    }

    //抽奖顶部入口
    var $go_to_lottery = $(page).find('.go_to_lottery');
    if($go_to_lottery.length>0){
        showLottery();
    }
    function showLottery(){
        var url = ApiBaseUrl + '/appv6_2/getLotterySwitch';
        $.ajax({
            type: "GET",
            url: url,
            dataType: 'json',
            data: {},
            headers: ajaxHeaders,
            success: function (data) {
                if (data.status == 1) {
                    if(data.data==1){
                        $go_to_lottery.show();
                    }
                }
            },
            error: function (e) {
                console.log('getLotterySwitch err: ', e);
            }

        });
    }

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
                desc = '标签';
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
                desc = '标签';
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
                desc = '标签';
            }else{
                //卖家id
                title = init.sensorsFun.getUrlId(url);
                desc = '店铺'
            }

            init.sensorsFun.mkt('商品列表','首页',title,index,desc,id);
        });

    }



});



