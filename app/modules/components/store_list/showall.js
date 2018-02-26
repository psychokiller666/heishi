// 商品列表
// 初始化
var common = require('../common/common.js');
var lazyload = require('../../../../bower_components/jieyou_lazyload/lazyload.min.js');


$(document).on('pageInit','.showall', function (e, id, page) {
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
    container: $(".goods_content")
  });

  // 打开ios对应页面
  var system_query = init.system_query();
  if(system_query == 'android'){
    var system_query_url = GV.app_url;
  }else if(system_query == 'ios'){
    var system_query_url = GV.api_url + '/ios/index/1';
  }
  $('.open_app').find('.open_app_btn').attr('href', system_query_url);

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

});
