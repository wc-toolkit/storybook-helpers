export type ArgSettingsType = {
  /** Sets a type for the property. */
  name?: string;
  /** Sets the property as optional or required. */
  required?: boolean;
};

export type Table = {
  type?: TableType;
  defaultValue?: TableDefaultValue;
  /** Removes control from table. */
  disable?: boolean;
  /** Assigns control to control group */
  category?:
    | "attributes"
    | "css properties"
    | "css shadow parts"
    | "css states"
    | "events"
    | "properties"
    | "methods"
    | "slots";
  /** Assigns the argTypes to a specific subcategory */
  subcategory?: string;
};

export type TableType = {
  /** Provide a short version of the type. */
  summary?: string;
  /** Provides an extended version of the type. */
  detail?: string;
};

export type TableDefaultValue = {
  /** Provide a short version of the default value. */
  summary?: string;
  /** Provides a longer version of the default value. */
  detail?: string;
};

export type Control = {
  type: ControlOptions;
  min?: number;
  max?: number;
  step?: number;
  accept?: string;
};

export type ControlOptions =
  | "text"
  | "radio"
  | "select"
  | "boolean"
  | "number"
  | "color"
  | "date"
  | "object"
  | "file"
  | "inline-radio"
  | "check"
  | "inline-check"
  | "multi-select"
  | null;
