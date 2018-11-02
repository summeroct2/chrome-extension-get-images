
// 接收popup页面的指令
// 支持 detail.1688, detail.tmall, item.taobao
chrome.runtime.onMessage.addListener(function (req, sender, Res) {
  if (req === 'doit') {
    // var propertyRegion = document.querySelector('.region-detail-property')
    var kvWrap = document.querySelector('#dt-tab') || document.querySelector('#J_UlThumb'),
        colorWrap = document.querySelector('.list-leading'),
        colorWrapT = document.querySelector('.tm-img-prop') || document.querySelector('.J_Prop_Color'),
        modelWrap = document.querySelector('.table-sku'),
        descWrap = document.querySelector('.de-description-detail') || document.querySelector('#description')

        // kv：J_UlThumb
        // 颜色：J_Prop_Color, tm-img-prop
        // description
        // <img data-ks-lazyload="https://img.alicdn.com/imgextra/i3/2938780442/TB2NkjGcHuWBuNjSszgXXb8jVXa_!!2938780442.jpg">

    var kvImgs = [],
        colorImgs = [],
        colorImgsT = [],
        modelImgs = [],
        descImgs = []

    var kvArr = [],
        colorArr = [],
        modelArr = [],
        descArr = []

    var msgData = {}
    var title = document.title

    if (kvWrap) { kvImgs = kvWrap.querySelectorAll('img') }
    if (colorWrap) { colorImgs = colorWrap.querySelectorAll('img')}
    if (colorWrapT) { colorImgsT = colorWrapT.querySelectorAll('a')}
    if (modelWrap) { modelImgs = modelWrap.querySelectorAll('img') }
    if (descWrap) { descImgs = descWrap.querySelectorAll('img') }

    // 遍历KV图，取原图
    kvImgs.forEach(function (img, i) {
      var imgsrc = img.getAttribute('data-lazy-src') || img.src
      var regrule = new RegExp(/\.(\d{2}x\d{2})/)
      var originSrc = ''

      if (regrule.test(imgsrc)) {
        originSrc = imgsrc.replace(regrule, '')
      } else {
        // 格式: xxx.jpg_50x50.jpg_.webp
        originSrc = imgsrc.replace(/_\d{2}x\d{2}.+$/, '')
      }

      kvArr.push({img: originSrc})
    })

    // 遍历颜色图，小图改为 300x300 大图
    colorImgs.forEach(function (img, i) {
      var name = img.alt,
          img = img.src.replace(/\.(\d{2}x\d{2})\./, '.300x300.')
      colorArr.push({name, img})
    })

    // 天猫、淘宝颜色图
    colorImgsT.forEach(function (a, i) {
      var name = a.children[0].innerText,
          imgurl = a.style.background.match(/url\(\"(.*)\"\)/)[1]
          img = ''

      imgurl = /https/.test(imgurl) ? imgurl : `https:${imgurl}`
      img = imgurl.replace(/(_\d{2}x\d{2}.+$)/, '')

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
      var lazysrc = img.getAttribute('data-lazyload-src') || img.getAttribute('data-ks-lazyload')
      var imgsrc = lazysrc ? (/https/.test(lazysrc) ? lazysrc : `https:${lazysrc}`) : img.src
      descArr.push({img: imgsrc})
    })

    // 发送结果数据
    kvArr.length && (msgData.kv = kvArr)
    colorArr.length && (msgData.color = colorArr)
    modelArr.length && (msgData.model = modelArr)
    descArr.length && (msgData.desc = descArr)

    chrome.runtime.sendMessage({msgData, title})
  }
})
