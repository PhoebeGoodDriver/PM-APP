export function buildGoogleMapsLink(parts: {
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  zip?: string;
}): string {
  const query = [parts.street1, parts.street2, parts.city, parts.state, parts.zip]
    .filter(Boolean)
    .join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
