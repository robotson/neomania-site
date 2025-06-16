// Theme toggle functionality
const themeToggle = document.querySelector(".theme-toggle");

// Enhanced logging for theme system
function getThemeStats(action) {
  return {
    timestamp: Date.now(),
    action,
    theme: {
      current: document.documentElement.classList.contains("light-theme")
        ? "light"
        : "dark",
      saved: localStorage.getItem("theme"),
      systemPreference: window.matchMedia("(prefers-color-scheme: light)")
        .matches
        ? "light"
        : "dark",
      toggle: !!themeToggle,
    },
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollY: window.scrollY,
    },
    document: {
      readyState: document.readyState,
      visibilityState: document.visibilityState,
    },
  };
}

console.log("🎨 THEME: Initializing theme system");
console.log(JSON.stringify(getThemeStats("INIT"), null, 2));

// Reduced motion handling moved to reduced-motion.js

// Check saved theme preference or system preference
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  console.log(`🎨 THEME: Found saved preference: ${savedTheme}`);
  if (savedTheme === "light") {
    document.documentElement.classList.add("light-theme");
  }
  console.log(JSON.stringify(getThemeStats("SAVED_APPLIED"), null, 2));
} else {
  // Check system preference on first load
  if (window.matchMedia("(prefers-color-scheme: light)").matches) {
    console.log("🎨 THEME: No saved preference, using system light theme");
    document.documentElement.classList.add("light-theme");
    localStorage.setItem("theme", "light");
    console.log(JSON.stringify(getThemeStats("SYSTEM_LIGHT_APPLIED"), null, 2));
  } else {
    console.log("🎨 THEME: No saved preference, using system dark theme");
    console.log(JSON.stringify(getThemeStats("SYSTEM_DARK_APPLIED"), null, 2));
  }
}

// Listen for system theme changes
window
  .matchMedia("(prefers-color-scheme: light)")
  .addEventListener("change", (e) => {
    console.log(
      `🎨 THEME: System preference changed to ${e.matches ? "light" : "dark"}`
    );
    if (!localStorage.getItem("theme")) {
      // Only react if user hasn't set a preference
      if (e.matches) {
        document.documentElement.classList.add("light-theme");
        console.log("🎨 THEME: Applied system light theme change");
      } else {
        document.documentElement.classList.remove("light-theme");
        console.log("🎨 THEME: Applied system dark theme change");
      }
      console.log(JSON.stringify(getThemeStats("SYSTEM_CHANGE"), null, 2));
    } else {
      console.log(
        "🎨 THEME: System change ignored - user has saved preference"
      );
    }
  });

if (themeToggle) {
  console.log("🎨 THEME: Theme toggle found, adding click listener");
  themeToggle.addEventListener("click", () => {
    console.log("🎨 THEME: Toggle clicked");
    document.documentElement.classList.toggle("light-theme");
    const isLight = document.documentElement.classList.contains("light-theme");
    localStorage.setItem("theme", isLight ? "light" : "dark");
    console.log(`🎨 THEME: Switched to ${isLight ? "light" : "dark"} theme`);
    console.log(JSON.stringify(getThemeStats("USER_TOGGLE"), null, 2));
  });
} else {
  console.log("⚠️ THEME: Theme toggle not found");
}

// Animation logic moved to wordmark-wiggle.js

// Email protection script with toast notification instead of alert
const emailLink = document.getElementById("email-link");
if (emailLink) {
  console.log("📧 EMAIL: Email protection link found, adding listener");

  emailLink.addEventListener("click", function (e) {
    const startTime = performance.now();
    console.log("📧 EMAIL: Link clicked, protecting email address");

    e.preventDefault();
    const user = "contact";
    const domain = "neomania.net";
    const emailAddress = user + "@" + domain;

    console.log("📧 EMAIL: Copying to clipboard via deprecated API");
    const textarea = document.createElement("textarea");
    textarea.value = emailAddress;
    document.body.appendChild(textarea);
    textarea.select();

    try {
      const success = document.execCommand("copy");
      console.log(
        `📧 EMAIL: Copy ${success ? "successful" : "failed"} using execCommand`
      );
    } catch (err) {
      console.error("📧 EMAIL: Copy failed with error:", err);
    }

    document.body.removeChild(textarea);

    const toast = document.getElementById("toast");
    if (toast) {
      console.log("🍞 TOAST: Showing copy notification");
      toast.classList.add("show");

      setTimeout(function () {
        toast.classList.remove("show");
        console.log("🍞 TOAST: Hiding notification");

        const endTime = performance.now();
        console.log("📧 EMAIL: Copy operation completed in", {
          duration: `${(endTime - startTime).toFixed(2)}ms`,
          timestamp: Date.now(),
          emailAddress: emailAddress,
          toastShown: true,
        });
      }, 3000);
    } else {
      console.log("⚠️ TOAST: Toast element not found");
    }
  });
} else {
  console.log("⚠️ EMAIL: Email link not found");
}

console.log("🚀 MAIN: All main.js initialization complete");
console.log(JSON.stringify(getThemeStats("COMPLETE"), null, 2));
