import {
  FASTElement,
  html,
  css,
  observable,
  nullableNumberConverter,
} from "@microsoft/fast-element";

/** Exercises reflected attributes, observable properties, slots, and Actions. */
export class FastGreeting extends FASTElement {
  constructor() {
    super();
    this.label = "Hello FAST";
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
}

observable(FastGreeting.prototype, "data");

FastGreeting.define({
  name: "fast-greeting",
  attributes: [
    "label",
    { property: "disabled", mode: "boolean" },
    { property: "count", converter: nullableNumberConverter },
  ],
  template: html`
    <span part="label">${(element) => element.label}</span>
    <span id="data">${(element) => element.data.message}</span>
    <slot name="header"></slot><slot></slot>
    <button @click="${(element) => element.activate()}">
      Update from component
    </button>
  `,
  styles: css`
    :host {
      display: block;
      padding-top: var(--padding, 8px);
    }
  `,
});
