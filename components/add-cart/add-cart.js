var app = getApp();
Component({
  properties: {
    type: {
      type: String
    },
    show: {
      type: Boolean
    },
    goodsid: {
      type: Number
    },
    skuid: {
      type: Number
    },
    cart: {
      type: Boolean
    },
    shopSku: {
      type: Object
    }
  },

  observers: {
    goodsid: function(newVal) {
      if (newVal > 0) this.getData(newVal)
    }
  },

  data: {
    goods: {},
    showLoading: false
  },

  methods: {

    getData(goodsid) {
      let page = this;
      page.setData({
        showLoading: true
      })
      app.request({
        url: '/v1/goods/' + goodsid,
        loading: true,
        success: function(res) {
          page.setData({
            goods: res
          });
        },
        complete: res => {
          page.setData({
            showLoading: false
          })
        }
      });
    },

    ok(e){
      this.triggerEvent('ok', e.detail);
    },
    close(){
      this.triggerEvent('close');
    },
    onSkuId(e){
      this.triggerEvent('onSkuId', e.detail);
    }
  }
})