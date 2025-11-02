# Understanding Vercel OAuth: Client ID & Client Secret Purpose

## The Complete OAuth Flow with Client ID & Secret

### 1. Installation URL (No Client ID needed)
```javascript
// User goes to this URL - only needs your slug
https://vercel.com/integrations/your-slug/new
```

### 2. User Authorizes (Happens on Vercel's site)
- User sees permission screen
- Clicks "Authorize"
- Vercel generates an authorization `code`

### 3. Redirect Back with Code
```javascript
// Vercel redirects to your callback with a temporary code
https://yourapp.com/api/vercel/callback?code=TEMPORARY_CODE&state=xyz
```

### 4. Exchange Code for Token (THIS is where Client ID & Secret are used!)
```javascript
// In your backend callback handler
const response = await fetch('https://api.vercel.com/v2/oauth/access_token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: new URLSearchParams({
    code: 'TEMPORARY_CODE',  // The code from step 3
    client_id: process.env.VERCEL_CLIENT_ID,  // YOUR CLIENT ID
    client_secret: process.env.VERCEL_CLIENT_SECRET,  // YOUR SECRET
    redirect_uri: 'https://yourapp.com/api/vercel/callback'
  })
});

const data = await response.json();
// Returns: { access_token: 'vc_token_xxx', team_id: '...', user_id: '...' }
```

## Why This Two-Step Process?

### Security Reasons:

1. **The authorization code is temporary** (expires in minutes)
2. **The code alone is useless** without your Client Secret
3. **Client Secret never goes to the browser** (backend only)
4. **Even if someone intercepts the code**, they can't get the access token without your secret

### Think of it like a hotel check-in:
- **Installation URL** = Hotel address (public)
- **Authorization Code** = Temporary confirmation number
- **Client ID** = Your name (semi-public)
- **Client Secret** = Your passport (private, proves you're really you)
- **Access Token** = Room key (what you actually use)

## Why Not Just Use Client ID in the URL?

Some OAuth providers (like GitHub) do use client_id in the initial URL:
```javascript
// GitHub OAuth (different approach)
https://github.com/login/oauth/authorize?client_id=YOUR_ID
```

But Vercel uses the integration slug approach because:
1. **Cleaner URLs** for users
2. **Integration settings** are tied to the slug (not just OAuth)
3. **Marketplace compatibility** (same URL pattern for public/private integrations)

## In Practice:

```javascript
// Environment variables (keep these SECRET)
VERCEL_CLIENT_ID=oac_AbC123...        // Semi-public (could be in frontend)
VERCEL_CLIENT_SECRET=abc123xyz...     // NEVER expose this!
VERCEL_INTEGRATION_SLUG=my-app        // Public (in your URLs)

// Frontend - Start OAuth
const startOAuth = () => {
  // Only uses slug, no secrets
  window.location = `https://vercel.com/integrations/${INTEGRATION_SLUG}/new`;
};

// Backend - Exchange code for token
app.get('/api/vercel/callback', async (req, res) => {
  const { code } = req.query;
  
  // This MUST be on backend because it uses the secret
  const tokenResponse = await fetch('https://api.vercel.com/v2/oauth/access_token', {
    method: 'POST',
    body: new URLSearchParams({
      code,
      client_id: process.env.VERCEL_CLIENT_ID,      // Identifies your app
      client_secret: process.env.VERCEL_CLIENT_SECRET, // Proves it's really you
      redirect_uri: 'https://yourapp.com/api/vercel/callback'
    })
  });
  
  const { access_token } = await tokenResponse.json();
  // Save this token to make API calls
});
```

## Key Takeaway

The Client ID and Secret are your app's credentials that prove to Vercel that it's really YOUR app exchanging the code for a token, not someone pretending to be you!

## Security Best Practices

1. **Never expose Client Secret in frontend code**
2. **Always perform token exchange on your backend**
3. **Store tokens encrypted in your database**
4. **Use HTTPS for all callback URLs**
5. **Implement state parameter for CSRF protection**
6. **Validate the state parameter before token exchange**