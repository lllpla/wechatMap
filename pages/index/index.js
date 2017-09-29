//index.js
//获取应用实例
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
// 实例化qq地图核心类
var qqmap = new QQMapWX({
  key: '2U5BZ-VCCRX-KRG4H-TCQMG-M3UW6-HTFAG' // 必填
});

const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    placeList: [],
    suggestList:[],
    hasSuggest:false,
    inputValue:""
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
      success: function(res) {
        that.setData({
          placeList:res.data
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
    qqmap.getSuggestion({
      keyword: that.data.inputValue,
      success: function (res) {
        that.setData({
          hasSuggest:true,
          suggestList:res.data
        })
        console.log(res);
      },
      fail: function (res) {
        console.log(res);
      },
      complete: function (res) {
        console.log(res);
      }
    })
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

  savePlaceData:function(){
    try{
      console.log("同步数据到缓存")
      wx.setStorageSync("placeList", this.data.placeList)
    }catch(e){
      console.log(e)
    }
  },

  moreInfo:function(e){
    console.log(e)
    var tapIdArr = e.currentTarget.id.split("_")
    var tapId = tapIdArr[0]
    var selected = this.data.placeList[tapId]
    if (this.data.placeList[tapId].hidden == false){
      this.data.placeList[tapId].hidden = true;
    }else{
      this.data.placeList[tapId].hidden = false
    }
    this.setData({
      placeList: this.data.placeList
    })
    console.log("moreInfo")
    console.log(selected)

  },

  caldis:function(src,des){
    var that = this
    console.log(src)
    console.log(des)
    var distance = 0
    var duration = 0
    try{
      qqmap.calculateDistance({
        mode: "driving",
        from: {
          latitude: that.data.placeList[src].location.lat,
          longitude: that.data.placeList[src].location.lng
        },
        to: [{
          latitude: that.data.placeList[des].location.lat,
          longitude: that.data.placeList[des].location.lng
        }],
        success: function (res) {
          console.log(res.result.elements[0]);
          that.data.placeList[des].distance = (res.result.elements[0].distance / 1000).toFixed(2)
          that.data.placeList[des].duration = (res.result.elements[0].duration / 60).toFixed(2)
          that.setData({
            placeList: that.data.placeList
          })
          that.savePlaceData()
        },
        fail: function (res) {
          //console.log(res);
        },
        complete: function (res) {
          //console.log(res);
        }

      })
    }catch(e){

    }
  },

  suggestBindTap: function(e){
    //根据id从suggest里面查找对应的对象
    console.log(e.currentTarget.id)
    var tapIdArr = e.currentTarget.id.split("_")
    var tapId = tapIdArr[0]
    var selected = this.data.suggestList[tapId]
    selected.hidden = true
    console.log(selected)
    var list = this.data.placeList
    
    list.push(selected)
    
    this.setData({
      placeList:list,
      suggestList: [],
      hasSuggest: false,
      inputValue:""
    })
    //如果当前不是第一个节点，则计算跟第一个节点的距离和行驶时间
    if (list.length > 1) {
      this.caldis(tapId - 1, tapId)
    }else{
      this.savePlaceData()
    }
    console.log(this.data.placeList)
  },

  delPlace:function(e){
    console.log(e);
    var tapIdArr = e.currentTarget.id.split("_")
    var tapId = tapIdArr[0]
    var delplace = this.data.placeList[tapId]
    var that = this
    wx.showModal({
      title: '提醒',
      content: '确认删除目的地[' + delplace.title+"]?",
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          var finalList = that.data.placeList
          finalList.splice(tapId,1)
          that.setData({
            placeList: finalList,
          })
          that.savePlaceData()
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
    
  },
})
