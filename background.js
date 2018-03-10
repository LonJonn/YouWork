function backTimer(minute, ticked) {
    startTime = new Date().getTime();
    timer = setInterval(function () {
        now = new Date().getTime();
        if (now >= startTime + minute*60*1000) {
            chrome.storage.sync.set({
                'timerOption': ''
            });
            chrome.storage.sync.set({
                'choice': 'enabled'
            });
            chrome.tabs.insertCSS(null, {
                code: "#items.ytd-watch-next-secondary-results-renderer {visibility: hidden;} !important"
            })
            if (ticked) {
                chrome.tabs.insertCSS(null, {
                    code: "#dismissable.style-scope.ytd-shelf-renderer {visibility: hidden;} !important"
                });
                chrome.storage.sync.set({
                    'ticked': true
                });
            } else if (!ticked) {
                chrome.tabs.insertCSS(null, {
                    code: "#dismissable.style-scope.ytd-shelf-renderer {visibility: visible;} !important"
                })
            }
            chrome.runtime.sendMessage('done');
            clearInterval(timer);
        }
    }, 60000)

}

function endTimer() {
    clearInterval(timer);
}
