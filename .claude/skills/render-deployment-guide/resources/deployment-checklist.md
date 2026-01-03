# Deployment Checklist

## Pre-Deployment

### Code Preparation

- [ ] All features tested locally
- [ ] No console.errors in production code
- [ ] All dependencies in package.json
- [ ] .env.example documented (without secrets)
- [ ] .gitignore includes .env files
- [ ] Build scripts work (`npm run build`)
- [ ] No hardcoded localhost URLs

### Database

- [ ] Schema matches production requirements
- [ ] Migration scripts ready and tested
- [ ] Foreign keys and constraints defined
- [ ] Indexes created for performance
- [ ] Sample data ready (if needed)

### Environment Variables

- [ ] All required variables documented
- [ ] Cloudinary credentials obtained
- [ ] Database credentials ready
- [ ] CORS origins configured

---

## Initial Deployment

### 1. Database Setup

- [ ] Create PostgreSQL service on Render
- [ ] Note database URL
- [ ] Wait for provisioning (2-3 minutes)
- [ ] Test connection from local

### 2. Backend Deployment

- [ ] Create Web Service on Render
- [ ] Connect GitHub repository
- [ ] Set build command: `cd backend && npm install`
- [ ] Set start command: `cd backend && node server.js`
- [ ] Link database (auto-sets DATABASE_URL)
- [ ] Add Cloudinary env variables
- [ ] Set NODE_ENV=production
- [ ] Deploy and monitor logs

### 3. Run Migrations

- [ ] Verify backend is running
- [ ] From local, run migration scripts
- [ ] Check Render database for tables
- [ ] Verify data integrity
- [ ] Test database connections

### 4. Frontend Deployment

- [ ] Create Static Site on Render
- [ ] Connect GitHub repository
- [ ] Set build command: `cd frontend && npm install && npm run build`
- [ ] Set publish directory: `frontend/dist`
- [ ] Add VITE_API_URL env variable
- [ ] Deploy and monitor logs

---

## Post-Deployment Testing

### Backend Tests

- [ ] Visit backend health endpoint
- [ ] Test all API endpoints with curl
- [ ] Verify database queries work
- [ ] Check file uploads (Cloudinary)
- [ ] Monitor logs for errors

**Quick Tests:**
```bash
# Health check
curl https://kkp-platform.onrender.com/health

# Test endpoint
curl https://kkp-platform.onrender.com/api/kalite-kontrol/siparisler

# Test authenticated endpoint
curl https://kkp-platform.onrender.com/api/teknik-resimler/kategoriler
```

### Frontend Tests

- [ ] Visit frontend URL
- [ ] Check all pages load
- [ ] Test navigation
- [ ] Submit forms
- [ ] Upload files
- [ ] Check browser console (no errors)
- [ ] Test on mobile view

### Integration Tests

- [ ] Frontend can reach backend
- [ ] API calls succeed
- [ ] Database queries work
- [ ] File uploads persist
- [ ] Authentication works
- [ ] CORS configured correctly

---

## Production Checklist

### Performance

- [ ] Images optimized
- [ ] Code minified (production build)
- [ ] Unused code removed
- [ ] Lazy loading implemented
- [ ] Database queries optimized
- [ ] Indexes added where needed

### Security

- [ ] No secrets in code
- [ ] CORS properly configured
- [ ] SQL injection prevention (parameterized queries)
- [ ] Input validation enabled
- [ ] HTTPS enforced
- [ ] Environment variables secure

### Monitoring

- [ ] Health check endpoint working
- [ ] Logs accessible on Render
- [ ] Error tracking configured (optional)
- [ ] Uptime monitoring (optional)

---

## Common Issues & Solutions

### Backend Won't Start

**Check:**
- Build command correct?
- Start command correct?
- Port binding (`process.env.PORT`)?
- All dependencies installed?

### Frontend Can't Reach Backend

**Check:**
- CORS origin includes frontend URL?
- VITE_API_URL set correctly?
- Backend actually running?

### Database Connection Fails

**Check:**
- DATABASE_URL set?
- SSL config included?
- Database is online?
- Migrations ran successfully?

### Files Not Persisting

**Check:**
- Using Cloudinary (not local filesystem)?
- Cloudinary credentials set?
- Upload function working?

---

## Post-Deployment

### Documentation

- [ ] Update README with deployment info
- [ ] Document environment variables
- [ ] Add production URLs
- [ ] Note any production-specific configs

### Monitoring

- [ ] Check logs daily for first week
- [ ] Monitor database usage
- [ ] Track Cloudinary storage
- [ ] Watch for errors

### Maintenance

- [ ] Plan for regular updates
- [ ] Schedule database backups
- [ ] Monitor free tier limits
- [ ] Consider upgrade timing

---

## Continuous Deployment

Once initial deployment works:

1. **Push to GitHub** → Render auto-deploys
2. **Monitor deploy logs** → Check for errors
3. **Test production** → Verify changes work
4. **Rollback if needed** → Render keeps previous versions

**Git Workflow:**
```bash
git add .
git commit -m "Descriptive message"
git push origin main
```

Render automatically:
- Detects push to main
- Runs build command
- Deploys new version
- Shows progress in dashboard

---

## Emergency Procedures

### Rollback Deployment

1. Go to Render Dashboard
2. Select service
3. Click "Manual Deploy"
4. Select previous commit
5. Deploy older version

### Database Restore

1. Have backup ready (pg_dump)
2. Stop backend service (to prevent writes)
3. Restore from backup
4. Restart backend service
5. Test thoroughly

### Service Down

1. Check Render status page
2. Check service logs
3. Verify environment variables
4. Try manual redeploy
5. Contact Render support if persistent

---

## Success Criteria

✅ Deployment successful when:

- [ ] Backend responds to health checks
- [ ] Frontend loads without errors
- [ ] API calls work end-to-end
- [ ] Database queries succeed
- [ ] File uploads persist
- [ ] All features functional
- [ ] No errors in logs
- [ ] Production URL accessible

---

## Next Steps After Deployment

1. **Set up custom domain** (optional)
2. **Configure SSL certificate** (auto on Render)
3. **Enable monitoring** (uptime, errors)
4. **Plan for scaling** (upgrade from free tier when needed)
5. **Document deployment process** (for team)

---

## Deployment Complete! 🎉

Your KKP Platform is now live:
- **Frontend:** https://kkp-frontend.onrender.com
- **Backend:** https://kkp-platform.onrender.com
- **Database:** Render PostgreSQL (Frankfurt)
- **Files:** Cloudinary

Monitor for 24-48 hours and address any issues that arise.
