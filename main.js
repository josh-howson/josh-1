const themeToggler = document.querySelector("#colorScheme");

themeToggler.addEventListener("change", e => {
  const newTheme = e.target.checked ? 'light' : 'dark';
  document.documentElement.dataset.theme = newTheme;
  localStorage.setItem("theme", newTheme);
  gtag('event', 'theme_toggle', { theme: newTheme });
});

// store a cookie with the theme preference

// get theme cookie
const currentTheme = localStorage.getItem("theme");
if (currentTheme == "light") {
  document.documentElement.dataset.theme = "light";
  themeToggler.checked = true;
} else if (currentTheme == "dark") {
  document.documentElement.dataset.theme = "dark";
} else {
  // no cookie, check for system preference and set the cookie
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.documentElement.dataset.theme = "dark";
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.dataset.theme = "light";
    themeToggler.checked = true;
    localStorage.setItem("theme", "light");
  }
}

// track mouse movement on the .ring-section and update the CSS variables
// css property is a percentage
const portrait = document.querySelector(".ring-section .portrait");
if (portrait) {
  portrait.addEventListener("mousemove", e => {
    // only handle mouse events, not touch
    let x, y
    const multiplier = .4;
    if (e.type === "touchmove") {
      x = .5;
      y = .5;
    } else {
      x = e.offsetX / portrait.offsetWidth;
      y = e.offsetY / portrait.offsetHeight;
    }
    document.documentElement.style.setProperty("--mouse-x", (x * 100 - 50) * multiplier + "deg");
    document.documentElement.style.setProperty("--mouse-y", (y * -100 + 50) * multiplier + "deg");
  });

  // reset on mouseout
  portrait.addEventListener("mouseout", e => {
    document.documentElement.style.setProperty("--mouse-x", "0deg");
    document.documentElement.style.setProperty("--mouse-y", "0deg");
  });
}

const initHomepageAnimations = () => {
  const sparkleContainer = document.createElement("div");
  sparkleContainer.classList.add("sparkle-container");
  document.body.firstChild.before(sparkleContainer);

  const addSparkle = () => {
    // in case they don't unrender
    if (sparkleContainer.children.length < 50) {
      const sparkle = document.createElement("div");
      sparkle.innerHTML = `
        <svg viewBox="0 0 576 512">
          <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/>
        </svg>
      `
      sparkle.classList.add("sparkle");
      sparkle.style.top = Math.random() * 100 + "%";
      sparkle.style.left = Math.random() * 100 + "%";
      sparkle.style.animationDuration = Math.random() * 4 + 1 + "s";
      sparkle.style.setProperty("--opacity", Math.max(.1, Math.random() * .6 - .2));
      sparkle.style.setProperty("--size", Math.max(2, Math.random() * 15 - 10) + "rem");
      sparkle.style.setProperty("--top", Math.random() * 100 + "%");
      sparkle.style.setProperty("--left", Math.random() * 100 + "%");
      const snapToNearest = number => Math.abs(number - 100) < Math.abs(number + 100) ? 50 : -50;

      const fromX = Math.random() * 100 - 50;
      const fromY = Math.random() * 100 - 50;
      const toX = snapToNearest(fromX);
      const toY = snapToNearest(fromY);
      sparkle.style.setProperty("--from-x", fromX + "vw");
      sparkle.style.setProperty("--from-y", fromY + "vh");
      sparkle.style.setProperty("--to-x", toX + "vw");
      sparkle.style.setProperty("--to-y", toY + "vh");
      sparkleContainer.appendChild(sparkle);
      sparkle.addEventListener("animationend", () => {
        sparkle.remove();
      });
    }
    setTimeout(() => addSparkle(), Math.max(500, Math.random() * 1000 + -500));
  };

  addSparkle();

  const setBackgroundGradientPosition = () => {
    let duration = Math.max(20000, Math.random() * 50000 - 20000);
    const x = Math.random() * 100 - 50;
    const y = Math.random() * 60 - 50;
    const scale = Math.max(2, Math.random() * 4 - 2);
    document.body.style.setProperty("--gradient-x", x + "%");
    document.body.style.setProperty("--gradient-y", y + "%");
    document.body.style.setProperty("--gradient-scale", scale);
    document.body.style.setProperty("--bg-transition-duration", duration + "ms");
    
    setTimeout(() => setBackgroundGradientPosition(), duration);
  }

  document.addEventListener('DOMContentLoaded', (event) => {
    setBackgroundGradientPosition();
  });
}

if (document.querySelector(".homepage"))
  initHomepageAnimations();

document.addEventListener('DOMContentLoaded', function() {
  const videos = document.querySelectorAll('video');

  const loadVideo = (video) => {
    const source = video.querySelector('source');
    source.src = source.getAttribute('data-src');
    video.load();
    video.setAttribute('autoplay', true);
  };

  const observerOptions = {
    root: null,
    rootMargin: '500px',
    threshold: 0,
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        loadVideo(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  videos.forEach(video => {
    observer.observe(video);
  });
});
