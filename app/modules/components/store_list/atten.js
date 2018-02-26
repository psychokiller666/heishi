// 关注
// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.atten', function(e, id, page){
	if (page.selector == '.page'){
	    return false;
	}
  	var init = new common(page);
  	init.checkfollow();
  	init.wx_share(false);


  	// 横向滚动懒加载
  	$(".goods_content").each(function(){
		$('[data-layzr]').lazyload({
			effect: "fadeIn",
			data_attribute:'layzr',
			container: $(this)
		});
  	})
	// 打开ios对应页面
  	var system_query = init.system_query();
	if(system_query == 'android'){
		var system_query_url = GV.app_url;
	}else if(system_query == 'ios'){
		var system_query_url = GV.api_url + '/ios/index/2';
	}
	$('.open_app').find('.open_app_btn').attr('href', system_query_url);


	//当用户下拉时
	var hs_footer_height = $('.hs-footer').height() + 'px';
	$(".content").on('scroll',function(){
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
			$('.atten').css('top',0);
			$('.hs-main').css('bottom', hs_footer_height);
		}
		if(height >= $('.content').scrollTop()){
			var top = '-' + $('.content').scrollTop() +'px';
			var bottom = $('.content').scrollTop() +'px';
			$('.atten').css('top',top);
			$('.hs-main').css('bottom', bottom);
		}else{
			var top = '-' + height +'px';
			$('.atten').css('top',top);
			$('.hs-main').css('bottom', 0);
		}
	}





  	$('.seller_user img').click(function(){
		var status = $(this).hasClass('active');
		if(!status){
			$('.seller_user img').css('display', 'block');
			$(this).css('display', 'none')
			$('.commodity img').css('display', 'none');
			$('.commodity .active').css('display', 'block');
			$('.seller_user_goods').css('display', 'block');
			$('.commodity_goods').css('display', 'none');
		}
	})
	$('.commodity img').click(function(){
		var status = $(this).hasClass('active');
		if(status){
			$('.commodity img').css('display', 'block');
			$(this).css('display', 'none')
			$('.seller_user img').css('display', 'block');
			$('.seller_user .active').css('display', 'none');
			$('.commodity_goods').css('display', 'block');
			$('.seller_user_goods').css('display', 'none');
		}
	})
	$('.attention').click(function(){
		var that = this;
		var num = $(that).find('.plus').length;
		if(num > 0){
			$.ajax({
				type: 'POST',
				url: '/index.php?g=user&m=HsFellows&a=ajax_add',
				data: {
					uid:$(that).data('id')
				},
				timeout: 10000,
				success: function(data){
					if(data.status == 1){
						var htmlStr = '<div class="my_fans_content">' +  $(that).parents('.recommend_users_content').html() + '</div>';
						$('.my_fans').append(htmlStr);
						$('.my_fans_content').find('.attention').text('已关注');
						$(that).parents('.recommend_users_content').remove();
					}
				},
				error: function(xhr, type){
					console.log(xhr);
				}
			});
		}else{
			$.ajax({
				type: 'POST',
				url: '/index.php?g=user&m=HsFellows&a=ajax_cancel',
				data: {
					uid:$(that).data('id')
				},
				timeout: 10000,
				success: function(data){
					if(data.status == 1){
						$(that).parents('.my_fans_content').remove();
					}
				},
				error: function(xhr, type){
					console.log(xhr);
				}
			});
		}
	})
});
