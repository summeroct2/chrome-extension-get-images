var appContent = document.querySelector('.app-content')
var btnDownload = document.querySelector('.btn-download')

function imgRender(imgItem, width) {
  var img = document.createElement('img')
  var cell = document.createElement('span')

  img.src = imgItem.img
  imgItem.name && (img.title = imgItem.name, img.alt = imgItem.name)
  width && (img.width = width)

  cell.className = 'cell'
  cell.appendChild(img)

  return cell
}

function createSection (sectionObj, type) {
  var section = document.createElement('dl')
  var typeName

  switch (type) {
    case 'kv':
      typeName = 'KV'
      break;

    case 'color':
      typeName = '颜色'
      break;

    case 'model':
      typeName = '型号'
      break;

    case 'desc':
      typeName = '画报'
      break;
  }

  section.className = type
  section.innerHTML = `<dt>${typeName}:</dt><dd></dd>`

  sectionObj.forEach(function(item, i){
    section.querySelector('dd').appendChild( imgRender(item) )
  })
  return section
}

function getSafeDir(docTitle) {
  return docTitle.replace(/[|\\-\\/:*?"'<>=%$@#+-;,!\^]/g, "_")
}

function saveAs(url, filename) {
  var dir = getSafeDir(document.title) + '/' + filename
  if (chrome.downloads) {
    chrome.downloads.download({
      url: url,
      filename: dir,
      saveAs: false,
      conflictAction: "uniquify"
    }, function(t) {})
  } else {
    var a = document.createElementNS("http://www.w3.org/1999/xhtml", "a")
    a.href = url,
    a.download = filename,
    a.click()
  }
}

// 发送执行指令: doit
chrome.tabs.query({
  active: true,
  currentWindow: true
}, function (tabs) {
  chrome.browserAction.setBadgeText({text: '在抓'})
  chrome.browserAction.setBadgeBackgroundColor({color: '#52c02e'})

  chrome.tabs.sendMessage(tabs[0].id, 'doit', function (res) {
    // 收到接收方接收成功的反馈消息
    if (!res) {
      chrome.browserAction.setBadgeText({text: ''})
    }
  })
})

// 接收content的消息
chrome.runtime.onMessage.addListener(function (req, sender, Res) {

  chrome.browserAction.setBadgeText({text: ''})

  // 渲染商品KV图
  req.kv && appContent.appendChild( createSection(req.kv, 'kv') )
  // 渲染商品颜色图
  req.color && appContent.appendChild( createSection(req.color, 'color') )
  // 渲染商品型号图
  req.model && appContent.appendChild( createSection(req.model, 'model') )
  // 渲染商品画报
  req.desc && appContent.appendChild( createSection(req.desc, 'desc') )
})

btnDownload.onclick = function () {
  var imgSection = appContent.querySelectorAll('dl')

  imgSection.forEach(function (section) {
    var sectionClass = section.className
    var imgs = section.querySelectorAll('img')

    if (!imgs.length) {
      return false
    }

    imgs.forEach(function (img, index) {
      var imgsrc = img.src
      var nameIndex = imgsrc.lastIndexOf('/')
      var filename = imgsrc.substr(nameIndex + 1)
      var colorName = img.title ? `${img.title}_` : ''
      var sectionName = sectionClass

      if (sectionClass === 'desc') {
        // 画报图名称添加索引序号，使保存后的文件顺序与页面中的顺序相同
        sectionName = `${sectionName}_${index}`
      }

      saveAs(imgsrc, sectionName + '_' + colorName + filename)
    })
  })
}
