# Deploying Vita to Vercel (Free Tier)

This guide will walk you through deploying the full-stack Vita application for free using **Vercel** (Frontend/Backend) and **Neon** (Database).

## Prerequisites

- A [GitHub](https://github.com/) account.
- A [Vercel](https://vercel.com/) account.
- A [Neon](https://neon.tech/) account (for the free Postgres database).

---

## Step 1: Push Code to GitHub

1.  Make sure all your changes are committed:
    ```bash
    git add .
    git commit -m "Ready for deployment: Configured Postgres and Layout"
    ```
2.  Push to your repository:
    ```bash
    git push origin main
    ```

---

## Step 2: Set up the Database (Neon)

Since Vercel is serverless, we need a cloud-hosted Postgres database. **Neon** is the best free option that works seamlessly with Vercel.

1.  Go to [Neon.tech](https://neon.tech/) and sign up.
2.  Create a **New Project** (e.g., named `vita-db`).
3.  Once created, copy the **Connection String** (it looks like `postgres://user:password@ep-cool-...`).

    > **Note:** Make sure to copy the "Pooled connection string" if available, or the standard one.

4.  **Important:** You need to update your local environment if you want to run the app locally with this new DB.
    - Open your `.env` file.
    - Replace `DATABASE_URL="file:./dev.db"` with your new Neon connection string:
      ```env
      DATABASE_URL="postgres://user:password@your-neon-url.neondatabase.app/neondb?sslmode=require"
      ```

---

## Step 3: Deploy to Vercel

1.  Go to [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your **Vita** repository from GitHub.
4.  **Configure Project:**
    - **Framework Preset:** Next.js (should be auto-detected).
    - **Root Directory:** `./` (default).
    - **Build Command:** `next build` (default).
    - **Install Command:** `npm install` (default).

5.  **Environment Variables (CRITICAL):**
    Expand the "Environment Variables" section and add the following keys. Copy values from your local `.env` file where applicable.

    | Key                            | Value Description                                                                                                                                                                                                                                                                  |
    | :----------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | `DATABASE_URL`                 | **The Neon Connection String** from Step 2.                                                                                                                                                                                                                                        |
    | `NEXTAUTH_URL`                 | Set this to your Vercel URL **after** deployment (e.g., `https://vita-app.vercel.app`). For the initial build, you can set it to `http://localhost:3000` or leave it, but Vercel sets a default `VERCEL_URL`. **Best practice**: Set it to the production domain once you know it. |
    | `NEXTAUTH_SECRET`              | Your random secret string (same as local `.env`).                                                                                                                                                                                                                                  |
    | `GOOGLE_CLIENT_ID`             | Your Google Client ID.                                                                                                                                                                                                                                                             |
    | `GOOGLE_CLIENT_SECRET`         | Your Google Client Secret.                                                                                                                                                                                                                                                         |
    | `TWILIO_ACCOUNT_SID`           | (Optional for SMS) Your Twilio SID.                                                                                                                                                                                                                                                |
    | `TWILIO_AUTH_TOKEN`            | (Optional for SMS) Your Twilio Token.                                                                                                                                                                                                                                              |
    | `TWILIO_PHONE_NUMBER`          | (Optional for SMS) Your Twilio Phone.                                                                                                                                                                                                                                              |
    | `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | (Optional for Push) Public Key.                                                                                                                                                                                                                                                    |
    | `VAPID_PRIVATE_KEY`            | (Optional for Push) Private Key.                                                                                                                                                                                                                                                   |
    | `VAPID_SUBJECT`                | (Optional for Push) mailto:email.                                                                                                                                                                                                                                                  |

6.  Click **Deploy**.

---

## Step 4: Finalize Setup

1.  **Database Migration:**
    - Vercel's build process generates the client, but it _does not_ automatically push the schema to the DB.
    - You can do this from your **local terminal** once you've updated your local `.env` with the Neon `DATABASE_URL`:
      ```bash
      npx prisma migrate deploy
      ```
      This will create the tables in your new Neon database.

2.  **Update Google OAuth:**
    - Go to [Google Cloud Console](https://console.cloud.google.com/).
    - Select your project -> **APIs & Services** -> **Credentials**.
    - Edit your OAuth 2.0 Client.
    - Add your new Vercel domain to **Authorized JavaScript origins** (e.g., `https://vita.vercel.app`).
    - Add the callback URL to **Authorized redirect URIs** (e.g., `https://vita.vercel.app/api/auth/callback/google`).

3.  **Update NEXTAUTH_URL:**
    - In Vercel Project Settings -> Environment Variables, update `NEXTAUTH_URL` to your actual deployed domain (e.g., `https://vita.vercel.app`).
    - Redeploy (Settings -> Deployments -> Redeploy) for changes to take effect.

---

**That's it! Your app is live.** 🚀
