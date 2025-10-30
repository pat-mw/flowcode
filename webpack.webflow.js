const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  devtool: false, // Disable eval() for readable output files
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
  plugins: [
    // Provide process polyfill for browser (handles process.nextTick, process.env, etc.)
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),

    new webpack.DefinePlugin({
      // Replace specific environment variables at build time
      // Next.js runtime detection (always 'browser' in Webflow)
      'process.env.NEXT_RUNTIME': JSON.stringify('browser'),

      // API Configuration (CRITICAL - required by auth client and oRPC client)
      // lib/auth/client.ts:15 and lib/orpc-client.ts:11 both require this
      'process.env.NEXT_PUBLIC_API_URL': JSON.stringify(
        process.env.NEXT_PUBLIC_API_URL || ''
      ),

      // Authentication - Google OAuth
      // Used in components/LoginForm.tsx:64 and components/RegistrationForm.tsx:71
      'process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED': JSON.stringify(
        process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED || ''
      ),

      // Supabase (optional - for future features)
      'process.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(
        process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      ),
      'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      ),
    }),
  ],
};
