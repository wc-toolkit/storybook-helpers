import { FASTElement, html, Observable } from "@microsoft/fast-element";
import type { ViewTemplate } from "@microsoft/fast-element";
import { useArgs } from "storybook/preview-api";
import { syncControls } from "../sync-controls.js";
import type { StoryOptions } from "../../types.js";
import type { Args, getHtmlTemplates } from "./templates.js";

type StoryControls = {
  tagName: string;
  observe?: ReturnType<typeof syncControls>;
  updateArgs: (args: Record<string, unknown>) => void;
  properties: ReturnType<typeof getHtmlTemplates>["propArgs"];
  propertiesEnabled: () => boolean;
  exposeComponent: boolean;
};

/**
 * Light-DOM host: owns the FAST view and Controls subscriptions while connected.
 */
export class FastStory extends FASTElement {
  args: Record<string, unknown> = {};
  content?: ViewTemplate;
  controls?: StoryControls;

  private component?: HTMLElement;
  private observer?: MutationObserver;
  private notifier?: ReturnType<typeof Observable.getNotifier>;

  connectedCallback() {
    super.connectedCallback();

    const controls = this.controls;
    if (!controls) return;

    const element = this.querySelector<HTMLElement>(controls.tagName);

    if (!element) {
      throw new Error(
        `Story component "${controls.tagName}" was not rendered.`,
      );
    }

    this.component = element;

    if (controls.exposeComponent) Reflect.set(globalThis, "component", element);

    if (controls.observe) {
      this.observer = controls.observe(element);
      this.notifier = Observable.getNotifier(element);
      this.notifier.subscribe(this);
    }
  }

  /** FAST notifies this subscriber when a component property changes. */
  handleChange(_source: unknown, property: string) {
    const controls = this.controls;

    if (
      !this.component ||
      !controls?.propertiesEnabled() ||
      !controls.properties[property]
    )
      return;

    const value: unknown = Reflect.get(this.component, property);

    if (!Object.is(this.args[property], value)) {
      controls.updateArgs({ [property]: value });
    }
  }

  disconnectedCallback() {
    this.notifier?.unsubscribe(this);
    this.notifier = undefined;

    this.observer?.disconnect();
    this.observer = undefined;

    if (
      this.controls?.exposeComponent &&
      Reflect.get(globalThis, "component") === this.component
    ) {
      Reflect.deleteProperty(globalThis, "component");
    }

    this.component = undefined;

    super.disconnectedCallback();
  }
}

FastStory.define({
  name: "wc-toolkit-fast-story",
  shadowOptions: null,
  template: html<FastStory>`${(story) => story.content}`,
});

/** Creates the HTML/Vite renderer and its FAST-to-Controls notification bridge. */
export function getRender<T>(
  tagName: string,
  {
    getTemplate,
    attrArgs,
    propArgs,
    enabled,
    config,
  }: ReturnType<typeof getHtmlTemplates<T>>,
  options?: StoryOptions,
) {
  return function render(
    args: Partial<T>,
    _context?: unknown,
    slot?: ViewTemplate,
  ) {
    const [, updateArgs] = useArgs();
    const values = args as Args<T>;
    const observe = syncControls(enabled("attributes") ? attrArgs : {}, values);

    const host = new FastStory();
    host.args = values;
    host.content = getTemplate(values, slot);
    host.controls = {
      tagName,
      observe: config().disableArgObserver ? undefined : observe,
      updateArgs,
      properties: propArgs,
      propertiesEnabled: () => Boolean(enabled("properties")),
      exposeComponent: Boolean(
        options?.setComponentVariable || config().setComponentVariable,
      ),
    };

    return host;
  };
}
