var app = getApp();
var {
  toast,
  findPrice,
  isContained,
  buttonClicked
} = require('../../utils/util.js');

"use strict";
Component({

  options: {
    multipleSlots: true,
    addGlobalClass: true
  },
  properties: {
    type: {
      type: String,
      value: ''
    },
    goods: {
      type: Object
    },
    extClass: {
      type: String,
      value: ''
    },
    show: {
      type: Boolean,
      value: false
    },
    showLoading:{
      type: Boolean,
      value: false
    },
    skuid: {
      type: Number
    },
    cart: {
      type: Boolean,
      value: false
    },
    shopSku: {
      type: Object
    }
  },
  data: {
    skuArr: [],
    listEnd: [],
    list: [],
    end: [],
    sNum: 0,
    price: 0,
    topInfo: {},
    onSkuId: null,
    buttonClicked: false
  },
  observers: {
    goods: function(nA) {
      let isSkuid = this.data.skuid;
      let skuShow = nA.skus && nA.skus.length > 0 && nA.skus.find(v => v.id == isSkuid)
      // 规格初始化
      if (nA.specs && nA.specs.length > 0) {
        let db = nA.specs
        if (isSkuid > 0 && skuShow && skuShow.specs && skuShow.specs.length > 0) { 
          // 初始选中
          db.forEach(v => {
            v.selected = false
            skuShow.specs.forEach( vv => {
              if (v.id == vv.spec_key_id) {
                v.selected = true
                v.values.forEach(k => {
                  k.selected = false;
                  if (k.id == vv.spec_value_id) {
                    k.selected = true;
                  }
                })
              }
            })
          });

        } else {
          // 初始不选中
          db.forEach(v => {
            v.selected = false
            v.values.forEach(k => {
              k.selected = false;
            })
          });
        }
        

        let end = db.slice(-1)
        let list = db.pop()
        this.setData({
          end: end,
          list: db,
          listEnd: db.concat(end[0])
        })
        
      } else {
        this.setData({
          end: [],
          list: [],
          listEnd: []
        })
      }
      // SKU初始化
      if (nA.skus && nA.skus.length > 0) {
        let skuArr = nA.skus
        skuArr.forEach(v => {
          v.num = 0
        });
        this.setData({
          skuArr: skuArr,
          topInfo: (isSkuid > 0 && skuShow) ? skuShow : nA,
          onSkuId: (isSkuid > 0 && skuShow) ? skuShow.id : nA.id
        })
      }
      this.setData({
        sNum: 0,
        price: 0
      })
    }
  },
  methods: {
    addCart() {
      // 加入购物车
      let page = this;
      let isCart = page.data.cart;
      if (isCart) {
        let onSkuId = page.data.onSkuId; // 当前选中
        let skuId = page.data.skuid; // 当前点开 skuid
        let shopSku = page.data.shopSku; // 购物车已有 sku

        let isB = shopSku.skus.find(v => v.sku_id == onSkuId)
        let aNum = shopSku.skus.find(v => v.sku_id == skuId)
        if (onSkuId == skuId){
          // 1、点开A，然后我选择还是A，那购物车里不变；
          page.close()
          return
        } else {
          let del = [{
            cart_id: shopSku.id,
            sku_id: aNum.id
          }]
          if (!isB) {
            // 点开A，然后我选择了B，那购物车里变为B；（购物车里本来没有B的情况）
            // 1. 删除 A，并记下 A 的数量
            // 2. 添加 B 到购物车，数量是 A 数量
            if (!onSkuId) {
              toast('商品已失效，请选择其它商品')
              return
            }
            let dbs = [{
              sku_id: onSkuId,
              qty: aNum.qty
            }]
            page.addCarts(dbs, del)
          } else if (isB) {
            // 点开A，然后我选择了B，那购物车里的A消失；（购物车里本来有B的情况）
            // 1. 删除 A，并记下 A 的数量
            // 2. 更新 B 的数量为 A + B
            buttonClicked(page, true)
            app.request({
              url: '/v1/buyer/carts/' + shopSku.id,
              loading: true,
              method: 'PUT',
              data: {
                sku_id: isB.sku_id,
                qty: Number(aNum.qty) + Number(isB.qty)
              },
              success: function (res) {
                if (res.error_code == 0) {
                  page.triggerEvent('ok', del);
                  toast('已加入购物车')
                  page.close()
                } else {
                  toast(res.message)
                }
              },
              complete: res => {
                buttonClicked(page, false)
              }
            })

            
          }
        } 
        return
      }

      let db = []
      page.data.skuArr.forEach(v => {
        if (v.num > 0) {
          db.push({
            sku_id: v.id,
            qty: v.num
          })
        }
      })

      if (page.data.sNum == 0 || db.length == 0) {
        toast('订购数量必须大于0')
        return
      }
      page.addCarts(db)

    },

    addCarts(db, del) {
      let page = this;
      buttonClicked(page, true)
      app.request({
        url: '/v1/buyer/carts',
        header: {
          'content-type': 'application/json'
        },
        loading: true,
        method: 'POST',
        data: {
          skus: db
        },
        success: function (res) {
          if (res.error_code == 0) {
            toast('已加入购物车')
            page.close()
            page.triggerEvent('ok', del);
          } else {
            toast(res.message)
          }
        },
        complete: res => {
          buttonClicked(page, false)
        }
      });
    },

    addCartOne() {
      // 立即购买
      let page = this;
      if (page.data.sNum == 0) {
        toast('订购数量必须大于0')
        return
      }

      let data = [];
      page.data.skuArr.forEach(v => {
        if (v.num > 0) {
          data.push({
            id: v.id,
            qty: v.num
          })
        }
      })
      buttonClicked(page, true)
      app.request({
        url: '/v1/buyer/goods/checkout',
        header: {
          'content-type': 'application/json'
        },
        loading: true,
        method: 'POST',
        data: {
          skus: data
        },
        success: function(res) {
          if (res.error_code == 0) {
            try {
              wx.setStorageSync("checkout", res);
              wx.navigateTo({
                url: '/pages/checkout/checkout?type=one'
              })
              page.close()
            } catch (e) {
              toast('走神了，请重新点击')
            }
          } else {
            toast(res.message)
          }
        },
        complete: res => {
          buttonClicked(page, false)
        }
      });
    },

    onSelected(key, value, isEnd, snum) {
      let end = this.data.end;
      let list = this.data.list;
      let listEnd = list.concat(end[0]);
      let isCart = this.data.cart;

      let arr = isCart ? listEnd : isEnd == 1 ? end : list
      arr.forEach((v, idx) => {
        if (key == v.id) {
          v.selected = false
          v.values.forEach((k, i) => {
            if (value == i) {
              let sel = snum ? snum : !k.selected;
              k.selected = isCart ? true : sel
              if (sel) v.selected = true
            } else {
              k.selected = false
            }
          })
        }
      });

      this.setData({
        end: end,
        list: list,
        listEnd: listEnd
      })

      // 联动头部信息
      let noS = listEnd.find(v => v.selected == false)
      if (noS == undefined) {
        // 获取选中规格
        let sel = []
        listEnd.forEach(v => {
          v.values.forEach(k => {
            if (k.selected) sel.push(k.id)
          })
        });

        let vv = this.data.skuArr.find(item => isContained(item.specs, sel))

        if (vv == undefined) {
          this.setData({
            topInfo: this.data.goods,
            onSkuId: null
          })
        } else {
          this.setData({
            topInfo: vv,
            onSkuId: vv.id
          })
          this.triggerEvent('onSkuId', vv);
        }
        
      }


    },

    skusel(e) {
      // 头规格选择
      let key = e.currentTarget.dataset.key
      let value = e.currentTarget.dataset.value
      this.onSelected(key, value)
    },

    skuselend(e) {
      // 尾规格选择
      let key = e.detail.key
      let value = e.detail.value
      this.onSelected(key, value, 1)
    },

    skunum(e) {
      // 购买数量
      let page = this;
      let s = e.detail
      let skuArr = this.data.skuArr;
      skuArr.forEach(v => {
        if (v.id == s.sku_id) {
          v.num = s.num
        }
      })

      this.setData({
        skuArr: skuArr
      })

      if(s.key) {
        this.onSelected(s.key, s.value, 1, true) // 调整数量时不切换
        this.tj()
      } else { // 单sku
        this.setData({
          sNum: s.num
        })
      }
    },

    tj() {
      // 套数 总价
      let n = 0
      let price = 0
      this.data.skuArr.forEach(v => {
        let num = v.num
        let p = findPrice(v, num)
        if (num >= 0) {
          n += num
        }
        if (p != undefined) {
          price += Number(p.price) * Number(num)
        }
      })
      this.setData({
        sNum: n,
        price: price.toFixed(2)
      })
    },

    close(e) {
      this.setData({
        show: false
      });
      this.triggerEvent('close');
    }
  }
});