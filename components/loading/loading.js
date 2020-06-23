"use strict";
Component({
  options: {
    addGlobalClass: true
  },
  properties: {
    extClass: {
      type: String,
      value: ''
    },
    color: {
      type: String,
      value: '#ffffff'
    },
    noMore: {
      type: Boolean,
      value: false
    },
    err: {
      type: Boolean,
      value: false
    },
    show: {
      type: Boolean,
      value: true
    },
    tips: {
      type: String,
      value: '加载中'
    }
  },
  data: {
  },
});