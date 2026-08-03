import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

/**
 * An sample element testing non primitive properties.
 *
 * @slot my-slot - a test slot
 * @tag my-element4
 */

@customElement("my-element4")
export class MyElement4 extends LitElement {
  /**
   * @type {object}
   */
  @property({ attribute: false }) objectNoAttribute = undefined;

  /**
   * @type {object}
   */
  @property({ attribute: false }) objectNoAttributeDefault = {
    test: "test-value",
  };

  /**
   * @type {object}
   */
  @property({ type: Object, attribute: "object-with-attribute" })
  objectWithAttribute = undefined;

  /**
   * @type {object}
   */
  @property({ type: Object, attribute: "object-with-attribute" })
  objectWithAttributeDefault = { test: "test-value" };

  /**
   * @type {Document}
   */
  @property({ attribute: false }) objectCustomType = undefined;

  /**
   * @type {Document}
   */
  @property({ attribute: false }) objectCustomTypeDefault = new Document();

  /**
   * @type {Function}
   */
  @property({ attribute: false }) functionNoAttribute = undefined;

  /**
   * @type {Function}
   */
  @property({ attribute: false }) functionNoAttributeDefault = (i) => i + 2;

  @property({ attribute: false }) functionCustomType: RendererFunc;

  /**
   * @type {RendererFunc}
   */
  @property({ attribute: false }) functionCustomTypeDefault = (v) =>
    `prefix: ${v}`;

  /**
   * @type {"one" | "two" | "three"}
   */
  @property({ type: String }) enumAttribute = undefined;

  render() {
    return html`
      <table>
        <thead>
          <tr>
            <th>var</th>
            <th>typeof var</th>
            <th>value</th>
          </tr>
        </thead>
        <tbody>
          ${this.__log("objectNoAttribute")}
          ${this.__log("objectNoAttributeDefault")}
          ${this.__log("objectWithAttribute")}
          ${this.__log("objectWithAttributeDefault")}
          ${this.__log("functionNoAttribute")}
          ${this.__log("functionNoAttributeDefault")}
          ${this.__log("functionCustomType")}
          ${this.__log("functionCustomTypeDefault")}
          ${this.__log("objectCustomType")}
          ${this.__log("objectCustomTypeDefault")}
        </tbody>
      </table>
    `;
  }

  /**
   * @private
   */
  __log(k: string) {
    const v = this[k];
    return html` <tr>
      <td>${k}</td>
      <td>${typeof v}</td>
      <td>
        ${v === null
          ? "null"
          : v === undefined
            ? "undefined"
            : typeof v == "string"
              ? `"${v}"`
              : typeof v == "object"
                ? JSON.stringify(v)
                : v}
      </td>
    </tr>`;
  }
  static styles = css`
    table {
      width: 100%;
      border: 1px solid gray;
      border-collapse: collapse;
    }

    table td {
      width: 33%;
      border: 1px solid gray;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "my-element4": MyElement4;
  }
}
