import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

/**
 * An sample element.
 * 
 * @tag my-element
 *
 * @slot - This adds content between the logo and the counter button
 * @slot button-content - This adds extra content into the counter button
 *
 * @csspart button - The button
 * @csspart docs-hint - Adds custom styles to the docs hint
 *
 * @cssprop [--card-border-color=#ccc] - The card border color
 * @cssprop [--card-border-size=1px] - The card border color
 * @cssprop [--card-border-style=solid] - The card border color
 * @cssprop [--card-border-radius=8px] - The card border radius
 *
 * @event {MyType} count - This is a custom event
 * @event {MyType} fakeEvent - This is a custom event
 * 
 */
@customElement("my-element")
export class MyElement extends LitElement {
  /** Copy for the read the docs hint. */
  @property({ attribute: "docs-hint", reflect: true })
  docsHint = "Click on the Storybook logo to learn more";

  /** The number of times the button has been clicked. */
  @property({ type: Number, reflect: true })
  count?: number = 0;

  /** Adds a label to the component */
  @property()
  label? = 'count is:';

  /** Adds a label to the component */
  @property()
  union?: 'value1' | 'value2' | 'value3' | 'value4' = 'value1';

  /** Adds a label to the component */
  @property({ type: Boolean, reflect: true })
  disabled?: boolean;

  /** Test object property */
  @property({ attribute: false, type: Object })
  jsonHint: object = {
    docsHint: 'Click on the Storybook logo to learn more',
  };

  /** Test object property */
  @property({ attribute: false, type: Array })
  hobbies: Array<string> = ['baseball', 'soccer', 'tennis'];

  /** Increments the `count`. */
  increment() {
    this.count!++;
    this.dispatchEvent(new CustomEvent("count", { bubbles: true }));
  }

  /** Decrements the `count`. */
  decrement() {
    this.count!--;
    this.dispatchEvent(new CustomEvent("count", { bubbles: true }));
  }

  private _onClick() {
    this.count!++;
    this.dispatchEvent(new CustomEvent("count", { bubbles: true }));
  }

  render() {
    return html`
      <div class="card">
        <div>
          <a
            href="https://storybook.js.org/docs/get-started/web-components-vite"
            target="_blank"
          >
            <img src="/storybook.svg" class="logo" alt="Storybook logo" />
          </a>
        </div>
        <slot></slot>
        <div>
          <button ?disabled=${this.disabled} @click=${this._onClick} part="button">
            ${this.label} ${this.count}
            <slot name="button-content"></slot>
          </button>
        </div>
        <p class="read-the-docs" part="docs-hint">${this.docsHint}</p>
      </div>
    `;
  }

  static styles = css`
    :host {
      --card-border-color: #ccc;
      --card-border-size: 1px;
      --card-border-style: solid;
      --card-border-radius: 8px;

      display: block;
      max-width: 500px;
      margin: 0 auto;
      padding: 2rem;
      text-align: center;
    }

    .logo {
      max-height: 6em;
      padding: 1.5em;
      will-change: filter;
      transition: filter 300ms;
      filter: drop-shadow(0 0 1em #000000aa);
    }
    .logo:hover {
      filter: drop-shadow(0 0 1.25em #090b25aa);
    }

    .card {
      padding: 2em;
      border: var(--card-border-color) var(--card-border-size)
        var(--card-border-style);
      border-radius: var(--card-border-radius);
    }

    .read-the-docs {
      color: #888;
    }

    h1 {
      font-size: 3.2em;
      line-height: 1.1;
    }

    a {
      font-weight: 500;
      color: #646cff;
      text-decoration: inherit;
    }
    a:hover {
      color: #535bf2;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "my-element": MyElement;
  }
}
