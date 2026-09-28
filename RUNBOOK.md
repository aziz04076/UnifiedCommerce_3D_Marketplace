# RUNBOOK.md — Incident Response Runbook

## Quick Reference

| Severity | Response Time | Who Handles |
|----------|--------------|-------------|
| P1 — Site down | < 30 min | Developer (you) |
| P2 — Payment broken | < 1 hour | Developer |
| P3 — Feature broken | < 24 hours | Developer |
| P4 — Minor issue | < 72 hours | Developer |

---

## P1: Site is Down

### Symptoms
- Homepage returns 5xx or connection refused
- Client calls saying "site nahi khul raha"

### Steps
1. Check hosting provider status page
2. SSH to server, check process: `pm2 status` or `docker ps`
3. If process crashed: `pm2 restart all` or `docker compose up -d`
4. Check logs: `pm2 logs` or `docker compose logs web`
5. If DB connection failed: verify DB is running, check connection string
6. If SSL error: check SSL certificate expiry (`openssl s_client -connect yourdomain.com:443`)
7. Update client via WhatsApp immediately, give ETA

### Rollback
```bash
git log --oneline -5          # find last working commit
git checkout <commit-hash>    # revert
npm run build && npm start
```

---

## P2: Payments Not Working

### Symptoms
- Customers report payment failures
- Razorpay checkout not opening

### Steps
1. Open Razorpay dashboard → Payments → check for errors
2. Check webhook logs: Razorpay dashboard → Webhooks → Recent deliveries
3. Verify `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env.local` are correct
4. Verify keys are LIVE keys (not test) if in production
5. Test with Razorpay test card: `4111 1111 1111 1111`
6. Check server logs for `/api/payment/create-order` errors
7. If webhook failing: verify `RAZORPAY_WEBHOOK_SECRET` matches dashboard value

---

## P3: Security Incident (Suspected Breach)

> This is the most critical scenario. Stay calm and follow steps in order.

### Signs of a breach
- Unexpected admin logins (from unknown IPs or times)
- Orders being created without corresponding payments
- Unusual data in admin panel

### Immediate Actions (within first 15 minutes)
1. **Revoke all sessions**: `DELETE /api/auth/sessions?sessionId=all`
2. **Change admin password** immediately
3. **Rotate Razorpay keys** in Razorpay dashboard, update `.env.local`, redeploy
4. **Rotate ENCRYPTION_KEY** (with migration — contact developer)
5. Notify client by phone (not WhatsApp — could be compromised)

### Investigation
1. Check server access logs for suspicious IPs
2. Check admin audit log (`/admin` → Audit Log tab)
3. Check Razorpay dashboard for unauthorized refunds
4. Run gitleaks: `gitleaks detect --source=.` to check for leaked secrets

### Report
After the incident, document:
- What happened
- When it was detected
- What data may have been affected
- What actions were taken
- How to prevent recurrence

Update `SECURITY.md` with findings.

---

## P4: High Disk / Memory Usage

```bash
# Check disk
df -h

# Check memory
free -h

# Find large files
du -sh /path/to/uploads/* | sort -rh | head -20

# Clean old logs
find /var/log -name "*.log" -mtime +30 -delete
```

---

## Contacts

| Service | Link |
|---------|------|
| Razorpay Support | https://razorpay.com/support |
| Vercel Status | https://vercel-status.com |
| Railway Status | https://status.railway.app |

---

## security.txt

The store has a security disclosure policy at `/.well-known/security.txt`.
Security researchers who find vulnerabilities will be directed there.
