// 搜索
// 搜索页修改版，为单页化搜索页定制
var SearchInit = function () {
  	var start_num = 0;
	var search_content = null;
	var last_page = null;
	var loading = false;
	var timeOutEvent = 0;
	var timeOutEventStatue = 0;
	var search_nodata_status = false;


    //取消按钮
    $('.search_list').find('.cancelBtn').click(function(){

        history.go(-1);

		start_num = 0;
		search_content = null;
		last_page = null;
    })

	//获取搜索标签
	$('.search_btn').click(function(){
		$('.search_list').css('display', 'block');
	    // 获取热搜词
		$.ajax({
		    type: 'GET',
		    url: '/index.php?g=restful&m=HsSearch&a=ajax_get_hot_keywords',
		    success: function(data){
		    	$.each(data, function(index, item){
		    		var list = '<span class="word_item" data-type="'+item.type+'" data-url="'+item.url+'" data-url_type="'+item.url_type+'">'+item.keyword+'</span>';
			    	$('.search_list').find('.showall_search_items').append(list);
		    	})
		    }
		});

		// 获取历史搜索词
		$.ajax({
		    type: 'GET',
		    url: '/index.php?g=restful&m=HsSearch&a=ajax_get_searching_history',
		    success: function(data){
		    	$.each(data, function(index, item){
		    		var list = '<span class="word_item">'+item+'</span>';
			    	$('.search_list').find('.history_search_items').append(list);
		    	})
		    }
		});
	})

	// 删除全部搜索历史
	$('.delete_all_word').click(function(){
		$.confirm('是否清空所有搜索历史', function () {
			$.ajax({
			    type: 'GET',
			    url: '/index.php?g=restful&m=HsSearch&a=ajax_clean_searching_history',
			    success: function(data){
			   		$('.search_list').find('.history_search_items').empty();
			    }
			});
		});
	})

	// 长按删除单个
	$(".history_search_items").on('touchstart', '.word_item', function(e){
		var that = this;
		if(timeOutEventStatue == 0){
	        timeOutEvent = setTimeout(function(){
	        	$(that).addClass('delete_item');
	        }, 1500);
		}
        e.preventDefault();
	});
	$(".history_search_items").on('touchend', '.word_item', function(e){
        clearTimeout(timeOutEvent);
        var that = $(this);
        
		if(timeOutEventStatue == 1){
			$.ajax({
			    type: 'GET',
			    url: '/index.php?g=restful&m=HsSearch&a=ajax_del_searching_history',
			    data: {
			    	keyword: that.text()
			    },
			    success: function(data){
				    $('.search_list').find('.history_search_items').empty();
			    	$.each(data, function(index, item){
			    		var list = '<span class="word_item">'+item+'</span>';
				    	$('.search_list').find('.history_search_items').append(list);
			    	})
			    }
			});
		}else if(timeOutEvent != 0 && !that.hasClass('delete_item')){
			search_content = that.text();
			$('.search_content').val(search_content);
			$('.search_goods_list ul').empty();
			start_num = 0;
			ajax_search(search_content, start_num);
		    $('.infinite-scroll-preloader').show();
		}
		if(that.hasClass('delete_item')){
        	timeOutEventStatue = 1;
        }
        e.preventDefault();
	});

	// 开始搜索
	$('.searchBtn').click(function(){
		search_content = $('.search_content').val();
		if(search_content){

            replaceUrl(search_content);

			$('.search_goods_list ul').empty();
			start_num = 0;
			ajax_search(search_content, start_num);
		    $('.infinite-scroll-preloader').show();

		}else{
			$.toast('请输入查找的关键词');
		}
	})

	//所有的标签项点击事件
	$('.showall_search').on('click', '.word_item', function(){

		var type = $(this).attr('data-type');
		var url_type = $(this).attr('data-url_type');
		if(type == 0){
			search_content = $(this).text();
            replaceUrl(search_content);
			$('.search_content').val(search_content);
			$('.search_goods_list ul').empty();
			start_num = 0;
			ajax_search(search_content, start_num);
		    $('.infinite-scroll-preloader').show();
			return false;
		}else{
            clearSessionStorage();//type!=0 会跳转页面，清除sessionStorage
		}

		if(type == 1 && url_type == 1){
			var url = '/Portal/HsArticle/index/id/'+$(this).attr('data-url')+'.html';
		}else if(type == 1 && url_type == 2){
			var url = '/Portal/HsArticle/culture/id/'+$(this).attr('data-url')+'.html';
		}else if(type == 1 && url_type == 3){
			var url = '/HsProject/index/pid/'+$(this).attr('data-url')+'.html';
		}else if(type == 1 && url_type == 5){
			var url = $(this).attr('data-url');
		}else if(type == 1 && url_type == 6){
			var url = '/HsCategories/category_index/id/'+$(this).attr('data-url')+'.html';
		}
		location.href = url;
	})

	//滚动条滚动事件
	$(".search_goods_list").on('scroll',function(){

		var height = $('.search_goods_list .search_goods_content').height() - $('.search_goods_list').scrollTop() - $('.search_goods_list').height();
		sessionStorage.setItem('searchScrollTop',$(this).scrollTop());

		$.refreshScroller();
		if(height > 100 ){
			return false;
		}
		if(loading){
			return false;
		}
		if(last_page <= start_num){
			return false;
		}
		if(search_nodata_status){
			return false;
		}
		loading = true;
		start_num++;
		ajax_search(search_content, start_num*20);
  	});

	//搜索接口
	function ajax_search(query, start){

        sessionStorage.setItem('searchStart',start_num);

		$.ajax({
	    	type: 'GET',
		    url: '/index.php?g=restful&m=HsSearch&a=ajax_search',
		    data: {
		    	query: query,
		    	start: start
		    },
		    success: function(data){
		    	if(data.status == 1){
		    		if(data.data.total_pages == 1){
		    			$('.infinite-scroll-preloader').hide();
		    		}
                    search_nodata_status = false;
                    last_page = data.data.total_pages;
                    $('.search_null').hide();
                    $('.conjecture_like').hide();
		    		$('.search_goods_list').show();
		    		$('.search_correlation').hide();
		    		output(data.data.items);
		    	}
		    	if(data.status == 0){
		    		$.toast(data.info);
		    		$('.infinite-scroll-preloader').hide();
		    	}
		    	if(data.status == 2){
		    		//没有收到
		    		search_nodata_status = true;
                    last_page = data.data.total_pages;
                    start_num = last_page;
                    $('.search_null').show();
                    $('.conjecture_like').show();
                    $('.search_goods_list').show();
                    $('.search_correlation').hide();
		    		output(data.data.items);
		    		$('.infinite-scroll-preloader').hide();
		    	}
		    	loading = false;
		    	function output(items){
		    		$.each(items, function(index, item){
			    		var str = '<li>\
							        <a class="articles external" href="/Portal/HsArticle/index/id/'+item.goods_id+'.html">\
							          <div class="image" style="background-image: url('+item.goods_cover_img+'@640w_1l);"></div>\
							          <h2 class="title">'+item.goods_title+'</h2>\
							        </a>\
							        <div class="user">\
							          <div class="user_info">\
							            <a href="/User/index/index/id/'+item.goods_author_uid+'.html" class="external">\
							              <img src="'+item.goods_author_avatar+'" />\
							              <span>'+item.goods_author_nickname+'</span>\
							            </a>\
							          </div>\
							          <div class="classify">';
						if(item.goods_keywords[0]){
							str += '<a href="/HsCategories/tag_index/tag/'+item.goods_keywords[0]+'.html" class="external classify_keyword">'+item.goods_keywords[0]+'</a></div></div></li>';
						}else{
							str += '<a class="classify_keyword classify_keyword_none"></a></div></div></li>';
						}
						$('.search_goods_list ul').append(str);

		    		})

                    sessionStorage.setItem('searchScrollTop',$('.search_goods_list').scrollTop());
                    sessionStorage.setItem('searchLastPage',last_page);
                    sessionStorage.setItem('searchStart',start_num);
                    sessionStorage.setItem('searchStatus',data.status);
                    sessionStorage.setItem('searchQuery',query);
                    sessionStorage.setItem('searchUl',$('.search_goods_list ul').html());

		    	}
		    },
		    error: function(error){
		    	console.log(error);
		    	loading = false;
		    }
		});
	}


    var searchTxt = getUrlParam('search');
    if(searchTxt){
        searchTxt = unescape(searchTxt);
        //如果有search字段，先检查是否有sessionStorage，有则直接加载并设置滚动高度，没有则重新加载
        var searchScrollTop = sessionStorage.getItem('searchScrollTop');
        var searchLastPage = sessionStorage.getItem('searchLastPage');
        var searchStatus = sessionStorage.getItem('searchStatus');
        var searchQuery = sessionStorage.getItem('searchQuery');
        var searchStart = sessionStorage.getItem('searchStart');
        var searchUl = sessionStorage.getItem('searchUl');

        if(searchQuery==searchTxt && searchUl){
            start_num = +searchStart;
            last_page = +searchLastPage;
            search_content = searchQuery;

            if(searchStatus==0){
                showSearchTags();
            }else{
                if(searchStatus==1){
                    search_nodata_status = false;
                    $('.search_null').hide();
                    $('.conjecture_like').hide();
                }
                if(searchStatus==2){
                    search_nodata_status = true;
                    $('.search_null').show();
                    $('.conjecture_like').show();
                }
                $('.search_goods_list').show();
                $('.search_correlation').hide();

                $('.search_content').val(searchQuery);
                $('.search_goods_list ul').html(searchUl);
                $('.infinite-scroll-preloader').hide();//隐藏初始化的loading
                $('.search_goods_list').scrollTop(searchScrollTop);
			}

		}else{
            clearSessionStorage();
            $('.search_content').val(searchTxt);
            $('.searchBtn').trigger('click');
		}

    }else{
        clearSessionStorage();
        showSearchTags();
    }

    //不显示搜索结果，显示搜索标签
    function showSearchTags(){
        $('.search_btn').trigger('click');//获取搜索标签
        $('.search_correlation').show();//显示搜索标签

        clearSessionStorage();
	}

	//删除sessionstorage
	function clearSessionStorage(){
        sessionStorage.removeItem('searchScrollTop');
        sessionStorage.removeItem('searchLastPage');
        sessionStorage.removeItem('searchStatus');
        sessionStorage.removeItem('searchQuery');
        sessionStorage.removeItem('searchStart');
        sessionStorage.removeItem('searchUl');
	}

    // 替换当前url query值
	function replaceUrl(txt){
        if(txt){
            txt = escape(txt);
        }else{
            txt = '';
		}
        history.replaceState('', '','?search='+ txt)
    }

    function getUrlParam(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    }


}

module.exports = SearchInit;
