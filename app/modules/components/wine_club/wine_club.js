//酒会员专区

// 初始化
var common = require('../common/common.js');

$(document).on('pageInit', '.wine_club', function (e, id, page) {

  if (page.selector == '.page') {
    return false;
  }

  document.title = '就会员专区';

  var init = new common(page);

  var $page = $(page);

  var ApiBaseUrl = init.getApiBaseUrl();

  var PHPSESSID = init.getCookie('PHPSESSID');
  var ajaxHeaders = {
    'phpsessionid': PHPSESSID
  };
  var mySwiper = new Swiper('.wine_swiper_wrap', {
    pagination: '.swiper-pagination',
    loop: true,
    autoplay: 3000,
    speed: 300,
    watchSlidesVisibility: true,
    autoplayDisableOnInteraction: false,
  })
  // var uid = init.ifLogin(true);

  // initPartnerData();


  // $page.find('.partner_share_btn').on('click',function(){
  //     init.sensors.track('buttonClick', {
  //         pageType : '公路传教士',
  //         buttonName : '去分享',
  //     })
  // });

  page.find('.toggle_cate').on('click',function(){
  
    if($(this).parent().hasClass('wine_cate_hide')){
      $(this).parent().removeClass('wine_cate_hide')
      $(this).find('div').html('点击收起')
    }else{
      $(this).parent().addClass('wine_cate_hide')
      $(this).find('div').html('查看更多')
    }
   
  })


});


