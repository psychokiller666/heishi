// 通知
// 页面初始化
var common = require('../common/common.js');

$(document).on('pageInit','.user_attention', function (e, id, page) {
	if (page.selector == '.page'){
		return false;
	}
	var init = new common(page);
	init.wx_share(false);
	init.checkfollow();
	$('.tab').on('click', '.user', function(){
		$('.commodity_goods').css('display', 'none');
		$('.seller_user_goods').css('display', 'block');
		$('.tab').find('span').removeClass('active');
		$(this).addClass('active');
	})
	$('.tab').on('click', '.goods', function(){
		$('.seller_user_goods').css('display', 'none');
		$('.commodity_goods').css('display', 'block');
		$('.tab').find('span').removeClass('active');
		$(this).addClass('active');
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
			$.confirm('确定取消关注吗？', function () {
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
	$('.clear_collect').click(function(){
		var id = $(this).attr('data-id');
		var that = this;
		$.confirm('确定取消收藏吗？', function () {
			$.ajax({
				type: 'POST',
				url: '/index.php?g=user&m=Favorite&a=delete_favorite',
				data: {
					id: id
				},
				success: function(data){
					if(data.status == 1){
						$.toast(data.info);
						$(that).parents('li').remove();
					} else {
						$.toast(data.info);
					}
				}
			});
	    });
	})
})
