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
          var weather = result.data.data;
          console.log(weather);

          //获得今天的日期
          var date = self.getDate();

          //显示yesterday风力
          weather.yesterday.fl = self.flDisplay(weather.yesterday.fl);

          for (var i = 0; i < weather.forecast.length; i++) {
            weather.forecast[i].date = '  ' + weather.forecast[i].date.replace('星期', ' 周');
            weather.forecast[i].fengli = self.flDisplay(weather.forecast[i].fengli);
          }          

          self.setData({
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
