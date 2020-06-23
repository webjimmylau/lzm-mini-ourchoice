const app = getApp()
Page({
  data: {
    db: {},
    current: 0,
    city_name: ''
  },

  onLoad: function(o) {
    var page = this
    if(o.shopid && o.cityname) {
      page.setData({
        current: 0,
        city_name: o.cityname
      })
      page.getIndex(o.shopid);
      wx.setStorageSync("city_name", o.cityname);
    } else {
      try {
        var shop = wx.getStorageSync("shop");
        var city_name = wx.getStorageSync("city_name");
        if (shop && city_name) {
          page.setData({
            db: shop,
            current: 0,
            city_name: city_name
          })
          page.getIndex(page.data.db.id);
        } else {
          page.toBus()
        }
      } catch (e) {
        page.toBus()
      }
    }
  },

  onShow: function() {
    var page = this
    try {
      var shop = wx.getStorageSync("shop");
      var city_name = wx.getStorageSync("city_name");
      if (shop && city_name) {
        page.setData({
          db: shop,
          current: 0,
          city_name: city_name
        })
        page.getIndex(page.data.db.id);
      }
    } catch (e) {}
  },

  onShareAppMessage: function (res) {
    let db = this.data.db
    return {
      title: db.name || '纵购商城',
      path: '/pages/index/index?shopid=' + db.id + '&cityname=' + this.data.city_name,
      imageUrl: '/image/share.png'
    }
  },

  toBus() {
    wx.navigateTo({
      url: '/pages/business/business'
    })
  },

  toAd(e) {
    const item = e.currentTarget.dataset.item
    const shopid = e.currentTarget.dataset.shopid
    if (item.type == 0) {
      wx.navigateTo({
        url: '/pages/goods/goods?shopid=' + shopid + '&id=' + item.data + '&skuid=' + item.sku_id
      })
    } else if (item.type == 1) {
      wx.navigateTo({
        url: '/pages/search/search?category=' + item.data
      })
    } else if (item.type == 2) {
      wx.navigateTo({
        url: '/pages/promotion/promotion'
      })
    }

  },

  getIndex(id) {
    var page = this
    app.request({
      url: '/v1/shops/' + id,
      loading: true,
      success: function(res) {
        if (res.error_code == 0) {
          page.setData({
            db: res
          })
          try {
            wx.setStorageSync("shop", res);
          } catch (e) {}
        } else {
          page.setData({
            db: {}
          })
          try {
            wx.removeStorageSync('shop')
          } catch (e) { }
          page.toBus()
        }
      },
      complete: res => {
        wx.stopPullDownRefresh()
      }
    });
  },

  toSearch(e) {
    let val = e.currentTarget.dataset.val
    let key = e.currentTarget.dataset.key
    let name = e.currentTarget.dataset.name
    app.toSearch(key, val, name)
  },

  onPullDownRefresh: function() {
    this.getIndex(this.data.db.id);
  }

})