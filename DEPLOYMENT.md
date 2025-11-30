# Turkey Escape - Deployment Guide

This guide explains how to deploy Turkey Escape to various hosting platforms.

## Prerequisites

1. Build the project:
```bash
cd turkey-escape
npm install
npm run build
```

This creates a `dist/` folder containing:
- index.html (main entry point)
- assets/ (JavaScript bundles and resources)

## Deployment Options

### Option 1: VPS Deployment (Nginx)

1. SSH into your VPS:
```bash
ssh user@your-vps-ip
```

2. Install Nginx (if not already installed):
```bash
sudo apt update
sudo apt install nginx
```

3. Copy the dist folder to your VPS:
```bash
# From your local machine:
scp -r dist/* user@your-vps-ip:/var/www/turkey-escape/
```

4. Configure Nginx:
```bash
sudo nano /etc/nginx/sites-available/turkey-escape
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/turkey-escape;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

5. Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/turkey-escape /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

6. (Optional) Set up SSL with Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Option 2: Apache Deployment

1. Copy files to Apache document root:
```bash
sudo cp -r dist/* /var/www/html/turkey-escape/
```

2. Create .htaccess file:
```bash
sudo nano /var/www/html/turkey-escape/.htaccess
```

Add:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /turkey-escape/
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /turkey-escape/index.html [L]
</IfModule>

# Enable gzip compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>
```

3. Ensure mod_rewrite is enabled:
```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

### Option 3: Netlify Deployment

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Login to Netlify:
```bash
netlify login
```

3. Deploy:
```bash
cd turkey-escape
netlify deploy --prod --dir=dist
```

Or use the Netlify web interface:
1. Go to https://app.netlify.com
2. Drag and drop the `dist` folder
3. Your site is live!

### Option 4: Vercel Deployment

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
cd turkey-escape
vercel --prod
```

Or use GitHub integration:
1. Push your code to GitHub
2. Import repository in Vercel
3. Set build command: `npm run build`
4. Set output directory: `dist`

### Option 5: GitHub Pages

1. Install gh-pages:
```bash
npm install -D gh-pages
```

2. Add to package.json scripts:
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

3. Update vite.config.ts base path:
```typescript
export default defineConfig({
  base: '/turkey-escape/', // Replace with your repo name
  // ... rest of config
});
```

4. Deploy:
```bash
npm run deploy
```

5. Enable GitHub Pages in repository settings:
   - Go to Settings > Pages
   - Select gh-pages branch
   - Save

### Option 6: AWS S3 + CloudFront

1. Create S3 bucket:
```bash
aws s3 mb s3://turkey-escape-game
```

2. Enable static website hosting:
```bash
aws s3 website s3://turkey-escape-game --index-document index.html
```

3. Upload files:
```bash
aws s3 sync dist/ s3://turkey-escape-game/ --acl public-read
```

4. (Optional) Set up CloudFront for CDN and HTTPS

### Option 7: Docker Deployment

1. Create Dockerfile:
```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. Build image:
```bash
docker build -t turkey-escape .
```

3. Run container:
```bash
docker run -d -p 80:80 turkey-escape
```

## Performance Optimization

### Gzip Compression
Ensure your web server is configured to compress assets:
- The main Phaser bundle is ~1.5MB and compresses to ~340KB with gzip
- Enable compression for .js, .html, and .css files

### Caching Headers
Add cache headers for static assets:
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### CDN (Optional)
For global distribution, use a CDN:
- CloudFlare (free tier available)
- AWS CloudFront
- Netlify CDN (automatic)
- Vercel Edge Network (automatic)

## Testing Deployment

After deployment, verify:
1. Game loads without errors (check browser console)
2. All sprites render correctly
3. Audio plays (may require user interaction first)
4. Controls respond (Arrow keys, WASD, SPACE)
5. High score persists after page refresh
6. Game works on mobile devices

## Troubleshooting

### Assets Not Loading
- Check base path in vite.config.ts
- Verify file permissions (should be readable)
- Check browser console for 404 errors

### Audio Not Playing
- Audio requires user interaction to start (click/key press)
- Check browser autoplay policies
- Verify Web Audio API support

### Poor Performance
- Enable gzip compression
- Check browser console for errors
- Verify hardware acceleration is enabled
- Test on different devices/browsers

## Domain Setup

If using a custom domain:
1. Point A record to your server IP
2. Update web server configuration with domain name
3. Set up SSL certificate (Let's Encrypt recommended)
4. Force HTTPS redirect for security

## Monitoring

Consider adding:
- Google Analytics for usage tracking
- Error tracking (Sentry, Rollbar)
- Uptime monitoring (UptimeRobot, Pingdom)

## Security

1. Use HTTPS (required for some Web APIs)
2. Set appropriate Content-Security-Policy headers
3. Keep dependencies updated: `npm audit fix`
4. Use CORS headers if needed

## Cost Estimates

- **VPS**: $5-10/month (DigitalOcean, Linode, Vultr)
- **Netlify**: Free for personal projects
- **Vercel**: Free for personal projects
- **GitHub Pages**: Free
- **AWS S3**: ~$0.50-2/month for static hosting

## Support

For issues or questions:
1. Check browser console for errors
2. Verify all assets loaded correctly
3. Test in different browsers
4. Check network tab for failed requests
