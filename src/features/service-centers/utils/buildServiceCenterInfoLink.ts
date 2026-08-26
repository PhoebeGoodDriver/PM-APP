export function buildServiceCenterInfoLink(alphaCode: string | undefined): string | null {
  const trimmed = alphaCode?.trim();
  if (!trimmed) return null;
  return `https://eai3534679.prod.cloud.fedex.com/fxfIntranet/servlet/ServiceCenterInfo?Action=SCDisplay&SCID=${trimmed}`;
}
