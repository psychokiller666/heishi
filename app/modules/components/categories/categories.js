// 分类页
// 初始化
var common = require('../common/common.js');
// var handlebars = require('../../../../node_modules/handlebars/dist/handlebars.min.js');
// 搜索
// var SearchInit = require('../search_list/search_list.js');

$(document).on('pageInit','.categories', function(e, id, page){
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.checkfollow();

  // 搜索初始
  // SearchInit();


  // 初始化title
  $('title').text('分类');
  // 存储每个子分类位置
  var categoriesTitlePosition = {};
  $('.categories_title').each(function(){
    var class_name = 'categories_title'+$(this).attr('data-id');
    categoriesTitlePosition[class_name] = $(this).position().top;
  })
  $(".classify_two").on('scroll',function(){
    $('.categories_title').each(function(){
      var top = Math.abs($(this).position().top);
      if(top <= 100){
        var class_name = '.categories' + $(this).attr('data-id');
        $('.classify_one li').removeClass('active');
        $(class_name).addClass('active');
      }
    })
  });
  // 子分类切换
  $('.classify_one li').click(function(){
    var that = this;
    $('.classify_one li').removeClass('active');
    $(that).addClass('active');
    var class_name = 'categories_title' + $(that).attr('data-id');
    $(".classify_two").scrollTop(categoriesTitlePosition[class_name]);
  })
  
  // 分类标签切换
  $('.label').click(function(){
    $('.classify').removeClass('active');
    $('.label').addClass('active');
    $('.classify_content').css('display', 'none');
    $('.classify_two').css('display', 'none');
    $('.label_content').css('display', 'block');
    $('.bg').addClass('bg_right');
  })
  $('.classify').click(function(){
    $('.label').removeClass('active');
    $('.classify').addClass('active');
    $('.classify_content').css('display', 'block');
    $('.classify_two').css('display', 'block');
    $('.label_content').css('display', 'none');
    $('.bg').removeClass('bg_right');
  })

    //  神策埋点事件
    sensorsEvent();
    function sensorsEvent() {
        $(page).find('.search_btn').on('click',function(){
            init.sensors.track('buttonClick', {
                pageType : '分类页',
                buttonName : '搜索',
            })
        });
        init.sensorsFun.bottomNav();

        //分类 分类列表页
        $(page).find('.classify_two').on('click','a',function(){
            var $this = $(this);
            var $li = $this.parents('li');
            var url = $this.attr('href');
            var index = $li.index();
            var title = $this.find('span').html();

            init.sensorsFun.mkt('分类','分类列表页',title,index,'','');
        });

        //标签 标签列表页
        $(page).find('.label_content .tags_list').on('click','a',function(){
            var $this = $(this);
            var $li = $this;
            var url = $this.attr('href');
            var index = $li.index();
            var title = init.sensorsFun.getUrlKey(url,'tag');

            init.sensorsFun.mkt('标签','标签列表页',title,index,'','');
        });

        //黑市书摊 标签列表页
        $(page).find('.label_content').children('a').on('click',function(){
            var $this = $(this);
            var url = $this.attr('href');
            init.sensorsFun.mkt('黑市书摊','标签列表页',url,'','','');
        });

    }



});
