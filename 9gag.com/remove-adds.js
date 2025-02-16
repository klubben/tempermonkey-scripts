// ==UserScript==
// @name         9gag.com/remove-adds
// @namespace    http://tampermonkey.net/
// @version      2025-02-16
// @description  try to take over the world!
// @author       You
// @match        https://9gag.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=9gag.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const style = document.createElement('style');
    style.innerHTML = `
       .sidebar, .shadow-root-voltax-mp, .billboard-flexsider-ad, .inline-ad-container {
           display: none !important;
       }
       #top-nav {
           top: 0 !important;
       }
    `;
    document.getElementsByTagName('head')[0].appendChild(style);
})();