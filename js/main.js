// Theme toggle functionality
const themeToggle = document.querySelector(".theme-toggle");

// Reduced motion handling moved to reduced-motion.js

// Check saved theme preference or system preference
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  if (savedTheme === "light") {
    document.documentElement.classList.add("light-theme");
  }
} else {
  // Check system preference on first load
  if (window.matchMedia("(prefers-color-scheme: light)").matches) {
    document.documentElement.classList.add("light-theme");
    localStorage.setItem("theme", "light");
  }
}

// Listen for system theme changes
window
  .matchMedia("(prefers-color-scheme: light)")
  .addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) {
      // Only react if user hasn't set a preference
      if (e.matches) {
        document.documentElement.classList.add("light-theme");
      } else {
        document.documentElement.classList.remove("light-theme");
      }
    }
  });

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.documentElement.classList.toggle("light-theme");
    const isLight = document.documentElement.classList.contains("light-theme");
    localStorage.setItem("theme", isLight ? "light" : "dark");
  });
}

// Animation logic moved to wordmark-wiggle.js

// Email protection script with toast notification instead of alert
const emailLink = document.getElementById("email-link");
if (emailLink) {
  emailLink.addEventListener("click", function (e) {
    e.preventDefault();
    const user = "contact";
    const domain = "neomania.net";
    const emailAddress = user + "@" + domain;

    const textarea = document.createElement("textarea");
    textarea.value = emailAddress;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);

    const toast = document.getElementById("toast");
    toast.classList.add("show");

    setTimeout(function () {
      toast.classList.remove("show");
    }, 3000);
  });
}
