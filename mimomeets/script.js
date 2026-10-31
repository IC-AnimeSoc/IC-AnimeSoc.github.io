// Builds the side nav and quick-link grid from the .card sections,
// and wires up the ▼ / ▶ collapse toggles.

(() => {
    const GRID_ROW_SIZE = 4;
    const MOBILE = window.matchMedia("(max-width: 860px)");

    const cards = [...document.querySelectorAll(".content .card")];
    const navList = document.querySelector(".side-nav__list");
    const grid = document.querySelector(".card-grid");
    const sideNav = document.getElementById("side-nav");
    const navToggle = document.querySelector(".nav-toggle");

    const slugify = (text) =>
        text.toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");

    const ensureId = (el, prefix) => {
        if (!el.id) el.id = `${prefix}-${slugify(el.textContent)}`;
        let id = el.id, n = 2;
        while (document.querySelectorAll(`#${CSS.escape(id)}`).length > 1) id = `${el.id}-${n++}`;
        el.id = id;
        return id;
    };

    const caretButton = (expanded, label) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "caret-button";
        button.setAttribute("aria-expanded", String(expanded));
        if (label) button.setAttribute("aria-label", label);
        return button;
    };

    const link = (href, text) => {
        const a = document.createElement("a");
        a.href = href;
        a.textContent = text;
        return a;
    };

    // ---------- Card sections: heading becomes a collapse toggle ----------
    const setCardOpen = (card, open) => {
        const toggle = card.querySelector(".card__toggle");
        toggle.setAttribute("aria-expanded", String(open));
        card.querySelector(".card__body").hidden = !open;
    };

    cards.forEach((card) => {
        const heading = card.querySelector(".card__heading");
        const body = card.querySelector(".card__body");
        const title = heading.textContent.trim();
        body.id ||= `${card.id}-body`;

        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "card__toggle";
        toggle.setAttribute("aria-controls", body.id);

        const label = document.createElement("span");
        label.className = "card__title";
        label.textContent = title;

        const caret = document.createElement("span");
        caret.className = "caret-button";
        caret.setAttribute("aria-hidden", "true");

        toggle.append(label, caret);
        heading.replaceChildren(toggle);
        card.dataset.title = title;

        toggle.addEventListener("click", () =>
            setCardOpen(card, toggle.getAttribute("aria-expanded") !== "true"));
        setCardOpen(card, true);
    });

    // ---------- Side nav ----------
    cards.forEach((card, i) => {
        const item = document.createElement("li");
        const row = document.createElement("div");
        row.className = "side-nav__row";
        row.append(link(`#${card.id}`, card.dataset.title));

        const subHeadings = [...card.querySelectorAll(".card__body h3, .card__body h4")];
        if (subHeadings.length) {
            const sub = document.createElement("ol");
            sub.className = "side-nav__sub";
            sub.id = `nav-${card.id}`;
            subHeadings.forEach((h) => {
                const li = document.createElement("li");
                li.className = h.tagName === "H4" ? "is-h4" : "is-h3";
                li.append(link(`#${ensureId(h, card.id)}`, h.textContent.trim()));
                sub.append(li);
            });

            const open = i === 0;
            const caret = caretButton(open, `Show sections in ${card.dataset.title}`);
            caret.setAttribute("aria-controls", sub.id);
            sub.hidden = !open;
            caret.addEventListener("click", () => {
                const next = caret.getAttribute("aria-expanded") !== "true";
                caret.setAttribute("aria-expanded", String(next));
                sub.hidden = !next;
            });

            row.append(caret);
            item.append(row, sub);
        } else {
            item.append(row);
        }
        navList.append(item);
    });

    // ---------- Quick-link grid: rows of 4 with hatched dead space ----------
    for (let i = 0; i < cards.length; i += GRID_ROW_SIZE) {
        const row = document.createElement("div");
        row.className = "card-grid__row";
        cards.slice(i, i + GRID_ROW_SIZE).forEach((card) =>
            row.append(link(`#${card.id}`, card.dataset.title)));
        const dead = document.createElement("span");
        dead.className = "card-grid__dead";
        dead.setAttribute("aria-hidden", "true");
        row.append(dead);
        grid.append(row);
    }

    // ---------- Jumping to a heading inside a collapsed card opens it ----------
    const revealHash = () => {
        const target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
        const card = target?.closest(".card");
        if (card) setCardOpen(card, true);
        if (target && target !== card) target.scrollIntoView();
    };
    window.addEventListener("hashchange", revealHash);
    revealHash();

    // ---------- Mobile contents drawer ----------
    const setDrawer = (open) => {
        sideNav.classList.toggle("is-open", open);
        navToggle.setAttribute("aria-expanded", String(open));
    };

    navToggle.addEventListener("click", () => setDrawer(!sideNav.classList.contains("is-open")));
    sideNav.addEventListener("click", (e) => {
        if (MOBILE.matches && e.target.closest("a")) setDrawer(false);
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && sideNav.classList.contains("is-open")) {
            setDrawer(false);
            navToggle.focus();
        }
    });
    MOBILE.addEventListener("change", () => setDrawer(false));
})();
