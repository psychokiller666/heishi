// 发过的东西
// handlebars
var handlebars = require('../../../../node_modules/handlebars/dist/handlebars.min.js');
// 页面初始化
var common = require('../common/common.js');

$(document).on('pageInit','.posts', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.wx_share(false);

  var stock_box = $('.stock_box');
  var stock_btn = $('.already_list li').find('button');
  stock_btn.on('click',function(e) {
    var stock_number = $(this).parent().parent().find('.username span');

    stock_box.show();
    stock_box.find('input').val(stock_number.text());

    stock_box.find('input').trigger('focus');
    stock_box.find('input').focus(function(){

    }).blur(function(e){
      stock_box.find('button').on('click',function(){
        $.toast('🙂 修改成功');

        stock_number.text(stock_box.find('input').val());
        stock_box.hide();
      })
    });
    stock_box.on('click',function(){
      stock_box.hide();
    });
  });

})
