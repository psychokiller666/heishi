//抽奖用户列表

// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.lottery_user', function(e, id, page) {
    if (page.selector == '.page') {
        return false;
    }
    document.title = '抽奖参与用户';

    var init = new common(page);


    var ApiBaseUrl = init.getApiBaseUrl();

    var PHPSESSID = init.getCookie('PHPSESSID');
    var ajaxHeaders = {
        'phpsessionid': PHPSESSID
    };

    //判断是否是app，如果是app，url都需要做处理，ajax headers携带身份不一样
    var isApp = false;
    var $isApp = $('.is_app');
    var Authorization = $isApp.attr('authorization');
    var loginStatus = true;

    if(Authorization && Authorization.length>0){
        isApp = true;
        ajaxHeaders = {
            'Authorization' : Authorization,
            // 'version' : version,//跨域不能加version
        };
    }else{
        //如果不是app，通过uid判断是否登录，如果未登录，点击领取和关注按钮需要跳转到登录页3
        loginStatus = init.ifLogin();
    }

    var pretendApp = init.getUrlParam('pretendApp');//todo delete 假装是app
    if(pretendApp==1){
        isApp = true;//todo delete
    }else if(pretendApp==2){
        isApp = false;//todo delete
    }


    var $page = $(page);

    var id = init.getUrlParam('id') || '';
    var page = 1;//页码
    var rows = 20;//每页多少个数据
    var loading = false;//是否正在加载数据
    var over = false;//是否加载完毕

    var $lottery_user_ul = $page.find('.lottery_user_wrap .lottery_user_ul');

    // 调用微信分享sdk
/*    var share_data = {
        title: '公路商店 — 抽奖活动',
        desc: '为你不着边际的企图心',
        link: window.location.href,
        img: 'https://jscache.ontheroadstore.com/tpl/simplebootx_mobile/Public/i/logo.png'
    };
    init.wx_share(share_data);*/

    getLotteryUser();

    function getLotteryUser(){

        if(over || loading){
            return false;
        }else{
            loading = true;
        }

        var url = ApiBaseUrl + '/appv6_2/getLotteryUserList/'+id;
        $.ajax({
            type: "GET",
            url: url,
            dataType: 'json',
            data: {
                page:page,
                rows:rows,
            },
            // headers: ajaxHeaders,

            success: function(data){
                if(data.status==1){
                    console.log(data.data)

                    var result = (data.data && data.data.result) ? data.data.result : [];

                    addUserList(result);

                    if(result.length<rows){
                        over = true;
                    }else{
                        page++;
                    }
                }
                loading = false;
            },
            error: function(e){
                loading = false;
                console.log('getLotteryUser err: ',e);
            }
        });
    }

    //追加用户列表
    function addUserList(res) {
        var html = '';

        for(var i=0;i<res.length;i++){
            html += '<li>'
            html += '<div class="li_time">'+formatTime(res[i].updated_time)+'</div>'
            html += '<a external class="li_avatar" href="'+ createUserUrl(res[i].uid) +'" style="background-image: url('+res[i].avatar+');"></a>'
            html += '<div class="li_name">'+res[i].user_name+'</div>'
            html += '</li>'
        }

        $lottery_user_ul.append(html);
    }

    //格式化时间
    function formatTime(time){
        if(time){
            if(String(time).length===10){
                time = time * 1000;
            }
            return new Date(time).format('MM-dd');
        }else{
            return '';
        }
    }


    //添加滚动事件
    addScrollEvent();

    function addScrollEvent(){
        //获取滚动元素

        $page.find('.hs-page').on('scroll',function(){
            if(over || loading){
                return;
            }
            var $this = $(this);
            //获取自己的scrollHeight,scrollTop
            var clientHeight = $this.height();
            var scrollHeight = $this[0].scrollHeight;
            var scrollTop = $this.scrollTop();

            //判断距离底部的px
            var diff = scrollHeight - clientHeight - scrollTop <= 300;
            if(diff){
                getLotteryUser();
            }
            // console.log(clientHeight,scrollHeight,scrollTop,diff)
        });


    }


    //用户中心页
    function createUserUrl(uid) {
        if(isApp){
            return 'user-info://' + uid;
        }else{
            return '/User/index/index/id/'+ uid +'.html'
        }
    }


});


