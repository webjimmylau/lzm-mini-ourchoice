var {
  isContained,
  findPrice
} = require('../../utils/util.js');
Component({
  properties: {
    sku: {
      type: Object
    },
    skuArr: {
      type: Array
    },
    keyid: {
      type: Number
    },
    keyvalidx: {
      type: Number
    },
    selected: {
      type: Boolean
    },
    list: {
      type: Array
    }
  },

  observers: {
    sku: function(nA) {
      let db = this.data.skuArr
      // 获取选中规格
      let sel = []
      this.data.list.forEach(v => {
        v.values.forEach(k => {
          if (k.selected) sel.push(k.id)
        })
      });

      let vv
      let cc
      
      if (sel.length == 0) {
        // 由最后一条规格 筛选初始SKU
        vv = db.find(item => item.specs.find(v => v.spec_value_id == nA.id))
      } else {
        // 多条 筛选SKU
        sel.push(nA.id)
        vv = db.find(item => isContained(item.specs, sel))
      }
      

      let nu = vv == undefined ? this.data.num : vv.num

      this.setData({
        db: vv == undefined ? false : vv,
        num: nu
      })

      this.isNum(nu)
      
    }
  },

  data: {
    num: 0,
    db: {},
    price: {}
  },

  methods: {
    isNum(n) {
      // 价格联动
      let num = n || 1;
      let db = this.data.db
      let p = findPrice(db, num)
      this.setData({
        price: p
      })
    },

    skunum({
      detail
    }) {
      let n = detail.value
      let list = this.data.list
      let tig = []
      list.forEach(v => {
        if(!v.selected) {
          tig.push(v.name)
        }
      })
      if(tig.length > 0) {
        this.setData({
          num: 0
        })
        wx.showToast({
          title: '请选择 ' + tig.join(" "),
          icon: 'none'
        });
        return
      }
      
      this.triggerEvent('skunum', {
        sku_id: this.data.db.id,
        num: n,
        key: this.data.keyid,
        value: this.data.keyvalidx
      });
      
      this.isNum(n)
      this.setData({
        num: n
      })
    },

    skusel(e) {
      this.triggerEvent('skusel', e.currentTarget.dataset);
    }
  }
})