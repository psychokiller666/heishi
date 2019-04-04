//抽奖用户列表

// 初始化
var common = require('../common/common.js');
var sm_extebd = require('../../../../node_not/SUI-Mobile/dist/js/sm-extend.min');


$(document).on('pageInit','.lottery_evaluation', function(e, id, page) {
    if (page.selector == '.page') {
        return false;
    }
    document.title = '测评';

    var init = new common(page);

    var ApiBaseUrl = init.getApiBaseUrl();

    var PHPSESSID = init.getCookie('PHPSESSID');
    var ajaxHeaders = {
        'phpsessionid': PHPSESSID
    };


    var $page = $(page);

    var id = init.getUrlParam('id') || '';



    // 调用微信分享sdk
/*    var share_data = {
        title: '公路商店 — 抽奖活动',
        desc: '为你不着边际的企图心',
        link: window.location.href,
        img: 'https://jscache.ontheroadstore.com/tpl/simplebootx_mobile/Public/i/logo.png'
    };
    init.wx_share(share_data);*/

    getGoodsEvaluation();

    //获取商品评测列表
    function getGoodsEvaluation(){

        var url = ApiBaseUrl + '/appv6_2/lottery/getGoodsEvaluation';
        $.ajax({
            type: "GET",
            url: url,
            dataType: 'json',
            data: {
                object_id:id,
            },
            // headers: ajaxHeaders,

            success: function(data){
                if(data.status==1){
                    console.log(data.data)
                    createEvaluation(data.data);
                }else{
                    $.toast(data.info);
                }
            },
            error: function(e){
                console.log('getLotteryUser err: ',e);
            }
        });
    }


    //生成列表
    function createEvaluation(data){

        var html = '';
        if( data instanceof Array && data.length>0){

            for(var i=0;i<data.length;i++){
                html+= '<li class="lottery_evaluation_li" fold="">'
                html+= '<div class="l_e_user">'
                html+= '<a external href="/User/index/index/id/'+ data[i].user_id +'.html" >'
                html+= '<div class="avatar" style="background-image: url('+data[i].avatar+')"></div>'
                html+= '<div class="name">'+ data[i].user_name +'</div>'
                html+= '</a>'
                html+= '</div>'
                html+= '<div class="l_e_content">'
                html+= '<div class="txt">'+ data[i].content +'</div>'
                html+= '<div class="more"><span></span><i></i></div>'
                html+= '</div>'
                html+= '<ul class="l_e_imgs">'
                for (var j=0;j<data[i].img.length;j++){
                    html+= '<li class="l_e_img" style="background-image: url('+data[i].img[j]+'@!320x320);" data-preview="'+data[i].img[j]+'@!rel"></li>'
                }
                html+= '</ul>'
                html+= '</li>'
            }

        }
        $page.find('.lottery_evaluation_ul').html(html);
        setFold();

    }

    //设置折叠
    function setFold(){
        var $txt = $page.find('.lottery_evaluation_ul .lottery_evaluation_li .txt');
        $txt.each(function(k,v){
            if(v.scrollHeight>v.clientHeight){
                $(v).parents('.lottery_evaluation_li').attr('fold','0');
            }
            console.log(v.scrollHeight,v.clientHeight)
        })
    }


    setPreview();
    openContent();

    //折叠展开
    function openContent(){
        $page.find('.lottery_evaluation_wrap').on('click','.more',function(){
            var $parent = $(this).parents('.lottery_evaluation_li');
            var $txt = $parent.find('.txt');
            if($parent.attr('fold')==='0'){
                $txt.css('height',$txt.prop('scrollHeight'));
                $parent.attr('fold','1');
            }else if($parent.attr('fold')==='1'){
                $txt.css('height','');
                $parent.attr('fold','0');
            }
        })
    }

    function setPreview() {
        // 微信预览图片
        $page.on('click','.l_e_imgs .l_e_img',function(){

            var $imgLi = $(this).parent('.l_e_imgs').find('.l_e_img');

            if(GV.device == 'any@weixin') {
                var preview_list = [];
                $.each($imgLi,function(index,item){
                    preview_list.push($imgLi.eq(index).data('preview'));
                });
                wx.previewImage({
                    current: $(this).data('preview'),
                    urls: preview_list
                });
            } else {
                var preview_lists = [];
                $.each($imgLi,function(index,item){
                    preview_lists.push({url:$imgLi.eq(index).data('preview')});
                });
                var previewimage = $.photoBrowser({
                    photos : preview_lists,
                    container : '.container',
                    type: 'popup'
                })
                previewimage.open();
            }
        });

    }

});


