import { LitElement, html, css } from "lit";

/** Provides the Lit counterpart for comparing generated stories and Controls. */
export class LitGreeting extends LitElement {
  static properties = {
    label: { type: String, reflect: true },
    count: { type: Number, reflect: true },
    disabled: { type: Boolean, reflect: true },
    data: { attribute: false },
  };

  static styles = css`
    :host {
      display: block;
      padding-top: var(--padding, 8px);
    }
  `;

  constructor() {
    super();
    this.label = "Hello Lit";
    this.count = 0;
    this.disabled = false;
    this.data = { message: "Default data" };
    this.attachInternals().states.add("ready");
  }

  activate() {
    this.label = "From component";
    this.dispatchEvent(
      new CustomEvent("greeting-change", { detail: this.label, bubbles: true }),
    );
  }

  render() {
    return html`
      <span part="label">${this.label}</span>
      <span id="data">${this.data.message}</span>
      <slot name="header"></slot><slot></slot>
      <button @click=${this.activate}>Update from component</button>
    `;
  }
}

customElements.define("lit-greeting", LitGreeting);
