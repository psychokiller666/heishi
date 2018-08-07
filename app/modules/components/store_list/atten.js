// 关注
// 初始化
var common = require('../common/common.js');
// 搜索
// var SearchInit = require('../search_list/search_list.js');

$(document).on('pageInit','.atten', function(e, id, page){
	if (page.selector == '.page'){
	    return false;
	}
  	var init = new common(page);
  	init.checkfollow();
  	// 搜索初始
	// SearchInit();
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
	$('.seller_user_goods').on('click', '.attention', function(){
		var that = this;
		var add_attention = $(that).hasClass('add_attention');
		if(add_attention){
			$.ajax({
				type: 'POST',
				url: '/index.php?g=user&m=HsFellows&a=ajax_add',
				data: {
					uid:$(that).data('id')
				},
				timeout: 10000,
				success: function(data){
					$.toast(data.info);
					if(data.status == 1){
						var htmlStr = '<div class="my_fans_content">' +  $(that).parents('.recommend_users_content').html() + '</div>';
						$('.my_fans').append(htmlStr);
						$('.my_fans_content').find('.attention').removeClass('add_attention').text('已关注');
						$(that).parents('.recommend_users_content').remove();
					}
				},
				error: function(xhr, type){
					console.log(xhr);
				}
			});
		}else{
			$.confirm('确定取消吗？', function () {
				$.ajax({
					type: 'POST',
					url: '/index.php?g=user&m=HsFellows&a=ajax_cancel',
					data: {
						uid:$(that).data('id')
					},
					timeout: 10000,
					success: function(data){
						$.toast(data.info);
						if(data.status == 1){
							$(that).parents('.my_fans_content').remove();
						}
					},
					error: function(xhr, type){
						console.log(xhr);
					}
				});
		    });
		}
	})
});
