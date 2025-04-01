class MarqueeBlock extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host {
          display: block;
          overflow: hidden;
          --duration: 10s;
        }

        .marquee-container {
          display: flex;
          white-space: nowrap;
          animation: scroll var(--duration) linear infinite;
        }

        @keyframes scroll {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(-100%);
          }
        }
      </style>
      <div class="marquee-container">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('josh-marquee', MarqueeBlock);
