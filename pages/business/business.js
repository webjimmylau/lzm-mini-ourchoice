var app = getApp();
Page({
  data: {
    loading: false,
    location: false,
    shops: [],
    city_name: null,
    business_areas: [],
    key:'',
    noCityName: ''
  },

  onShow () {
    var page = this;
    page.getLA();
  },

  bindKeyInput(e) {
    this.setData({
      key: e.detail.value
    })
  },

  cities(latitude, longitude){ //  热门商圈
    var page = this, db
    if (latitude) db = { longitude: longitude, latitude: latitude }
    app.request({
      url: '/v1/cities',
      data: db,
      success: function (res) {
        if (res.error_code == 0) {
          page.setData({
            business_areas: res.shop_business_cities
          });
        } else {
          page.setData({
            business_areas: []
          });
        }
      }
    });
  },

  bindtap(e) { //  热门商圈
    this.setData({
      key: '',
      noCityName: e.currentTarget.dataset.name
    })
    this.getBusiness(e.currentTarget.dataset.id)
  },
  
  searchCancel(){
    this.setData({
      key: ''
    })
    this.getLA()
  },

  getLA () {
    var page = this;
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        page.setData({ location: true })
        page.getBusiness(null,res.latitude, res.longitude)
        page.cities(res.latitude, res.longitude)
      },
      fail(e) {
        page.setData({ location: false })
        page.getBusiness()
        page.cities()
      }
    })
  },

  inputConfirm: function (e) { // 搜索
    const val = e.detail.value
   if(val == undefined || val == ''){
     wx.showToast({
       title: '请输入城市名称或店铺名称进行搜索',
       icon: 'none'
     });
     return
   }
    this.setData({
      key: val
    })
    this.getBusiness()
  },

  tabclick(e){
    try {
      wx.setStorageSync("city_name", this.data.city_name || e.detail.city_name);
    } catch (e) {}
    
  },

  getBusiness: function (id, latitude, longitude) {
    var page = this;
    var db = {}
    if (id) db.city_id = id;
    if (this.data.key) db.key = this.data.key;
    if (latitude) db = { longitude: longitude, latitude: latitude }

    app.request({
      url: '/v1/shops',
      data: db,
      loading: true,
      success: function (res) {
        if (res.error_code == 0) {
          page.setData({
            shops: res.shops,
            city_name: res.city_name
          });
        } else {
          page.setData({
            shops: []
          });
        }
      },
      complete: function () {
        page.setData({
          loading: true
        })
      }
    });
  }

})