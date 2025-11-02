How Vercel Integration OAuth Flow Actually Works
Based on the Medium article by Tony and other sources, here's how the Vercel integration flow works - it's different from standard OAuth:
The Complete Flow:

User starts in YOUR app

Clicks "Connect Vercel" button
You redirect them to: https://vercel.com/integrations/{your-slug}/new


User authorizes on VERCEL's site

They see the permission screen
Click "Authorize"
Vercel creates a code


Vercel redirects BACK TO YOU (your Redirect URL)

To: https://yourapp.com/api/vercel/callback?code=XXX&state=YYY
This is the URL you specified in integration settings


Your backend exchanges code for token

