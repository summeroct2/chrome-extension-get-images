
// 接收popup页面的指令
chrome.runtime.onMessage.addListener(function (req, sender, Res) {
  if (req === 'doit') {
    var propertyRegion = document.querySelector('.region-detail-property')
    var kvWrap = document.querySelector('#dt-tab'),
        colorWrap = propertyRegion.querySelector('.list-leading'),
        modelWrap = propertyRegion.querySelector('.table-sku'),
        descWrap = document.querySelector('.de-description-detail')

    var kvImgs = [],
        colorImgs = [],
        modelImgs = [],
        descImgs = []

    var kvArr = [],
        colorArr = [],
        modelArr = [],
        descArr = []

    var msgData = {}

    if (kvWrap) { kvImgs = kvWrap.querySelectorAll('img') }
    if (colorWrap) { colorImgs = colorWrap.querySelectorAll('img') }
    if (modelWrap) { modelImgs = modelWrap.querySelectorAll('img') }
    if (descWrap) { descImgs = descWrap.querySelectorAll('img') }

    // 遍历KV图，取原图
    kvImgs.forEach(function (img, i) {
      var imgsrc = img.getAttribute('data-lazy-src') || img.src
      kvArr.push({img: imgsrc.replace(/\.(\d{2}x\d{2})/, '')})
    })

    // 遍历颜色图，小图改为 300x300 大图
    colorImgs.forEach(function (img, i) {
      var name = img.alt,
          img = img.src.replace(/\.(\d{2}x\d{2})\./, '.300x300.')
      colorArr.push({name, img})
    })

    // 遍历规格图，小图改为 200x200 大图
    modelImgs.forEach(function (img, i) {
      var name = img.alt,
          img = img.src.replace(/\.(\d{2}x\d{2})\./, '.300x300.')
      modelArr.push({name, img})
    })

    // 遍历描述图
    descImgs.forEach(function (img, i) {
      var lazysrc = img.getAttribute('data-lazyload-src')
      var imgsrc = lazysrc ? `https:${lazysrc}` : img.src
      descArr.push({img: imgsrc})
    })

    // 发送结果数据
    kvArr.length && (msgData.kv = kvArr)
    colorArr.length && (msgData.color = colorArr)
    modelArr.length && (msgData.model = modelArr)
    descArr.length && (msgData.desc = descArr)

    chrome.runtime.sendMessage(msgData)
  }
})
