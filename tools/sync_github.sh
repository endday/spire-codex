#!/bin/bash
# Sync merged GitHub PRs into Forgejo
# Run via cron: */5 * * * * /path/to/spire-codex/tools/sync_github.sh >> /var/log/spire-codex-sync.log 2>&1

cd "$(dirname "$0")/.." || exit 1

# Fetch from GitHub
git fetch github 2>/dev/null || exit 0

# Check if there's anything new
LOCAL=$(git rev-parse main)
REMOTE=$(git rev-parse github/main)

if [ "$LOCAL" = "$REMOTE" ]; then
    exit 0
fi

echo "$(date): Syncing github/main ($REMOTE) into origin/main ($LOCAL)"

# Fast-forward only — if it fails, there's a conflict that needs manual resolution
if git merge github/main --ff-only; then
    git push origin main
    echo "$(date): Sync complete"
else
    echo "$(date): Fast-forward failed — manual merge needed"
fi
