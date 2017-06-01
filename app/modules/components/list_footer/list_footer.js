// 私信聊天顶部
var hs_footer = $('.hs-footer');
var newMessages = $('.newMessages');
var myId = $('#cnzz_user_id').val();
function IsPC() {
var userAgentInfo = navigator.userAgent;
var Agents = ["Android", "iPhone",
  "SymbianOS", "Windows Phone",
  "iPad", "iPod"
];
var flag = false;
for(var v = 0; v < Agents.length; v++) {
  if(userAgentInfo.indexOf(Agents[v]) > 0) {
    flag = true;
    break;
  }
}
return flag;
}
var statusDb = IsPC();
if(hs_footer.length){
    $.ajax({
        type: 'POST',
        url: '/index.php?g=api&m=HsNeteasyIM&a=get_token',
        timeout: 4000,
        success: function(data){
            var token = JSON.parse(data).data.token;
            callbackIM(token, myId);
        },
        error: function(xhr, type){
            // $.toast(xhr.info);
            console.log(type);
        }
    });
    var callbackIM = function(token, myId){
        var nim = NIM.getInstance({
            appKey: '3ee032ac53f77af2dd508b941d091f60',
            account: myId,
            token: token,
            onconnect: onConnect,
            syncSessionUnread: true,
            onsessions: onSessions,
            onupdatesession: onUpdateSession,
            ondisconnect: onDisconnect,
            db: statusDb
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
