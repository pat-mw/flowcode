# Webflow GitHub Deployment Workflow

This document explains how to use the GitHub Actions workflow to automatically deploy Webflow components from CI/CD.

## Overview

The `.github/workflows/webflow-deploy.yml` workflow provides a reliable way to deploy Webflow components using GitHub Actions on Linux runners. This solves issues with inconsistent local deployments by running in a consistent Ubuntu environment.

## Features

- **Manual Deployment**: Trigger deployments on-demand from GitHub Actions UI
- **Automatic Caching**: Uses pnpm cache for faster builds
- **Environment Configuration**: Automatically sets required environment variables
- **Consistent Environment**: Runs on Ubuntu Linux (same as production)

## Setup Instructions

### 1. Add GitHub Secret

You need to add your Webflow workspace API token as a GitHub secret:

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `WEBFLOW_WORKSPACE_API_TOKEN`
5. Value: Your Webflow workspace API token (from `.env` file or [Webflow Dashboard](https://webflow.com/dashboard/account/apps))
6. Click **Add secret**

### 2. Verify Workflow File

The workflow file is located at `.github/workflows/webflow-deploy.yml` and should be committed to your repository.

### 3. Run Manual Deployment

To manually trigger a deployment:

1. Go to your GitHub repository
2. Navigate to **Actions** tab
3. Select **Deploy Webflow Components** workflow
4. Click **Run workflow**
5. Select the branch (usually `main`)
6. Click **Run workflow** button

The workflow will:
- Checkout your code
- Setup Node.js 20 and pnpm 9
- Install dependencies (with caching)
- Run `pnpm webflow:share` with the proper environment variables
- Report success or failure

## Automatic Deployment (Optional)

To enable automatic deployment on push to main branch:

1. Open `.github/workflows/webflow-deploy.yml`
2. Uncomment the `push` trigger section:

```yaml
on:
  workflow_dispatch:

  push:
    branches:
      - main
    paths:
      - 'src/components/**/*.webflow.tsx'
      - 'src/components/**/*.tsx'
      - 'components/**/*.tsx'
      - 'webflow.json'
      - 'webpack.webflow.js'
```

This will automatically deploy whenever you push changes to Webflow-related files on the main branch.

## Environment Variables

The workflow uses these environment variables:

- `WEBFLOW_WORKSPACE_API_TOKEN`: From GitHub secrets (required)
- `NEXT_PUBLIC_API_URL`: Set to `https://blogflow-three.vercel.app`
- `NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED`: Set to `false`

These match the production environment configuration in `package.json`.

## Troubleshooting

### Deployment Fails

1. **Check the secret**: Verify `WEBFLOW_WORKSPACE_API_TOKEN` is set correctly in GitHub secrets
2. **Check logs**: Review the workflow logs in GitHub Actions for specific error messages
3. **Verify token permissions**: Ensure your Webflow API token has the correct workspace permissions
4. **Local bundle test**: Run `pnpm webflow:bundle` locally to test webpack compilation before deploying

### Token Expiration

If your deployment suddenly fails:

1. Go to [Webflow Dashboard](https://webflow.com/dashboard/account/apps)
2. Generate a new workspace API token
3. Update the `WEBFLOW_WORKSPACE_API_TOKEN` secret in GitHub

### Missing Dependencies

If the build fails due to missing dependencies:

1. Ensure `pnpm-lock.yaml` is committed to the repository
2. The workflow uses `--frozen-lockfile` to ensure consistent installs
3. If you added new dependencies, commit the updated `pnpm-lock.yaml`

## Workflow Structure

```yaml
name: Deploy Webflow Components

on:
  workflow_dispatch:  # Manual trigger

jobs:
  deploy:
    runs-on: ubuntu-latest  # Linux environment
    steps:
      - Checkout code
      - Setup Node.js 20
      - Setup pnpm 9
      - Cache pnpm store
      - Install dependencies
      - Deploy to Webflow
      - Report results
```

## CI/CD Best Practices

1. **Always test locally first**: Run `pnpm webflow:bundle` before pushing to verify compilation
2. **Use manual triggers initially**: Start with `workflow_dispatch` until you're confident
3. **Monitor the Actions tab**: Check deployment status and logs regularly
4. **Keep secrets secure**: Never commit the API token to the repository
5. **Update documentation**: Keep this file updated if you modify the workflow

## Related Documentation

- [Webflow Local Development](./webflow-local-development.md) - Local bundling and debugging
- [CLAUDE.md](../CLAUDE.md) - Component development guidelines
- [env.example](../env.example) - Environment variable reference

## Comparison: Local vs GitHub Actions

| Aspect | Local Development | GitHub Actions |
|--------|------------------|----------------|
| Environment | macOS/Windows/Linux | Ubuntu Linux |
| Consistency | Varies by machine | Consistent |
| Reliability | Can be inconsistent | Highly reliable |
| Speed | Depends on local machine | Consistent performance |
| Setup | Requires local .env | Uses GitHub secrets |
| Best For | Development/testing | Production deployment |

## Next Steps

After setting up the workflow:

1. Test a manual deployment to verify everything works
2. Consider enabling automatic deployment on push to main
3. Add deployment status badge to README (optional)
4. Set up Slack/email notifications for deployment status (optional)
