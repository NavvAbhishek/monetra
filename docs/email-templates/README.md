# Email templates (Firebase console)

These are NOT used by the app code — paste them into **Firebase console → Authentication → Templates**.

## Password reset (`password-reset.html`)
1. Open the *Password reset* template (pencil icon).
2. **Sender name** `Monetra` · **Subject** `Reset your Monetra password`
3. **Message**: select everything in the box, delete it, paste the whole content of `password-reset.html`
   (the box accepts HTML; keep `%EMAIL%` and `%LINK%` exactly as written).
4. **Customise action URL** → `https://monetra-e2f97.web.app/reset-password`
5. Save. Also set *Project settings → General → Public-facing name* = `Monetra`.

Emails can't use the app's design tokens, so the colours are written out (default violet; they don't follow the theme colour).
