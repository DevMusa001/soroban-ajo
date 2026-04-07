# Disabled Features

This directory contains features that have been temporarily disabled due to TypeScript errors or missing dependencies. These can be re-enabled once the issues are resolved.

## Structure

```
.disabled/
├── controllers/     # Disabled API controllers
├── services/        # Disabled service layer components
├── routes/          # Disabled API routes
├── middleware/      # Disabled middleware
└── jobs/           # Disabled background jobs
```

## Disabled Features

### Controllers
- `goalsController.ts` - Goals management endpoints
- `referralController.ts` - Referral system endpoints
- `rewardController.ts` - Rewards distribution endpoints

### Services
- `AchievementService.ts` - Achievement tracking
- `ChallengeService.ts` - Challenge management
- `kycService.ts` - KYC verification
- `moderationService.ts` - Content moderation
- `MultiSigService.ts` - Multi-signature transactions

### Routes
- `admin.ts` - Admin panel routes
- `achievements.ts` - Achievement routes

### Middleware
- `kyc.ts` - KYC verification middleware
- `kycCheck.ts` - KYC status checking

### Jobs
- `analyticsETL.ts` - Analytics ETL pipeline

## Re-enabling Features

To re-enable a feature:

1. Move the file back to its original location
2. Remove the `.disabled` extension
3. Fix any TypeScript errors
4. Update imports in dependent files
5. Add the route/service back to the main index
6. Test thoroughly
7. Commit with conventional format

Example:
```bash
mv backend/.disabled/controllers/goalsController.ts.disabled backend/src/controllers/goalsController.ts
# Fix errors, update imports, test
git add backend/src/controllers/goalsController.ts
git commit -m "feat: re-enable goals controller"
```
