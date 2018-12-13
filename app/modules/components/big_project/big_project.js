// 页面初始化
var common = require('../common/common.js');

$(document).on('pageInit','.big_project', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);

  //微信分享图片
  var shareImgUrl = 'https://jscache.ontheroadstore.com/tpl/simplebootx_mobile/Public/i/logo.png';
  var $project_share_img = $(page).find('.project_share_img');
  if($project_share_img.length>0){
    shareImgUrl = $project_share_img.attr('value') || shareImgUrl;
  }

  // 调用微信分享sdk
  var share_data = {
    title: $('.project_name').attr('data-name') + ' — 公路商店',
    desc: $('.desc').text(),
    link: window.location.href,
    img: shareImgUrl
  };

  init.wx_share(share_data);
  init.checkfollow(1);


  $('.project_names').find('.item').eq(0).addClass('active');
  $('.project_list').find('.active').attr('data-id', $('.project_names').find('.item').eq(0).attr('data-id'));
  // swiper配置
  var mySwiper = new Swiper ('.swiper-container',{
    lazyLoading: true,
    autoplay : 3000,
    speed:300,
    autoplayDisableOnInteraction : false,
    loop: true,
    pagination : '.swiper-pagination',
  })

  // 下拉project定位在顶部
  $(".hs-page").on('scroll', function(){
    var project = $('.project').position();
    if(project.top < 0){
      $('.project_box').css('position', 'fixed');
      $('.project_list').css('padding-top', '1.1733rem');
    }else{
      $('.project_box').css({'position':'relative', 'top': 0});
      $('.project_list').css('padding-top', '0.4rem');
    }
  });
  // 子专题点击切换
  $('.project_names').on('click', '.item', function(){
    if(status == 1) return false;
    $('.project_names').find('.item').removeClass('active');
    $(this).addClass('active');
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
        }
      }
    })
  }

    //  神策埋点事件
    sensorsEvent();
    function sensorsEvent() {
        //大专题banner
        var bigTitle = $(page).find('.project_name').html();
        $(page).find('.banner').on('click','.swiper-slide',function(){
            var url = $(this).find('a').attr('href');
            var index = $(this).attr('data-swiper-slide-index');
            init.sensorsFun.mkt('banner','大专题页-'+bigTitle,url,index,'','');
        });
        //大专题 精选商品
        $(page).find('.project_list').on('click','li',function(){
            var url = $(this).find('a').attr('href');
            var index = $(this).index();
            var title = $(this).find('span').html();
            var classify = $(page).find('.project_names .active').html();
            var id = init.sensorsFun.getUrlId(url);
            init.sensorsFun.mkt('精选商品','大专题页-'+bigTitle,classify+'-'+title,index,'',id);
        });

    }

})
