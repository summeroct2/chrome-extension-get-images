
// 接收popup页面的指令
// 支持 detail.1688, detail.tmall, item.taobao, www.youzan.com

const selectorMap = {
  'detail.1688.com': {
    kv:     '#dt-tab',
    color:  '.list-leading',
    model:  '.table-sku',
    desc:   '.de-description-detail',
  },
  'detail.tmall.com': {
    kv:     '#J_UlThumb',
    color:  '.tm-img-prop',
    desc:   '#description',
  },
  'item.taobao.com': {
    kv:     '#J_UlThumb',
    color:  '.J_Prop_Color',
    desc:   '#description',
  },
  'www.youzan.com': {
    kv:     '.goods-swiper-list',
    desc:   '.market-goods-desc-detail',
  },
  'item.jd.com': {
    kv:     '#spec-list',
    color:  '#choose-attr-1',
    desc:   '#J-detail-content',
  }
}

const imgRuleMap = {
  'detail.1688.com': {
    kv:     /\.\d{2}x\d{2}/,
    color:  /\.\d{2}x\d{2}/,
    model:  /\.\d{2}x\d{2}/
  },
  'detail.tmall.com': {
    kv:     /_\d{2}x\d{2}.+$/,
    color:  /_\d{2}x\d{2}.+$/
  },
  'item.taobao.com': {
    kv:     /_\d{2}x\d{2}.+$/,
    color:  /_\d{2}x\d{2}.+$/
  },
  'www.youzan.com': {
    kv:     /\?.*$/,
    desc:   /\!.*$/
  },
  'item.jd.com': {
    kv:     /\/n\d{1}\//,
    color:  /s\d{2,4}x\d{2,4}/,
  }
}

// img data-lazyload

/**
 * 获取目标容器的DOM对象
 * @param   {String} hostName 主机名
 * @param   {String} conName 容器名称
 * @return  {Object} 容器的DOM对象
 */
const getContainer = (hostName, conName) => {
  return document.querySelector(selectorMap[hostName][conName])
}

const getKVImgSrc = (kvImgs, regexp, as) => {
  let imgs = []
  as = as || ''
  kvImgs.forEach(function (img, i) {
    var imgsrc = img.getAttribute('data-lazy-src') || img.src
    var originSrc = imgsrc.replace(regexp, as)

    imgs.push({img: originSrc})
  })
  return imgs
}

const getColorImgSrc = (colorImgs, regexp, as) => {
  let imgs = []
  as = as || ''
  colorImgs.forEach((img, i) => {
    var name = img.alt,
        imgsrc = img.src.replace(regexp, as)
    imgs.push({name, img: imgsrc})
  })
  return imgs
}

const getColorTagAImgSrc = (colorImgs, regexp, as) => {
  let imgs = []
  as = as || ''
  colorImgs.forEach(function (a, i) {
    var name = a.children[0].innerText,
        imgurl = a.style.background.match(/url\(\"(.*)\"\)/)[1]
        img = ''

    imgurl = /https/.test(imgurl) ? imgurl : `https:${imgurl}`
    img = imgurl.replace(regexp, as)

    imgs.push({name, img})
  })
  return imgs
}

const getModelImgSrc = (modelImgs, regexp, as) => {
  let imgs = []
  as = as || ''
  modelImgs.forEach(function (img, i) {
    var name = img.alt,
        img = img.src.replace(regexp, '')
    imgs.push({name, img})
  })
  return imgs
}

const getDescImgSrc = (descImgs, regexp, as) => {
  let imgs = []
  as = as || ''
  descImgs.forEach(function (img, i) {
    var lazysrc = img.getAttribute('data-lazyload-src')
        || img.getAttribute('data-ks-lazyload')
        || img.getAttribute('data-lazyload') // jd
        || img.getAttribute('data-echo') // youzan
    var imgsrc = lazysrc ? (/https/.test(lazysrc) ? lazysrc : `https:${lazysrc}`) : img.src
    if (regexp) {
      imgsrc.replace(regexp, '')
    }
    imgs.push({img: imgsrc})
  })
  return imgs
}

const getItems = hostname => {
  const kvWrap = getContainer(hostname, 'kv')
  const colorWrap = getContainer(hostname, 'color')
  const modelWrap = getContainer(hostname, 'model')
  const descWrap = getContainer(hostname, 'desc')

  const kvImgs = kvWrap && kvWrap.querySelectorAll('img'),
        modelImgs = modelWrap && modelWrap.querySelectorAll('img'),
        descImgs = descWrap && descWrap.querySelectorAll('img')
  
  let colorImgs = []
  const elementsObj = {}

  if (kvImgs && kvImgs.length) { elementsObj.kv = getKVImgSrc(kvImgs, imgRuleMap[hostname]['kv']) }
  if (modelImgs && modelImgs.length) { elementsObj.model = getModelImgSrc(modelImgs, /\.(\d{2}x\d{2})\./) }
  if (descImgs && descImgs.length) { elementsObj.desc = getDescImgSrc(descImgs) }

  // 一些特殊处理
  switch (hostname) {
    case 'detail.1688.com':
      colorImgs = colorWrap && colorWrap.querySelectorAll('img')
      if (colorImgs && colorImgs.length) { elementsObj.color = getColorImgSrc(colorImgs, imgRuleMap[hostname]['color']) }
      break
    
    case 'detail.tmall.com':
    case 'item.taobao.com':
      colorImgs = colorWrap && colorWrap.querySelectorAll('a')
      if (colorImgs && colorImgs.length) { elementsObj.color = getColorTagAImgSrc(colorImgs, imgRuleMap[hostname]['color']) }
      break
    
    case 'www.youzan.com':
      if (descImgs && descImgs.length) { elementsObj.desc = getDescImgSrc(descImgs, imgRuleMap[hostname]['desc']) }
      break

    case 'item.jd.com':
      colorImgs = colorWrap && colorWrap.querySelectorAll('img')
      if (colorImgs && colorImgs.length) { elementsObj.color = getColorImgSrc(colorImgs, imgRuleMap[hostname]['color'], 's1080x1080') }
      if (kvImgs && kvImgs.length) { elementsObj.kv = getKVImgSrc(kvImgs, imgRuleMap[hostname]['kv'], '/cms/') }
      break
  }
  
  return elementsObj
}

chrome.runtime.onMessage.addListener(function (req, sender, Res) {
  if (req === 'doit') {
    const hostname = location.hostname
    const title = document.title
    const msgData = getItems(hostname)
    
    chrome.runtime.sendMessage({msgData, title})
  }
})
