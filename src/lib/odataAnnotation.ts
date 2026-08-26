const FORMATTED_VALUE_SUFFIX = '@OData.Community.Display.V1.FormattedValue';

/**
 * Reads a Dataverse OData formatted-value annotation directly off a raw record by its
 * base property name (e.g. '_createdby_value'). The generated TypeScript models declare
 * friendly names for these (e.g. `createdbyname`), but confirmed via a raw JSON dump of
 * an actual SDK response that those friendly properties are never populated at runtime —
 * the real value lives under this raw `{property}@OData.Community.Display.V1.FormattedValue`
 * key instead, which the generated types don't expose.
 */
export function getFormattedValueAnnotation(
  record: object,
  baseProperty: string,
): string | undefined {
  return (record as Record<string, unknown>)[`${baseProperty}${FORMATTED_VALUE_SUFFIX}`] as
    | string
    | undefined;
}
