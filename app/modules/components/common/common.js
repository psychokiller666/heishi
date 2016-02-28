// 页面初始化
// 图片延时加载
var Layzr = require('../../../../node_modules/layzr.js/dist/layzr.js');

var common = function(page){
    this.page = page;
    if (page.selector == '.page'){
        return false;
    }
    // 页面初始化
    // 控制.hs-page高度
    if($('.hs-page').length){
        if($('header').length){
          $('.hs-main').css('top',$('header').height());
      } else {
          $('.hs-main').css('top','0');
      }
      if($('footer').length){
          $('.hs-main').css('bottom',$('footer').height());
      } else {
          $('.hs-main').css('bottom','0');
      }
  }
  console.log(page);
  console.log('高度初始化');
  // 图片加载
  var layzr = new Layzr({
    threshold: 10000,
  });

};
common.prototype.loadimg = function(){
    var page = this.page;
    if (page.selector == '.page'){
        return false;
    }
    var layzr = new Layzr({
        threshold: 10000,
    });
    layzr.update();
};
module.exports = common;
