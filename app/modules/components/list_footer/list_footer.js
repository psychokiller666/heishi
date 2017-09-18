// 私信聊天顶部
var hs_footer = $('.hs-footer');
var newMessages = $('.newMessages');
var myId = $('#cnzz_user_id').val();
if(GV.HOST == 'http://hstest.ontheroadstore.com/'){
    myId = 'hstest'+myId;
}
if(hs_footer.length){
    $.ajax({
        type: 'GET',
        url: '/index.php?g=api&m=HsNeteasyIM&a=get_token_by_user_id',
        timeout: 4000,
        data: {
            user_id: myId
        },
        success: function(res){
            var data = JSON.parse(res);
            var token = data.data.token;
            var appKey = data.data.app_key;
            callbackIM(token, myId, appKey);
        },
        error: function(xhr, type){
            // $.toast(xhr.info);
            console.log(type);
        }
    });
    var callbackIM = function(token, myId, appKey){
        var nim = NIM.getInstance({
            appKey: appKey,
            account: myId,
            token: token,
            onconnect: onConnect,
            syncSessionUnread: true,
            onsessions: onSessions,
            onupdatesession: onUpdateSession,
            ondisconnect: onDisconnect,
            db: true
        });
    }
    
    function onConnect() {
        console.log('连接成功');
    }
    function onSessions(sessions) {
        var data = sessions;
        var num = 0;
        for(var i in data){
            if(data[i]['unread']){
                num++;
            }
        }
        if(num){
            $('.information').css('display','block');
        }
        if(newMessages.length && num){
            newMessages.css('display','block');
        }
    }
    function onUpdateSession(){
        $('.information').css('display','block');
        newMessages.css('display','block');
    }
    function onDisconnect(error) {
        // 此时说明 SDK 处于断开状态, 开发者此时应该根据错误码提示相应的错误信息, 并且跳转到登录页面
        $.toast('丢失连接');
        console.log(error);
        if (error) {
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
                    },
                    error: function(xhr, type){
                        // $.toast(xhr.info);
                        console.log(type);
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
        },
        error: function(xhr, type){
        // $.toast('网络错误 code:'+type);
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
        },
        error: function(xhr, type){
        // $.toast('网络错误 code:'+type);
        }
    });
    
}
