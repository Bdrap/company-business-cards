// Gates every /api/* route behind Clerk auth. Verifies the Authorization:
// Bearer <token> header sent by authedFetch() in index.html, and stashes the
// verified Clerk user id on context.data for downstream route handlers to
// use as the sole tenant-isolation key (every D1 query is scoped by it).
import { createClerkClient } from '@clerk/backend';

export async function onRequest(context) {
  const { request, env, next } = context;

  const clerkClient = createClerkClient({
    secretKey: env.CLERK_SECRET_KEY,
    publishableKey: env.CLERK_PUBLISHABLE_KEY,
  });

  const requestState = await clerkClient.authenticateRequest(request, {
    authorizedParties: [new URL(request.url).origin],
  });

  if (!requestState.isAuthenticated) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const userId = requestState.toAuth().userId;

  // Upsert a users row so `cards.user_id` always has somewhere to point.
  // Cheap enough to do on every request at this scale; revisit if it shows
  // up in D1's write-quota accounting later.
  await env.DB.prepare(
    `INSERT INTO users (id, created_at, last_seen_at) VALUES (?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET last_seen_at = excluded.last_seen_at`
  ).bind(userId, Date.now(), Date.now()).run();

  context.data.userId = userId;
  return next();
}
