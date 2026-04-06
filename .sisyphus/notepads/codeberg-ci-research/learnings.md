# Codeberg CI Research - Learnings

## 1. CI System: Woodpecker CI
- Codeberg provides a hosted Woodpecker CI instance at ci.codeberg.org
- Requires manual onboarding via form
- Alternative: Forgejo Actions (self-hosted runners, open alpha)
- Only linux/amd64 build target on Codeberg's hosted instance

## 2. Configuration Files
- Single file: .woodpecker.yaml at repo root
- Multi-workflow: .woodpecker/ directory with .yml/.yaml files (subfolders ignored)
- Each file = one workflow, runs in parallel by default
- Use depends_on for ordering between workflows
- Custom path configurable in project settings

## 3. Push Back to Repository
- YES, but requires explicit authentication
- Use Codeberg access token stored as Woodpecker secret
- URL format: https://username:token@codeberg.org/owner/repo.git
- Token needs read+write permissions
- Alternative: appleboy/drone-git-push plugin with SSH key

## 4. Authentication Tokens/Secrets
- Stored via Woodpecker UI or CLI
- Three levels: Repository > Organization > Global secrets
- Default: NOT exposed to pull_request events
- Can filter by event type and plugin image
- No automatic push token - must create manually

## 5. Build Images
- Any Docker image from any registry
- Common: debian, golang, node, alpine, python
- Woodpecker plugins: woodpeckerci/plugin-*
- Codeberg container registry available

## 6. Trigger Types
- Events: push, pull_request, tag, release, deployment, cron, manual
- Cron: Configure in UI, standard cron syntax
- Filter: when: event: cron + cron: job-name
- Skip CI: [SKIP CI] in commit message
- Manual: event: manual from UI

