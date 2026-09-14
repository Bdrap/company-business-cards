# Card Studio

A multi-tenant web app for designing business cards and email signatures,
generating QR codes (including scannable vCard QR codes on each card), and
saving your own cards to your account — sign in and your cards are yours
alone.

The frontend is one file, **`index.html`** — no npm packages, no bundler,
just CDN script tags (Clerk for auth, QRious for QR codes). The backend is a
handful of small Cloudflare Pages Functions plus a Cloudflare D1 database,
so every signed-in user only ever sees and edits their own cards.

## Features

- **Business Card designer** — Title, Name, Surname, Contact Number, Email
  (plus optional Company, Website, Address, Tagline), rendered live onto a
  canvas, with 3 built-in theme presets plus a fully custom theme (pick your
  own background/text/accent colours) and an optional uploaded logo. Exports
  as PNG or as a `.vcf` contact file.
- **Email Signature designer** — reuses the same contact details and theme,
  adds a second phone number, an editable "Our Offices" / "Our Hubs" city
  list with a stylised (non-literal) map graphic, and an editable legal
  disclaimer footer.
- **QR code generator** — standalone tab for turning any text/URL into a
  downloadable QR code (via [QRious](https://github.com/neocotic/qrious)).
- **My Cards** — every card you save lives in your account. Add/edit/delete
  freely; changes save instantly, no publish step, and nobody else can see
  or touch them.

## Running it locally

Serve the repo root with any static file server (e.g. `python3 -m http.server`)
and open `index.html`. The Clerk sign-in widget and the `/api/*` calls need
a deployed (or `wrangler pages dev`) backend to actually work — see below.

## Hosting: Cloudflare Pages + D1 + Clerk

### 1. Create a Clerk application

1. Sign up at [clerk.com](https://clerk.com) (free tier covers up to 10,000
   monthly active users) and create a new application.
2. In **Configure → API Keys**, use **Quick Copy → JavaScript** to get your
   exact `<script>` snippet (publishable key + your instance's script host),
   and paste it over the placeholder one in `index.html`'s `<head>`.
3. Copy the **Secret Key** too — you'll add it as a Cloudflare secret in
   step 4, not hardcode it anywhere.

### 2. Create the D1 database

1. Cloudflare Dashboard → **Storage & Databases → D1 SQL Database → Create**.
2. Open its **Console** tab, paste the contents of `schema.sql`, and run it.

### 3. Connect the repo to Cloudflare Pages

1. **Workers & Pages → Create → Pages → Connect to Git** (use the *classic
   Pages* flow, not the newer git-connected Workers flow — that one doesn't
   support Pages Functions routing or the `nodejs_compat` flag the same way).
2. Build settings: **Framework preset: None**, **Build command: (leave
   blank)**, **Build output directory: `/`**. Cloudflare auto-detects the
   `functions/` folder and the root `package.json` (it runs `npm install`
   for the Functions' dependencies automatically — the frontend itself
   stays bundler-free).
3. Deploy.

### 4. Configure the Pages project

In **Settings**:
- **Variables and secrets**: add `CLERK_SECRET_KEY` (mark as Secret) and
  `CLERK_PUBLISHABLE_KEY`.
- **Functions → Compatibility Flags**: add `nodejs_compat` for **both**
  Preview and Production — `@clerk/backend` needs it, and its absence fails
  in a non-obvious way (not an auth error, more like a broken build).
- **Bindings**: add a **D1 database** binding, variable name `DB`, pointing
  at the database created in step 2.

Redeploy (**Deployments → Retry deployment**) after adding all of the above
— new secrets/bindings only apply to deployments made after they're set.

### 5. Use it

Visit the site, sign up (self-service — anyone can create an account),
design a card, click **Save Card**. It shows up under **My Cards** — yours
only, saved instantly, no further steps.

## How the data model works

Every card is a row in the `cards` D1 table, scoped by `user_id` (your
Clerk user id) on every read/write — that scoping *is* the entire access
control model. There's no admin passcode and no shared file: what you save
is private to your account by construction.

## What's out of scope (for now)

Billing/payments, custom email verification, rate-limiting beyond Clerk's
defaults, custom domains, moving uploaded logos out of D1 into object
storage, and team/org-shared cards (every user's cards are private to them
only). Add a license here if you intend to open this repository up more
broadly.
