'use strict';
const app = getApp()
var { toast } = require('../../utils/util.js');
Component({
  properties: {
    item: {
      type: Object,
    },
    index: {
      type: Number,
      value: "",
    },
    showLine: {
      type: Boolean,
      value: true,
    }
  },

  data: {
    favorites: true
  },

  observers: {
    'item': function(v, o) {
      this.setData({
        favorites: v.favorited == 0
      })
    }
  },

  methods: {
    handleTabClick(e) {
      var id = e.currentTarget.dataset.id;
      this.getIndex(id)
    },

    getIndex(id) {
      var page = this
      app.request({
        url: '/v1/shops/' + id,
        loading: true,
        success: function(res) {
          if (res.error_code == 0) {
            try {
              page.triggerEvent('tabclick', res);
              wx.setStorageSync("shop", res);
              wx.switchTab({
                url: `/pages/index/index`
              })
            } catch (e) {
              toast('走神了，请重新进店')
            }
          } else {
            toast(res.message)
          }
        }
      });
    },

    handleFavorites(e) {
      var page = this
      var id = e.currentTarget.dataset.id;
      var favorites = e.currentTarget.dataset.favorites

      if (page.data.favorites) {
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
                favorites: false
              })
              toast('收藏成功')
              page.triggerEvent('favclick', {
                id: id,
                fav: false,
              });

            } else {
              toast(res.message)
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
                favorites: true
              })
              toast('取消收藏成功')
              page.triggerEvent('favclick', {
                id: id,
                fav: true,
              });

            } else {
              toast(res.message)
            }
          }
        });
      }

    }

  }
});