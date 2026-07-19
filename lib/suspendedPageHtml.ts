/** Hosting-style suspension page returned when SITE_SUSPENDED=true. */
export const SUSPENDED_PAGE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Website Suspended</title>
  <style>
    :root {
      --bg: #f3f4f6;
      --card: #ffffff;
      --text: #111827;
      --muted: #6b7280;
      --border: #e5e7eb;
      --accent: #b45309;
      --accent-bg: #fffbeb;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
    }
    .panel {
      width: 100%;
      max-width: 520px;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 40px 36px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
    }
    .badge {
      display: inline-block;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--accent);
      background: var(--accent-bg);
      border: 1px solid #fde68a;
      padding: 4px 10px;
      border-radius: 4px;
      margin-bottom: 20px;
    }
    h1 {
      font-size: 1.5rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 12px;
    }
    p {
      color: var(--muted);
      font-size: 0.975rem;
      margin-bottom: 12px;
    }
    p:last-child { margin-bottom: 0; }
    .meta {
      margin-top: 28px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
      font-size: 0.8125rem;
      color: #9ca3af;
    }
  </style>
</head>
<body>
  <main class="panel">
    <div class="badge">Service notice</div>
    <h1>This website has been suspended</h1>
    <p>
      Access to this site is temporarily unavailable. The hosting account associated
      with this domain has been suspended, usually because of an outstanding billing
      or service issue with the account owner.
    </p>
    <p>
      If you are the website owner, please contact your service provider to settle
      any outstanding balance and request reactivation.
    </p>
    <p class="meta">
      HTTP 503 &mdash; Service Unavailable<br />
      This page is served by the infrastructure provider, not the website application.
    </p>
  </main>
</body>
</html>
`;
