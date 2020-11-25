// pages/test/test.js
//在onLoad中定位当前城市，然后通过getWeather(city)查询今日天气，通过getForecast(city)查询小时和未来天气

//获取应用实例
const app = getApp()
//调用百度地图天气API的js文件
var bmap = require('../../utils/bmap-wx-new.js');

var util = require('../../utils/util.js');

Page({
  //“分享”功能
  onShareAppMessage: function() {
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
          fail: function(res) {
            console.log(res)
          },
          complete: function(res) {
            console.log(res)
          }
        })
      },
      fail: function(res) {
        console.log(res)
      }
    }
  },

  /**
   * 页面的初始数据
   */
  data: {
    currentWeather: {},
    inputCity: "",
    topNum: 0,
    scroll_height: 0,
    todayInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;

    let windowHeight = wx.getSystemInfoSync().windowHeight // 屏幕的高度
    let windowWidth = wx.getSystemInfoSync().windowWidth // 屏幕的宽度
    that.setData({
      scroll_height: windowHeight * 750 / windowWidth
    });

    var BMap = new bmap.BMapWX({
      ak: 'sNrVzv0oHrkXfYyo08gUkMyQRWxzUcgU'
    });

    var fail = function(data) {
      console.log(data)
    };
    var success = function(data) {
      var city = data.originalData.result.addressComponent.city;
      //城市名称不能带“市”
      city = city.substring(0, city.length - 1);
      console.log("定位城市：", city);

      //调用查询天气函数
      //that.getWeather(city);
      that.getForecast(city);
    };
    BMap.regeocoding({
      fail: fail,
      success: success,
    });
  },


  //获得当天信息
  getWeather: function(cityName) {
    var that = this;

    //提示“加载中”
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      mask: true
    });

    //version=v6&appid=84411527&appsecret=G2CNv72f
    let weatherparam = {
      version: 'v6',
      city: cityName,
      appid: '84411527',
      appsecret: 'G2CNv72f'
    };

    wx.request({
      url: 'https://tianqiapi.com/api',
      data: weatherparam,
      header: {
        "content-type": "application/json"
      },
      method: 'GET',

      //查询成功
      success(data) {
        console.log("今日天气", data);

        //关闭加载提示框
        wx.hideLoading();

        //解析数据
        var currentDate = data.data.date.substring(5, 10); //2020-11-21
        var weekday = data.data.week; //星期六
        var highTemp = data.data.tem1;
        var lowTemp = data.data.tem2;
        var humidity = data.data.humidity;
        var iconURL = that.getIconURL(data.data.wea);
        var win = data.data.win;
        var win_speed = data.data.win_speed;

        //判断空气质量等级
        var pm25 = data.data.air_pm25;
        var airClass = data.data.air_level;
        var airColor = "";
        if (pm25 <= 50) {
          airColor = "#00EE00";
        } else if (pm25 > 50 && pm25 <= 100) {
          airColor = "#EEEE00";
        } else if (pm25 > 100 && pm25 <= 150) {
          airColor = "#FF8C00";
        } else if (pm25 > 150 && pm25 <= 200) {
          airColor = "#FF3030";
        } else if (pm25 > 200 && pm25 <= 300) {
          airColor = "#E066FF";
        } else {
          airColor = "#8B0000";
        }

        //今日天气信息
        var todayInfo = {};
        todayInfo.date = that.getFormattedDate(currentDate);
        todayInfo.week = that.getFormattedWeek(weekday);
        todayInfo.currentTemp = data.data.tem;
        todayInfo.temperatureRange_humidity = "最低" + lowTemp + "℃  " + "最高" + highTemp + "℃  " + "湿度" + humidity;
        todayInfo.weatherDesc = data.data.wea;
        todayInfo.wind = that.getWind(win, win_speed);
        todayInfo.pm25 = pm25;
        todayInfo.update_time = data.data.update_time.substring(11, 19);

        that.setData({
          todayInfo: todayInfo,
          cityName: cityName,
          iconURL: iconURL,
          airClass: airClass,
          airColor: airColor,
        });
      },
      fail(data) {
        console.log("失败", data);
      }
    });
  },


  //获得未来6天的天气
  getForecast: function(cityName) {
    //提示“加载中”
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      mask: true
    });

    var that = this;

    //version=v6&appid=84411527&appsecret=G2CNv72f
    let weatherparam = {
      version: 'v1',
      city: cityName,
      appid: '84411527',
      appsecret: 'G2CNv72f'
    };

    wx.request({
      url: 'https://tianqiapi.com/api',
      data: weatherparam,
      header: {
        "content-type": "application/json"
      },
      method: 'GET',

      //查询成功
      success(data) {
        console.log("未来天气", data);

        //关闭加载提示框
        wx.hideLoading();

        //1、解析今日天气数据
        var currentDate = data.data.data[0].date.substring(5, 10); //2020-11-21
        var weekday = data.data.data[0].week; //星期六
        var currentTemp = data.data.data[0].tem;
        var highTemp = data.data.data[0].tem1;
        var lowTemp = data.data.data[0].tem2;
        var humidity = data.data.data[0].humidity;
        var iconURL = that.getIconURL(data.data.data[0].wea);
        var win = data.data.data[0].win[0];
        var win_speed = data.data.data[0].win_speed;
        //判断空气质量等级
        var pm25 = data.data.data[0].air;
        var airClass = data.data.data[0].air_level;
        var airColor = "";
        if (pm25 <= 50) {
          airColor = "#00EE00";
        } else if (pm25 > 50 && pm25 <= 100) {
          airColor = "#EEEE00";
        } else if (pm25 > 100 && pm25 <= 150) {
          airColor = "#FF8C00";
        } else if (pm25 > 150 && pm25 <= 200) {
          airColor = "#FF3030";
        } else if (pm25 > 200 && pm25 <= 300) {
          airColor = "#E066FF";
        } else {
          airColor = "#8B0000";
        }

        //今日天气信息汇总
        var todayInfo = {};
        todayInfo.date = that.getFormattedDate(currentDate);
        todayInfo.week = that.getFormattedWeek(weekday);
        todayInfo.currentTemp = currentTemp.substring(0, currentTemp.length - 1);
        todayInfo.temperatureRange_humidity = "最低" + lowTemp + "  " + "最高" + highTemp + "  " + "湿度" + humidity + "%";
        todayInfo.weatherDesc = data.data.data[0].wea;
        todayInfo.wind = that.getWind(win, win_speed);
        todayInfo.pm25 = pm25;
        todayInfo.update_time = data.data.update_time.substring(11, 19);

        //2、解析小时天气数据
        //当前时间
        var time = util.formatTime(new Date());
        var currentDate = time.substring(8, 10);
        var currentHour = time.substring(11, 13);

        var hoursForecast = [];
        var jsonObj = {};
        jsonObj["day"] = "现在";
        jsonObj["wea"] = that.getIconURL(todayInfo.weatherDesc);
        jsonObj["tem"] = todayInfo.currentTemp + "℃";
        hoursForecast.push(jsonObj);

        //获得今天小时预报
        for (var i = 0; i < data.data.data[0].hours.length; i++) {
          //大于当前小时才显示
          if (parseInt(data.data.data[0].hours[i].day.substring(3, 5)) > parseInt(currentHour)) {
            var jsonObj = {};
            jsonObj["day"] = data.data.data[0].hours[i].day;
            jsonObj["wea"] = that.getIconURL(data.data.data[0].hours[i].wea);
            jsonObj["tem"] = data.data.data[0].hours[i].tem;
            hoursForecast.push(jsonObj);
          }
        }
        //明天的小时预报
        for (var i = 0; i < data.data.data[1].hours.length; i++) {
          var jsonObj = {};
          jsonObj["day"] = data.data.data[1].hours[i].day;
          jsonObj["wea"] = that.getIconURL(data.data.data[1].hours[i].wea);
          jsonObj["tem"] = data.data.data[1].hours[i].tem;
          hoursForecast.push(jsonObj);
        }

        //3、解析未来6天的天气数据
        var forecast = new Array(6);
        for (var i = 0; i < 6; i++) {
          forecast[i] = data.data.data[i + 1];
          forecast[i].wea = that.getIconURL(forecast[i].wea);
          forecast[i].tem = that.getTemperatureRange(forecast[i].tem2.substring(0, forecast[i].tem2.length - 1), forecast[i].tem1.substring(0, forecast[i].tem1.length - 1));
        }

        that.setData({
          todayInfo: todayInfo,
          cityName: cityName,
          iconURL: iconURL,
          airClass: airClass,
          airColor: airColor,
          hoursForecast: hoursForecast,
          forecast: forecast,
        });
      },

      fail(data) {
        console.log("失败", data);
      }
    });
  },

  //格式化日期
  getFormattedDate: function(date) {
    var month = date.substring(0, 2);
    var day = date.substring(3, 5);
    var today = month + "月" + day + "日";
    return today;
  },

  //格式化周几
  getFormattedWeek: function(week) {
    var week = "星期" + week.substring(2, 3);
    return week;
  },

  //温度范围
  getTemperatureRange: function(low, high) {
    return low + " ~ " + high + "℃";
  },

  //天气图标路径
  getIconURL: function(weatherDesc) {
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

  //风力
  getWind: function(win, win_speed) {
    return win + win_speed;
  },

  //获得输入框中的文字
  inputing: function(e) {
    this.setData({
      inputCity: e.detail.value
    });
  },

  //查询按钮
  bindSearch: function() {
    if (this.data.inputCity == '') {
      wx.showModal({
        title: '提示',
        content: '请先输入要查询的城市名称',
        confirmText: '好的',
        confirmColor: '#ACB4E3',
        showCancel: false,
      });
    } else {
      //查询天气
      //this.getWeather(this.data.inputCity);
      this.getForecast(this.data.inputCity);

      // 一键回到顶部
      this.setData({
        topNum: 0,
        inputCity: '',
      });
    }
  },

  bindReset: function() {
    this.onLoad();

    this.setData({
      topNum: 0,
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})