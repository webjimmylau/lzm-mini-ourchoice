"use strict";
Component({
  properties: {
    extClass: {
      type: String,
      value: ''
    },
    show: {
      type: Boolean,
      value: false
    },
    type: {
      type: String,
      value: 'bottom'
    }
  },
  methods: {
    close(e) {
      var type = e.currentTarget.dataset.type;
      this.setData({
        show: false
      });
      this.triggerEvent('close');

    }
  }
});