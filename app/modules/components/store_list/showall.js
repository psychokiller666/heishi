// 商品列表
// 初始化
var common = require('../common/common.js');
// 搜索
// var SearchInit = require('../search_list/search_list.js');

$(document).on('pageInit','.showall', function (e, id, page) {
  require('../../../../node_not/SUI-Mobile/dist/js/sm-extend.min.js');
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);

  // 调用微信分享sdk
  var share_data = {
    title: '公路商店 — 为你不着边际的企图心',
    desc: '这里能让好事自然发生',
    link: window.location.href,
    img: 'http://jscache.ontheroadstore.com/tpl/simplebootx_mobile/Public/i/logo.png'
  };
  init.wx_share(share_data);
  init.checkfollow();

    var ApiBaseUrl = init.getApiBaseUrl();
    var PHPSESSID = init.getCookie('PHPSESSID');
    var ajaxHeaders = {
        'phpsessionid': PHPSESSID
    };


  // 搜索初始
  // SearchInit();
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
  // 监听滚动增加返回顶部按钮
  var hs_footer_height = $('.hs-footer').height() + 'px';
  $(".content").on('scroll',function(){
    //当用户下拉时
    if($('.open_hs').height() != 0){
      contentScroll($('.open_hs').height());
    }else if( $('.open_app').height() != 0){
      contentScroll($('.open_app').height());
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

        //哆嗦排行榜
        $(page).find('.goods_content .goods_list').on('click','a',function(){
            var url = $(this).attr('href');
            var index = $(this).index();
            var title = $(this).find('.post_title').html();
            var id = init.sensorsFun.getUrlId(url);
            init.sensorsFun.mkt('哆嗦排行榜','热门',title,index,'',id);
        });
        //当下最热
        $(page).find('.current_hot_ul').on('click','a',function(){
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

            init.sensorsFun.mkt('当下最热','热门',title,index,desc,id);
        });
    }

});
