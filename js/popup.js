var appContent = document.querySelector('.app-content')
var btnDownload = document.querySelector('.btn-download')

chrome.browserAction.setBadgeText({text: '在抓'})
// chrome.browserAction.setBadgeBackgroundColor({color: []})

// 发送执行指令: doit
chrome.tabs.query({
  active: true,
  currentWindow: true
}, function (tabs) {
  chrome.tabs.sendMessage(tabs[0].id, 'doit', function (res) {
    // 收到接收方接收成功的反馈消息
  })
})

function imgRender(url, width) {
  var img = document.createElement('img')
  img.src = url
  width && (img.width = width)
  return img
}

function getSafeDir(docTitle) {
  return docTitle.replace(/[|\\-\\/:*?"'<>=%$@#+-;,!\^]/g, "_")
}

function saveAs(url, filename) {
  if (chrome.downloads) {
    var dir = getSafeDir(document.title) + "/" + filename

    chrome.downloads.download({
      url: url,
      filename: dir,
      saveAs: !1,
      conflictAction: "uniquify"
    }, function(t) {})

  } else {
    var a = document.createElementNS("http://www.w3.org/1999/xhtml", "a")
    a.href = url,
    a.download = filename,
    a.click()
  }
}

// 接收content的消息
chrome.runtime.onMessage.addListener(function (req, sender, Res) {

  chrome.browserAction.setBadgeText({text: ''})

  // 渲染商品KV图
  var kvSection = document.createElement('dl')
  kvSection.className = 'kv'
  kvSection.innerHTML = '<dt>KV:</dt><dd></dd>'
  req.kv.forEach(function(url, i){
    kvSection.querySelector('dd').appendChild( imgRender(url, 50) )
  })
  appContent.appendChild(kvSection)

  // 渲染商品颜色图
  var colorSection = document.createElement('dl')
  colorSection.className = 'color'
  colorSection.innerHTML = '<dt>颜色:</dt><dd></dd>'
  req.color.forEach(function(url, i){
    colorSection.querySelector('dd').appendChild( imgRender(url, 50) )
  })
  appContent.appendChild(colorSection)

  // 渲染商品画报
  var descSection = document.createElement('dl')
  descSection.className = 'desc'
  descSection.innerHTML = '<dt>画报:</dt><dd></dd>'
  req.desc.forEach(function(url, i){
    descSection.querySelector('dd').appendChild( imgRender(url, 100) )
  })
  appContent.appendChild(descSection)
})

btnDownload.onclick = function () {
  var imgSection = appContent.querySelectorAll('dl')

  imgSection.forEach(function (section) {
    var sectionName = section.className
    var imgs = section.querySelectorAll('img')

    if (!imgs.length) {
      return false
    }

    imgs.forEach(function (img) {
      var imgsrc = img.src
      var nameIndex = imgsrc.lastIndexOf('/')
      var filename = imgsrc.substr(nameIndex + 1)

      saveAs(imgsrc, sectionName + '_' + filename)
    })
  })
}
