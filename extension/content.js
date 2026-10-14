// GitHub Image Viewer
// Adds a thumbnail grid above the file list of any GitHub folder that contains
// images, plus a full-size lightbox. Settings are kept in chrome.storage.
(() => {
    "use strict";

    const IMAGE_EXT = /\.(png|jpe?g|gif|webp|bmp|svg|avif|ico)$/i;
    const defaults = { size: 160, perRow: 0, showNames: true, hideList: false, open: true };
    let settings = { ...defaults };
    let lastKey = "";
    let images = [];

    const store = {
        load: () => new Promise(resolve => {
            try {
                chrome.storage.local.get(defaults, v => resolve(v || defaults));
            } catch (e) {
                resolve(defaults);
            }
        }),
        save: () => {
            try {
                chrome.storage.local.set(settings);
            } catch (e) {
                // Settings simply don't persist.
            }
        }
    };

    // The folder's file table (current React UI), or the older grid UI.
    function findList() {
        return document.querySelector('table[aria-labelledby="folders-and-files"]') ||
            document.querySelector('div[role="grid"][aria-labelledby="files"]') ||
            document.querySelector('div.js-details-container [role="grid"]');
    }

    function findImages(list) {
        const seen = new Map();
        for (const a of list.querySelectorAll('a[href*="/blob/"]')) {
            const href = a.getAttribute("href").split("?")[0].split("#")[0];
            if (!IMAGE_EXT.test(href) || seen.has(href)) continue;
            seen.set(href, decodeURIComponent(href.split("/").pop()));
        }
        return [...seen].map(([href, name]) => ({
            href,
            name,
            src: href.replace("/blob/", "/raw/")
        }));
    }

    //-------------------------------------------------------------------------
    // Grid

    function layout(panel) {
        const grid = panel.querySelector(".ghiv-grid");
        grid.style.gridTemplateColumns = settings.perRow > 0
            ? `repeat(${settings.perRow}, minmax(0, 1fr))`
            : `repeat(auto-fill, minmax(${settings.size}px, 1fr))`;
        grid.style.setProperty("--ghiv-size", `${settings.size}px`);
        grid.classList.toggle("ghiv-nonames", !settings.showNames);
        grid.style.display = settings.open ? "" : "none";
        panel.querySelector(".ghiv-toggle").textContent = settings.open ? "Hide thumbnails" : "Show thumbnails";
        const list = findList();
        if (list) list.classList.toggle("ghiv-hidelist", settings.open && settings.hideList);
    }

    function control(label, html, key, read) {
        const l = document.createElement("label");
        l.innerHTML = `${label} ${html}`;
        const input = l.querySelector("input");
        input.addEventListener("input", () => {
            settings[key] = read(input);
            const out = l.querySelector("output");
            if (out) out.textContent = input.value;
            store.save();
            layout(l.closest(".ghiv-panel"));
        });
        return l;
    }

    function build(list) {
        const panel = document.createElement("div");
        panel.className = "ghiv-panel";

        const bar = document.createElement("div");
        bar.className = "ghiv-bar";
        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "ghiv-toggle";
        toggle.addEventListener("click", () => {
            settings.open = !settings.open;
            store.save();
            layout(panel);
        });
        bar.append(
            toggle,
            control("Size", `<input type="range" min="48" max="512" step="8" value="${settings.size}"><output>${settings.size}</output>px`,
                "size", i => Number(i.value)),
            control("Per row", `<input type="number" min="0" max="20" value="${settings.perRow}" title="0 = fit as many as the size allows">`,
                "perRow", i => Math.max(0, Math.min(20, Number(i.value) || 0))),
            control("", `<input type="checkbox" ${settings.showNames ? "checked" : ""}> Names`, "showNames", i => i.checked),
            control("", `<input type="checkbox" ${settings.hideList ? "checked" : ""}> Hide file list`, "hideList", i => i.checked)
        );
        const count = document.createElement("span");
        count.className = "ghiv-count";
        count.textContent = `${images.length} image${images.length === 1 ? "" : "s"}`;
        bar.append(count);

        const grid = document.createElement("div");
        grid.className = "ghiv-grid";
        images.forEach((im, index) => {
            const a = document.createElement("a");
            a.className = "ghiv-item";
            a.href = im.href;
            a.title = im.name;
            a.addEventListener("click", e => {
                // Plain click opens the lightbox; modified clicks keep the link.
                if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
                e.preventDefault();
                openLightbox(index);
            });
            const img = document.createElement("img");
            img.loading = "lazy";
            img.decoding = "async";
            img.alt = im.name;
            img.src = im.src;
            const name = document.createElement("span");
            name.textContent = im.name;
            a.append(img, name);
            grid.append(a);
        });

        panel.append(bar, grid);
        list.parentElement.insertBefore(panel, list);
        layout(panel);
    }

    //-------------------------------------------------------------------------
    // Lightbox

    let box = null;
    let current = 0;

    function buildLightbox() {
        box = document.createElement("div");
        box.className = "ghiv-lightbox";
        box.innerHTML = `
            <button type="button" class="ghiv-lb-close" aria-label="Close">&times;</button>
            <button type="button" class="ghiv-lb-prev" aria-label="Previous">&#8249;</button>
            <figure><img alt=""><figcaption><a target="_blank" rel="noopener"></a><span></span></figcaption></figure>
            <button type="button" class="ghiv-lb-next" aria-label="Next">&#8250;</button>`;
        box.addEventListener("click", e => {
            if (e.target === box || e.target.closest(".ghiv-lb-close")) closeLightbox();
            else if (e.target.closest(".ghiv-lb-prev")) step(-1);
            else if (e.target.closest(".ghiv-lb-next")) step(1);
        });
        box.querySelector("img").addEventListener("load", e => {
            const img = e.target;
            // Small images are scaled up; keep their pixels sharp.
            img.classList.toggle("ghiv-pixel", Math.max(img.naturalWidth, img.naturalHeight) < 256);
            box.querySelector("figcaption span").textContent =
                `${img.naturalWidth} × ${img.naturalHeight} · ${current + 1} / ${images.length}`;
        });
        document.body.append(box);
    }

    function show(index) {
        current = (index + images.length) % images.length;
        const im = images[current];
        box.querySelector("img").src = im.src;
        box.querySelector("img").alt = im.name;
        const link = box.querySelector("figcaption a");
        link.href = im.href;
        link.textContent = im.name;
        box.querySelector("figcaption span").textContent = `${current + 1} / ${images.length}`;
    }

    function step(delta) {
        show(current + delta);
    }

    function openLightbox(index) {
        if (!box) buildLightbox();
        show(index);
        box.classList.add("ghiv-open");
    }

    function closeLightbox() {
        if (box) box.classList.remove("ghiv-open");
    }

    document.addEventListener("keydown", e => {
        if (!box || !box.classList.contains("ghiv-open")) return;
        if (e.key === "Escape") closeLightbox();
        else if (e.key === "ArrowLeft") step(-1);
        else if (e.key === "ArrowRight") step(1);
        else return;
        e.preventDefault();
        e.stopPropagation();
    }, true);

    //-------------------------------------------------------------------------
    // Page tracking

    function refresh() {
        const list = findList();
        const existing = document.querySelector(".ghiv-panel");
        if (!list) {
            if (existing) existing.remove();
            lastKey = "";
            return;
        }
        const found = findImages(list);
        const key = location.pathname + "|" + found.map(i => i.href).join(",");
        if (existing && key === lastKey) return;
        if (existing) existing.remove();
        closeLightbox();
        lastKey = key;
        images = found;
        if (images.length) build(list);
    }

    let timer = 0;
    const schedule = () => {
        clearTimeout(timer);
        timer = setTimeout(refresh, 250);
    };

    store.load().then(v => {
        settings = { ...defaults, ...v };
        refresh();
        // GitHub navigates without page loads, so watch the DOM for new folders.
        new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
        document.addEventListener("turbo:load", schedule);
        window.addEventListener("popstate", schedule);
    });
})();
