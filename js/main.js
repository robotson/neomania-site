// Theme toggle functionality
const themeToggle = document.querySelector(".theme-toggle");

// Set data-motion attribute
document.documentElement.setAttribute("data-motion", "normal");
let isReducedMotion = false;

// Check for prefers-reduced-motion
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.documentElement.setAttribute("data-motion", "reduced");
  isReducedMotion = true;
}

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

// Animation script for the letters - BALANCED APPROACH
const letters = document.querySelectorAll(".text span");

// Keep original ranges for reference
const axes = {
  wght: { min: 350, max: 800 }, // Slightly higher min weight for readability
  wdth: { min: 50, max: 130 },
  opsz: { min: 14, max: 120 },
  GRAD: { min: -100, max: 100 },
  slnt: { min: -5, max: 0 },
  XOPQ: { min: 60, max: 150 }, // Slightly higher min optical weight
  XTRA: { min: 350, max: 550 },
  YOPQ: { min: 35, max: 120 },
  YTAS: { min: 700, max: 850 },
  YTDE: { min: -250, max: -120 },
  YTFI: { min: 600, max: 750 },
  YTLC: { min: 450, max: 550 },
  YTUC: { min: 550, max: 700 },
};

// Create balanced relationships between parameters
const balancedAxes = [
  // When one gets thinner, the other gets thicker (negative correlation)
  { axis1: "wght", axis2: "XOPQ", correlation: -0.6 },
  { axis1: "wdth", axis2: "XOPQ", correlation: -0.4 },
  { axis1: "wght", axis2: "wdth", correlation: -0.3 },
];

const letterStates = Array.from(letters).map(() => ({
  currentValues: Object.fromEntries(
    Object.entries(axes).map(([axis, range]) => [
      axis,
      Math.random() * (range.max - range.min) + range.min,
    ])
  ),
  directions: Object.fromEntries(
    Object.keys(axes).map((axis) => [axis, Math.random() < 0.5 ? -1 : 1])
  ),
  updateCounter: 0,
  // Give each letter a slightly different animation speed
  speed: Math.random() * 0.006 + 0.01, // Increased: Between 0.01 and 0.016
}));

// Throttle animation updates to every few frames
const LETTER_ANIMATION_THROTTLE = 2; // Reduced from 3 to 2 for faster updates
let frameCount = 0;

function animate() {
  frameCount++;

  // Only update letters every few frames
  if (frameCount % LETTER_ANIMATION_THROTTLE === 0) {
    letters.forEach((letter, index) => {
      const state = letterStates[index];
      state.updateCounter++;

      // Only check for direction changes occasionally
      if (state.updateCounter % 10 === 0) {
        for (let axis in axes) {
          if (Math.random() < 0.01) {
            state.directions[axis] *= -1;
          }
        }
      }

      // Primary animation step - move each axis value in its current direction
      for (let axis in axes) {
        state.currentValues[axis] +=
          state.directions[axis] *
          (axes[axis].max - axes[axis].min) *
          state.speed;

        if (state.currentValues[axis] <= axes[axis].min) {
          state.currentValues[axis] = axes[axis].min;
          state.directions[axis] = 1;
        } else if (state.currentValues[axis] >= axes[axis].max) {
          state.currentValues[axis] = axes[axis].max;
          state.directions[axis] = -1;
        }
      }

      // Apply balanced relationships between axes
      balancedAxes.forEach((relation) => {
        const { axis1, axis2, correlation } = relation;

        // Get normalized position of first axis (0 to 1)
        const range1 = axes[axis1].max - axes[axis1].min;
        const normalizedPos1 =
          (state.currentValues[axis1] - axes[axis1].min) / range1;

        // Calculate target position for second axis based on correlation
        // Negative correlation: when one is high, the other should be low
        let targetPos2;
        if (correlation < 0) {
          targetPos2 = 1 - normalizedPos1 * Math.abs(correlation);
        } else {
          targetPos2 = normalizedPos1 * correlation;
        }

        // Calculate a "pull" toward the balanced relationship
        // but don't override the independent animation completely
        const range2 = axes[axis2].max - axes[axis2].min;
        const targetValue2 = axes[axis2].min + targetPos2 * range2;
        const currentValue2 = state.currentValues[axis2];

        // Blend between current value and balanced target (30% influence)
        state.currentValues[axis2] = currentValue2 * 0.7 + targetValue2 * 0.3;
      });

      // Extra protection - if stroke weight and width both get low, boost one of them
      const weightNormalized =
        (state.currentValues.wght - axes.wght.min) /
        (axes.wght.max - axes.wght.min);
      const xopqNormalized =
        (state.currentValues.XOPQ - axes.XOPQ.min) /
        (axes.XOPQ.max - axes.XOPQ.min);

      // If both weight and optical weight are in the lower 30%, boost one of them
      if (weightNormalized < 0.3 && xopqNormalized < 0.3) {
        if (Math.random() < 0.5) {
          state.currentValues.wght =
            axes.wght.min + (axes.wght.max - axes.wght.min) * 0.4;
        } else {
          state.currentValues.XOPQ =
            axes.XOPQ.min + (axes.XOPQ.max - axes.XOPQ.min) * 0.4;
        }
      }

      // Apply the animation to the letter with rounding for performance
      letter.style.fontVariationSettings = Object.entries(state.currentValues)
        .map(([axis, value]) => `'${axis}' ${Math.round(value)}`)
        .join(", ");
    });
  }

  requestAnimationFrame(animate);
}

if (letters.length > 0) {
  animate();
}

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
