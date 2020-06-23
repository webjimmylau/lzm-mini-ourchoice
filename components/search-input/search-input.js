Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    name: {
      type: String,
      value: '请选择'
    },
    value: {
      type: String,
      value: ''
    },
    placeholder: {
      type: String,
      value: '请输入关键词'
    },
    extClass: {
      type: String,
      value: ''
    },
    focus: {
      type: Boolean,
      value: false,
    },
    search: {
      type: Function,
      value: null
    },
    showBox: {
      type: Number
    },
    result: {
      type: Array,
      value: []
    },
  },

  lifetimes: {
    attached() {
      if (this.data.focus) {
        this.setData({
          searchState: true,
        })
      }
    }
  },
  methods: {
    toBusiness(){
      wx.navigateTo({
        url: '/pages/business/business'
      })
    },
    inputConfirm(e) {
      this.setData({
        focus: false,
        searchState: false
      })
      this.triggerEvent('confirm', e.detail)
    },

    clearInput() {
      this.setData({
        value: '',
        searchState: false
      })
      this.triggerEvent('clear')
    },

    inputFocus(e) {
      var val = e.detail.value
      this.triggerEvent('focus', e.detail)
    },

    inputBlur(e) {
      this.setData({
        focus: false,
      })
      this.triggerEvent('blur', e.detail)
    },

    inputChange(e) {
      var val = e.detail.value
      this.setData({
        value: val == ' ' ? '' : val
      })
      this.triggerEvent('input', e.detail)
    },

    selectResult(e) {
      const { index } = e.currentTarget.dataset
      const item = this.data.result[index]
      this.setData({
        searchState: false,
      })
      this.triggerEvent('selectresult', { index, item })
    }
  }
})