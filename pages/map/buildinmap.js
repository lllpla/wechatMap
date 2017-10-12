// pages/map/buildinmap.js

const app = getApp()
var wxMarkerData = [];
var BMap = require('../../libs/bmap-wx.js');
var bak = 'vinFTrI4DisyXN3yHe3WZFO8oAiyB4ws';
var bmap = new BMap.BMapWX({
  ak: bak
});


Page({

  /**
   * 页面的初始数据
   */
  data: {
    markers: [],
    pois: [],
    latitude: '',
    longitude: '',
    rgcData: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wxMarkerData = app.globalData.wxMapData.wxMarkerData[0];
    console.log(wxMarkerData)
    var j = 1;
    var pois = app.globalData.wxMapData.originalData.result.pois
    var markers = [];

    var markerData = {
      id: 0,
      latitude: wxMarkerData.latitude,
      longitude: wxMarkerData.longitude,
      address: wxMarkerData.address,
      name: wxMarkerData.desc,
    }
    markers.push(markerData)

    for (var i = 0; i < pois.length; i++ , j++) {
      var marker = {
        id: j,
        latitude: pois[i].point.y,
        longitude: pois[i].point.x,
        address: pois[i].addr,
        name: pois[i].name,
      }
      markers.push(marker)
    }


    console.log(markers)
    this.setData({
      markers: markers,
      pois: app.globalData.wxMapData.originalData.result.pois
    });
    this.setData({
      latitude: wxMarkerData.latitude
    });
    this.setData({
      longitude: wxMarkerData.longitude
    });
    this.showSearchInfo(markers, 0);
  },
  makertap: function (e) {
    var that = this;
    var id = e.markerId;
    console.log(e.markerId)
    that.showSearchInfo(that.data.markers, id);
  },

  showSearchInfo: function (data, i) {
    var that = this;
    that.setData({
      rgcData: {
        address: data[i].address,
        desc: data[i].name,
      }
    });
  },
  makesure: function () {
    var that = this;
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];  //上一个页面
    console.log(that.data)
    that.getMapData(prevPage,that.data.rgcData.desc)
    wx.navigateBack()
  },

  //通过点击图标获得的地址将直接更新到前页面的【目的地列表】中
  getMapData: function (that,desc) {
    console.log("getMapData："+desc)
    var fail = function (data) {
      console.log("bmap fail")
      console.log(data)
    };
    var success = function (data) {
      console.log("bmap success")
      console.log(data)
      var list = that.data.placeList
      var listId = list.length - 1
      data.result[0].hidden = true
      list.push(data.result[0])
      if (listId > 0) {
        that.setData({
          hasPlace: true
        })
      }
      that.setData({
        placeList: list,
        suggestList: [],
        hasSuggest: false,
        inputValue: ""
      })
      //如果当前不是第一个节点，则计算跟第一个节点的距离和行驶时间
      if (list.length > 1) {
        that.caldis(listId, listId + 1)
      } else {
        that.savePlaceData()
      }
      console.log(that.data.placeList)
    }

    try {
      bmap.suggestion({
        query: desc,
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



})