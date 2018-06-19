'use strict';

// 发货页
// 页面初始化
var common = require('../common/common.js');
// 微信sdk
var wx = require('weixin-js-sdk');
$(document).on('pageInit', '.logistique', function (e, id, page) {
  if (page.selector == '.page') {
    return false;
  }
  var init = new common(page);

});