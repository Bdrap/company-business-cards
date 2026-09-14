import { rowToCard, validateBody, slugify } from '../_lib/cards.js';

// GET /api/cards — list the signed-in user's own cards.
export async function onRequestGet(context) {
  const { env, data } = context;
  const { results } = await env.DB.prepare(
    'SELECT * FROM cards WHERE user_id = ? ORDER BY updated_at DESC'
  ).bind(data.userId).all();
  return Response.json(results.map(rowToCard));
}

// POST /api/cards — create a new card owned by the signed-in user.
export async function onRequestPost(context) {
  const { request, env, data } = context;
  const body = await request.json();

  const validationError = validateBody(body);
  if (validationError) return new Response(JSON.stringify({ error: validationError }), { status: 400 });

  const id = slugify(body.name + '-' + body.surname) + '-' + Date.now().toString(36);
  const now = Date.now();

  await env.DB.prepare(
    `INSERT INTO cards (id, user_id, title, name, surname, phone, phone2, email, company, website, address,
                         tagline, theme, custom_bg, custom_text, custom_accent, logo_src, offices, hubs, disclaimer, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(
    id, data.userId,
    body.title || '', body.name || '', body.surname || '', body.phone || '', body.phone2 || '',
    body.email || '', body.company || '', body.website || '', body.address || '', body.tagline || '',
    body.theme || 0,
    body.customColors?.bg || null, body.customColors?.text || null, body.customColors?.accent || null,
    body.logoSrc || null,
    JSON.stringify(body.offices || []), JSON.stringify(body.hubs || []),
    body.disclaimer || '', now
  ).run();

  return Response.json({ ok: true, id, updatedAt: now });
}
