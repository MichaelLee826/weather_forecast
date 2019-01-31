//index.js
//获取应用实例
const app = getApp()
//调用百度地图天气API的js文件
var bmap = require('../../utils/bmap-wx.js'); 

Page({
  //“分享”功能
  onShareAppMessage: function () {
    let that = this;
    return {
      title: '分享',
      path: '/pages/index',
      success: (res) => {
        console.log(res.shareTickets[0])
        wx.getShareInfo({
          shareTicket: res.shareTickets[0],
          success: (res) => {
            that.setData({
              isShow: true
            })
            console.log(that.setData.isShow)
          },
          fail: function (res) { console.log(res) },
          complete: function (res) { console.log(res) }
        })
      },
      fail: function (res) {
        console.log(res)
      }
    }
  },

  data: {
    currentWeather:{},
    inputCity: "",
    topNum: 0,
    scroll_height: 0
  },
  
  onLoad: function () {
    let windowHeight = wx.getSystemInfoSync().windowHeight // 屏幕的高度
    let windowWidth = wx.getSystemInfoSync().windowWidth // 屏幕的宽度
    this.setData({
      scroll_height: windowHeight * 750 / windowWidth
    });
    this.getWeather("");
  },

  //查询天气
  getWeather: function (cityName) {
    //提示“加载中”
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      mask: true
    });

    var that = this;

    // 新建百度地图对象 
    var BMap = new bmap.BMapWX({
      ak: 'sNrVzv0oHrkXfYyo08gUkMyQRWxzUcgU'
    });

    //查询失败
    var fail = function (data) {
      //关闭加载提示框
      wx.hideLoading();

      var statusCode = data["statusCode"];
      //城市名称查询不到，弹窗提示
      if (statusCode == "No result available"){
        wx.showModal({
          title: '提示',
          content: '输入的城市名称有误，请重新输入',
          confirmText: '好的',
          confirmColor: '#ACB4E3',
          showCancel: false,
        });
      }
    };

    //查询成功
    var success = function (data) {
      //关闭加载提示框
      wx.hideLoading();

      //获取当前的日期和星期几
      var currentDate = that.getDate().substring(5);
      var weekday = data.currentWeather[0].date.substring(0, 2);
      //currentDate = currentDate + "  " + weekday;

      //返回的数据包括2部分：data.currentWeather和data.originalData.results
      //console.log(data);
      //console.log(data.currentWeather);
      //console.log(data.originalData);
      //console.log(data.originalData.results);

      //第1部分数据示例
      var currentWeather = data.currentWeather[0];
      //currentWeather.currentCity："济南市"
      //currentWeather.date："周四 01月17日 (实时：3℃)"
      //currentWeather.pm25："85"
      //currentWeather.temperature："7 ~ -2℃"
      //currentWeather.weatherDesc："晴"
      //currentWeather.wind："南风微风"

      //获得天气图标URL
      var iconURL = that.getIconURL(currentWeather.weatherDesc);

      //截取出实时温度数据
      var begin = currentWeather.date.indexOf("时");
      var end = currentWeather.date.indexOf(")");
      currentWeather.date = currentWeather.date.substring(begin + 2, end - 1);
      //console.log(currentWeather.date);

      //调整温度范围显示
      currentWeather.temperature = that.tempSwitch(currentWeather.temperature);

      //判断空气质量等级
      var pm25 = currentWeather.pm25;
      var airClass = "";
      var airColor = "";
      if (pm25 <= 50) {
        airClass = "优";
        airColor = "#00EE00";
      }
      else if (pm25 > 50 && pm25 <= 100) {
        airClass = "良";
        airColor = "#EEEE00";
      }
      else if (pm25 > 100 && pm25 <= 150) {
        airClass = "轻度污染";
        airColor = "#FF8C00";
      }
      else if (pm25 > 150 && pm25 <= 200) {
        airClass = "中度污染";
        airColor = "#FF3030";
      }
      else if (pm25 > 200 && pm25 <= 300) {
        airClass = "重度污染";
        airColor = "#E066FF";
      }
      else {
        airClass = "严重污染";
        airColor = "#8B0000";
      }

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
      for (var i = 0; i < 3; i++) {
        forecast[i] = forecastArray[i + 1];
        //调整日期显示
        forecast[i].date = that.getForecatDate(i, forecast[i].date);
        //获得天气图标URL
        forecast[i].iconURL = that.getIconURL(forecast[i].weather);
        //调整温度范围显示
        forecast[i].temperature = that.tempSwitch(forecast[i].temperature);
        //调整风向和风速显示，如果没有风速，则风速为空
        forecast[i].windDeriction = that.getWindDeriction(forecast[i].wind);
        forecast[i].windSpeed = that.getWindSpeed(forecast[i].wind);
      }

      //配置数据
      that.setData({
        iconURL: iconURL,
        currentWeather: currentWeather,
        currentDate: currentDate,
        weekday: weekday,
        airClass: airClass,
        airColor: airColor,
        forecast: forecast,
        ganmao: ganmao,
        yundong: yundong,
        ziwaixian: ziwaixian,
        xiche: xiche
      });
    }

    // 发起weather请求
    //cityName为空，查询定位城市天气
    if (!cityName){
      BMap.weather({
        cityName: "",
        fail: fail,
        success: success
      }); 
    }
    //cityName不为空，查询输入城市天气
    else{
      BMap.weather({
        cityName: cityName,
        fail: fail,
        success: success
      }); 
    }
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
	},

  //天气图标路径
  getIconURL: function (weatherDesc){
    var condition = String(weatherDesc);
    var url = "";
    if (condition.includes("转")){
      condition = condition.substring(0, condition.indexOf("转"));
    }

    if (condition.includes("晴")) {
      url = "../../pics/sunny.png";
    }
    else if (condition.includes("多云")) {
      url = "../../pics/partly_cloudy.png";
    }
    else if (condition.includes("阴")) {
      url = "../../pics/cloudy.png";
    }
    else if (condition.includes("阵雨")) {
      url = "../../pics/shower.png";
    }
    else if (condition.includes("雷阵雨")) {
      url = "../../pics/stormy_rain.png";
    }
    else if (condition.includes("雨夹雪")) {
      url = "../../pics/snow_rain.png";
    }
    else if (condition.includes("小雨")) {
      url = "../../pics/light_rain.png";
    }
    else if (condition.includes("中雨")) {
      url = "../../pics/moderate_rain.png";
    }
    else if (condition.includes("大雨")) {
      url = "../../pics/heavy_rain.png";
    }
    else if (condition.includes("暴雨")) {
      url = "../../pics/rainstorm.png";
    }
    else if (condition.includes("阵雪")) {
      url = "../../pics/shower_snow.png";
    }
    else if (condition.includes("小雪")) {
      url = "../../pics/light_snow.png";
    }
    else if (condition.includes("中雪")) {
      url = "../../pics/moderate_snow.png";
    }
    else if (condition.includes("大雪")) {
      url = "../../pics/heavy_snow.png";
    }
    else if (condition.includes("暴雪")) {
      url = "../../pics/snow_storm.png";
    }
    else if (condition.includes("雾")) {
      url = "../../pics/fog.png";
    }
    else if (condition.includes("霾")) {
      url = "../../pics/haze.png";
    }
    else if (condition.includes("沙尘暴")) {
      url = "../../pics/dust_storm.png";
    }
    else {
      url = "../../pics/unknown.png";
    }
    return url;
  },

  //获得风向
  getWindDeriction: function (wind) {
    var result = "";
    var index = this.seperateWind(wind);
    //信息中不包含风速，风向为全部信息
    if (index == -1){
      result = wind;
    }
    //信息中包含风速，截取出风向
    else{
      result = wind.substring(0, index);
    }
    return result;
  },

  //获得风速
  getWindSpeed: function (wind) {
    var result = "";
    var index = this.seperateWind(wind);
    //信息中不包含风速，风速为空
    if (index == -1) {
      result = "";
    }
    //信息中包含风速，截取出风速
    else {
      result = wind.substring(index, wind.length);
    }
    return result;
  },

  //将风向和风力分开，获得分隔的索引值
  seperateWind: function(wind){
    var numPattern = /[0-9]/;
    var result = "";
    if(numPattern.test(wind)){
      //风力信息中包含数字
      var pattern = new RegExp("[0-9]+");
      var res = wind.match(pattern);
      result = res.index;
    }
    else if (wind.search("微风")){
      var res = wind.match("微风");
      result = res.index;
    }
    else{
      //风力信息中不包含数字
      result = -1;
    }
    return result;
  },
  
  //获得输入框中的文字
  inputing: function (e) {
    this.setData({inputCity: e.detail.value});
  },

  //查询按钮
  bindSearch: function () {
    if (this.data.inputCity == ''){
      wx.showModal({
        title: '提示',
        content: '请先输入要查询的城市名称',
        confirmText: '好的',
        confirmColor: '#ACB4E3',
        showCancel: false,
      });
    }
    else {
      //查询天气
      this.getWeather(this.data.inputCity);

      // 一键回到顶部
      this.setData({
        topNum: 0
      });
    }
  }
})
