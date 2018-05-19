chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason == 'install') {
    chrome.storage.sync.set({ on: false })
    console.log('initiallise')
  }
})

chrome.tabs.onActivated.addListener(function() {
  injectCSS()
})

chrome.tabs.onUpdated.addListener(function(tabId, info) {
  if (info.status === 'complete') {
    injectCSS()
  }
})

chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.storage.sync.get('on', data => {
    chrome.storage.sync.set({ on: !data.on })
    injectCSS()
  })
})

function injectCSS() {
  chrome.storage.sync.get('on', data => {
    if (data.on) {
      chrome.tabs.insertCSS(null, {
        code:
          '#items.ytd-watch-next-secondary-results-renderer {visibility: hidden;} !important'
      })
      chrome.tabs.insertCSS(null, {
        code:
          '#dismissable.style-scope.ytd-shelf-renderer {visibility: hidden;} !important'
      })
    } else {
      chrome.tabs.insertCSS(null, {
        code:
          '#items.ytd-watch-next-secondary-results-renderer {visibility: visible;} !important'
      })
      chrome.tabs.insertCSS(null, {
        code:
          '#dismissable.style-scope.ytd-shelf-renderer {visibility: visible;} !important'
      })
    }
  })
}
