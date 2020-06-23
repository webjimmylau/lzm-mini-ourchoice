'use strict';
Component({
  properties: {
    item: {
      type: Object,
      observer: ''
    }
  },
  methods: {
    add (e){
      this.triggerEvent('add', e.currentTarget.dataset.goodsid)
    },
  }
})
