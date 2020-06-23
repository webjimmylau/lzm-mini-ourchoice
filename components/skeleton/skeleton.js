Component({
	properties: {
		selector: {
			type: String,
			value: 'skeleton'
		}
	},
	data: {
		systemInfo: {},
		skeletonRectLists: [],
	},
	lifetimes: {
    attached: function() {
      this.getInfo()
    }
  },
	attached: function () {
		// 以下是旧式的定义方式，可以保持对 <2.2.3 版本基础库的兼容
		this.getInfo() 
	},
	ready: function () {
		this.rectHandle();
	},
	methods: {
		getInfo: function () {
			const systemInfo = wx.getSystemInfoSync();
			this.setData({
				systemInfo: {
					width: systemInfo.windowWidth,
					height: systemInfo.windowHeight
				}
			})
		},
		rectHandle: function () {
			const that = this;
			wx.createSelectorQuery().selectAll(`.${this.data.selector} >>> .${this.data.selector}-rect`).boundingClientRect().exec(function(res){
				that.setData({
					skeletonRectLists: res[0]
				})
			});
		}
	}
})