# ScoreKeep - Netlify Deployment Guide

## 🚀 Quick Deploy to Netlify

### Option 1: Automatic GitHub Integration (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

2. **Connect to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub account
   - Select the `scorekeep` repository
   - Netlify will auto-detect the settings from `netlify.toml`

3. **Deploy:**
   - Click "Deploy site"
   - Netlify will automatically build and deploy
   - Future pushes to main branch will auto-deploy

### Option 2: Manual Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Build and deploy
npm run deploy
netlify deploy --prod --dir=.next
```

## ⚙️ Configuration Files

- **`netlify.toml`** - Main Netlify configuration
- **`_headers`** - Security headers and caching rules
- **`next.config.mjs`** - Next.js optimizations for Netlify

## ✅ Pre-Deployment Checklist

- [x] ESLint configuration added
- [x] All tests passing (67/67)
- [x] Production build successful
- [x] Netlify configuration files created
- [x] Security headers configured
- [x] Caching optimization enabled
- [x] Next.js plugin configured

## 🔧 Build Settings

- **Build command:** `npm run build`
- **Publish directory:** `.next`
- **Node version:** 18
- **Plugin:** `@netlify/plugin-nextjs`

## 🛡️ Security Features

- X-Frame-Options: DENY
- X-XSS-Protection enabled
- Content-Type-Options: nosniff
- Referrer-Policy configured
- Permissions-Policy for camera/microphone

## 📊 Performance Optimizations

- Static asset caching (1 year)
- Image optimization enabled
- Bundle size optimized
- Gzip compression enabled by Netlify

## 🐛 Troubleshooting

**Build fails:**
- Check Node version is 18+
- Ensure all dependencies are installed
- Run `npm run build` locally first

**Routing issues:**
- Next.js plugin handles dynamic routes automatically
- Client-side routing is properly configured

**Performance issues:**
- Static assets are cached for 1 year
- Next.js automatic optimizations enabled
- Bundle analysis available in build logs

## 📱 Features Supported

- ✅ Server-side rendering
- ✅ Dynamic routes (/games/[id], /players/[id], etc.)
- ✅ Client-side routing
- ✅ Local storage persistence
- ✅ Responsive design
- ✅ Dark/light theme toggle
- ✅ Progressive Web App ready