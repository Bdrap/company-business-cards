// Shared helpers used by functions/api/cards.js and functions/api/cards/[id].js.

// Reassembles a flattened D1 row back into the shape the frontend's
// collectFormData()/applyFormData()/drawCardToContext() already expect —
// so the rendering code stays unaware that storage moved from a single
// shared contacts.json to a per-user D1 table.
export function rowToCard(row) {
  return {
    id: row.id,
    title: row.title || '',
    name: row.name || '',
    surname: row.surname || '',
    phone: row.phone || '',
    phone2: row.phone2 || '',
    email: row.email || '',
    company: row.company || '',
    website: row.website || '',
    address: row.address || '',
    tagline: row.tagline || '',
    theme: row.theme || 0,
    // Default to the same fallback hex values applyFormData() uses client-side,
    // even for cards that don't use the custom theme — keeps the colour
    // pickers sane if the user switches to "Custom" starting from a preset.
    customColors: {
      bg: row.custom_bg || '#FFFFFF',
      text: row.custom_text || '#153044',
      accent: row.custom_accent || '#8A6323',
    },
    logoSrc: row.logo_src || null,
    offices: JSON.parse(row.offices || '[]'),
    hubs: JSON.parse(row.hubs || '[]'),
    disclaimer: row.disclaimer || '',
    updatedAt: row.updated_at,
  };
}

// Client-side there's already a ~300KB guidance note on the logo upload
// field; this is the hard server-side backstop so a stray oversized image
// can't blow past D1's per-column size limit.
export const MAX_LOGO_BYTES = 400 * 1024;

export function validateBody(body) {
  if (body.logoSrc && body.logoSrc.length > MAX_LOGO_BYTES) {
    return 'Logo image is too large — please use a smaller file.';
  }
  return null;
}

export function slugify(str) {
  return (str || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'card';
}
