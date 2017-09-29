//index.js
//获取应用实例
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');


const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    placeList: [],
    hasPlace:false,
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
    // 实例化API核心类
    var qqmap = new QQMapWX({
      key: '2U5BZ-VCCRX-KRG4H-TCQMG-M3UW6-HTFAG' // 必填
    });
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
    console.log(this.data.inputValue)
  },

  suggestBindType: function(e){
    //根据id从suggest里面查找对应的对象
    console.log(e.currentTarget.id)
    var tapId = e.currentTarget.id
    var selected = this.data.suggestList[tapId]
    console.log(selected)
    
    var list = this.data.placeList
    list.push(selected)
    
    if (list.length>0){
      this.setData({
        hasPlace:true
      })
    }
    this.setData({
      placeList:list,
      suggestList: [],
      hasSuggest: false,
      inputValue:""
    })
    console.log(this.data.placeList)
  },

  delPlace:function(e){
    console.log(e);
    var id = e.currentTarget.id
    var delplace = this.data.placeList[id]
    var that = this
    wx.showModal({
      title: '提醒',
      content: '确认删除目的地[' + delplace.title+"]?",
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          var finalList = that.data.placeList
          var haslist = true
          finalList.splice(id,1)
          if(finalList.length == 0){
            haslist = false
          }
          that.setData({
            placeList: finalList,
            hasPlace:haslist
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  },
})
