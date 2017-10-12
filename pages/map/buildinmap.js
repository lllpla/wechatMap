// pages/map/buildinmap.js

const app = getApp()
var wxMarkerData = [];
var BMap = require('../../libs/bmap-wx.js');
var bak = 'vinFTrI4DisyXN3yHe3WZFO8oAiyB4ws';
var bmap = new BMap.BMapWX({
  ak: bak
});


var QQMapWX = require('../../libs/qqmap-wx-jssdk.min.js');
var qqkey = "2U5BZ-VCCRX-KRG4H-TCQMG-M3UW6-HTFAG"
var qqmapwx = new QQMapWX({
  key: qqkey
})


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
    wxMarkerData = app.globalData.wxMapData
    console.log(wxMarkerData)
    var pois = wxMarkerData.pois
    var markers = [];

    for (var i = 0; i < pois.length; i++ ) {
      var marker = {
        id: i,
        latitude: pois[i].location.lat,
        longitude: pois[i].location.lng,
        address: pois[i].address,
        name: pois[i].title,
      }
      markers.push(marker)
    }


    console.log(markers)
    this.setData({
      markers: markers,
      pois: pois
    });
    this.setData({
      latitude: wxMarkerData.location.lat
    });
    this.setData({
      longitude: wxMarkerData.location.lng
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

    var fail = function (res) {
      console.log("bmap fail")
      console.log(res)
    };
    var success = function (res) {
      console.log("qqmap success")
      console.log(res.data)
      var result = res.data[0]
      for(var i=0;i<res.data.length;i++){
        if(res.data[i].title == desc){
          result = res.data[i]
          break;
        }
      }

      var list = that.data.placeList
      var listId = list.length - 1
      result.hidden = true
      list.push(result)
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
    }

    try {
      qqmapwx.getSuggestion({
        keyword: desc,
        region: "全国",
        fail: fail,
        success: success
      })
    } catch (e) {
      console.log("bmap error")
      console.log(e)
    }
  },



})