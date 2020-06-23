const app = getApp()
Component({
  properties: {
    name: {
      type: String
    },
    logo: {
      type: String
    },
    favorited: {
      type: Number
    },
    shopid: {
      type: Number
    }
  },
  methods: {
    handleFavorites(e) {
      var page = this
      var id = e.currentTarget.dataset.shopid

      if (page.data.favorited == 0) {
        app.request({
          url: '/v1/buyer/favorites',
          header: {
            'content-type': 'application/json'
          },
          method: 'POST',
          data: {
            favorites: [{
              type: 1,
              shop_id: id
            }]
          },
          success: function(res) {
            if (res.error_code == 0) {
              page.setData({
                favorited: true
              })
              try {
                var shop = wx.getStorageSync("shop");
                shop.favorited = 1
                wx.setStorageSync("shop", shop)
              } catch (e) { }

              wx.showToast({
                title: '收藏成功',
                icon: 'none'
              });

              page.triggerEvent('favclick', {
                id: id,
                fav: false,
              });

            } else {
              wx.showToast({
                title: res.message,
                icon: 'none'
              });
            }
          }
        });
      } else {
        app.request({
          url: '/v1/buyer/favorites/delete',
          header: {
            'content-type': 'application/json'
          },
          method: 'POST',
          data: {
            favorites: [{
              type: 1,
              shop_id: id
            }]
          },
          success: function(res) {
            if (res.error_code == 0) {
              page.setData({
                favorited: false
              })
              try {
                var shop = wx.getStorageSync("shop");
                shop.favorited = 0
                wx.setStorageSync("shop", shop)
              } catch (e) { }
              wx.showToast({
                title: '您已取消关注该店铺',
                icon: 'none'
              });

              page.triggerEvent('favclick', {
                id: id,
                fav: true,
              });

            } else {
              wx.showToast({
                title: res.message,
                icon: 'none'
              });
            }
          }
        });
      }

    }
  }
})