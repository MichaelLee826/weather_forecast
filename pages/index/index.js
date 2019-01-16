//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    weather:{
    }
  },
  
  onLoad: function () {
    var self = this;
    self.searchWeather();
  },
  
  //修改风力的显示方式
  flDisplay:function(fl){
    //fl格式为：<![CDATA[3-4级]]>
    var end = fl.indexOf("级");
    fl = fl.substring(9, end + 1);
    return fl;
  },

  //日期显示
  getDate:function(){
    var date = new Date();
    var seperator = "-";
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
      month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
      strDate = "0" + strDate;
    }
    var currentdate = year + seperator + month + seperator + strDate;
    return currentdate;
  },

  //查询天气
  searchWeather:function(){
    var self = this;
    var cityName = '青岛';
    wx.request({
      url: 'http://wthrcdn.etouch.cn/weather_mini?city=' + cityName,
      data: {},
      header: {
        'Content-Type': 'application/json'
      },
      success: function(result){
        //无此城市
        if(result.data.status == 1002)
        {
          wx.showModal({
            title: '提示',
            content: '城市名称有误，请重新输入！',
            showCancel: false,
            success: function(result){
              self.setData({inpuCity:''});
            }
          })
        }
        else{
          //获得“中华万年历”的天气预报返回结果
          var weather = result.data.data;
          console.log(weather);

          //获得今天的日期
          var date = self.getDate();

          //获得今日的天气（forecast数组中的第1个）
          var weather_today = weather.forecast[0];

          //获得未来四天的天气(forecast数组中的第2到第5个)
          var forecast = new Array();
          for(var i = 0; i < 4; i++){
            forecast[i] = weather.forecast[i + 1];
          }

          for (var i = 0; i < weather.forecast.length; i++) {
            weather.forecast[i].date = '  ' + weather.forecast[i].date.replace('星期', ' 周');
            weather.forecast[i].fengli = self.flDisplay(weather.forecast[i].fengli);
          }          

          self.setData({
            today:weather_today,
            forecast:forecast,
            date:date,
            city:cityName,
            weather:weather,
            inputCity:''
          })
        }
      }
    })
  }
})
