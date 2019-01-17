//index.js
//获取应用实例
const app = getApp()
var bmap = require('../../utils/bmap-wx.min.js'); 

Page({
  data: {
    currentWeather:{
    }
  },
  
  onLoad: function () {
    //var self = this;
    //self.searchWeather();
	
    var that = this;
    // 新建百度地图对象 
    var BMap = new bmap.BMapWX({
      ak: 'sNrVzv0oHrkXfYyo08gUkMyQRWxzUcgU'
    });
    var fail = function (data) {
      console.log(data)
    };
    var success = function (data) {
      var weatherData = data.currentWeather[0];
            
      //console.log(data.currentWeather);
      //console.log(data.originalData.results);
	  
      var currentWeather = data.currentWeather[0];
      var begin = currentWeather.date.indexOf("时");
      var end = currentWeather.date.indexOf(")");
      currentWeather.date = currentWeather.date.substring(begin + 2, end - 1);
      console.log(currentWeather.date);
      
      //currentWeather.currentCity："济南市"
      //currentWeather.date："周四 01月17日 (实时：3℃)"
      //currentWeather.pm25："85"
      //currentWeather.temperature："7 ~ -2℃"
      //currentWeather.weatherDesc："晴"
      //currentWeather.wind："南风微风"
      
      var tipsArray = new Array(5);
      tipsArray = data.originalData.results[0].index;
	  
      var chuanyi = tipsArray[0];
      var xiche = tipsArray[1];
      var ganmao = tipsArray[2];
      var yundong = tipsArray[3];
      var ziwaixian = tipsArray[4];
      
      //chuanyi.tipt：穿衣指数
      //chuanyi.zs：较冷
      //chuanyi.des："建议着厚外套加毛衣等服装。年老体弱者宜着大衣、呢外套加羊毛衫。"
      
      //xiche.tipt：洗车指数
      //xiche.zs：较适宜
      //xiche.des："较适宜洗车，未来一天无雨，风力较小，擦洗一新的汽车至少能保持一天。"
      
      //ganmao.tipt：感冒指数
      //ganmao.zs：少发
      //ganmao.des："各项气象条件适宜，无明显降温过程，发生感冒机率较低。"
      
      //yundong.tipt：运动指数
      //yundong.zs：较适宜
      //yundong.des："天气较好，无雨水困扰，较适宜进行各种运动，但因气温较低，在户外运动请注意增减衣物。"
      
      //ziwaixian.tipt：紫外线强度指数
      //ziwaixian.zs：中等
      //ziwaixian.des："属中等强度紫外线辐射天气，外出时建议涂擦SPF高于15、PA+的防晒护肤品，戴帽子、太阳镜。"
      
      
      var forecastArray = new Array(4);
      forecastArray = data.originalData.results[0].weather_data;
      console.log(forecastArray);
      var forecast = new Array(3);
      for(var i = 0; i < 3; i++){
          forecast[i] = forecastArray[i + 1];
        }
      
      var date = that.getDate();
	  
      that.setData({
		    currentWeather: currentWeather,
		    forecast: forecast,
		    date: date,
		    ganmao: ganmao,
        weatherData: weatherData
      });
    }
    // 发起weather请求 
    BMap.weather({
      fail: fail,
      success: success
    }); 
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
