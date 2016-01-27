// 按钮
!function($){

  // 默认模板
  var _loadingTpl='<div class="ui-loading-block show">'+
  '<div class="ui-loading-cnt">'+
  '<i class="ui-loading-bright"></i>'+
  '<p><%=content%></p>'+
  '</div>'+
  '</div>';

  // 默认参数
  var defaults={
    content:'加载中...'
  }
  // 构造函数
  var button = function (el,option,isFromTpl) {
    var self=this;
    this.element=$(el);
    this._isFromTpl=isFromTpl;
    this.option=$.extend(defaults,option);
  }
  button.prototype={
    loading:function(){
      this.element.attr('disabled','disabled');
      this.element.addClass('hs-disabled');
    },
    reset:function(){
      this.element.removeAttr('disabled');
      this.element.removeClass('hs-disabled');
    }
  }
  function Plugin(option) {

    return $.adaptObject(this, defaults, option,_loadingTpl,button,"button");
  }
  $.fn.button=$.button= Plugin;
}(window.Zepto)
