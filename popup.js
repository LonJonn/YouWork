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

document.addEventListener('DOMContentLoaded', () => {
    getCurrentTabUrl((url) => {
        var dropdown = document.getElementById('dropdown');
        getSavedChoice(url, (savedChoice) => {
            if (savedChoice) {
                setMode(savedChoice, url);
                dropdown.value = savedChoice;
            }
            dropdown.addEventListener('change', () => {
                setMode(dropdown.value, url);
                saveChoice(url, dropdown.value);
            });
            page.addEventListener('change', () => {
                setMode(dropdown.value, url);
                saveChoice(url, dropdown.value);
            });
        });
    });
});
