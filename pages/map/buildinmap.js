// pages/map/buildinmap.js

const app = getApp()
var wxMarkerData = []; 

Page({

  /**
   * 页面的初始数据
   */
  data: {
    markers: [],
    pois:[],
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

    for (var i = 0; i < pois.length;i++,j++){
      var marker = {
        id:j,
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
        address:data[i].address,
        desc:data[i].name,
      }
    });
  },
  makesure: function(){
    var that = this;
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];  //上一个页面
    console.log(that.data)
    prevPage.setData({
      inputValue: that.data.rgcData.desc
    })
    wx.navigateBack()
  }
})