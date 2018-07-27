//卖家店铺分类商品列表页

// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.tag_goods', function(e, id, page) {
    if (page.selector == '.page') {
        return false;
    }
    var init = new common(page);
    var lazyLoad = init.lazyLoad;

    var HostName = location.hostname;
    var ApiBaseUrl = 'https://apitest.ontheroadstore.com';


    if(HostName==="hs.ontheroadstore.com"){
        ApiBaseUrl = 'https://api.ontheroadstore.com';
    }

    var uid = getUrlParam('id');
    var sortid = getUrlParam('sortid') || 0;

    var $classifyWrap = $('.classify_wrap');
    var img_root = $classifyWrap.attr('img_root');

    var $classifyTabWrap = $('.classify_tab_wrap');
    var $classifyPageWrap = $('.classify_page_wrap');
    var $classifyLoading = $('.classify_loading');

    //属性名是sortid,值是对象,保存nowpage,totalpage,ifover,ifloading
    var goodsSort = {
        0:{
            nowPage:0,
            totalPage:1,
            ifOver:false,
            ifLoading:false,
            pageSize:20,
        }
    };


    getGoodsSort();

    //获取店铺分类
    function getGoodsSort(){
        var url = ApiBaseUrl + '/appv5_2/sort/getGoodsSort';
        $.ajax({
            type: "GET",
            url: url,
            dataType: 'json',
            data: {uid:uid,status:1},

            success: function(data){
                if(data.status==1){
                    addGoodsSort(data.data);
                    addChangeEvent();
                    addScrollEvent();
                    setTimeout(function(){
                        // $('.classify_tab[sortid="'+ sortid +'"]').trigger('click');
                        $('.classify_tab[sortid="'+ sortid +'"]').triggerHandler('click');
                    },10);
                    console.log('tab sortid: ',$('.classify_tab[sortid="'+ sortid +'"]'))

                }
            },
            error: function(e){
                console.log('getGoodsSort err: ',e);
            }
        });
    }

    //把分类添加进去
    function addGoodsSort(data){

        var tabHtml = '';
        var pageHtml = '';
        for(var i=0;i<data.length;i++){
            tabHtml+= '<div class="classify_tab" sortid="'+ data[i].id +'" loaddata="0">'+ data[i].sort_name +'</div>'
            pageHtml += '<div class="classify_page " scroll="1" sortid="'+ data[i].id +'"></div>'
            goodsSort[data[i].id]={
                nowPage:0,
                totalPage:Math.ceil(data[i].goods_num/20),
                ifOver:false,
                ifLoading:false,
                pageSize:20,
            }
        }
        $classifyTabWrap.append($(tabHtml));
        $classifyPageWrap.append($(pageHtml));
    }

    //生成商品列表，传参是数据数组
    function createGoodsLists(lists){

        if(!(lists instanceof Array)){
            return '';
        }

        var html = '';
        for(var i=0;i<lists.length;i++){
            html+= '<li>'
            html+= '<a href="/Portal/HsArticle/index/id/'+ lists[i].id +'.html" class="filepath external">'
            html+= '<div class="image" data-layzr="'+ lists[i].cover +'@640w_1l"></div>'
            html+= '</a>'
            html+= '<a href="/Portal/HsArticle/index/id/'+ lists[i].id +'.html" class="post_title external">'+ lists[i].title +'</a>'
            html+= '<a class="keywords keywords_none"></a>'
            html+= '<div class="price font_din">'+ lists[i].price +'</div>'
            html+= '</li>'
        }

        return html;
    }

    //在每次请求前都设置goodsSort相应的值,判断是否可以请求
    //获取分类商品列表
    function getGoodsSortInfo(sortid,page){

        var gSort = goodsSort[sortid];

        if(!gSort){
            return false;
        }
        if(gSort.ifOver){
            return false;
        }
        if(gSort.ifLoading){
            return false;
        }
        gSort.ifLoading=true;

        page = page || gSort.nowPage + 1;

        var obj = {
            uid: uid,
            page: page,
            size: gSort.pageSize || 20,
            sortid: sortid
        };
        var url = ApiBaseUrl + '/appv5_2/user/goodsSortInfo';
        $.ajax({
            type: "GET",
            url: url,
            dataType: 'json',
            data: obj,

            success: function(data){
                if(data.status == 1){

                    addGoodsList(sortid,data.data.goodslist);
                    gSort.nowPage= obj.page;
                    gSort.totalPage=data.data.totalPages;
                    gSort.ifOver= obj.page>=data.data.totalPages;
                }
                gSort.ifLoading=false;
            },
            error: function(e){
                console.log('getGoodsSortInfo err: ',e);
                gSort.ifLoading=false;
            }
        });

    }

    //追加商品列表
    function addGoodsList(sortid,data){
        var $page = $('.classify_page[sortid="'+ sortid +'"]');
        var html = createGoodsLists(data);

        $page.append($(html));
        lazyLoad();
        //延迟触发一次页面scroll事件,防止图片懒加载没有生效.
        setTimeout(function(){
            // $('.content').trigger('scroll');
            lazyLoad();
        },500);
    }

    //添加点击事件
    function addChangeEvent(){
        changeTab('classify_tab','classify_page','classify_tab_act','classify_page_act',function($o){

            /*if($o.attr('scroll_top')){
                var scrollTop = $o.attr('scroll_top');
                $('.classify_page_act').scrollTop(scrollTop);
            }*/

            var loadData = $o.attr('loaddata');
            var sortid = $o.attr('sortid');
            if(loadData!=='0'){
                return false;
            }
            $o.attr('loaddata',1);
            getGoodsSortInfo(sortid,1);
        },function($o){
            //切换标签之前先保存当前标签的scroll top
            /*var scrollTop = $('.classify_page_act').scrollTop();
            $o.siblings('.classify_tab_act').attr('scroll_top',scrollTop)*/
        });
    }

    //添加滚动事件
    function addScrollEvent(){
        //获取滚动元素

        $('.classify_page[scroll="1"]').on('scroll',function(){
            var $this = $(this);
            //获取自己的scrollHeight,scrollTop
            var clientHeight = $this.height();
            var scrollHeight = $this[0].scrollHeight;
            var scrollTop = $this.scrollTop();


            //判断距离底部的px
            var diff = scrollHeight - clientHeight - scrollTop <= 300;
            if(diff){

                var sortId = $this.attr('sortid');
                console.log('sortid',sortId)
                if(typeof sortId === 'string'){
                    getGoodsSortInfo(sortId)
                }
            }
            console.log(clientHeight,scrollHeight,scrollTop,diff)
        });

        $('.classify_page').on('scroll',function(){
            // $('.content').trigger('scroll');
            lazyLoad();
        });
    }


    /*点击tab切换对应标签*/
    function changeTab(tabClass,pageClass,tabActClass,pageActClass,endback,preback){
        var $tabs = $('.' + tabClass);
        var $pages = $('.' + pageClass);

        $tabs.off('click').on('click',function(ev){
            var index = $(this).index();
            if($(this).hasClass(tabActClass)){
                return;
            }
            if(typeof preback === "function"){
                preback($(this),ev);
            }
            $tabs.removeClass(tabActClass);
            $tabs.eq(index).addClass(tabActClass);
            $pages.removeClass(pageActClass);
            $pages.eq(index).addClass(pageActClass);
            if(typeof endback === "function"){
                endback($(this),ev);
            }
        })
    }



    function getUrlParam(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    }


});


