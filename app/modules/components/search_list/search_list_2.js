// 搜索

var common = require('../common/common.js');
var apiBaseUrl = common.prototype.getApiBaseUrl();
var PHPSESSID = common.prototype.getCookie('PHPSESSID');
var ajaxHeaders = {
  'phpsessionid': PHPSESSID
};

// 搜索页修改版，为单页化搜索页定制(原先搜索页是个弹窗，现在改为单独的页面，并且可以保持当前的搜索结果及状态)
var SearchInit = function () {
  var start_num = 0;
  var search_content = null;
  var last_page = null;
  var loading = false;
  var timeOutEvent = 0;
  var timeOutEventStatue = 0;
  var search_nodata_status = false;


  var sensorsTrack = {
    'searchType': '狠货',
    'keyWord': '', //关键词
    'hasResult': true, //是否有搜索结果
    'isHistory': false, //是否是历史记录
    'isRecommend': false, //是否是推荐词
  };
  //筛选的条件
  var searchClassTypes = sessionStorage.getItem('searchClassTypes') ? sessionStorage.getItem('searchClassTypes') : 1
  var searchSortTypes = 1
  //物理返回做的tab状态保存
  if (sessionStorage.getItem('searchClassTypes')) {
    let _searchTypes = parseInt(searchClassTypes)
    let tabsHtml = `
		<span class="${_searchTypes==1?'active':''}">综合</span>
		<span class="${_searchTypes==2?'active':''}">销量</span>
		<span class="${_searchTypes==3?'active':''}">新品</span>
		<span class="price ${_searchTypes==4?'active':''}">价格</span>
		`
    $('.tabs').html(tabsHtml)
  }
  //取消按钮
  $('.search_list').find('.cancelBtn').click(function () {

    history.go(-1);

    start_num = 0;
    search_content = null;
    last_page = null;
	})
	let tabSearchStatus = 0
  //tab搜索切换
  $('.tab_search').on('click', 'span', function () {
    $(this).addClass('active').siblings().removeClass('active')
    let idx = $(this).index()

    if (idx == 0) {
      // $('.search_null').show()
      // $('.tabs-box').show()
    } else {
      $('.search_null').hide()
      $('.tabs-box').hide()
    }
    $('.search_goods_content').find('ul').html('')
		$('.infinite-scroll-preloader').hide();
		tabSearchStatus = idx
		let	search_content = $('.search_content').val();
		start_num = 0;
		loading = true;
    if (search_content) {
      replaceUrl(search_content);
      $('.search_goods_list ul').empty();
      $('.infinite-scroll-preloader').show();

    } else {
      $.toast('请输入查找的关键词');
    }
    switch (idx) {
      case 0:
				ajax_search(search_content, start_num, searchClassTypes, searchSortTypes);
        break;
      case 1:
        searchUser(search_content, start_num)
        break;
      case 2:
        searchTopic(search_content, start_num)
				break;
			case 3:
        searchArticle(search_content, start_num)
				break;
			default:
				ajax_search()
    }
  })
  //搜索用户 
  function searchUser(query, start) {
		// sessionStorage.setItem('searchStart', start_num);
		$.ajax({
      type: 'GET',
      url: apiBaseUrl + '/appv6_1/search/user',
      data: {
        query: query,
        page: start  + 1
      },
      headers: ajaxHeaders,
      //todo 加header
      success: function (data) {
				if(data.status==1){
					if (data.data.total_pages==0){
						$('.search_goods_list ul').append(`<div class="no_data">${data.data.message}</div>`);
						$('.infinite-scroll-preloader').hide();
						loading = false;
						return
					}
					if (data.data.total_pages == 1) {
						$('.infinite-scroll-preloader').hide();
					}
					last_page = data.data.total_pages;
					let str = createDomUserList(data.data.items)
					$('.search_goods_list ul').append(str);
					// $('.infinite-scroll-preloader').hide();
					loading = false;
				}else{
					var errMsg = '';
          if (typeof data.info === "string") {
            errMsg = data.info;
          } else if (typeof data.info.code === "string") {
            errMsg = data.info.code;
          } else {
            errMsg = '网络错误，请稍后重试';
          }
          $.toast(errMsg);
          $('.infinite-scroll-preloader').hide();
				}
			}
		})
  }
  //搜索专题
  function searchTopic(query, start) {
		$.ajax({
      type: 'GET',
      url: apiBaseUrl + '/appv6_1/search/zhuanti',
      data: {
        query: query,
        page: start  + 1
      },
      headers: ajaxHeaders,
      //todo 加header
      success: function (data) {
				if(data.status==1){
					if (data.data.total_pages==0){
						$('.search_goods_list ul').append(`<div class="no_data">${data.data.message}</div>`);
						$('.infinite-scroll-preloader').hide();
						loading = false;
						return
					}
					if (data.data.total_pages == 1) {
						$('.infinite-scroll-preloader').hide();
						$('.search_goods_list ul').append(`<p class="top_tit">相关专题</p>`);
					}
					last_page = data.data.total_pages;
					let str = createDomTopicList(data.data.items)
					$('.search_goods_list ul').append(str);
					
					loading = false;
				}else{
					var errMsg = '';
          if (typeof data.info === "string") {
            errMsg = data.info;
          } else if (typeof data.info.code === "string") {
            errMsg = data.info.code;
          } else {
            errMsg = '网络错误，请稍后重试';
          }
          $.toast(errMsg);
          $('.infinite-scroll-preloader').hide();
				}
			}
		})
  }
  //搜索文章
  function searchArticle(query, start) {
		$.ajax({
      type: 'GET',
      url: apiBaseUrl + '/appv6_1/search/article',
      data: {
        query: query,
        page: start  + 1
      },
      headers: ajaxHeaders,
      //todo 加header
      success: function (data) {
				if(data.status==1){
					if (data.data.total_pages==0){
						$('.search_goods_list ul').append(`<div class="no_data">${data.data.message}</div>`);
						$('.infinite-scroll-preloader').hide();
						loading = false;
						return
					}
					if (data.data.total_pages == 1) {
						$('.infinite-scroll-preloader').hide();
					}
					last_page = data.data.total_pages;
					let str = createDomArticleList(data.data.items)
					$('.search_goods_list ul').append(str);
					
					loading = false;
				}else{
					var errMsg = '';
          if (typeof data.info === "string") {
            errMsg = data.info;
          } else if (typeof data.info.code === "string") {
            errMsg = data.info.code;
          } else {
            errMsg = '网络错误，请稍后重试';
          }
          $.toast(errMsg);
          $('.infinite-scroll-preloader').hide();
				}
			}
		})
	}
	//渲染用户列表dom
	function createDomUserList(data){
		let str = ''
		data.forEach(v=>{
			str+=`<li class='user_item' >
			<img class="to_user" data-id="${v.id}" src='${v.avatar}'>
			<div  data-id="${v.id}"  class="name_sign to_user">
				<span>${v.name}</span>
				<span class="sign">${v.signature}</span>
			</div>
			<div class="follow_btn" data-uid="${v.id}">${v.is_follow==1?'已关注':'关注TA'}</div>
			</li>`
		})
		return str
	}
	//渲染专题列表
	function createDomTopicList(data){
		let str = ``
		data.forEach((v=>{
			str+=`<li class="topic_item" data-id="${v.id}">
				<img src="${v.cover}" />
				<div class="topic_cont">
					<p class="title">${v.title}</p>
					<p class="sub_tit">${v.sub_title}</p>
					
				</div>
			</li>`
			// <span class="segment">${v.group[0].name}</span>
		}))
		return str
	}
	//渲染文章列表
	function createDomArticleList(data){
		let str = ''
		data.forEach(v=>{
			str+=`<li class="article_item" data-id="${v.id}">
				<img src="${v.img}" />
				<span class="article_number">article______No.${v.number}</span>
				<span class="article_date">date:${v.post_date}</span>
				<p class="tit">${v.post_title}</p>
			<li>`
		})
		return str
	}
	//关注按钮
	$('.search_goods_list').on('click','.follow_btn',function(){

		let loginStatus = common.prototype.ifLogin();
		let uid = $(this).attr('data-uid')
		let that = this
		if(loginStatus){
			// to_user_id
			$.ajax({
				type: 'POST',
				url: apiBaseUrl + '/appv1/follow',
				data: {
					to_user_id: uid
				},
				headers: ajaxHeaders,
				//todo 加header
				success: function (data) {
					if(data.status==1){
						$(that).html('已关注')
					}
				}})
		}else{
			common.prototype.ifLogin(true)
		}
	})
	let preBaseUrl = common.prototype.getVueBaseUrl()
	//跳转用户个人中心
	$('.search_goods_list').on('click','.to_user',function(){
		
	 let uid =	$(this).attr('data-id')
	 location.href = `${preBaseUrl}seller/${uid}`
	})
	//跳转专题详情
	$('.search_goods_list').on('click','.topic_item',function(){
		let tid =	$(this).attr('data-id')
		location.href = `${preBaseUrl}feature/${tid}/0`
	})
	//跳转专题详情
	$('.search_goods_list').on('click','.article_item',function(){
		let aid =	$(this).attr('data-id')
		location.href = `${preBaseUrl}article/${aid}`
	})

  //获取搜索标签
  $('.search_btn').click(function () {
    $('.search_list').css('display', 'block');
    // 获取热搜词
    var url = apiBaseUrl + '/appv4/search/hot';
    $.ajax({
      type: 'GET',
      // url: '/index.php?g=restful&m=HsSearch&a=ajax_get_hot_keywords',
      url: url,
      success: function (data) {
        if (data.status == 1) {
          $.each(data.data, function (index, item) {
            var list = '<span class="word_item" data-type="' + item.type + '" data-url="' + item.url + '" data-url_type="' + item.url_type + '">' + item.keyword + '</span>';
            $('.search_list').find('.showall_search_items').append(list);
          })
        }

      }
    });

    // 获取历史搜索词
    $.ajax({
      type: 'GET',
      url: apiBaseUrl + '/appv4/search/suggestions',
      headers: ajaxHeaders,
      success: function (data) {
        if (data.data.searching_history) {
          $.each(data.data.searching_history, function (index, item) {
            var list = '<span class="word_item" item=' + item + '>' + item + '<span class="delete_one"></span></span>';
            $('.search_list').find('.history_search_items').append(list);
          })
        }
      }
    });
  })

  // 删除全部搜索历史
  $('.delete_all_word').click(function () {

    $(this).hide()
    $('.delete_all').show()
    $('.finish').show()
    $('.delete_one').show()

  })
  //点击完成
  $('.finish').click(function () {
    $('.delete_all_word').show()
    $('.delete_all').hide()
    $('.finish').hide()
    $('.delete_one').hide()
  })
  //全部删除
  $('.delete_all').click(function () {
    // $.confirm('是否清空所有搜索历史', function () {
    $.ajax({
      type: 'GET',
      url: '/index.php?g=restful&m=HsSearch&a=ajax_clean_searching_history',
      success: function (data) {
        $('.search_list').find('.history_search_items').empty();
        $('.delete_all_word').show()
        $('.delete_all').hide()
        $('.finish').hide()
        $('.delete_one').hide()
      }
    });
    // });
  })
  //单个删除
  let deleteFlag = true
  $('.history_search').on('click', '.delete_one', function (e) {
    if (!deleteFlag) {
      return
    }
    deleteFlag = false
    setTimeout(() => {
      deleteFlag = true
    }, 200)
    e.stopPropagation();
    e.preventDefault();
    $.ajax({
      type: 'GET',
      url: '/index.php?g=restful&m=HsSearch&a=ajax_del_searching_history',
      data: {
        keyword: $(this).parent().attr('item')
      },
      success: function (data) {
        $('.search_list').find('.history_search_items').empty();
        $.each(data, function (index, item) {
          var list = '<span class="word_item" item=' + item + '>' + item + '<span class="delete_one" style="display:block;"></span></span>';
          $('.search_list').find('.history_search_items').append(list);
        })
      }
    });
  })
  //点击搜索历史
  $('.history_search').on('click', '.word_item', function () {
    if (!deleteFlag) {
      return
    }
    search_content = $(this).text();
    $('.search_content').val(search_content);
    $('.search_goods_list ul').empty();
    start_num = 0;
    sensorsTrack.isRecommend = false;
    sensorsTrack.isHistory = true;
    ajax_search(search_content, start_num, searchClassTypes, searchSortTypes);
    $('.infinite-scroll-preloader').show();
  })

  var clickTabs = false
  //点击筛选条件
  $('.tabs').on('click', 'span', function () {
    if (clickTabs) {
      return
    }
    if ($('.search_content').val() == '') {
      $.toast('请输入查找的关键词');
      return
    }
    clickTabs = true
    start_num = 0
    setTimeout(() => {
      clickTabs = false
    }, 1000)
    $('.search_goods_list ul').empty();
    if ($(this).index() == 3) {
      searchClassTypes = 4
      $(this).removeClass('price')
      if ($('.tabs').find('.price-active-2').length) {
        searchSortTypes = 2
        $(this).addClass('price-active-1').siblings().removeClass('active').siblings().removeClass('price-active-2')
      } else {
        searchSortTypes = 1
        $(this).addClass('price-active-2').siblings().removeClass('active').siblings().removeClass('price-active-1')
      }

    } else {
      searchClassTypes = $(this).index() + 1
      searchSortTypes = 1
      if ($('.tabs').find('.price-active-1') || $('.tabs').find('.price-active-2')) {
        $('.tabs').find('.price-active-1').addClass('price')
        $('.tabs').find('.price-active-2').addClass('price')
      }
      $(this).addClass('active').siblings().removeClass('active').siblings().removeClass('price-active-2').siblings().removeClass('price-active-1')
    }
    sessionStorage.setItem('searchClassTypes', searchClassTypes)
    ajax_search($('.search_content').val(), 0, searchClassTypes, searchSortTypes);
  })

  // 长按删除单个
  // $(".history_search_items").on('touchstart', '.word_item', function(e){
  // 	var that = this;
  // 	if(timeOutEventStatue == 0){
  //         timeOutEvent = setTimeout(function(){
  //         	$(that).addClass('delete_item');
  //         }, 1500);
  // 	}
  // 			e.preventDefault();

  // });
  // $(".history_search_items").on('touchend', '.word_item', function(e){
  //       clearTimeout(timeOutEvent);
  //       var that = $(this);

  // 	if(timeOutEventStatue == 1){
  // 		$.ajax({
  // 		    type: 'GET',
  // 		    url: '/index.php?g=restful&m=HsSearch&a=ajax_del_searching_history',
  // 		    data: {
  // 		    	keyword: that.text()
  // 		    },
  // 		    success: function(data){
  // 			    $('.search_list').find('.history_search_items').empty();
  // 		    	$.each(data, function(index, item){
  // 		    		var list = '<span class="word_item">'+item+'</span>';
  // 			    	$('.search_list').find('.history_search_items').append(list);
  // 		    	})
  // 		    }
  // 		});
  // 	}else if(timeOutEvent != 0 && !that.hasClass('delete_item')){

  // 		// search_content = that.text();
  // 		// $('.search_content').val(search_content);
  // 		// $('.search_goods_list ul').empty();
  // 		// start_num = 0;
  //     //       sensorsTrack.isRecommend = false;
  //     //       sensorsTrack.isHistory = true;
  // 		// ajax_search(search_content, start_num);
  // 	  //   $('.infinite-scroll-preloader').show();
  // 	}
  // 	if(that.hasClass('delete_item')){
  //       	timeOutEventStatue = 1;
  //       }
  //       e.preventDefault();
  // });

  // 开始搜索
  $('.searchBtn').click(function () {
    search_content = $('.search_content').val();
    if (search_content) {

      replaceUrl(search_content);

      $('.search_goods_list ul').empty();
			start_num = 0;
			switch (tabSearchStatus) {
				case 0:
					ajax_search(search_content, start_num*20, searchClassTypes, searchSortTypes);
					break;
				case 1:
					searchUser(search_content, start_num)
					break;
				case 2:
					searchTopic(search_content, start_num)
					break;
				case 3:
					searchArticle(search_content, start_num)
					break;
				default:
					ajax_search()
			}
      //ajax_search(search_content, start_num, searchClassTypes, searchSortTypes);
      $('.infinite-scroll-preloader').show();

    } else {
      $.toast('请输入查找的关键词');
    }
  })

  //所有的标签项点击事件
  $('.showall_search').on('click', '.word_item', function () {
    var type = $(this).attr('data-type');
    var url_type = $(this).attr('data-url_type');
    if (type == 0) {
      search_content = $(this).text();
      replaceUrl(search_content);
      $('.search_content').val(search_content);
      $('.search_goods_list ul').empty();
      start_num = 0;
      sensorsTrack.isRecommend = true;
      sensorsTrack.isHistory = false;
      ajax_search(search_content, start_num, searchClassTypes, searchSortTypes);
      $('.infinite-scroll-preloader').show();
      return false;
    } else {
      clearSessionStorage(); //type!=0 会跳转页面，清除sessionStorage
    }

    if (type == 1 && url_type == 1) {
      var url = '/Portal/HsArticle/index/id/' + $(this).attr('data-url') + '.html';
    } else if (type == 1 && url_type == 2) {
      var url = '/Portal/HsArticle/culture/id/' + $(this).attr('data-url') + '.html';
    } else if (type == 1 && url_type == 3) {
      var url = '/HsProject/index/pid/' + $(this).attr('data-url') + '.html';
    } else if (type == 1 && url_type == 5) {
      var url = $(this).attr('data-url');
    } else if (type == 1 && url_type == 6) {
      var url = '/HsCategories/category_index/id/' + $(this).attr('data-url') + '.html';
    }
    location.href = url;
    common.prototype.sensorsFun.mkt('搜索', '', $(this).text(), '', '', '');
  })

  //滚动条滚动事件
  $(".search_goods_list").on('scroll', function () {
		
    var height = $('.search_goods_list .search_goods_content').height() - $('.search_goods_list').scrollTop() - $('.search_goods_list').height();
    sessionStorage.setItem('searchScrollTop', $(this).scrollTop());

    $.refreshScroller();
    if (height > 100) {
      return false;
		}

    if (loading) {
      return false;
		}
		
    // console.log(last_page <= start_num);

    if (last_page <= start_num) {
      return false;
    }
    if (search_nodata_status) {
      return false;
    }
    if (clickTabs) {
      return false;
    }
    loading = true;
		start_num++;
		switch (tabSearchStatus) {
      case 0:
				ajax_search(search_content, start_num*20, searchClassTypes, searchSortTypes);
        break;
      case 1:
        searchUser(search_content, start_num)
        break;
      case 2:
        searchTopic(search_content, start_num)
				break;
			case 3:
        searchArticle(search_content, start_num)
				break;
			default:
				ajax_search()
    }
    //-ajax_search(search_content, start_num * 20, searchClassTypes, searchSortTypes);
  });


  //搜索接口：新旧接口字段转换
  function transData(items) {
    var obj = [];
    if (items instanceof Array && items.length > 0) {
      items.forEach(function (v, i) {
        obj.push({
          goods_author_uid: v.author,
          goods_author_nickname: v.user_name,
          goods_author_avatar: v.user_avatar,
          goods_id: v.id,
          goods_title: v.title,
          goods_sub_title: v.post_subtitle,
          goods_cover_img: v.cover_fang,
          goods_keywords: [(v.traits && v.traits[0]) ? v.traits[0].name : ''],
          goods_price: v.min_price,
          goods_comments: "",
          goods_hits: "",
          goods_likes: "",
          goods_sales: "",
          goods_type: "",
          index_name: ""
        })
      });
    }
    return obj;
  }

  //搜索接口
  function ajax_search(query, start, _cla, _sor) {
    sessionStorage.setItem('searchStart', start_num);
    $.ajax({
      type: 'GET',
      url: apiBaseUrl + '/appv6_1/search/posts',
      data: {
        query: query,
        searchtype: _cla,
        sort: _sor,
        page: start / 20 + 1
      },
      headers: ajaxHeaders,
      //todo 加header
      success: function (data) {
        $('.tab_search').show()
        var message = '';

        if (data.status == 1) {

          //如果message不为空，则是没有搜索到数据
          message = data.data.message;

          if (typeof message === "string" && message.length > 0) {

            //没有搜到
            sensorsTrack.hasResult = false;
            search_nodata_status = true;
            last_page = data.data.total_pages;
            start_num = last_page;
            setSearchNullMsg(searchMsg);
            $('.search_null').show();
            // $('.conjecture_like').show();
            $('.search_goods_list').show();
            // $('.tabs-box').hide()
            $('.search_correlation').hide();
            var items = transData(data.data.items);
            output(items);
            $('.infinite-scroll-preloader').hide();

          } else {

            //搜到数据
            sensorsTrack.hasResult = true;
            if (data.data.total_pages == 1) {
              $('.infinite-scroll-preloader').hide();
            }
            search_nodata_status = false;
            last_page = data.data.total_pages;
            $('.search_null').hide();
            // $('.conjecture_like').hide();
            $('.search_goods_list').show();
            $('.tabs-box').show()
            $('.search_correlation').hide();
            var items = transData(data.data.items);
            //如果是0  添加分类按钮
            if(start==0&&data.data.catelist.length){
            	let cateList = data.data.catelist
            	// let jumpCateHtml = `
            	// <a class="articles external" href="/HsCategories/category_index/id/${cateList.category_id}.html">
            	// 	<div class="jump_cate_box">
            	// 		<img class="cate_left" src="${cateList.category_icon}">
            	// 		<div class="cate_right">
            	// 			<p class="name">${cateList.category_name}</p>
            	// 			<p class="desc">${cateList.category_desc}</p>
            	// 		</div>
            	// 		<div class="btn">去分类逛逛</div>
            	// 	</div>
            	// </a>
            	// `
							// $('.search_goods_list ul').append(jumpCateHtml);
							let sHtml = `<li class="cate_list">`
							cateList.forEach(v=>{
								sHtml+=`
								<a class="articles external" href="/HsCategories/category_index/id/${v.category_id}.html">
									<div class="jump_cate_box">
										<img class="cate_left" src="${v.category_icon}">
									</div>
								</a>
								`
							})
							sHtml+= `</li>`
							$('.search_goods_list ul').append(sHtml);
            }
            output(items);
          }

          sensorsTrack.keyWord = query;
          if (start == 0) {
            common.prototype.sensors.track('search', sensorsTrack);
            common.prototype.sensorsFun.mkt('搜索', '', query, '', '', '');
          }

        } else {
          var errMsg = '';
          if (typeof data.info === "string") {
            errMsg = data.info;
          } else if (typeof data.info.code === "string") {
            errMsg = data.info.code;
          } else {
            errMsg = '网络错误，请稍后重试';
          }
          $.toast(errMsg);
          $('.infinite-scroll-preloader').hide();
          //加载更多数据时，假如接口失败了，start_num回退一个。
          if (data.info !== '到最后一页了' && start_num > 0) {
            start_num--;
          }
        }


        loading = false;

        function output(items) {
          $.each(items, function (index, item) {
            var str = `<li class="good_item">
							        <a class="articles external" href="/Portal/HsArticle/index/id/${item.goods_id}.html">
							          <div class="image" style="background-image: url('${item.goods_cover_img}@640w_1l);"></div>
												<div class="title">${item.goods_title}</div>
												<div class="sub_title">${item.goods_sub_title}</div>
												<span class="price">￥${item.goods_price}</span>
											</a>
											</li>
											`


            // if(item.goods_keywords[0]){ <div class="classify">
            // 	str += '<a href="/HsCategories/tag_index/tag/'+item.goods_keywords[0]+'.html" class="external classify_keyword">'+item.goods_keywords[0]+'</a></div></div></li>';
            // }else{
            // 	str += '<a class="classify_keyword classify_keyword_none"></a></div></div></li>';
            // }
            $('.search_goods_list ul').append(str);

          })

          sessionStorage.setItem('searchScrollTop', $('.search_goods_list').scrollTop());
          sessionStorage.setItem('searchLastPage', last_page);
          sessionStorage.setItem('searchStart', start_num);
          sessionStorage.setItem('searchStatus', (search_nodata_status ? 2 : 1)); //搜索状态，1是有结果，2是没结果
          sessionStorage.setItem('searchQuery', query);
          sessionStorage.setItem('searchUl', $('.search_goods_list ul').html());
          // sessionStorage.setItem('searchMsg',message);

        }
      },
      error: function (error) {
        console.log(error);
        loading = false;
        //加载更多数据时，假如接口失败了，start_num回退一个。
        if (start_num > 0) {
          start_num--;
        }
      }
    });
  }


  var searchTxt = getUrlParam('search');
  if (searchTxt) {
    searchTxt = unescape(searchTxt);
    //如果有search字段，先检查是否有sessionStorage，有则直接加载并设置滚动高度，没有则重新加载
    var searchScrollTop = sessionStorage.getItem('searchScrollTop');
    var searchLastPage = sessionStorage.getItem('searchLastPage');
    var searchStatus = sessionStorage.getItem('searchStatus');
    var searchQuery = sessionStorage.getItem('searchQuery');
    var searchStart = sessionStorage.getItem('searchStart');
    var searchUl = sessionStorage.getItem('searchUl');
    var searchMsg = sessionStorage.getItem('searchMsg');


    if (searchQuery == searchTxt && searchUl) {
      start_num = +searchStart;
      last_page = +searchLastPage;
      search_content = searchQuery;

      if (searchStatus == 0) {
        showSearchTags();
      } else {
        if (searchStatus == 1) {
          search_nodata_status = false;
          $('.search_null').hide();
          // $('.conjecture_like').hide();
        }
        if (searchStatus == 2) {
          search_nodata_status = true;
          setSearchNullMsg(searchMsg);
          $('.search_null').show();
          // $('.tabs-box').hide()
          // $('.conjecture_like').show();
        }
        $('.search_goods_list').show();
        $('.tabs-box').show()
        $('.search_correlation').hide();

        $('.search_content').val(searchQuery);
        $('.search_goods_list ul').html(searchUl);
        $('.infinite-scroll-preloader').hide(); //隐藏初始化的loading
        $('.search_goods_list').scrollTop(searchScrollTop);
      }

    } else {
      clearSessionStorage();
      $('.search_content').val(searchTxt);
      $('.searchBtn').trigger('click');
    }

  } else {
    clearSessionStorage();
    showSearchTags();
  }

  //不显示搜索结果，显示搜索标签
  function showSearchTags() {
    $('.search_btn').trigger('click'); //获取搜索标签
    $('.search_correlation').show(); //显示搜索标签

    clearSessionStorage();
  }

  //删除sessionstorage
  function clearSessionStorage() {
    sessionStorage.removeItem('searchScrollTop');
    sessionStorage.removeItem('searchLastPage');
    sessionStorage.removeItem('searchStatus');
    sessionStorage.removeItem('searchQuery');
    sessionStorage.removeItem('searchStart');
    sessionStorage.removeItem('searchUl');
    sessionStorage.removeItem('searchMsg');
  }

  // 替换当前url query值
  function replaceUrl(txt) {
    if (txt) {
      txt = escape(txt);
    } else {
      txt = '';
    }
    history.replaceState('', '', '?search=' + txt)
  }

  function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
  }

  //设置无搜索结果的提示语
  function setSearchNullMsg(msg) {
    if (typeof msg === "string" && msg.length > 0) {
      $('.search_null_msg').html(msg);
    }
  }


}

module.exports = SearchInit;
