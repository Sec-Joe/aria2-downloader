// ==UserScript==
// @name         Aria2 Downloader (Auto Open)
// @name:zh       Aria2 下载拦截器
// @namespace    https://github.com/Sec-Joe/aria2-downloader
// @version      1.0.0
// @description  Intercept file downloads and send to Aria2 automatically, with Aria2 Explorer tab auto-open
// @description:zh  拦截浏览器下载，自动发送到 Aria2 RPC，并打开 Aria2 Explorer 查看进度
// @author       JoeSec
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @connect      localhost
// @run-at       document-start
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    console.log('🔥 Aria2 下载拦截器已加载');

    // ─── 配置 ─────────────────────────────────────────
    const ARIA2_RPC = 'http://localhost:6800/jsonrpc';    // Aria2 RPC 地址
    const ARIA2_UI  = 'http://localhost:6800/';            // Aria2 Explorer 地址
    const TOKEN    = '';                                   // Aria2 RPC token（有就填）
    const TAB_NAME = 'aria2_explorer_auto';                // 固定标签页名，浏览器自动复用
    // ─────────────────────────────────────────────────

    // 可下载文件扩展名
    const DOWNLOAD_EXTS = /\.(exe|zip|rar|7z|iso|pdf|dmg|apk|msi|pkg|tar|gz|xz|deb|rpm|mp4|mkv|avi|mov|mp3|flac)$/i;

    // ─── 1. 拦截 <a> 标签点击 ────────────────────────
    document.addEventListener('click', (e) => {
        let target = e.target;
        while (target && target.tagName !== 'A') target = target.parentElement;

        if (target && target.tagName === 'A') {
            const href = target.href;
            if (DOWNLOAD_EXTS.test(href)) {
                e.preventDefault();
                e.stopPropagation();
                sendToAria2(href, target.textContent.trim() || href.split('/').pop());
            }
        }
    }, true);

    // ─── 2. 拦截编程式下载 ────────────────────────────
    const originalCreateElement = document.createElement.bind(document);
    document.createElement = function(tagName) {
        const el = originalCreateElement(tagName);

        if (tagName.toLowerCase() === 'a') {
            const originalClick = el.click.bind(el);
            el.click = function() {
                if (el.href && DOWNLOAD_EXTS.test(el.href)) {
                    sendToAria2(el.href, el.download || el.href.split('/').pop());
                } else {
                    originalClick();
                }
            };
        }

        return el;
    };

    // ─── 3. 发送到 Aria2 RPC ──────────────────────────
    function sendToAria2(url, filename) {
        console.log('📥 拦截下载:', url);

        const payload = {
            jsonrpc: '2.0',
            id: Date.now().toString(),
            method: 'aria2.addUri',
            params: [[url], {
                out: filename,
                header: ['User-Agent: Mozilla/5.0', 'Referer: ' + location.href]
            }]
        };

        if (TOKEN) payload.params.unshift('token:' + TOKEN);

        GM_xmlhttpRequest({
            method: 'POST',
            url: ARIA2_RPC,
            headers: {'Content-Type': 'application/json'},
            data: JSON.stringify(payload),
            onload: (resp) => {
                console.log('🚀 Aria2 响应:', resp.responseText);
                if (resp.status === 200) {
                    try {
                        const result = JSON.parse(resp.responseText);
                        if (result.result) {
                            console.log('✅ 任务已添加, GID:', result.result);
                            openAria2UI();
                        } else if (result.error) {
                            console.error('❌ Aria2 错误:', result.error);
                        }
                    } catch (e) {}
                }
            },
            onerror: (err) => console.error('❌ RPC 请求失败:', err)
        });
    }

    // ─── 4. 自动打开 Aria2 Explorer ──────────────────
    function openAria2UI() {
        const w = window.open(ARIA2_UI, TAB_NAME);
        if (!w) {
            console.warn('⚠️ 弹窗被浏览器拦截，请允许此站点弹窗');
        }
    }
})();
