export function buildODataBind(entitySetName: string, id: string): string {
  return `/${entitySetName}(${id})`;
}
