var api = require('./utils/api.js');
var { toast } = require('./utils/util.js');
App({
  onLaunch: function() {
    try {
      var value = wx.getStorageSync('api')
      if (api == value) {
        this.globalData.token = wx.getStorageSync("access_token");
        this.globalData.userInfo = wx.getStorageSync("userInfo");
      } else {
        try {
          wx.clearStorageSync()
          wx.setStorage({ key: "api", data: api })
        } catch (e) {
          wx.clearStorage({success(res) {wx.setStorage({ key: "api", data: api })}
          })
        }
      }
    } catch (e) {}

    const updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
    })

    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '小程序即将重启更新功能',
        success: function (res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })

    updateManager.onUpdateFailed(function () {
      // 新版本下载失败
    })

  },

  login: function(obj) {
    var pages = getCurrentPages();
    var page = pages[(pages.length - 2)];
    var that = this;
    wx.login({
      success: res => {
        const codes = res.code
        if (codes) {

          wx.getUserInfo({
            success: function (ress) {

              getApp().request({
                url: '/v1/buyer/login',
                method: "post",
                data: {
                  code: codes,
                  encrypted_data: ress.encryptedData,
                  iv: ress.iv
                },
                success: v => {
                  if (v.error_code == 0) {
                    var token = 'Bearer ' + v.token
                    var info = {
                      avatarUrl: v.avatar_url,
                      nickName: v.nick_name,
                      company_name: v.company_name
                    }
                    that.globalData.token = token;
                    wx.setStorageSync("access_token", token);
                    wx.setStorageSync("userInfo", info);
                    that.globalData.userInfo = info;
                    if (obj.success) obj.success(v);
                    if (page == undefined) {
                      return;
                    }
                    wx.navigateBack()
                  } else if (v.error_code == 6028) { // 当前微信用户未注册，请先注册。
                    if (obj.success) obj.success(v);
                  } else {
                    toast(v.message)
                  }
                },
                complete: res => {
                  if (obj.complete) obj.complete();
                }
              });
            }
          })
        } else {
          toast('登录失败')
        }
      },
      complete: function() {
        wx.hideNavigationBarLoading()
      }
    });
  },

  request: function(object) {
    if (object.header) {
      object.header.Accept = 'application/x.ourchoice.v1+json';
    }
    var access_token = getApp().globalData.token || wx.getStorageSync("access_token");
    if (access_token && object.header) {
      object.header.Authorization = access_token;
    }

    if (object.loading) wx.showNavigationBarLoading()
    wx.request({
      url: api + object.url,
      header: object.header || {
        'Authorization': access_token || '',
        'Accept': 'application/x.ourchoice.v1+json',
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: object.data || {},
      method: object.method || "GET",
      dataType: object.dataType || "json",
      success: res => {
        let tokens = res.header && res.header.Authorization
        if (tokens) {
          wx.setStorageSync("access_token", tokens);
          getApp().globalData.token = tokens;
        } 
        if (res.data.error_code == 401) {
          var pages = getCurrentPages(); 
          var route = pages[pages.length - 1].route
          if (route == 'pages/cart/cart' || route == 'pages/order/order' || route == 'pages/user/user'){
            if (object.success) object.success(res.data);
          } else {
            this.toLogin('token')
          }

        } else if (res.data.error_code == 500) {
          toast('服务器暂时无法工作，请联系管理员')
        } else {
          if (object.success) object.success(res.data);
        }
      },
      fail: res => {
        toast('网络错误')
        if (object.fail)
          object.fail(res);
      },
      complete: res => {
        if (object.loading) wx.hideNavigationBarLoading()
        if (object.complete)
          object.complete(res);
      }
    });
  },

  toLogin(v) {
    var page = this;
    if (page.globalData.isLogin) {
      return
    }
    page.globalData.isLogin = true
    wx.navigateTo({
      url: '/pages/login/login?o=' + v,
      complete: function() {
        setTimeout(function() {
          page.globalData.isLogin = false
        }, 500)
      }
    })
  },

  toSearch(key, val, name) {
    var page = this
    wx.navigateTo({
      url: '/pages/search/search?' + key + '=' + val + (name ? '&name=' + name : '') ,
      success: function(res) {
        try {
          wx.setStorageSync('searchQuery', {
            key: val
          })
        } catch (e) {}
      }
    })
  },

  globalData: {
    userInfo: null,
    token: null,
    isLogin: false,
    orderId: null
  }
})