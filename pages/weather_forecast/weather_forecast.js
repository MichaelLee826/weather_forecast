// pages/weather_forecast/weather_forecast.js

//获取应用实例
const app = getApp()
//调用百度地图天气API的js文件
var bmap = require('../../utils/bmap-wx-new.js');
//调用util里的时间格式化方法
var util = require('../../utils/util.js');

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
          fail: function (res) {
            console.log(res)
          },
          complete: function (res) {
            console.log(res)
          }
        })
      },
      fail: function (res) {
        console.log(res)
      }
    }
  },

  /**
   * 页面的初始数据
   */
  data: {
    inputCity: "",
    topNum: 0,
    scroll_height: 0,
    todayInfo: {},
    background_src: "../../pics/background_day.jpg",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;

    let windowHeight = wx.getSystemInfoSync().windowHeight // 屏幕的高度
    let windowWidth = wx.getSystemInfoSync().windowWidth // 屏幕的宽度
    that.setData({
      scroll_height: windowHeight * 750 / windowWidth
    });

    var BMap = new bmap.BMapWX({
      ak: 'sNrVzv0oHrkXfYyo08gUkMyQRWxzUcgU'
    });

    var fail = function (data) {
      console.log(data)
    };
    //定位成功
    var success = function (data) {
      //城市
      var city = data.originalData.result.addressComponent.city;
      city = city.substring(0, city.length - 1);
      //经度
      var longtitude = data.originalData.result.location.lng.toFixed(2);
      //纬度
      var latitude = data.originalData.result.location.lat.toFixed(2);

      //1、查询今日天气
      that.getWeather(city, longtitude, latitude);
      //2、查询空气质量
      that.getAirClass(longtitude, latitude);
      //4、查询未来6天天气
      that.getDaysForecast(longtitude, latitude);
    };
    BMap.regeocoding({
      fail: fail,
      success: success,
    });
  },

  //1、查询今日天气
  getWeather: function (city, longtitude, latitude) {
    //提示“加载中”
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      mask: true
    });

    var that = this;
    var location = longtitude + "," + latitude;
    let weatherparam = {
      location: location,
      key: 'f10d5759164d412f9dbcfc2312ea1374',
    };

    wx.request({
      url: 'https://devapi.qweather.com/v7/weather/now',
      data: weatherparam,
      header: {
        "content-type": "application/json"
      },
      method: 'GET',

      //查询成功
      success(data) {
        //console.log("今日天气", data);
        //关闭加载提示框
        wx.hideLoading();

        //解析数据
        var date = util.formatTime(new Date());
        var currentDate = date.substring(5, 7) + "月" + date.substring(8, 10) + "日";
        var weekday = util.getWeekByDate(date.substring(0, 10));
        var currentTemp = data.data.now.temp;
        var iconURL = that.getIconURL(data.data.now.text);
        var weatherDesc = data.data.now.text;
        var feelsLike = data.data.now.feelsLike;
        var win = data.data.now.windDir;
        var win_speed = data.data.now.windScale + "级";

        //今日天气信息
        var todayInfo = {};
        todayInfo.date = currentDate;
        todayInfo.week = weekday;
        todayInfo.currentTemp = currentTemp;
        todayInfo.iconURL = iconURL;
        todayInfo.type_feelsLike = '体感：' + feelsLike + "℃    " + weatherDesc;
        todayInfo.wind = win + win_speed;
        
        //以下两个是全局变量，在app.js中声明
        app.globalData.currentWeather = currentTemp;
        app.globalData.currentWea = weatherDesc;

        //3、查询逐小时预报
        //这里是为了确保得到currentTemp和weatherDesc后，再进行查询
        that.getHoursForecast(longtitude, latitude);

        that.setData({
          todayInfo: todayInfo,
          cityName: city,
          iconURL: iconURL,
        });
      },
      fail(data) {
        console.log("失败", data);
      }
    });
  },

  //2、查询空气质量
  getAirClass: function (longtitude, latitude){
    var that = this;
    var location = longtitude + "," + latitude;
    let weatherparam = {
      location: location,
      key: 'f10d5759164d412f9dbcfc2312ea1374',
    };

    wx.request({
      url: 'https://devapi.qweather.com/v7/air/now',
      data: weatherparam,
      header: {
        "content-type": "application/json"
      },
      method: 'GET',

      //查询成功
      success(data) {
        //console.log("今日空气质量", data);
        //判断空气质量等级
        var aqi = data.data.now.aqi;
        var airClass = data.data.now.category;
        var airColor = "";
        if (aqi <= 50) {
          airColor = "#00EE00";
        } else if (aqi > 50 && aqi <= 100) {
          airColor = "#EEEE00";
        } else if (aqi > 100 && aqi <= 150) {
          airColor = "#FF8C00";
        } else if (aqi > 150 && aqi <= 200) {
          airColor = "#FF3030";
        } else if (aqi > 200 && aqi <= 300) {
          airColor = "#E066FF";
        } else {
          airColor = "#8B0000";
        }

        that.setData({
          aqi: aqi,
          airClass: airClass,
          airColor: airColor,
        });
      },
      fail(data) {
        console.log("失败", data);
      }
    });
  },

  //3、查询逐小时预报
  getHoursForecast: function (longtitude, latitude) {
    var that = this;
    var location = longtitude + "," + latitude;
    let weatherparam = {
      location: location,
      key: 'f10d5759164d412f9dbcfc2312ea1374',
    };

    wx.request({
      url: 'https://devapi.qweather.com/v7/weather/24h',
      data: weatherparam,
      header: {
        "content-type": "application/json"
      },
      method: 'GET',

      //查询成功
      success(data) {
        //console.log("未来24小时天气", data);
        //通过JSON数组存储各小时的天气信息
        var hoursForecast = [];
        var jsonObj = {};
        jsonObj["hour"] = "现在";
        jsonObj["wea"] = that.getIconURL(app.globalData.currentWea);
        jsonObj["tem"] = app.globalData.currentWeather + "℃";
        hoursForecast.push(jsonObj);

        //获得今天小时预报
        for (var i = 0; i < data.data.hourly.length; i++) {
          var jsonObj = {};
          jsonObj["hour"] = data.data.hourly[i].fxTime.substring(11, 13) + "时";
          jsonObj["wea"] = that.getIconURL(data.data.hourly[i].text);
          jsonObj["tem"] = data.data.hourly[i].temp + "℃";
          hoursForecast.push(jsonObj);
        }

        that.setData({
          hoursForecast: hoursForecast,
        });
      },
      fail(data) {
        console.log("失败", data);
      }
    });
  },

  //4、查询未来6天天气
    getDaysForecast: function(longtitude, latitude) {
      var that = this;
      var location = longtitude + "," + latitude;
      let weatherparam = {
        location: location,
        key: 'f10d5759164d412f9dbcfc2312ea1374',
      };

      wx.request({
        url: 'https://devapi.qweather.com/v7/weather/7d?',
        data: weatherparam,
        header: {
          "content-type": "application/json"
        },
        method: 'GET',

        //查询成功
        success(data) {
          //console.log("未来6天天气", data);
          //今日的温度范围、湿度、日出日落
          var lowTemp = data.data.daily[0].tempMin;
          var highTemp = data.data.daily[0].tempMax;
          var humidity = data.data.daily[0].humidity;
          var temperatureRange_humidity = lowTemp + '~' + highTemp + '℃     ' + humidity + "%";
          var sunrise = data.data.daily[0].sunrise;
          var sunset = data.data.daily[0].sunset;

          //根据日出日落时间切换背景图片
          var date = util.formatTime(new Date()).substring(0, 10);
          var sunrise_time = new Date(date + ' ' + sunrise).getTime();
          var sunset_time = new Date(date + ' ' + sunset).getTime();
          var current_time = new Date().getTime();
          var background_src = "";
          if(current_time > sunrise_time && current_time < sunset_time){
            background_src = "../../pics/background_day.jpg";
          }
          else{
            background_src = "../../pics/background_night.jpg";
          }

          //通过JSON数组存储未来6天的天气信息
          var daysForecast = [];
          //获得每一天的预报
          for (var i = 1; i < data.data.daily.length; i++) {
            var jsonObj = {};
            jsonObj["week"] = util.getWeekByDate(data.data.daily[i].fxDate);
            jsonObj["wea"] = that.getIconURL(data.data.daily[i].textDay);
            jsonObj["desc"] = data.data.daily[i].textDay;
            jsonObj["tem"] = data.data.daily[i].tempMin + "~" + data.data.daily[i].tempMax + "℃";
            daysForecast.push(jsonObj);
          }

          that.setData({
            temperatureRange_humidity: temperatureRange_humidity,
            sunrise: sunrise,
            sunset: sunset,
            background_src: background_src,
            daysForecast: daysForecast,
          });
        },
        fail(data) {
          console.log("失败", data);
        }
      });
    },

  //天气图标路径
  getIconURL: function (weatherDesc) {
    var condition = String(weatherDesc);
    var url = "";
    if (condition.includes("转")) {
      condition = condition.substring(0, condition.indexOf("转"));
    }

    if (condition.includes("晴")) {
      url = "../../pics/sunny.png";
    } else if (condition.includes("多云")) {
      url = "../../pics/partly_cloudy.png";
    } else if (condition.includes("阴")) {
      url = "../../pics/cloudy.png";
    } else if (condition.includes("阵雨")) {
      url = "../../pics/shower.png";
    } else if (condition.includes("雷阵雨")) {
      url = "../../pics/stormy_rain.png";
    } else if (condition.includes("雨夹雪")) {
      url = "../../pics/snow_rain.png";
    } else if (condition.includes("小雨") || condition.includes("雨")) {
      url = "../../pics/light_rain.png";
    } else if (condition.includes("中雨")) {
      url = "../../pics/moderate_rain.png";
    } else if (condition.includes("大雨")) {
      url = "../../pics/heavy_rain.png";
    } else if (condition.includes("暴雨")) {
      url = "../../pics/rainstorm.png";
    } else if (condition.includes("阵雪")) {
      url = "../../pics/shower_snow.png";
    } else if (condition.includes("小雪") || condition.includes("雪")) {
      url = "../../pics/light_snow.png";
    } else if (condition.includes("中雪")) {
      url = "../../pics/moderate_snow.png";
    } else if (condition.includes("大雪")) {
      url = "../../pics/heavy_snow.png";
    } else if (condition.includes("暴雪")) {
      url = "../../pics/snow_storm.png";
    } else if (condition.includes("雾")) {
      url = "../../pics/fog.png";
    } else if (condition.includes("霾")) {
      url = "../../pics/haze.png";
    } else if (condition.includes("沙尘暴") || condition.includes("扬沙") || condition.includes("浮尘")) {
      url = "../../pics/dust_storm.png";
    } else {
      url = "../../pics/unknown.png";
    }
    return url;
  },

  //获得输入框中的文字
  inputing: function (e) {
    this.setData({
      inputCity: e.detail.value
    });
  },

  //查询按钮
  bindSearch: function () {
    var that = this;
    var city = this.data.inputCity;

    if (city == '') {
      wx.showModal({
        title: '提示',
        content: '请先输入要查询的城市名称',
        confirmText: '好的',
        confirmColor: '#ACB4E3',
        showCancel: false,
      });
    } else {
      let weatherparam = {
        location: city,
        key: 'f10d5759164d412f9dbcfc2312ea1374',
      };

      wx.request({
        url: 'https://geoapi.qweather.com/v2/city/lookup?',
        data: weatherparam,
        header: {
          "content-type": "application/json"
        },
        method: 'GET',

        success(data) {
          //console.log("查询坐标成功", data);
          if(data.data.code == '404'){
            wx.showModal({
              title: '提示',
              content: '输入的城市名称有误，请重新输入',
              confirmText: '好的',
              confirmColor: '#ACB4E3',
              showCancel: false,
            });
          }
          else{
            city = data.data.location[0].adm2;
            var longtitude = data.data.location[0].lon;
            var latitude = data.data.location[0].lat;

            that.getWeather(city, longtitude, latitude);
            that.getAirClass(longtitude, latitude);
            that.getHoursForecast(longtitude, latitude);
            that.getDaysForecast(longtitude, latitude);
          }
        },
        fail(data) {
          console.log("查询坐标失败", data);
        }
      });

      // 一键回到顶部
      this.setData({
        topNum: 0,
        inputCity: '',
      });
    }
  },

  //重置按钮
  bindReset: function () {
    this.onLoad();

    this.setData({
      topNum: 0,
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})