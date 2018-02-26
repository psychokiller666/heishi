// 页面初始化
var common = require('../common/common.js');

$(document).on('pageInit','.big_project', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  // 调用微信分享sdk
  var share_data = {
    title: '黑市 | '+ $('.project_name').val(),
    desc: '这里能让好事自然发生',
    link: GV.HOST+location.pathname,
    img: '//img8.ontheroadstore.com/upload/170817/be6eec2c499df6bfbb41b132e0275759.png'
  };
  init.wx_share(share_data);
  init.checkfollow();

  // 打开ios对应页面
    var system_query = init.system_query();
  if(system_query == 'android'){
    var system_query_url = GV.app_url;
  }else if(system_query == 'ios'){
    var system_query_url = GV.api_url + '/ios/project/'+ $('.big_project').attr('data-id');
  }
  $('.open_app').find('.open_app_btn').attr('href', system_query_url);

  // 检查是否有新的消息
  init.msg_tip();
  // 初始ul width
  var project_names_ul = $('.project_names').children('ul');
  if(project_names_ul.attr('data-width') == 0){
    project_names_ul.find('li').each(function(index){
      $(this).find('a').removeClass('active');
      if(index == 0){
        $(this).find('a').addClass('active');
        var id = $(this).attr('data-id');
        $('.project_list').find('ul').eq(0).attr('data-id', id);
      }
      var n = parseInt(project_names_ul.attr('data-width'));
      var m = $(this).width();
      project_names_ul.attr('data-width', n+m+1);
    })
    project_names_ul.css('width', project_names_ul.attr('data-width') + 'px');
  }
  // swiper配置
  var mySwiper = new Swiper ('.swiper-container',{
    lazyLoading: true,
    autoplay : 3000,
    speed:300,
    autoplayDisableOnInteraction : false,
    loop: true,
    pagination : '.swiper-pagination',
  })
  // js控制Y轴滚动 status判断是点击还是左右滑动
  var touchclientX = 0,
  touchclientY = 0,
  status = 0;
  $('.project_names').on('touchstart',function(e){
    touchclientX = e.targetTouches[0].clientX;
    touchclientY = e.targetTouches[0].clientY;
    status = 0;
  })
  $('.project_names').on('touchmove',function(e){
    e.preventDefault();
    e.stopPropagation();
    status = 1;
    var num = e.targetTouches.length;
    if(num == 1){
      var x = Math.abs(touchclientX - e.targetTouches[0].clientX);
      var y = Math.abs(touchclientY - e.targetTouches[0].clientY);
      //判断上下  还是左右
      if(x < y) return;
      // 当前位置
      var m = parseInt(project_names_ul.attr('data-translatex'));
      // 位移位置
      var n = e.targetTouches[0].clientX - touchclientX + m;
      // ul width
      var ul_width = parseInt(project_names_ul.attr('data-width'));
      // window width 
      var ul_window = parseInt($('body').width());
      // 计算当前位置可以移动的范围

      if(n < 0 && n > (ul_window - ul_width)){
        $('.project_names').attr('data-location', n);
        project_names_ul.css({'transform':'translatex('+n+'px)','webkitTransform':'translatex('+n+'px)'});
        hr_move();
      }else if(n > 0){
        $('.project_names').attr('data-location', 0);
        project_names_ul.css({'transform':'translatex('+0+'px)','webkitTransform':'translatex('+0+'px)'});
        hr_move();
      }else if(n < (ul_window - ul_width)){
        $('.project_names').attr('data-location', (ul_window - ul_width));
        project_names_ul.css({'transform':'translatex('+(ul_window - ul_width)+'px)','webkitTransform':'translatex('+(ul_window - ul_width)+'px)'});
        hr_move();
      }
    }
  })
  $('.project_names').on('touchend',function(e){
    var m = parseInt($('.project_names').attr('data-location'));
    project_names_ul.attr('data-translatex', m);
  })
  // 下拉project_box定位在顶部
  $(".hs-page").on('scroll', function(){
    var project_box = $('.project_box').position();
    if(project_box.top < 0){
      $('.project_names').css('position', 'fixed');
      $('.project_list').css('padding-top', '0.85rem');
    }else{
      $('.project_names').css({'position':'relative', 'top': 0});
      $('.project_list').css('padding-top', '0.16rem');
    }
  });
  // 记录project_names距离视图顶部位置
  var project_names_top = $('.project_box').position().top;
  // 子专题点击切换
  $('.project_names').on('click', 'li', function(){
    if(status == 1) return false;
    $(this).siblings().each(function(){
      $(this).find('a').removeClass('active');
    })
    $(this).find('a').addClass('active');
    hr_move();
    $(".hs-page").scrollTo({toT: project_names_top});
    // 判断是否已经加载过子专题，没有的ajax 有的直接显示
    var project_status = true;
    var id = $(this).attr('data-id');
    $('.project_list').find('ul').each(function(){
      if(id == $(this).attr('data-id')){
        project_status = false;
        $('.project_list').find('ul').removeClass('active');
        $(this).addClass('active');
      }
    })
    if(project_status){
      ajax_posts(id);
    }
  })
  // 滚动动画
  $.fn.scrollTo =function(options){
      var defaults = {
          toT : 0,
          durTime : 500,
          delay : 17,
          callback:null
      };
      var opts = $.extend(defaults,options),
          timer = null,
          _this = this,
          curTop = _this.scrollTop(),//滚动条当前的位置
          subTop = opts.toT - curTop,    //滚动条目标位置和当前位置的差值
          index = 0,
          dur = Math.round(opts.durTime / opts.delay),
          smoothScroll = function(t){
              index++;
              var per = Math.round(subTop/dur);
              if(index >= dur){
                  _this.scrollTop(t);
                  window.clearInterval(timer);
                  if(opts.callback && typeof opts.callback == 'function'){
                      opts.callback();
                  }
                  return;
              }else{
                  _this.scrollTop(curTop + index*per);
              }
          };
      timer = window.setInterval(function(){
          smoothScroll(opts.toT);
      }, opts.delay);
      return _this;
  };
  // 控制下划线移动
  hr_move();
  function hr_move(){
    var active_left = project_names_ul.find('.active').offset();
    var active_width = project_names_ul.find('.active').width();
    $('.hr').css({'width': active_width, 'left': active_left.left});
  }
  function ajax_posts(id){
    var picture_root_url = $('.picture_root_url').val();
    $.ajax({
      url: '/HsProject/getProject?sid='+id,
      type: 'get',
      success: function(data){
        if(data.status == 1){
          $('.project_list').find('ul').removeClass('active');
          var ul = '<ul class="active" data-id="'+id+'"></ul>';
          $('.project_list').append(ul);
          $.each(data.data, function(i, item){
            var str = '<li>'
                      +'<a href="/Portal/HsArticle/index/id/'+item.id +'.html">'
                      +'<div class="images" data-layzr="'+picture_root_url+item.filepath+'@640w_1l" data-layzr-bg></div>'
                      +'<span>'+item.post_title+'</span>'
                      +'</a>'
                    +'</li>';
            $('.project_list .active').append(str);
          })
          init.loadimg();
        }else{
          $.toast(data.info);
          $('.project_list').find('ul').removeClass('active');
          var ul = '<ul class="active" data-id="'+id+'"></ul>';
          $('.project_list').append(ul);
        }
      }
    })
  }
})
