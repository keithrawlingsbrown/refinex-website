# RefineX Deployment Guide

## Quick Deploy Options

### Option 1: Vercel (Recommended - 2 minutes)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Import in Vercel**
   - Go to https://vercel.com
   - Click "Import Project"
   - Select your GitHub repository
   - Click "Deploy"

3. **Done!** Your site is live at `https://your-project.vercel.app`

### Option 2: Docker (5 minutes)

1. **Build the image**
   ```bash
   docker build -t refinex-website .
   ```

2. **Run the container**
   ```bash
   docker run -p 3000:3000 -v $(pwd)/data:/app/data refinex-website
   ```

3. **Access** at http://localhost:3000

### Option 3: Manual VPS Deployment (10 minutes)

1. **Prerequisites**
   ```bash
   # Install Node.js 20+
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PM2
   sudo npm install -g pm2
   ```

2. **Build and deploy**
   ```bash
   # Clone and build
   git clone <your-repo>
   cd refinex-website
   npm install
   npm run build

   # Start with PM2
   pm2 start npm --name "refinex-website" -- start
   pm2 save
   pm2 startup
   ```

3. **Setup Nginx (optional)**
   ```nginx
   server {
       listen 80;
       server_name refinex.io www.refinex.io;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## Environment Configuration

### Production Environment Variables

No environment variables are required for basic deployment. All configuration is in code.

Optional variables:
```bash
# Analytics (if you add tracking)
NEXT_PUBLIC_ANALYTICS_ID=your-id

# Admin token for database access
ADMIN_TOKEN=your-secret-token
```

## Database Setup

SQLite database is automatically created on first run at `/data/refinex.db`.

**Important for production:**
- Ensure `/data` directory has write permissions
- Backup database regularly
- Consider moving to Postgres for high-traffic scenarios

### Backup Script

```bash
#!/bin/bash
# backup-db.sh
DATE=$(date +%Y%m%d_%H%M%S)
cp data/refinex.db backups/refinex_$DATE.db
# Keep last 30 backups
ls -t backups/refinex_*.db | tail -n +31 | xargs rm -f
```

Run daily:
```bash
chmod +x backup-db.sh
crontab -e
# Add: 0 2 * * * /path/to/backup-db.sh
```

## Performance Optimization

### 1. Enable Compression

Add to `next.config.js`:
```javascript
compress: true,
```

### 2. CDN for Static Assets

Use Vercel's built-in CDN or Cloudflare:
```javascript
// next.config.js
images: {
  domains: ['cdn.refinex.io'],
},
```

### 3. Database Optimization

For high traffic (>10K requests/min), migrate to Postgres:

```bash
# Install Postgres
sudo apt-get install postgresql

# Update lib/db.ts to use pg instead of better-sqlite3
```

## Monitoring

### 1. Health Checks

Set up monitoring for:
- `GET /v1/health` - Should return 200
- Database connectivity
- Disk space for SQLite

### 2. Uptime Monitoring

Use services like:
- UptimeRobot (free)
- Pingdom
- Better Stack

### 3. Error Tracking

Add Sentry (optional):
```bash
npm install @sentry/nextjs
```

## Security Checklist

- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Rate limiting configured (use Vercel's built-in)
- [ ] Database backups automated
- [ ] Environment variables secured
- [ ] CORS headers configured
- [ ] CSP headers added (optional)

## Scaling

### Horizontal Scaling

For high traffic:
1. Use Vercel's serverless functions (automatic)
2. Or deploy multiple Docker containers behind load balancer
3. Migrate SQLite to Postgres for concurrent writes

### Vertical Scaling

- Increase Vercel function memory (Pro plan)
- Or upgrade VPS resources

## Troubleshooting

### Database Locked Error

If you see "database is locked":
```bash
# Check for stale connections
lsof data/refinex.db

# Kill if needed
kill <PID>
```

### Build Failures

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Production 500 Errors

Check logs:
```bash
# Vercel
vercel logs

# PM2
pm2 logs refinex-website

# Docker
docker logs <container-id>
```

## Support

For deployment issues:
- GitHub Issues: [repository-url]/issues
- Email: keith@getrefinex.com
