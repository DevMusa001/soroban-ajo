-- Migration: add_reminder_preferences_push_subscriptions (Issue #587)

CREATE TABLE "ReminderPreferences" (
    "id"                        TEXT NOT NULL,
    "userId"                    TEXT NOT NULL,
    "channels"                  TEXT[] NOT NULL DEFAULT ARRAY['push']::TEXT[],
    "contributionReminderHours" INTEGER NOT NULL DEFAULT 24,
    "payoutReminderHours"       INTEGER NOT NULL DEFAULT 2,
    "enabled"                   BOOLEAN NOT NULL DEFAULT true,
    "phoneNumber"               TEXT,
    "email"                     TEXT,
    "createdAt"                 TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"                 TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReminderPreferences_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ReminderPreferences_userId_key" ON "ReminderPreferences"("userId");
CREATE INDEX "ReminderPreferences_userId_idx" ON "ReminderPreferences"("userId");

ALTER TABLE "ReminderPreferences"
    ADD CONSTRAINT "ReminderPreferences_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("walletAddress") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE "PushSubscription" (
    "id"        TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "endpoint"  TEXT NOT NULL,
    "p256dh"    TEXT NOT NULL,
    "auth"      TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");
CREATE INDEX "PushSubscription_userId_idx" ON "PushSubscription"("userId");

ALTER TABLE "PushSubscription"
    ADD CONSTRAINT "PushSubscription_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("walletAddress") ON DELETE CASCADE ON UPDATE CASCADE;
