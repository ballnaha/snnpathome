## Local Development

Run the development server:

```bash
npm run dev
```

The app runs on port `5005` and listens on all interfaces for local network testing.

- Local machine: `http://localhost:5005`
- LAN / mobile testing: `http://192.168.100.88:5005`

Next.js 16 blocks cross-origin access to dev-only assets by default, so `next.config.ts` includes `allowedDevOrigins` for `192.168.100.88` during local testing.

Google OAuth does not work with a raw private IP callback/origin such as `http://192.168.100.88:5005`. For Google login in development:

- Use `http://localhost:5005` on the same machine
- Use a public HTTPS tunnel/domain on mobile or another device

## Auth URL

For local mobile testing, `NEXTAUTH_URL` is set in `.env.local`.

```env
NEXTAUTH_URL=http://192.168.100.88:5005
```

If your machine IP changes, update `.env.local` before testing login or session flows on another device.

If you need Google login on mobile, set `NEXTAUTH_URL` to a public HTTPS URL and add that exact origin plus callback URL to the Google Cloud OAuth client settings.
