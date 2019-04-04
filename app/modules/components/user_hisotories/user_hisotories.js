// 发布规则页
// 页面初始化
var common = require('../common/common.js');

$(document).on('pageInit','.user_hisotories', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);

    //  神策埋点事件
    sensorsEvent();
    function sensorsEvent() {

        //浏览记录页
        $(page).find('ul').on('click','a',function(){
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

            init.sensorsFun.mkt('浏览记录','浏览记录页',title,index,desc,id);
        });


    }


})
