# MAINTENANCE.md — Store Maintenance Guide

## Daily Tasks (Automated)
- ✅ Database backup runs at 3:00 AM (configure in cron or hosting provider)
- ✅ Error monitoring via logs (Sentry optional — add `SENTRY_DSN` to `.env.local`)

## Weekly Tasks (Freelancer)
- [ ] Check error logs for any new issues
- [ ] Check Razorpay webhook delivery report (dashboard → Webhooks → Logs)
- [ ] Verify backup files are present and non-zero size
- [ ] Check uptime monitoring (use UptimeRobot free — monitor `/api/health`)

## Monthly Tasks
- [ ] `npm audit` — check for security vulnerabilities
  ```bash
  cd apps/web && npm audit
  ```
- [ ] Update dependencies:
  ```bash
  npm update
  npm run build  # verify build still passes
  ```
- [ ] Review Razorpay payouts — confirm all settled correctly
- [ ] Rotate `ENCRYPTION_KEY` if needed (with migration script)
- [ ] Check Lighthouse score (mobile, production mode)

---

## Backup Policy

### What is backed up
- SQLite/PostgreSQL database (all orders, products, users)
- Uploaded product images

### Backup location
Configure in your hosting provider's backup settings, or use this cron:
```bash
# Example: daily backup at 3 AM (add to server crontab)
0 3 * * * cd /path/to/project && pg_dump $DATABASE_URL | gzip > backups/$(date +%Y%m%d).sql.gz
```

### Retention
Keep 30 days of backups. Delete older ones automatically:
```bash
find /path/to/backups -name "*.sql.gz" -mtime +30 -delete
```

### Test restore (do this monthly)
```bash
# Download a backup file and restore to a test DB
gunzip < backup-YYYYMMDD.sql.gz | psql $TEST_DATABASE_URL
```

---

## Updating the Template Version

When a new version of the template is released:

1. Review the changelog
2. Test on a staging server first
3. Back up production database
4. Deploy update
5. Verify build and test order flow

---

## Monitoring Setup (Recommended)

### UptimeRobot (Free)
1. Create account at uptimerobot.com
2. Add monitor: `https://yourdomain.com/api/health`
3. Alert: email or WhatsApp when down

### Error Tracking (Optional)
1. Create Sentry account
2. Add `SENTRY_DSN` to `.env.local`
3. Sentry captures server errors automatically

---

## Emergency Contacts

| Issue | Action |
|-------|--------|
| Site down | Check hosting provider status, then redeploy |
| Payment not working | Check Razorpay dashboard → check webhook logs |
| Data loss | Restore from yesterday's backup |
| Security incident | See `RUNBOOK.md` → Incident Response |
