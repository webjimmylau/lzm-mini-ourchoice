var app = getApp();
var {
  toast
} = require('../../utils/util.js');
var timerSerch = null
Page({
  data: {
    showBox: -1, // 当前页面显示
    db: {},
    city_name: '',
    popupShow: false, // 购物窗显示
    goodsid: null, // 购物窗id
    value: '',
    lists: [], // 商品列表数据
    options: {}, // 筛选数据
    sortIdx: 0,
    isCheckShow: false, // 排序窗显示
    checkList: [{
        id: 0,
        name: '综合排序'
      },
      {
        id: 1,
        name: '价格最低'
      },
      {
        id: 2,
        name: '价格最高'
      },
      {
        id: 3,
        name: '最新发布'
      }
    ],
    searchHistory: [], // 最近搜索数据
    searchHot: [], // 热搜数据
    suggestions: [], // 联想数据
    searchQuery: {}, // 搜索数据
    oldQuery: {}, // 搜索旧数据
    loadingDb: false, // 加载中
    sornShow: false, // 筛选高亮
    focus: false, // 聚焦
    loading: false, // 分页加载中
    pageNum: 1, // 当前分页
    noMore: false, // 是否分页
    contentScrollTop: 0, // 返顶
  },

  bindclear(e) {
    this.setData({
      showBox: 1
    })
    this.setTitle()
  },

  setTitle(v) {
    if(v) {
      this.setNav(v)
    } else {
      try {
        var shop = wx.getStorageSync("shop");
        this.setNav(shop.name)
      } catch (e) {}
    }
  },

  setNav (v){
    wx.setNavigationBarTitle({
      title: v
    });
  },

  bindfocus(e) { // 焦点
    this.getSuggestions(e.detail.value, 'focus')
  },
  bindinput(e) { // 联想
    this.getSuggestions(e.detail.value, 'input')
  },
  getSuggestions(key, o) {
    let page = this;
    page.setData({
      showBox: key == '' ? 1 : 3
    });

    if (key == '') page.setTitle()

    clearTimeout(timerSerch);
    timerSerch = setTimeout(function() {
      app.request({
        url: '/v1/shops/' + page.data.db.id + '/suggestions',
        data: {
          key: key
        },
        success: function(res) {
          if (page.data.showBox == 2) return
          if (res.error_code == 0) {
            page.setData({
              suggestions: res.suggestions,
              showBox: key == '' ? 1 : 3
            });
            if (key == '') page.setTitle()
          } else {
            page.setData({
              suggestions: [],
              showBox: 1
            });
            page.setTitle()
          }

          
        }
      });
    }, 500)
  },

  selectResult: function(e) { // 点击联想列表
    const key = e.detail.item.name
    this.startQuery(key)
    this.productList()
  },
  startQuery(key) {
    this.setData({
      value: key,
      searchQuery: {},
      sortIdx: 0,
      pageNum: 1,
      sornShow: false,
      loadingDb: true,
    })

    if (key) {
      this.setTitle(key)
    }
    
    wx.removeStorageSync('sortOn')
    this.storage(key)
  },

  onLoad(o) {
    let page = this;
    try {
      // 删除筛选
      wx.removeStorageSync('sortOn')
      var shop = wx.getStorageSync('shop')
      if (shop) {
        page.setData({
          db: shop
        })
      } else {
        wx.switchTab({
          url: `/pages/index/index`
        })
      }
      // 取最近
      page.storage()
      // 获取热搜
      page.getTops(shop.id)
      // 初始化搜索数据
      page.setData({
        searchQuery: o,
        oldQuery: o,
        sornShow: false
      })

      if (o.soso) {
        // 首页头部搜索 查找商品头部搜索 soso 空
        page.setData({
          focus: true,
          showBox: 1
        })
        return
      }
      // searchQuery：
      // 1首页搜索（聚焦）category  
      // 2首页自定义分类 category，
      // 3首页全部商品  空购物车 page；
      // 4查找商品一，二级分类 category；

      // 列表数据
      if (o.category || o.page) { // 首页分类 空购物车
        page.setData({
          focus: false,
          showBox: 2,
          loadingDb: true
        })
        page.setTitle(o.name || o.key || '全部商品')
        page.productList()
      }
    } catch (e) {}
  },

  onShow() {
    let page = this
    try {
      var shop = wx.getStorageSync('shop')
      var sortOn = wx.getStorageSync('sortOn')
      var city_name = wx.getStorageSync('city_name')
      if (shop) {
        page.setData({
          db: shop,
          city_name: city_name
        })
      }
      var arr = Object.keys(sortOn); // 筛选
      page.setData({
        searchQuery: arr.length > 0 ? sortOn : page.data.oldQuery,
        sornShow: arr.length > 0 && true || false
      })
      if (page.data.loadingDb || page.data.focus || page.data.pageNum > 1) return
      page.productList()

    } catch (e) {}
  },

  // 热搜
  getTops(id) {
    let page = this
    app.request({
      url: '/v1/shops/' + id + '/search/tops',
      success: function(res) {
        if (res.error_code == 0) {
          page.setData({
            searchHot: res.tops
          });
        }
      }
    });
  },

  storage(val) { // 最近搜索记录
    var h = wx.getStorageSync('search_history') || []
    if (val) {
      h.forEach((v, i) => {
        if (h[i] == val) {
          h.splice(i, 1);
        }
      })
      h.unshift(val)
      wx.setStorageSync('search_history', h)
    }
    this.setData({
      searchHistory: h
    });
  },

  confirm(e) { // 搜索
    var v = e.detail.value
    if (v == '') {
      toast('请输入商品关键词进行搜索')
      return
    }
    this.startQuery(v)
    this.productList()
  },

  showInput(e) { // 点击最近搜索
    const v = e.target.dataset.val
    this.startQuery(v)
    this.productList()
  },

  checkShow() {
    this.setData({
      isCheckShow: !this.data.isCheckShow
    })
  },
  // 排序
  navTab(e) {
    var page = this
    var idx = e.target.dataset.idx
    page.setData({
      sortIdx: idx,
      isCheckShow: false,
      pageNum: 1,
      loadingDb: true
    })
    page.productList()
  },
  // 筛选
  toSort() {
    var page = this
    wx.setStorageSync('sortDb', page.data.options)
    wx.navigateTo({
      url: '/pages/search-sort/search-sort?id=' + page.data.db.id + '&key=' + page.data.value + '&category=' + page.data.searchQuery.category,
      events: {
        // 高级筛选确定后，需重置page:1
        acceptDataFromOpenedPage: function(data) {
          page.setData({
            pageNum: 1
          })
        }
      }
    })
  },

  add(e) {
    this.setData({
      popupShow: true,
      goodsid: e.detail
    })
  },

  close() {
    this.setData({
      popupShow: false,
      goodsid: null
    })
  },

  bindscrolltolower(e) {
    var page = this;
    if (page.data.loading || page.data.noMore) return
    page.setData({
      pageNum: page.data.pageNum + 1,
      loading: true
    })
    page.productList(true);
  },

  productList(isPage) {
    let page = this
    const data = page.data.searchQuery
    const pageNum = page.data.pageNum // 分页
    if (pageNum == 1) {
      page.setData({
        contentScrollTop: 0
      })
    }
    data.page = pageNum
    data.sort = page.data.sortIdx; // 排序：0默认综合 1价格最低 2价格最高 3最新发布 4热门
    if (page.data.value) data.key = page.data.value // 搜索
    page.setData({
      showBox: 2
    })
    page.setTitle(data.name || data.key)
    app.request({
      url: '/v1/shops/' + page.data.db.id + '/goods',
      loading: true,
      method: "post",
      header: {
        'content-type': 'application/json'
      },
      data: data,
      success: res => {
        if (res.error_code == 0) {
          if (isPage) {
            page.setData({
              lists: page.data.lists.concat(res.goods)
            });
          } else {
            page.setData({
              lists: res.goods,
            });
          }
          page.setData({
            noMore: res.page == res.total_page ? true : false,
            showBox: 2,
            options: res.options
          })
        }
      },
      complete: res => {
        page.setData({
          loadingDb: false,
          loading: false,
          focus: false
        })
      }

    });
  },

  remove() { // 删除历史
    var self = this
    wx.showModal({
      title: '确定清空历史搜索吗？',
      confirmColor: '#ff7300',
      success: function(res) {
        if (res.confirm) {
          try {
            wx.removeStorageSync('search_history')
            self.setData({
              searchHistory: [],
            })
          } catch (e) {}
        }
      }
    })
  }
});