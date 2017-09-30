//index.js
//获取应用实例
var BMap = require('../../libs/bmap-wx.js');
var bak = 'vinFTrI4DisyXN3yHe3WZFO8oAiyB4ws';
var bmap = new BMap.BMapWX({
  ak: bak
});

const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    placeList: [],
    suggestList: [],
    hasSuggest: false,
    inputValue: "",
    allCount:{
      allDis: 0,
      allDur: 0,
      allDesc: ""
    }
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    console.log("onload")
    //从缓存读取数据
    var that = this
    wx.getStorage({
      key: 'placeList',
      success: function (res) {
        that.setData({
          placeList: res.data
        })
      },
    })

    wx.getStorage({
      key: 'allCount',
      success: function (res) {
        that.setData({
          allCount: res.data
        })
      },
    })

    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  getMapData: function (e) {

    var that = this;

    var fail = function (data) {
      console.log("bmap fail")
      console.log(data)
    };
    var success = function (data) {
      console.log("bmap success")
      console.log(data)
      that.setData({
        suggestList: data.result,
        hasSuggest: true
      })
    }

    try {
      bmap.suggestion({
        query: that.data.inputValue,
        region: "全国",
        city_limit: false,
        fail: fail,
        success: success
      })
    } catch (e) {
      console.log("bmap error")
      console.log(e)
    }

  },

  bindKeyInput: function (e) {
    this.setData({
      hasSuggest: false
    })
    this.setData({
      inputValue: e.detail.value
    })
    //console.log(this.data.inputValue)
  },

  savePlaceData: function () {
    this.countAll()
    try {
      console.log("同步数据到缓存")
      wx.setStorageSync("placeList", this.data.placeList)
      wx.setStorageSync("allCount", this.data.allCount)
    } catch (e) {
      console.log(e)
    }
  },

  moreInfo: function (e) {
    console.log(e)
    var tapIdArr = e.currentTarget.id.split("_")
    var tapId = tapIdArr[0]
    var selected = this.data.placeList[tapId]
    if (this.data.placeList[tapId].hidden == false) {
      this.data.placeList[tapId].hidden = true;
    } else {
      this.data.placeList[tapId].hidden = false
    }
    this.setData({
      placeList: this.data.placeList
    })
    console.log("moreInfo")
    console.log(selected)

  },

  caldis: function (src, des) {
    var that = this
    console.log(src)
    console.log(des)
    var srcPlace = this.data.placeList[src]
    var desPlace = this.data.placeList[des]
    var origin = "&origin=" + srcPlace.name + "|" + srcPlace.location.lat + "," + srcPlace.location.lng + "&origin_region=" + srcPlace.city
    var destination = "&destination=" + desPlace.name + "|" + desPlace.location.lat + "," + desPlace.location.lng + "&destination_region=" + desPlace.city
    var url = "https://api.map.baidu.com/direction/v1?mode=driving" + origin + destination + "&output=json&ak=" + bak
    console.log("请求URL:\n" + url)
    wx.request({
      url: url,
      success: function (res) {
        console.log(res)
        var traffic_condition = ""
        switch (res.data.result.traffic_condition) {
          case 1:
            traffic_condition = "畅通"
            break
          case 2:
            traffic_condition = "缓行"
            break
          case 3:
            traffic_condition = "无路况"
            break
        }
        console.log(res.data.result.routes[0])
        //格式化时间和距离
        res.data.result.routes[0].distance = (res.data.result.routes[0].distance / 1000).toFixed(2)
        res.data.result.routes[0].duration = (res.data.result.routes[0].duration / 60).toFixed(2)
        /**      
        var hour = 0
        var min = 0
        if (res.data.result.routes[0].duration>60){
          hour = Math.floor(res.data.result.routes[0].duration/60)
          min = (res.data.result.routes[0].duration%60).toFixed(0)
        }else{
          min = res.data.result.routes[0].duration
        }
        **/
        //路况
        res.data.result.routes[0].traffic_condition = traffic_condition
        //计算总里程

        //赋值
        that.data.placeList[des].taxi = res.data.result.routes[0]
        that.data.placeList[des].taxi.desc = that.durationToStr(res.data.result.routes[0].duration)

        that.setData({
          placeList: that.data.placeList,
        })
        that.savePlaceData()
      }
    })
  },

  countAll:function(){
    console.log("countAll")
    var alldis = 0;
    var alldur = 0;
    var alldesc = "";   
    if (this.data.placeList.length>1){
      alldis = this.data.placeList.filter(place => place.taxi != null).map(place => place.taxi.distance).reduce(function (a, b) { return Number(a) + Number(b); })
      alldur = this.data.placeList.filter(place => place.taxi != null).map(place => place.taxi.duration).reduce(function (a, b) { return Number(a) + Number(b); })
      alldesc = this.durationToStr(alldur)
    }

    this.setData({
      allCount:{
        alldis: alldis.toFixed(2),
        alldur: alldur.toFixed(0),
        alldesc: alldesc
      }
    })
    console.log(this.data)
  },

  durationToStr:function(duration){
    var hour = 0
    var min = 0
    if (duration > 60) {
      hour = Math.floor(duration / 60)
      min = (duration % 60).toFixed(0)
    } else {
      min = duration
      return (min + "min")
    }
     return (hour + "h" + min + "min")
  },


  suggestBindTap: function (e) {
    //根据id从suggest里面查找对应的对象
    console.log(e.currentTarget.id)
    var tapId = e.currentTarget.id
    var tapIdArr = e.currentTarget.id.split("_")
    var tapId = tapIdArr[0]
    var selected = this.data.suggestList[tapId]
    selected.hidden = false
    console.log(selected)

    var list = this.data.placeList
    var listId = list.length - 1;

    list.push(selected)

    if (listId > 0) {
      this.setData({
        hasPlace: true
      })
    }
    this.setData({
      placeList: list,
      suggestList: [],
      hasSuggest: false,
      inputValue: ""
    })
    //如果当前不是第一个节点，则计算跟第一个节点的距离和行驶时间
    if (list.length > 1) {
      this.caldis(listId, listId + 1)
    } else {
      this.savePlaceData()
    }
    console.log(this.data.placeList)
  },

  delPlace: function (e) {
    console.log(e);
    var tapIdArr = e.currentTarget.id.split("_")
    var tapId = tapIdArr[0]
    var delplace = this.data.placeList[tapId]
    var that = this
    wx.showModal({
      title: '提醒',
      content: '确认删除目的地[' + delplace.name + "]?",
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          var finalList = that.data.placeList

          finalList.splice(tapId, 1)
          if (tapId == 0 && finalList.length!=0) {
            finalList[0].taxi = null;
          }

          that.setData({
            placeList: finalList,
          })

         //删除节点后要重新计算删除节点后续节点的距离
         //删除之后tapId等于被删除节点后面的序号
          if (finalList.length > 1 
            && tapId < finalList.length
            && tapId > 0) {
            that.caldis(tapId-1, tapId)
          }else{
            that.savePlaceData()
          }
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
})
