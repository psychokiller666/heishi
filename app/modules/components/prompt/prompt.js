// 提示

var _prompttpl = '<div class="prompt ui-dialog">'+
'<div class="ui-dialog-cnt">'+
'<div class="ui-dialog-bd">'+
'<div class="text"><%=text%></div>'+
'</div>'+
'</div>'+
'</div>';



var prompt = function prompt(text){

    var htmltpl = $($.tpl(_prompttpl,{text:text}));

    function init(){
        if($('.prompt').length){
            $('.prompt').remove();
            htmltpl.appendTo('body').show();
        } else {
            htmltpl.appendTo('body').show();
        }
        setTimeout(function(){
            $('.prompt').hide();
        },1500);

        // htmltpl.appendTo('body').show();
    }

    return init();
};

module.exports = prompt;
