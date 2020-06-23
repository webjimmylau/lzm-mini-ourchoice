function addNum(num1, num2) {
  let sq1, sq2, m;
  try {
    sq1 = num1.toString().split('.')[1].length;
  } catch (e) {
    sq1 = 0;
  }
  try {
    sq2 = num2.toString().split('.')[1].length;
  } catch (e) {
    sq2 = 0;
  }
  m = Math.pow(10, Math.max(sq1, sq2));
  return (Math.round(num1 * m) + Math.round(num2 * m)) / m;
}

Component({
  externalClasses: ['my-class'],

  properties: {
    size: String,
    value: {
      type: Number,
      value: 0
    },
    min: {
      type: Number,
      value: Infinity
    },
    max: {
      type: Number,
      value: Infinity
    },
    step: {
      type: Number,
      value: 1
    }
  },


  methods: {
    handleChangeStep(e, type) {
      const {
        dataset = {}
      } = e.currentTarget;
      const {
        disabled
      } = dataset;
      const {
        step
      } = this.data;
      let {
        value
      } = this.data;

      if (disabled) return null;

      if (type === 'minus') {
        value = addNum(value, -step);
        if (value < this.data.min) return null;
      } else if (type === 'plus') {
        value = addNum(value, step);
        if (value > this.data.max) return null;
      }

      this.handleEmit(value, type);
    },

    reduce(e) {
      this.handleChangeStep(e, 'minus');
    },

    add(e) {
      this.handleChangeStep(e, 'plus');
    },

    handleBlur(e) {

      let {
        value
      } = e.detail;

      const {
        min,
        max
      } = this.data;
      // if (!value) {
      //   console.log(Number(value) )
      //   setTimeout(() => {
      //     // this.handleEmit(Number(value));
      //   }, 16);
      //   return;
      // }

      value = +Number(value);
      if (value > max) {
        value = max;
        wx.showToast({
          title: '已达库存最大值',
          icon: 'none'
        });
      } else if (value < min) {
        value = min;
      }

      this.handleEmit(value);
    },
    handleEmit(value, type) {
      const data = {
        value: value
      };
      if (type) data.type = type;
      
      this.triggerEvent('change', data);
    }
  }
});