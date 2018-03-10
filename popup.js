function getCurrentTabUrl(callback) {
    var queryInfo = {
        active: true,
        currentWindow: true
    };

    chrome.tabs.query(queryInfo, (tabs) => {
        tab = tabs[0];
        url = tab.url.substr(0, 23);
        console.assert(typeof url == 'string', 'tab.url should be a string');
        callback(url);
    });
}

function studyMode(choice) {
    chrome.tabs.insertCSS(null, {
        code: "#items.ytd-watch-next-secondary-results-renderer {visibility: " + choice + ";} !important"
    })
}

function setMode(choice) {
    if (url.includes('youtube')) {
        if (choice == 'enabled') {
            studyMode('hidden')
        } else {
            studyMode('visible')
        };
    }
    if (page.checked && choice == 'enabled') {
        chrome.tabs.insertCSS(null, {
            code: "#dismissable.style-scope.ytd-shelf-renderer {visibility: hidden;} !important"
        })
    } else if (!page.checked || choice == 'disabled') {
        chrome.tabs.insertCSS(null, {
            code: "#dismissable.style-scope.ytd-shelf-renderer {visibility: visible;} !important"
        })
    }
}

function getSavedChoice() {
    chrome.storage.sync.get("choice", function (obj) {
        dropdown.value = obj['choice'];
    });
}

function saveChoice() {
    chrome.storage.sync.set({
        'choice': dropdown.value
    });
}

function getSavedTick() {
    chrome.storage.sync.get("ticked", function (obj) {
        page.checked = obj['ticked'];
        setMode(dropdown.value, url);
    });
}

function saveTick() {
    chrome.storage.sync.set({
        'ticked': page.checked
    });
}

function saveTimer() {
    chrome.storage.sync.set({
        'timerOption': timer.value
    });
}

function getSavedTimer() {
    chrome.storage.sync.get("timerOption", function (obj) {
        timer.value = obj['timerOption'];
    });
};

function timerRun(time, url) {

    if (!time || time == '') {
        chrome.runtime.getBackgroundPage(function (bgWindow) {
            bgWindow.endTimer();
        });
    }

    if (time == '15min') {
        chrome.runtime.getBackgroundPage(function (bgWindow) {
            bgWindow.backTimer(15, page.checked);
        });
    }

    if (time == '30min') {
        chrome.runtime.getBackgroundPage(function (bgWindow) {
            bgWindow.backTimer(30, page.checked);
        });
    }

    if (time == '45min') {
        chrome.runtime.getBackgroundPage(function (bgWindow) {
            bgWindow.backTimer(45, page.checked);
        });
    }

    if (time == '1hour') {
        chrome.runtime.getBackgroundPage(function (bgWindow) {
            bgWindow.backTimer(60, page.checked);
        });
    }

    saveTimer();
}

document.addEventListener('DOMContentLoaded', () => {
    getCurrentTabUrl((url) => {
        var dropdown = document.getElementById('dropdown');
        var page = document.getElementById('page');
        var timer = document.getElementById('timer');

        getSavedChoice();
        getSavedTimer();
        getSavedTick();

        dropdown.addEventListener('change', () => {
            setMode(dropdown.value, url);
            saveChoice(url, dropdown.value);
        });
        page.addEventListener('change', () => {
            setMode(dropdown.value, url);
            saveTick();
        });

        timer.addEventListener('change', () => {
            timerRun(timer.value, url);
        });

        document.getElementById('button').addEventListener('click', function () {
            var choice = dropdown.value;
            if (choice == 'enabled') {
                setMode('disabled', url);
                dropdown.value = 'disabled';
                saveChoice();
            } else {
                setMode('enabled', url);
                dropdown.value = 'enabled';
                saveChoice();
            }
        });
    });
});


chrome.runtime.onMessage.addListener(
    function (msg, sender, sendResponse) {
        if (msg == 'done') {
            setMode('enabled');
        }
    }
);
