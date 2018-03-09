// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Get the current URL.
 *
 * @param {function(string)} callback called when the URL of the current tab
 *   is found.
 */

var active = false;

function getCurrentTabUrl(callback) {
    var queryInfo = {
        active: true,
        currentWindow: true
    };

    chrome.tabs.query(queryInfo, (tabs) => {
        var tab = tabs[0];
        url = tab.url.substr(0, 23);
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
    } else if (!page.checked || choice == 'disabled') {
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
        'active': active,
        'minute': minute,
        'started': startTime
    });
}

function getSavedTimer() {
    chrome.storage.sync.get("active", function (obj) {
        active = obj['active'];
    });
    chrome.storage.sync.get("minute", function (obj) {
        minute = obj['minute'];
    });
    chrome.storage.sync.get("started", function (obj) {
        startTime = obj['started'];
    });
};

function timerRun(time, url) {
    startTime = new Date();
    startTime = startTime.getMinutes() /////////////////////////////////////////////////////

    if (!time || time == '') {
        active = false;
    }

    if (time == '15min') {
        active = true;
        minute = 15;
    }

    if (time == '30min') {
        active = true;
        minute = 30;
    }

    if (time == '45min') {
        active = true;
        minute = 45;
    }

    if (time == '1hour') {
        active = true;
        minute = 60;
    }

    saveTimer();
}

document.addEventListener('DOMContentLoaded', () => {
    getCurrentTabUrl((url) => {
        var dropdown = document.getElementById('dropdown');
        var page = document.getElementById('page');
        var timer = document.getElementById('timer');

        getSavedChoice(url, (savedChoice) => {
            if (savedChoice) {
                dropdown.value = savedChoice;
            };
        });

        getSavedTimer();

        setInterval(function () {
            if (active == true) {
                now = new Date();
                console.log(now.getMinutes() + now.getHours());
                if (now.getMinutes() + now.getHours() === startTime + minute) {
                    setMode('enabled', url);
                    dropdown.value = 'enabled';
                    saveChoice(url, 'enabled');
                    timer.value = '';
                    active = false;
                    saveTimer();
                }
            }

        }, 6000)

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
