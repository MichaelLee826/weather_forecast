//index.js
//获取应用实例
const app = getApp()
//调用百度地图天气API的js文件
var bmap = require('../../utils/bmap-wx.min.js'); 

Page({
  data: {
    currentWeather:{
    }
  },
  
  onLoad: function () {
    var that = this;
    
	// 新建百度地图对象 
    var BMap = new bmap.BMapWX({
      ak: 'sNrVzv0oHrkXfYyo08gUkMyQRWxzUcgU'
    });
	
	//查询失败
    var fail = function (data) {
      console.log(data)
    };
	
	//查询成功
    var success = function (data) {
		//获取当前的日期和星期几
		var currentDate = that.getDate();
		var weekday = data.currentWeather[0].date.substring(0, 2);
		currentDate = currentDate + "  " + weekday;

		//返回的数据包括2部分：data.currentWeather和data.originalData.results
		//console.log(data.currentWeather);
		//console.log(data.originalData.results);
      
		//第1部分数据示例
    var currentWeather = data.currentWeather[0];
		//currentWeather.currentCity："济南市"
    //currentWeather.date："周四 01月17日 (实时：3℃)"
    //currentWeather.pm25："85"
    //currentWeather.temperature："7 ~ -2℃"
    //currentWeather.weatherDesc："晴"
    //currentWeather.wind："南风微风"
		
		//截取出实时温度数据
    var begin = currentWeather.date.indexOf("时");
    var end = currentWeather.date.indexOf(")");
    currentWeather.date = currentWeather.date.substring(begin + 2, end - 1);
    //console.log(currentWeather.date);
      
		//调整温度范围显示
		currentWeather.temperature = that.tempSwitch(currentWeather.temperature);
	  
		//第2部分数据示例
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
      
		//未来3天的天气预报
		var forecastArray = new Array(4);
		forecastArray = data.originalData.results[0].weather_data;

		var forecast = new Array(3);
		for(var i = 0; i < 3; i++){
			forecast[i] = forecastArray[i + 1];
      //调整日期显示
      forecast[i].date = that.getForecatDate(i, forecast[i].date);
      //调整温度范围显示
      forecast[i].temperature = that.tempSwitch(forecast[i].temperature);
        }
      
		//配置数据
		that.setData({
		    currentWeather: currentWeather,
			  currentDate: currentDate,
		    forecast: forecast,
		    ganmao: ganmao,
		});
    }
    // 发起weather请求 
    BMap.weather({
      fail: fail,
      success: success
    }); 
  },

	//日期显示
	getDate:function(){
		var date = new Date();
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		var strDate = date.getDate();
		if (month >= 1 && month <= 9) {
			month = "0" + month;
		}
		if (strDate >= 0 && strDate <= 9) {
			strDate = "0" + strDate;
		}
		var currentdate = year + "年" + month + "月" + strDate + "日";
		return currentdate;
	},
	
  //未来3天预报中调整日期显示
  getForecatDate: function (index, weekday) {
    var date = this.getNextDate(index + 1);
    var result;
    result = date + " " + weekday;
    return result;
  },

	getNextDate:function(index){
		var today = new Date();
		//后index天的日期
		var nextDate = new Date(today.getTime() + 24 * 60 * 60 * 1000 * index);
    var month = nextDate.getMonth() + 1;
    var strDate = nextDate.getDate();
    if (month >= 1 && month <= 9) {
      month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
      strDate = "0" + strDate;
    }
    var result = month + "月" + strDate + "日";
    return result;
	},

	//转换温度范围显示格式，eg:"7 ~ -2℃"
	tempSwitch:function(temp){
		var low;
		var high;
		var result;
    var flag = temp.indexOf("~");
    var length = temp.length;
	
		low = temp.substring(flag + 2, length - 1);
		high = temp.substring(0, flag - 1);
		result = low + " ~ " + high + "℃";
	
		return result;
	}
})
