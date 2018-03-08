// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Get the current URL.
 *
 * @param {function(string)} callback called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
    var queryInfo = {
        active: true,
        currentWindow: true
    };

    chrome.tabs.query(queryInfo, (tabs) => {
        var tab = tabs[0];
        var url = tab.url.substr(0, 23);
        console.log(url);
        console.assert(typeof url == 'string', 'tab.url should be a string');
        callback(url);
    });
}

function studyMode(choice) {
    chrome.tabs.insertCSS(null, {
        code: "#items.ytd-watch-next-secondary-results-renderer {visibility: " + choice + ";} !important"
    })
}

function setMode(choice, url) {
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
    }
    if (!page.checked || choice == 'disabled') {
        chrome.tabs.insertCSS(null, {
            code: "#dismissable.style-scope.ytd-shelf-renderer {visibility: visible;} !important"
        })
    }
}

function getSavedChoice(url, callback) {
    chrome.storage.sync.get(url, (items) => {
        callback(chrome.runtime.lastError ? null : items[url]);
    });
}

function saveChoice(url, choice) {
    var items = {};
    items[url] = choice;
    chrome.storage.sync.set(items);
}

function getSavedTick() {
    chrome.storage.sync.get("ticked", function (obj) {
        console.log(obj['ticked']);
        page.checked = obj['ticked'];
        setMode(dropdown.value, url);
    });
}

function saveTick() {
    chrome.storage.sync.set({
        'ticked': page.checked
    });
}

function timerRun(time, url) {
    if (!time) {
        return
    }

    if (time == '15min') {
        timerGo(0, 15, url);
    } else if (time == '30min') {
        timerGo(0, 3, url);
    } else if (time == '45min') {
        timerGo(0, 45, url);
    } else if (time == '1hour') {
        timerGo(1, 0, url);
    }

}

function timerGo(hour, minute, url) {
    startTime = new Date();
    loop = window.setInterval(function() {
        var now = new Date();
        if (now.getSeconds()+now.getHours() === startTime.getSeconds()+startTime.getHours() + minute + hour) {
            setMode('enabled', url);
            dropdown.value = 'enabled';
            saveChoice(url, 'enabled');
            timer.value = '';
            clearInterval(loop);
        }
    }, 600)
}

document.addEventListener('DOMContentLoaded', () => {
    getCurrentTabUrl((url) => {
        var dropdown = document.getElementById('dropdown');
        var page = document.getElementById('page');
        var timer = document.getElementById('timer');
        getSavedChoice(url, (savedChoice) => {
            if (savedChoice) {
                setMode(savedChoice, url);
                dropdown.value = savedChoice;
            }

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
        });

        document.getElementById('button').addEventListener('click', function () {
            var choice = dropdown.value;
            if (choice == 'enabled') {
                setMode('disabled', url);
                saveChoice(url, 'disabled');
                dropdown.value = 'disabled';
            } else {
                setMode('enabled', url);
                saveChoice(url, 'enabled');
                dropdown.value = 'enabled';
            }
        });
    });
});
