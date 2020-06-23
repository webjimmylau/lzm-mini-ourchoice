const buttonClicked = (self,val) => {
  if(val) {
    self.setData({
      buttonClicked: val
    })
  } else {
    setTimeout(function() {
      self.setData({
        buttonClicked: val
      })
    }, 500)
  }
}

const toast = (msg) => {
  wx.showToast({
    title: msg,
    duration: 2000,
    icon: 'none'
  });
}
const findPrice = (db, num) => {
  let p = db && db.prices
  if (!p) return
  let price = p.find(v => num >= v.min_qty && num <= v.max_qty) || (p.length > 0 && num < p[0].min_qty && p[0]) || (p.length > 0 && num > p[p.length - 1].max_qty && p[p.length - 1]) || {}
  return price
}

const isContained = (aa, bb) => {
  // 获取sku
  if (!(aa instanceof Array) || !(bb instanceof Array) || ((aa.length < bb.length))) {
    return false;
  }
  for (var i = 0; i < bb.length; i++) {
    var flag = false;
    for (var j = 0; j < aa.length; j++) {
      if (aa[j].spec_value_id == bb[i]) {
        flag = true;
        break;
      }
    }
    if (flag == false) {
      return flag;
    }
  }
  return true;
}

module.exports = {
  buttonClicked: buttonClicked,
  toast: toast,
  isContained: isContained,
  findPrice: findPrice
}