// ==UserScript==
// @name         imdb.com / add torrent link
// @namespace    http://tampermonkey.net/
// @version      2025-02-16-3
// @description  adds a link to search for torrents for the movie
// @author       You
// @match        https://www.imdb.com/title/tt*
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
                top: 10px;
                right: 10px;
                background: rgba(255, 255, 255, 0.95);
                z-index: 1000;
                color: #000;
                font-size: 14px;
                padding: 10px 15px;
                border-radius: 3px;
                max-width: 500px;
            }

            .torrent-popup p + p {
                margin-top: 12px;
            }
            
            .torrent-subtitles {
                margin-top: 12px;
            }
            
            .torrent-subtitles p {
                display: none;
                overflow: auto;
                max-height: 500px;
                padding-top: 5px;
            }
            
            .torrent-subtitles a {
                color: #000;
                display: inline-block;
                margin-bottom: 3px;
                // white-space: nowrap;
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

        return `magnet:?xt=urn:btih:${hash}&dn=${encodeURIComponent(name)}&tr=${trackers.join('&tr=')}`;
    }

    function createSubtitleLinks(imdb_id, popup) {
        fetch(`https://yifysubtitles.ch/movie-imdb/${imdb_id}`)
            .then(async (response) => {
                const html = await response.text()
                const parser = new DOMParser()
                return parser.parseFromString(html, "text/html");
            })
            .then(doc => {
                const el = document.createElement('div');
                el.classList.add('torrent-subtitles');

                const content = document.createElement('p');

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.addEventListener('change', () => {
                    content.style.display = checkbox.checked ? 'block' : 'none';
                });

                const label = document.createElement('label');
                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(' Show subtitles'));

                el.appendChild(label);
                el.appendChild(content);

                popup.appendChild(el);

                const subs = [];
                [...doc.querySelectorAll('.table > tbody > tr')].forEach(row => {
                    const lang = row.querySelector('.sub-lang').textContent;
                    if (lang === 'English') {
                        const link = row.querySelector('a');
                        link.querySelector('span').remove();
                        const url = link.getAttribute('href').replace(/\/subtitles\/(.*)/, '/subtitle/$1');
                        const name = link.textContent;
                        const rating = row.querySelector('.rating-cell').textContent;
                        subs.push({url, name, rating});
                    }
                });

                subs.sort((a, b) => b.rating - a.rating).forEach(sub => {
                    const {url, name, rating} = sub;
                    content.innerHTML += `<a href="https://yifysubtitles.ch${url}.zip" target="_blank">[${rating}] ${name}</a><br />`;
                });
            })
    }

    function createTorrent(popup, torrent) {
        const el = document.createElement('p');
        el.innerHTML = `
            Quality: <b>${torrent.quality} (${torrent.type})</b> <a href="${createMagnet(torrent.hash, torrent.movie_title)}" target="_blank">🧲</a><br />
            Size: <b>${torrent.size}</b><br />
            Seeds/peers: <b>${torrent.seeds} / ${torrent.peers}</b><br />
        `;

        popup.appendChild(el);
    }

    const imdb_id = window.location.href.match(/tt\d+/)[0] ?? 0;
    fetch(`https://yts.mx/api/v2/movie_details.json?imdb_id=${imdb_id}`).then(response => response.json()).then(resp => {
        createStyle();
        const popup = createPopup();

        if (resp.data.movie.id > 0) {
            resp.data.movie.torrents.forEach(torrent => {
                createTorrent(popup, {...torrent, movie_title: resp.data.movie.title_english});
            });
            createSubtitleLinks(imdb_id, popup);

        } else {
            popup.innerHTML = 'Torrent not found';
        }
    });
})();