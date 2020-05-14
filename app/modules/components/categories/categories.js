// 分类页
// 初始化
var common = require('../common/common.js');
// var handlebars = require('../../../../node_modules/handlebars/dist/handlebars.min.js');
// 搜索
// var SearchInit = require('../search_list/search_list.js');

$(document).on('pageInit', '.categories', function (e, id, page) {
  if (page.selector == '.page') {
    return false;
  }
  var init = new common(page);
  init.checkfollow();
  var ApiBaseUrl = init.getApiBaseUrl();
  // 搜索初始
  // SearchInit();
  $.ajax({
    url: ApiBaseUrl+'/appv3/categories?level=1&depth=1',
    type: 'get',
    success: function (res) {
      if (res.code) {
        initDate(res);
        $('.classify_one li').click(function () {
          var that = this;
          let idx = $(that).index()
          let secondsLevelHtml =''
          $('.classify_one li').removeClass('active');
          $(that).addClass('active');
          secondsLevelHtml += freshSecondLevelCategory(res.data[idx]);
          $('.classify_two').html(secondsLevelHtml);

        })
      } else {
        $('.hs-page').html('<H1>网络不佳请稍后再试</H1>');
      }
    }
  })

  // 初始化title
  $('title').text('分类');
  // 存储每个子分类位置
  var categoriesTitlePosition = {};
  $('.categories_title').each(function () {
    var class_name = 'categories_title' + $(this).attr('data-id');
    categoriesTitlePosition[class_name] = $(this).position().top;
  })
  $(".classify_two").on('scroll', function () {
    $('.categories_title').each(function () {
      var top = Math.abs($(this).position().top);
      if (top <= 100) {
        var class_name = '.categories' + $(this).attr('data-id');
        $('.classify_one li').removeClass('active');
        $(class_name).addClass('active');
      }
    })
  });
  // 子分类切换
  // $('.classify_one li').click(function () {
  //   var that = this;
  //   $('.classify_one li').removeClass('active');
  //   $(that).addClass('active');
  //   var class_name = 'categories_title' + $(that).attr('data-id');
  //   $(".classify_two").scrollTop(categoriesTitlePosition[class_name]);
  // })

  // 分类标签切换
  $('.label').click(function () {
    $('.classify').removeClass('active');
    $('.label').addClass('active');
    $('.classify_content').css('display', 'none');
    $('.classify_two').css('display', 'none');
    $('.label_content').css('display', 'block');
    $('.bg').addClass('bg_right');
  })
  $('.classify').click(function () {
    $('.label').removeClass('active');
    $('.classify').addClass('active');
    $('.classify_content').css('display', 'block');
    $('.classify_two').css('display', 'block');
    $('.label_content').css('display', 'none');
    $('.bg').removeClass('bg_right');
  })

  function initDate(res) {
    //左侧一级的菜单
    let fisrtLevelHtml = '';
    //右边的二级菜单
    let secondsLevelHtml = '';
    for (let i = 0; i<res.data.length;i++) {
     let  firstCategory = res.data[i];
      fisrtLevelHtml += freshFirstLevelCategory(firstCategory, i);
      if(i==0){
        secondsLevelHtml += freshSecondLevelCategory(firstCategory);
      }
      
    }
    $('ul[class="classify_one"]').html(fisrtLevelHtml);
    $('.classify_two').html(secondsLevelHtml);


    $('title').text('分类');
    // 存储每个子分类位置
    var categoriesTitlePosition = {};
    $('.categories_title').each(function () {
      var class_name = 'categories_title' + $(this).attr('data-id');
      categoriesTitlePosition[class_name] = $(this).position().top;
    })
    $(".classify_two").on('scroll', function () {
      $('.categories_title').each(function () {
        var top = Math.abs($(this).position().top);
        if (top <= 100) {
          var class_name = '.categories' + $(this).attr('data-id');
          $('.classify_one li').removeClass('active');
          $(class_name).addClass('active');
        }
      })
    })
    // 子分类切换
    $('.classify_one li').click(function () {
      var that = this;
      $('.classify_one li').removeClass('active');
      $(that).addClass('active');
      $(that).siblings().find('span').css('opacity','0')
      $(that).find('span').css('opacity','1')
      $(that).siblings().css('color','#333')
      let Fontcolor =   $(that).find('span').css('background-color')
      $(that).css('color',Fontcolor)
      var class_name = 'categories_title' + $(that).attr('data-id');
      $(".classify_two").scrollTop(categoriesTitlePosition[class_name]);
    })

    // 分类标签切换
    $('.label').click(function () {
      $('.classify').removeClass('active');
      $('.label').addClass('active');
      $('.classify_content').css('display', 'none');
      $('.classify_two').css('display', 'none');
      $('.label_content').css('display', 'block');
      $('.bg').addClass('bg_right');
    })
    $('.classify').click(function () {
      $('.label').removeClass('active');
      $('.classify').addClass('active');
      $('.classify_content').css('display', 'block');
      $('.classify_two').css('display', 'block');
      $('.label_content').css('display', 'none');
      $('.bg').removeClass('bg_right');
    })
  }

  function freshSecondLevelTitle(firstCategory) {
    let url = genrateUrl(firstCategory.url, firstCategory.url_type);
    let basicTitle = ''
    if(!firstCategory.banner_image){
      return ''
    }
    return basicTitle =
      `<a href="${url}"><div class="categories_title categories_title${firstCategory.id}" data-id="${ firstCategory.id}"> 
      <div class="categories_bg" data-layzr="${firstCategory.banner_image}" data-layzrstatus="1" style="background-image: url(${firstCategory.banner_image});"></div> 
      <h4>${ firstCategory.name}</h4> 
      <div>${firstCategory.desc}</div> 
      </div></a>`
  }

  function freshSecondLevelCategory(firstCategory) {
    //处理那个大图片
    let title = freshSecondLevelTitle(firstCategory)
    //处理地下的小分类
    let contents = freshSecondLevelContent(firstCategory);
    return title + contents;
  }
  function freshFirstLevelCategory(firstCategory, num) {
    if (num === 0 || num === '0') {
      return '<li data-id="' + firstCategory.id + '"style="color:'+firstCategory.mini_color+';"class="active categories categories' + firstCategory.id + '">' +'<span style="background-color:'+firstCategory.mini_color+';opacity:1;"></span>'+'<img src="'+firstCategory.mini_icon+'">'+ firstCategory.name + '</li>';
    } else {
      return '<li data-id="' + firstCategory.id + '" class="categories categories' + firstCategory.id + '">'+'<span style="background-color:'+firstCategory.mini_color+';opacity:0;"></span>'+'<img src="'+firstCategory.mini_icon+'">' + firstCategory.name + '</li>';
    }
  }
  function freshSecondLevelContent(firstCategory) {
    let content = '';
    let hasBorder = typeof firstCategory.children === 'object' && firstCategory.children.length > 0
    let isBorder = hasBorder?"border_bot":""
    if (typeof firstCategory.adList === 'object' && firstCategory.adList.length > 0) {
      content += '<div class="tit">热门推荐</div>'
      content = content + '<ul class="classify_two_list '+isBorder+' classify_two_list">';
      for (let adListNum in firstCategory.adList) {
        content = content + freashAdLi(firstCategory.adList[adListNum]);
      }
      content = content + '</ul>';
    }
    if (typeof firstCategory.children === 'object' && firstCategory.children.length > 0) {
      content += '<div class="tit tit2">精选分类</div>'
      content = content + '<ul class="classify_two_list classify_two_list">';
      for (let kidCategoryNum in firstCategory.children) {
        content = content + freashKidLi(firstCategory.children[kidCategoryNum]);
      }
      content = content + '</ul>';
    }

    if (content === '') {
      content = '<ul class="classify_two_list classify_two_list"></ul>'
    }

    return content
  }


  function freashKidLi(child) {
    return '<li>' +
      '       <a href="/HsCategories/category_index/id/' + child.id + '" class="external">' +
      '          <div class="image" data-layzr="' + child.icon + '" data-layzrstatus="1" style="background-image: url(' + child.icon + ');"></div>' +
      '          <span>' + child.name + '</span>' +
      '       </a>' +
      '   </li>';
  }

  function freashAdLi(adListElement) {
    let url = genrateUrl(adListElement.url, adListElement.url_type);
    return '<li>' +
      '       <a href="' + url + '" class="external">' +
      '          <div class="image" data-layzr="' + adListElement.img + '" data-layzrstatus="1" style="background-image: url(' + adListElement.img + ');"></div>' +
      '          <span>' + adListElement.description + '</span>' +
      '       </a>' +
      '   </li>';
  }

  function genrateUrl(url, url_type) {
    if (url_type === 0 || url_type === '0') {
      return 'javascript:;';
    }
    if (url_type === 1 || url_type === '1') {
      return `/Portal/HsArticle/index/id/${url}.html`
    }
    if (url_type === 2 || url_type === '2') {
      return `/Portal/HsArticle/culture/id/${url}.html`
    }
    if (url_type === 3 || url_type === '3') {
      return `/HsProject/index/pid/${url}.html`
    }
    if (url_type === 5 || url_type === '5') {
      if(!url){
        url = 'javascript:;'
      }
      return url;
    }
    if (url_type === 6 || url_type === '6') {
      return `/HsCategories/category_index/id/${url}.html`
    }
     //书专题
     if (url_type === 17 || url_type === '17') {
      return `${H5BaseUrl}bookListDetail/${url}`
    }
    //诗人角
    if (url_type === 16 || url_type === '16') {
      return `${H5BaseUrl}authorBook/${url}`
    }


  }

  //  神策埋点事件
  sensorsEvent();
  function sensorsEvent() {
    $(page).find('.search_btn').on('click', function () {
      init.sensors.track('buttonClick', {
        pageType: '分类页',
        buttonName: '搜索',
      })
    });
    init.sensorsFun.bottomNav();

    //分类 分类列表页
    $(page).find('.classify_two').on('click', 'a', function () {
      var $this = $(this);
      var $li = $this.parents('li');
      var url = $this.attr('href');
      var index = $li.index();
      var title = $this.find('span').html();

      init.sensorsFun.mkt('分类', '分类列表页', title, index, '', '');
    });

    //标签 标签列表页
    $(page).find('.label_content .tags_list').on('click', 'a', function () {
      var $this = $(this);
      var $li = $this;
      var url = $this.attr('href');
      var index = $li.index();
      var title = init.sensorsFun.getUrlKey(url, 'tag');

      init.sensorsFun.mkt('标签', '标签列表页', title, index, '', '');
    });

    //黑市书摊 标签列表页
    $(page).find('.label_content').children('a').on('click', function () {
      var $this = $(this);
      var url = $this.attr('href');
      init.sensorsFun.mkt('黑市书摊', '标签列表页', url, '', '', '');
    });

  }



});
