/** Scopes generated host, part and state rules to a story instance. */
export function transformToScoped(template: string, tagSelector: string) {
  if (!template || !tagSelector) return template;

  const baseTag = tagSelector.split("[")[0];
  const escapeRegExp = (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  let styleContent = template;

  styleContent = styleContent.replace(
    new RegExp(
      `${escapeRegExp(tagSelector)}(?=\\s*\\{|::part\\(|:state\\()`,
      "g",
    ),
    ":scope",
  );
  styleContent = styleContent.replace(
    new RegExp(`${escapeRegExp(baseTag)}::part\\(`, "g"),
    ":scope::part(",
  );
  styleContent = styleContent.replace(
    new RegExp(`${escapeRegExp(baseTag)}:state\\(`, "g"),
    ":scope:state(",
  );
  styleContent = styleContent.replace(
    new RegExp(
      `(^|\\n)\\s*${escapeRegExp(baseTag)}(?=\\s*\\{|\\s|:|\\.|\\[|,|>|\\+|~)`,
      "g",
    ),
    "$1:scope",
  );

  return `@scope (${tagSelector}) {\n  ${styleContent}\n}`;
}
