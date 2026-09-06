includeCSS();
includeHTML();
printEventListeners();

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
    const isDarkMode = localStorage.getItem("alan-resume-darkMode") === "true";
    toggleDarkMode(isDarkMode);
}
function toggleDarkMode(active) {
    const toggle = document.getElementById("darkModeToggle");
    toggle.classList.toggle("active", active);

    toggle.setAttribute(
        "aria-checked",
        active ? "true" : "false"
    );

    const thumb = toggle.querySelector(".thumb");
    if (active) {
        thumb.classList.add("active");
    } else {
        thumb.classList.remove("active");
    }
    document.body.setAttribute("data-theme", active ? "dark" : "light");
}

function printEventListeners() {
    window.addEventListener('beforeprint', () => {
        document.body.setAttribute("data-theme", "light");
    });
    window.addEventListener('afterprint', () => {
        initializeDarkMode();
    });
}

function addDarkModeToggleEventListeners() {
    const toggle = document.getElementById("darkModeToggle");

    toggle.addEventListener("click", () => {
        const active = toggle.classList.toggle("active");
        toggleDarkMode(active);
        localStorage.setItem("alan-resume-darkMode", active ? true : false);
    });

    toggle.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggle.click();
        }
    });
}

function toggleSection(id) {
    const section = document.getElementById(id);
    section.classList.toggle('collapsed');
}
