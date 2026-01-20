# DeadManPing Pricing Strategy

## 4-Tier Pricing Structure (Option A - Aggressive) ✅ IMPLEMENTED

### Pricing Table (Landing Page Ready)

| Feature | **Free** | **Starter** | **Pro** | **Team** |
|---------|----------|-------------|---------|----------|
| **Price/month** | $0 | $7 | $24 | $79 |
| **Tagline** | Get started free | Perfect for solo devs | Scale without hassle | Built for teams |
| **Max Monitors** | 20 | 30 | 150 | 1000 |
| **Min Interval** | 5 minutes | 5 minutes | 1 minute | 1 minute |
| **Max Team Members** | 1 | 1 | 3 | 10 |
| **Email Alerts** | ✓ | ✓ | ✓ | ✓ |
| **Slack Integration** | — | ✓ | ✓ | ✓ |
| **Discord Integration** | — | ✓ | ✓ | ✓ |
| **Custom Webhooks** | — | — | — | ✓ |
| **Priority Support** | — | — | — | ✓ |
| **Advanced Analytics** | — | — | — | ✓ |
| **Annual Discount** | — | 10% off | 15% off | 20% off |

---

## Plan Details

### Free - $0/month
**Tagline:** *Get started free*

- 20 monitors (increased from 10 - Option A implementation)
- 5-minute minimum interval
- Email alerts only
- Single user
- **14-day trial:** Full access with Slack/Discord integrations (20 monitors)
- **Best for:** Trying out the service, personal projects, or learning environments.

---

### Starter - $7/month
**Tagline:** *Perfect for solo devs*

- 30 monitors (increased from 25)
- 5-minute minimum interval
- Email + Slack/Discord alerts
- Single user
- **Annual:** $76/year (save $8, ~10% off)

**Best for:** Individual developers monitoring personal projects, small side projects, or freelancers with a few clients.

---

### Pro - $24/month ⭐ *Most Popular*
**Tagline:** *Scale without hassle*

- 150 monitors (increased from 100)
- 1-minute minimum interval
- Email + Slack/Discord alerts
- Up to 3 team members
- **Annual:** $245/year (save $43, ~15% off)

**Best for:** Agencies, freelancers managing multiple client projects, or developers running production systems.

---

### Team - $79/month
**Tagline:** *Built for teams*

- 1000 monitors (increased from 500)
- 1-minute minimum interval (same as Pro, but with more monitors and team features)
- All alert channels: Email, Slack, Discord, Custom Webhooks
- Priority support (24-hour response)
- Advanced analytics & reporting
- Custom webhook endpoints
- Up to 10 team members
- **Annual:** $758/year (save $190, ~20% off)

**Best for:** Power users, startups, or teams who need high-frequency monitoring, API integration, and advanced features for production systems.

---

## Trial & Discount Strategy

### Free Trial
- **14-day free trial** for all paid plans
- No credit card required
- Full access to plan features during trial
- Automatic conversion to free tier if not upgraded

### Annual Discounts
- **Starter:** 10% off ($76/year vs $84/monthly)
- **Pro:** 15% off ($245/year vs $288/monthly)
- **Team:** 20% off ($758/year vs $948/monthly)

*Rationale: Higher discounts for higher tiers incentivize annual commitments and increase LTV.*

---

## Pricing Psychology Notes

1. **Clear Value Ladder:** $0 → $7 → $24 → $79 creates logical progression with clear upgrade triggers
2. **Better Free Tier:** 20 monitors is competitive with Healthchecks (20) and better than Cronitor (5)
3. **Low Entry Point:** $7 Starter plan is very competitive vs Dead Man's Snitch ($5) and Healthchecks ($5)
4. **Feature Differentiation:** Each tier adds meaningful capabilities (channels, speed, scale, collaboration)
5. **Team Plan Premium:** Team collaboration and advanced features justify the premium
6. **Annual Incentives:** Progressive discounts (10%/15%/20%) reward commitment and improve cash flow

---

## Implementation Notes

- All plans include the 14-day free trial
- Annual billing saves customers money and improves MRR predictability
- Team plan features (webhooks, analytics) differentiate it as a premium offering
- 1-minute intervals (same as Pro) with team collaboration for high-frequency monitoring use cases

## Team Collaboration

**Status:** ✅ **IMPLEMENTED**

Team collaboration is now fully implemented with:

1. **Database Schema:**
   - ✅ `workspaces` table (one per user/team)
   - ✅ `workspace_members` junction table (user_id, workspace_id, role)
   - ✅ `monitors.workspace_id` added (backward compatible with `user_id`)
   - ✅ RLS policies updated for workspace-based access

2. **Features:**
   - ✅ Workspace creation on user signup
   - ✅ Workspace-based billing (subscription tied to workspace)
   - ✅ Member limits per tier (Free: 1, Starter: 1, Pro: 3, Team: 10)
   - ✅ Role-based access (owner, admin, member)

3. **Next Steps (Optional):**
   - Team invitation flow (invite via email)
   - Team settings page in dashboard
   - Member management UI
   - Workspace switching (if user is member of multiple workspaces)

