//抽奖活动页

// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.lottery', function(e, id, page) {
    if (page.selector == '.page') {
        return false;
    }
    document.title = '抽奖';

    var init = new common(page);

    var ApiBaseUrl = init.getApiBaseUrl();

    var PHPSESSID = init.getCookie('PHPSESSID');
    var ajaxHeaders = {
        'phpsessionid': PHPSESSID
    };

    // 调用微信分享sdk
    var share_data = {
        title: '公路商店 — 抽奖活动',
        desc: '为你不着边际的企图心',
        link: window.location.href,
        img: 'https://jscache.ontheroadstore.com/tpl/simplebootx_mobile/Public/i/logo.png'
    };
    init.wx_share(share_data);


    //判断是否是app，如果是app，url都需要做处理，ajax headers携带身份不一样
    var isApp = false;
    var $isApp = $('.is_app');
    var Authorization = $isApp.attr('authorization');
    var uid = $isApp.attr('uid');
    // var version = $isApp.attr('version');

    var loginStatus = true;

    //与app交互的协议url
    var AppUrl = {

        //抽奖首页 https://hstest.ontheroadstore.com/Portal/Lottery/lottery.html?id=CJ20181107102903JH5991&shareid=163

        //商品详情页
        //卖家中心页                  user-info:// +uid

        //设置开始提醒                lottery://11

        //抽奖成功弹窗（点击免费抽奖）  lottery://21
        //我的抽奖券弹窗              lottery://22

        //中奖后领取奖品弹窗          lottery://31
        //中奖后分享（点击显摆一下）   lottery://32
        //未中奖，点击去看看          lottery://33

        //打开活动预告页       lottery-url://Portal/Lottery/lottery.html?id=xxx
        //打开抽奖规则页       lottery-url://Portal/Lottery/lottery_rule.html
        //打开参与用户列表页    lottery-url://Portal/Lottery/lottery_user.html


    };

    if(Authorization && Authorization.length>0){
        isApp = true;
        ajaxHeaders = {
            'Authorization' : Authorization,
            // 'version' : version,//跨域不能加version
        };
        // $('.get_coupon').attr('href','get-coupon://0');
    }else{
        //如果不是app，通过uid判断是否登录，如果未登录，点击领取和关注按钮需要跳转到登录页3
        loginStatus = init.ifLogin();
    }


    //返回卖家中心url
    function sellerUrl(uid){
        if(isApp){
            return 'user-info://'+uid;
        }else{
            return '/User/index/index/id/'+ uid +'.html';
        }
    }
    //返回商品标签url
    function tagUrl(id){
        if(isApp){
            return 'product-tag://'+id;
        }else{
            return '/HsCategories/tag_index/tag/'+ id +'.html';
        }
    }



    // initLottery();

    //获取所有信息
    function initLottery(){
        var url = ApiBaseUrl + '/appv6/coupon/newUserCouponList';
        $.ajax({
            type: "GET",
            url: url,
            dataType: 'json',
            data: {},
            headers: ajaxHeaders,
            success: function(data){
                if(data.status==1){


                }
            },
            error: function(e){
                console.log('initLottery err: ',e);
            }
        });
    }


    //根据当前状态展示不同数据
    //状态：
    var allStatus = {
        'web抽奖页' : {
            1:{
                1:'有活动预告',
                2:'无活动预告',
            },
            2:{
                1:'未抽奖',
                2:'已抽奖,等待开奖',
                3:'已结束'
            }
        },

        'app抽奖页' : {
            1:{
                1:'有活动预告',
                2:'无活动预告',
            },
            2:{
                1:'未抽奖：与web相同',
                2:'已抽奖,等待开奖:显示获取更多抽奖券和我的抽奖券',
                3:{
                    '已结束':'',
                    1:'中奖',
                    2:'未中奖',
                }
            }
        },

        'web活动预告':{
            '1':'等待开始'
        },
        'app活动预告':{
            '1':'设置提醒'
        }
    }




    //顶部开奖倒计时 参数：结束时间戳，下次活动id
    function initEndCD(endTime,nextId){

    }

    //顶部预告开始时间
    function initStartTime(startTime){

    }






});


