import { validateBody } from '../../_lib/cards.js';

// PUT /api/cards/:id — update a card, only if it belongs to the signed-in user.
export async function onRequestPut(context) {
  const { request, env, data, params } = context;
  const body = await request.json();

  const validationError = validateBody(body);
  if (validationError) return new Response(JSON.stringify({ error: validationError }), { status: 400 });

  const now = Date.now();
  const res = await env.DB.prepare(
    `UPDATE cards SET title=?, name=?, surname=?, phone=?, phone2=?, email=?, company=?, website=?, address=?,
       tagline=?, theme=?, custom_bg=?, custom_text=?, custom_accent=?, logo_src=?, offices=?, hubs=?, disclaimer=?, updated_at=?
     WHERE id=? AND user_id=?`
  ).bind(
    body.title || '', body.name || '', body.surname || '', body.phone || '', body.phone2 || '',
    body.email || '', body.company || '', body.website || '', body.address || '', body.tagline || '',
    body.theme || 0,
    body.customColors?.bg || null, body.customColors?.text || null, body.customColors?.accent || null,
    body.logoSrc || null,
    JSON.stringify(body.offices || []), JSON.stringify(body.hubs || []),
    body.disclaimer || '', now,
    params.id, data.userId
  ).run();

  // Covers "doesn't exist" and "exists but isn't yours" identically — a 404
  // in both cases avoids confirming to a caller that some other user's
  // card id exists at all.
  if (res.meta.changes === 0) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });

  return Response.json({ ok: true, id: params.id, updatedAt: now });
}

// DELETE /api/cards/:id — delete a card, only if it belongs to the signed-in user.
export async function onRequestDelete(context) {
  const { env, data, params } = context;
  const res = await env.DB.prepare('DELETE FROM cards WHERE id=? AND user_id=?')
    .bind(params.id, data.userId).run();

  if (res.meta.changes === 0) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });

  return new Response(null, { status: 204 });
}
