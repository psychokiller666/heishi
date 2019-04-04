
//神策sdk
var sensors = require('../../../modules/components/sa_sdk/sensorsdata.min.js')

initSensorsdata();

//神策初始化
//文档 https://www.sensorsdata.cn/manual/js_sdk.html
function initSensorsdata(){
    try{
        sensors.init({
            server_url: 'https://sc.ontheroadstore.com/sa?project=default',
            // server_url: 'https://sc.ontheroadstore.com/sa?project=production',
            web_url:"http://47.93.182.143:8107",
        });
        sensors.quick('autoTrack');//自动采集页面浏览
        //todo: 自动采集会自动console
        console.log('sensors:',sensors)

    }catch (e) {
        console.log('sensors err:',e);
    }

}
