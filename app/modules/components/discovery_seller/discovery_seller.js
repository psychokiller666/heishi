// 页面初始化
var common = require('../common/common.js');

$(document).on('pageInit','.discovery_seller', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  // 调用微信分享sdk
  var share_data = {
    title: page.data('desc'),
    desc: '这里能让好事自然发生',
    link: GV.HOST+location.pathname,
    img: 'http://jscache.ontheroadstore.com/tpl/simplebootx_mobile/Public/i/logo.png'
  };
  init.wx_share(share_data);
  init.checkfollow(1);

  // 判断当前按钮关注状态
  var other_uids = [];
  page.find('.header button').each(function(index){
    other_uids.push($(this).data('id'));
  });
  $.post('/index.php?g=user&m=HsFellows&a=ajax_group_relations',{
    my_uid:page.data('myuid'),
    other_uids:other_uids.join()
  },function(res){
    if(res.status == 1){
      $.map(res.relations,function(item,index){
        if(item == 1) {
          page.find('.header button').eq(index).text('关注').removeClass().addClass('add active');
        } else if(item ==2) {
          page.find('.header button').eq(index).text('已关注').removeClass().addClass('cancel');
        } else if(item ==3) {
          page.find('.header button').eq(index).text('已关注').removeClass().addClass('cancel');
        }
      });
    } else {
      $.toast(res.info);
    }
  });

  page.find('.header button').on('click',function(){
    var _this = this;
    $(_this).data('id');
    if($(_this).hasClass('cancel')) {
      // 取消关注
      $.post('/index.php?g=user&m=HsFellows&a=ajax_cancel',{
        uid:$(_this).data('id')
      },function(res){
        if(res.status == '1') {
          $(_this).text('关注').removeClass().addClass('add active');
          $.toast(res.info);
        } else {
          $.toast(res.info);
        }
      })
    } else {
      // 添加关注
      $.post('/index.php?g=user&m=HsFellows&a=ajax_add',{
        uid:$(_this).data('id')
      },function(res){
        if(res.status == '1') {
          $(_this).text('已关注').removeClass().addClass('cancel');
          $.toast(res.info);
        } else {
          $.toast(res.info);
        }
      })
    }

  });
})
