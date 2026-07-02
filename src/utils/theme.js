export function initTheme() {
  const themeToggleBtn = document.getElementById("theme-toggle");
  const themeIconMoon = document.getElementById("theme-icon-moon");
  const themeIconSun = document.getElementById("theme-icon-sun");
  const htmlElement = document.documentElement;

  function updateThemeIcons(isDarkMode) {
    if (isDarkMode) {
      themeIconMoon.classList.add("hidden");
      themeIconSun.classList.remove("hidden");
    } else {
      themeIconMoon.classList.remove("hidden");
      themeIconSun.classList.add("hidden");
    }
  }

  function loadTheme() {
    const storedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    let isDark =
      storedTheme === "dark"
        ? true
        : storedTheme === "light"
          ? false
          : systemPrefersDark;

    if (isDark) htmlElement.classList.add("dark");
    else htmlElement.classList.remove("dark");
    updateThemeIcons(isDark);
  }

  themeToggleBtn.addEventListener("click", () => {
    const isDark = htmlElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    updateThemeIcons(isDark);
  });

  loadTheme();
}
