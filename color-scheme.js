const themeToggler = document.querySelector("#colorScheme");

themeToggler.addEventListener("change", e => {
  if (e.target.checked) {
    document.documentElement.dataset.theme = "light";
    localStorage.setItem("theme", "light");
  } else {
    document.documentElement.dataset.theme = "dark";
    localStorage.setItem("theme", "dark");
  }
});

// store a cookie with the theme preference

// get theme cookie
const currentTheme = localStorage.getItem("theme");
if (currentTheme == "light") {
  document.documentElement.dataset.theme = "light";
  themeToggler.checked = true;
} else {
  document.documentElement.dataset.theme = "dark";
}

// track mouse movement on the .ring-section and update the CSS variables
// css property is a percentage
window.addEventListener("mousemove", e => {
  // only handle mouse events, not touch
  let x, y
  const multiplier = .2;
  if (e.type === "touchmove") {
    x = .5;
    y = .5;
  } else {
    x = e.clientX / window.innerWidth;
    y = e.clientY / window.innerHeight;
  }
  document.documentElement.style.setProperty("--mouse-x", (x * 100 - 50) * multiplier + "deg");
  document.documentElement.style.setProperty("--mouse-y", (y * -100 + 50) * multiplier + "deg");
});
