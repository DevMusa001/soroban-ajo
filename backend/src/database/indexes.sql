-- Group indexes
CREATE INDEX IF NOT EXISTS idx_group_created_at ON "Group"(createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_group_active ON "Group"(isActive);
CREATE INDEX IF NOT EXISTS idx_group_owner ON "Group"(ownerId);

-- GroupMember indexes
CREATE INDEX IF NOT EXISTS idx_group_member_group_id ON "GroupMember"(groupId);
CREATE INDEX IF NOT EXISTS idx_group_member_user_id ON "GroupMember"(userId);
CREATE INDEX IF NOT EXISTS idx_group_member_composite ON "GroupMember"(groupId, userId);

-- Contribution indexes
CREATE INDEX IF NOT EXISTS idx_contribution_group_id ON "Contribution"(groupId);
CREATE INDEX IF NOT EXISTS idx_contribution_user_id ON "Contribution"(userId);
CREATE INDEX IF NOT EXISTS idx_contribution_created_at ON "Contribution"(createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_contribution_composite ON "Contribution"(groupId, userId, createdAt DESC);

-- Goal indexes
CREATE INDEX IF NOT EXISTS idx_goal_user_id ON "Goal"(userId);
CREATE INDEX IF NOT EXISTS idx_goal_status ON "Goal"(status);
CREATE INDEX IF NOT EXISTS idx_goal_created_at ON "Goal"(createdAt DESC);

-- Reward indexes
CREATE INDEX IF NOT EXISTS idx_reward_user_id ON "Reward"(userId);
CREATE INDEX IF NOT EXISTS idx_reward_status ON "Reward"(status);
CREATE INDEX IF NOT EXISTS idx_reward_earned_at ON "Reward"(earnedAt DESC);

-- User indexes
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
CREATE INDEX IF NOT EXISTS idx_user_created_at ON "User"(createdAt DESC);

-- Webhook indexes
CREATE INDEX IF NOT EXISTS idx_webhook_active ON "Webhook"(active);
CREATE INDEX IF NOT EXISTS idx_webhook_event_status ON "WebhookEvent"(status);
CREATE INDEX IF NOT EXISTS idx_webhook_event_next_retry ON "WebhookEvent"(nextRetry);
