var {
  findPrice
} = require('../../utils/util.js');
Component({
  properties: {
    skuArr: {
      type: Object
    },
    unit: {
      type: String
    }
  },
  observers: {
    skuArr: function (a) {
      this.setData({
        price: a && a.prices[0],
        num:0
      })

    }
  },
  data: {
    num: 0,
    price: {},
    totalPrice: 0
  },
  methods: {
    isNum(n) {
      let num = n || 1;
      let db = this.data.skuArr
      let p = findPrice(db, num)
      this.setData({
        price: p
      })
    },

    skunum({
      detail
    }) {
      let n = Number(detail.value) || 0
      this.triggerEvent('skunum', {
        sku_id: this.data.skuArr.id,
        num: n,
        key: null,
        value: null 
      });

      this.isNum(n)
      let p = Number(this.data.price.price) * n
      this.setData({
        num: n,
        totalPrice: Number(p).toFixed(2)
      })
    }
  }
})
