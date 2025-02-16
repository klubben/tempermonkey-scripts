// ==UserScript==
// @name         imdb.com / add torrent link
// @namespace    http://tampermonkey.net/
// @version      2025-02-16
// @description  adds a link to search for torrents for the movie
// @author       You
// @match        https://imdb.com/title/tt*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=imdb.com
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function createStyle() {
        const style = document.createElement('style');
        style.innerHTML = `
            .torrent-popup {
                position: fixed;
                top: 0;
                right: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.8);
                z-index: 1000;
                color: #000;
                font-size: 14px;
            }
    `;
        document.getElementsByTagName('head')[0].appendChild(style);
    }

    function createPopup() {
        const popup = document.createElement('div');
        popup.classList.add('torrent-popup');
        document.getElementsByTagName('body')[0].appendChild(popup);

        return popup;
    }

    function createMagnet(hash, name) {
        const trackers = [
            "udp://glotorrents.pw:6969/announce",
            "udp://tracker.opentrackr.org:1337/announce",
            "udp://torrent.gresille.org:80/announce",
            "udp://tracker.openbittorrent.com:80",
            "udp://tracker.coppersurfer.tk:6969",
            "udp://tracker.leechers-paradise.org:6969",
            "udp://p4p.arenabg.ch:1337",
            "udp://tracker.internetwarriors.net:1337",
        ]

        return `agnet:?xt=urn:btih:${hash}&dn=${encodeURIComponent(name)}&tr=${trackers.join('&tr=')}`;
    }

    function createTorrent(popup, torrent) {
        const el = document.createElement('p');
        el.innerHTML = `
            Quality: <b>${torrent.quality} (${torrent.type})</b> <a href="${createMagnet(torrent.hash, torren.movie_title)}" target="_blank">🧲</a><br />
            Size: <b>${torrent.size}</b><br />
            Seeds/peers: <b>${torrent.seeds} / ${torrent.peers}</b><br />
        `;

        popup.appendChild(el);
    }

    const imdb_id = window.location.href.match(/tt\d+/)[0] ?? 0;
    fetch(`https://yts.mx/api/v2/movie_details.json?imdb_id=${imdb_id}`).then(response => response.json()).then(resp => {
        if (resp.data.movie.id > 0) {
            createStyle();
            const popup = createPopup();

            resp.data.movie.torrents.forEach(torrent => {
                createTorrent(popup, {...torrent, movie_title: resp.data.movie.title_english});
            });
        }
    });
})();