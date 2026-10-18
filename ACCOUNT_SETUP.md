# Bluewave accounts

The account API runs in the existing Node.js server. Install its dependencies with `npm install`, copy `.env.example` to `.env`, set the SMTP connection and sender fields, then start the site with `npm start`. The SQLite account database is created at `data/accounts.sqlite` by default; keep that file in persistent, private storage and back it up securely.

Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM` to the credentials supplied by your email provider. `SITE_URL` must be the public origin of the website so reset links point to the correct host. Password-reset emails are unavailable until these settings are valid.

For production, use HTTPS, set `NODE_ENV=production`, and set `SITE_URL` to the HTTPS origin. Keep `.env` and the SQLite database out of source control. If the Node server is behind a reverse proxy, forward requests using the original host and HTTPS origin.
