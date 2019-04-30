// 公用底部
var hs_footer = $('.hs-footer');
if(hs_footer.length){

    var myId = $('#my_id').val();
    var IMmyId = $('#my_id').val();
    // 如果是卖家中心
    if($('.user_index').length){
        myId = $('.attention').attr('data-myuid');
        IMmyId = $('.attention').attr('data-myuid');
    }
    var IMnim = null;
    // 测试环境 网易id加hstest
    if((GV.HOST != 'http://hs.ontheroadstore.com/') && (GV.HOST != 'https://hs.ontheroadstore.com/')){
        IMmyId = 'hstest' + IMmyId;
    }
    $.ajax({
        type: 'GET',
        url: '/index.php?g=api&m=HsNeteasyIM&a=get_token_by_user_id',
        data: {
            user_id: myId
        },
        success: function(res){
            // var data = JSON.parse(res);
            var data = res
            if(!data.data){
                return
            }
            var token = data.data.token;
            var appKey = data.data.app_key;
            IMnim = NIM.getInstance({
                appKey: appKey,
                account: IMmyId,
                token: token,
                onconnect: onConnect,
                syncSessionUnread: true,
                onsessions: onSessions,
                ondisconnect: onDisconnect,
                db: true
            });
        }
    });
    function onConnect() {
        console.log('IM连接成功');
    }
    function onSessions(sessions) {
        var data = sessions;
        var num = 0;
        for(var i in data){
            if(data[i]['unread']){
                num++;
            }
        }
        if(num > 1){
            newMessages();
        }
    }
    function onDisconnect(error) {
        if (error) {
            console.log(error);
            switch (error.code) {
            // 账号或者密码错误, 请跳转到登录页面并提示错误
            case 302:
                $.ajax({
                    type: 'POST',
                    url: '/index.php?g=api&m=HsNeteasyIM&a=refresh_token',
                    data:{
                        user_id: myId
                    },
                    timeout: 4000,
                    success: function(data){
                        console.log(data);
                    }
                });
                break;
            // 重复登录, 已经在其它端登录了, 请跳转到登录页面并提示错误
            case 417:
                break;
            // 被踢, 请提示错误后跳转到登录页面
            case 'kicked':
                break;
            default:
                break;
            }
        }
    }
    // 获取评论数量显示已读未读
    $.ajax({
        type: 'GET',
        url: '/user/HsComment/ajax_get_my_comments',
        success: function(data){
            if(data.state == "success"){
                if(data.data != 0){
                    $('.newComment').css('display','block');
                }
            }
        }
    });
    //购物车数量监控
    $.ajax({
        type: 'GET',
        url: '/index.php?g=restful&m=HsShoppingCart&a=counts',
        dataType: 'json',
        timeout: 4000,
        success: function(data){
            if(data.status != 1 ) return;
            if(data.numbers > 0 && $('.shopping-num').length == 1){
                $('.shopping-num').css('display','block');
            }
        }
    });
    function newMessages() {
        if($('.newMessages').length >= 1){
            $('.newMessages').css('display','block');
        }
        if($('.information').length >= 1){
            $('.information').css('display','block');
        }
    }
}
