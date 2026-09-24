const THEME_KEY = "alan-resume-darkMode";
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

includeCSS();
includeHTML();
printEventListeners();
initSections();
initReveal();
initSpotlight();
initTyped();
initScrollEffects();

async function includeCSS() {
    const cssFiles = [
        "./styles/dark-mode-toggle.css"
    ];
    cssFiles.forEach(file => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = `${file}`;
        document.head.appendChild(link);
    });

}

// Include the dark mode toggle HTML into the page
async function includeHTML() {
    const files = ["./components/dark-mode-toggle.html"];
    for (let file of files) {
        const response = await fetch(file);
        const data = await response.text();
        document.querySelector("#theme-switcher").innerHTML = data;
    }
    initializeDarkMode();
    addDarkModeToggleEventListeners();
}

function initializeDarkMode() {
    // default is dark
    const isDarkMode = !localStorage.hasOwnProperty(THEME_KEY) || localStorage.getItem(THEME_KEY) === "true";
    toggleDarkMode(isDarkMode);
}

function toggleDarkMode(active) {
    const toggle = document.getElementById("darkModeToggle");
    if (toggle) {
        toggle.classList.toggle("active", active);
        toggle.setAttribute("aria-checked", active ? "true" : "false");
        toggle.querySelector(".thumb").classList.toggle("active", active);
    }
    document.documentElement.setAttribute("data-theme", active ? "dark" : "light");
}

// Reveal the new theme as a circle expanding from the toggle, where supported
function switchThemeAnimated(active, x, y) {
    if (!document.startViewTransition || prefersReducedMotion) {
        toggleDarkMode(active);
        return;
    }
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const transition = document.startViewTransition(() => toggleDarkMode(active));
    transition.ready.then(() => {
        document.documentElement.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
            { duration: 650, easing: "cubic-bezier(0.4, 0, 0.2, 1)", pseudoElement: "::view-transition-new(root)" }
        );
    });
}

function printEventListeners() {
    window.addEventListener('beforeprint', () => {
        document.documentElement.setAttribute("data-theme", "light");
    });
    window.addEventListener('afterprint', () => {
        initializeDarkMode();
    });
}

function addDarkModeToggleEventListeners() {
    const toggle = document.getElementById("darkModeToggle");

    toggle.addEventListener("click", () => {
        const active = !toggle.classList.contains("active");
        localStorage.setItem(THEME_KEY, active ? true : false);
        const rect = toggle.getBoundingClientRect();
        switchThemeAnimated(active, rect.left + rect.width / 2, rect.top + rect.height / 2);
    });

    toggle.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggle.click();
        }
    });
}

function initSections() {
    document.querySelectorAll(".section-title").forEach(title => {
        const section = title.closest("section");
        title.setAttribute("role", "button");
        title.setAttribute("tabindex", "0");
        title.setAttribute("aria-expanded", "true");
        title.addEventListener("click", () => toggleSection(section.id));
        title.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toggleSection(section.id);
            }
        });
    });
}

function toggleSection(id) {
    const section = document.getElementById(id);
    const collapsed = section.classList.toggle('collapsed');
    section.querySelector(".section-title")?.setAttribute("aria-expanded", String(!collapsed));
}

// Fade elements in as they scroll into view, and count up the hero stats
function initReveal() {
    document.querySelectorAll("[data-stagger]").forEach(group => {
        [...group.children].forEach((child, i) => child.style.setProperty("--d", `${i * 90}ms`));
    });
    document.querySelectorAll(".chips").forEach(list => {
        [...list.children].forEach((chip, i) => chip.style.setProperty("--i", i));
    });

    const targets = document.querySelectorAll(".reveal, .timeline, [data-count]");
    if (!("IntersectionObserver" in window)) {
        targets.forEach(el => el.classList.add("in"));
        return;
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("in");
            if (entry.target.dataset.count) animateCount(entry.target);
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    targets.forEach(el => observer.observe(el));
}

function animateCount(el) {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    if (prefersReducedMotion) {
        el.textContent = target + suffix;
        return;
    }
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

// Soft light that follows the cursor across cards
function initSpotlight() {
    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("pointermove", (event) => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
            card.style.setProperty("--my", `${event.clientY - rect.top}px`);
        });
    });
}

// Typewriter effect cycling through the focus areas
function initTyped() {
    const el = document.querySelector(".typed");
    if (!el) return;
    const words = el.dataset.words.split("|");
    if (prefersReducedMotion) return;

    let wordIndex = 0;
    let charIndex = words[0].length;
    let deleting = true;

    const tick = () => {
        const word = words[wordIndex];
        charIndex += deleting ? -1 : 1;
        el.textContent = word.slice(0, charIndex);

        let delay = deleting ? 35 : 75;
        if (!deleting && charIndex === word.length) {
            deleting = true;
            delay = 2000;
        } else if (deleting && charIndex === 0) {
            deleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            delay = 350;
        }
        setTimeout(tick, delay);
    };
    setTimeout(tick, 2500);
}

// Scroll progress bar and back-to-top button
function initScrollEffects() {
    const progress = document.querySelector(".scroll-progress");
    const backToTop = document.querySelector(".back-to-top");
    let ticking = false;

    const update = () => {
        const max = document.documentElement.scrollHeight - innerHeight;
        progress?.style.setProperty("--progress", max > 0 ? scrollY / max : 0);
        backToTop?.classList.toggle("show", scrollY > 500);
        ticking = false;
    };

    window.addEventListener("scroll", () => {
        if (!ticking) {
            requestAnimationFrame(update);
            ticking = true;
        }
    }, { passive: true });

    backToTop?.addEventListener("click", () => window.scrollTo({ top: 0 }));
    update();
}
