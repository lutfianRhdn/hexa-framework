# 🔄 CI/CD Pipeline Documentation

This document explains the CI/CD setup for Hexa Framework's create-hexa-framework-app package.

## 📋 Table of Contents

- [Overview](#overview)
- [Workflows](#workflows)
- [Setup Instructions](#setup-instructions)
- [Publishing Process](#publishing-process)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

We use **GitHub Actions** for our CI/CD pipeline with the following goals:

1. **Automated Testing** - Run tests on every push and PR
2. **Automated Publishing** - Publish to npm on version tags
3. **Multi-platform Support** - Test on Linux, Windows, and macOS
4. **Quality Assurance** - Lint, type-check, and build verification

---

## 🔧 Workflows

### 1. Main CI/CD Pipeline (`ci-cd.yml`)

**Triggers:**
- Push to `master`, `main`, or `develop` branches
- Pull requests to these branches
- Version tags (`v*.*.*`)

**Jobs:**

#### Job 1: Lint & Type Check
- Runs TypeScript compiler
- Checks for type errors
- Ensures code quality

#### Job 2: Test
- Tests on Node.js 18.x and 20.x
- Generates test projects
- Verifies CLI files exist
- Matrix testing across configurations

#### Job 3: Build
- Compiles TypeScript to JavaScript
- Verifies build output
- Uploads artifacts

#### Job 4: Publish to npm
- **Triggers only on version tags** (`v*.*.*`)
- Verifies version match between tag and package.json
- Publishes to npm registry
- Creates GitHub release
- Requires `NPM_TOKEN` secret

#### Job 5: Publish to GitHub Packages (Optional)
- Publishes to GitHub Packages
- Useful for internal distribution

#### Job 6: Release Notes
- Updates release documentation
- Generates changelog

**Workflow File:** `.github/workflows/ci-cd.yml`

---

### 2. Manual Publish Workflow (`manual-publish.yml`)

**Purpose:** Manually trigger npm publishing with a specific version

**Triggers:**
- Manual workflow dispatch from GitHub Actions tab

**Inputs:**
- `version`: Version number to publish (e.g., `2.1.2`)

**Process:**
1. Validates version format
2. Updates package.json
3. Runs build and tests
4. Publishes to npm
5. Creates git tag and pushes

**Usage:**
1. Go to GitHub Actions tab
2. Select "Publish to npm" workflow
3. Click "Run workflow"
4. Enter version number
5. Click "Run workflow" button

**Workflow File:** `.github/workflows/manual-publish.yml`

---

### 3. CLI Testing Workflow (`test-cli.yml`)

**Purpose:** Comprehensive CLI testing across platforms and configurations

**Triggers:**
- Changes to `cli-templates/` directory
- Changes to `src/generators/cli.ts`
- Pull requests

**Test Matrix:**
- **Operating Systems:** Ubuntu, Windows, macOS
- **Node Versions:** 18.x, 20.x
- **Templates:** full-auth, basic-auth, empty
- **Databases:** PostgreSQL, MySQL, MongoDB, SQLite
- **Transports:** REST, GraphQL, WebSocket

**Jobs:**

#### Job 1: Test CLI Generation
- Generates projects with all combinations
- Verifies CLI files exist
- Tests CLI commands
- Tests CRUD generation

#### Job 2: Test CLI Shortcuts
- Tests command shortcuts (`hexa g c`)
- Verifies shorthand commands work

#### Job 3: Test CLI Interactive Mode
- Tests interactive mode
- Ensures no crashes

#### Job 4: Test Summary
- Aggregates all test results
- Provides pass/fail summary

**Workflow File:** `.github/workflows/test-cli.yml`

---

## 🚀 Setup Instructions

### Prerequisites

1. **GitHub Repository** with Actions enabled
2. **npm Account** with publishing permissions
3. **Git** installed locally

### Step 1: Configure npm Token

1. Generate npm token:
   ```bash
   npm login
   npm token create --read-write
   ```

2. Copy the generated token

3. Add to GitHub Secrets:
   - Go to repository Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Paste your npm token
   - Click "Add secret"

### Step 2: Verify Workflows

1. Check workflow files exist:
   ```bash
   ls .github/workflows/
   # Should show: ci-cd.yml, manual-publish.yml, test-cli.yml
   ```

2. Commit and push workflows:
   ```bash
   git add .github/workflows/
   git commit -m "Add CI/CD workflows"
   git push origin master
   ```

### Step 3: Test Workflows

1. Go to GitHub Actions tab
2. Verify workflows appear
3. Make a test commit to trigger CI

---

## 📦 Publishing Process

### Automatic Publishing (Recommended)

**Process:**

1. **Update version in package.json:**
   ```bash
   npm version patch  # or minor, or major
   # Example: 2.1.1 → 2.1.2
   ```

2. **Commit changes:**
   ```bash
   git add package.json
   git commit -m "🔖 Release v2.1.2"
   ```

3. **Create and push tag:**
   ```bash
   git tag -a v2.1.2 -m "Release v2.1.2 - Description"
   git push origin master --tags
   ```

4. **GitHub Actions automatically:**
   - Runs all tests
   - Builds the project
   - Publishes to npm
   - Creates GitHub release

5. **Monitor progress:**
   - Go to GitHub Actions tab
   - Watch the "CI/CD Pipeline" workflow
   - Check for ✅ success or ❌ errors

**Expected Timeline:** 5-10 minutes

---

### Manual Publishing

**When to use:**
- Automatic publishing fails
- Need to publish specific version
- Testing publishing process

**Process:**

1. **Go to GitHub Actions tab**

2. **Select "Publish to npm" workflow**

3. **Click "Run workflow"**

4. **Enter version number** (e.g., `2.1.2`)

5. **Click "Run workflow" button**

6. **Monitor progress** in Actions tab

---

### Local Publishing (Emergency)

**Only use if GitHub Actions is down or failing:**

```bash
# 1. Ensure you're on master branch
git checkout master
git pull

# 2. Update version
npm version patch  # or minor, or major

# 3. Build project
npm run build

# 4. Test build
node dist/index.js test-local --template empty --database postgresql --transports rest --yes

# 5. Verify CLI works
cd test-local
npm install
npx ts-node cli/hexa-cli.ts list

# 6. Go back and publish
cd ..
npm publish

# 7. Push changes and tag
git push origin master --tags
```

---

## 🔍 Monitoring & Verification

### After Publishing

1. **Check npm registry:**
   ```bash
   npm view create-hexa-framework-app version
   # Should show latest version
   ```

2. **Test published package:**
   ```bash
   npx create-hexa-framework-app@latest test-published
   cd test-published
   npm run hexa list
   ```

3. **Verify GitHub release:**
   - Go to repository Releases page
   - Check latest release created
   - Verify release notes

4. **Check package contents:**
   ```bash
   npm pack create-hexa-framework-app
   tar -tzf create-hexa-framework-app-*.tgz
   # Should include cli-templates/
   ```

---

## 🐛 Troubleshooting

### Issue 1: Publishing Fails - Version Mismatch

**Error:**
```
❌ Version mismatch!
   package.json: 2.1.1
   Git tag: v2.1.2
```

**Solution:**
```bash
# Update package.json version to match tag
npm version 2.1.2 --no-git-tag-version
git add package.json
git commit --amend --no-edit
git push origin master --force
```

---

### Issue 2: NPM_TOKEN Invalid

**Error:**
```
npm ERR! code E401
npm ERR! Unable to authenticate
```

**Solution:**

1. Generate new npm token:
   ```bash
   npm token create --read-write
   ```

2. Update GitHub secret:
   - Settings → Secrets → Actions
   - Edit `NPM_TOKEN`
   - Paste new token

3. Re-run workflow

---

### Issue 3: CLI Files Not Included in Package

**Error:**
```
❌ CLI directory not created
```

**Solution:**

1. Check `package.json` files array:
   ```json
   {
     "files": [
       "dist",
       "cli-templates"
     ]
   }
   ```

2. Verify cli-templates exists:
   ```bash
   ls cli-templates/
   ```

3. Rebuild and republish:
   ```bash
   npm version patch
   git push origin master --tags
   ```

---

### Issue 4: Tests Failing

**Error:**
```
❌ TypeScript compilation failed
```

**Solution:**

1. Run tests locally:
   ```bash
   npm run build
   npx tsc --noEmit
   ```

2. Fix TypeScript errors

3. Commit and push:
   ```bash
   git add .
   git commit -m "Fix TypeScript errors"
   git push
   ```

---

### Issue 5: GitHub Actions Not Triggering

**Symptoms:**
- Push tag but no workflow runs
- No "CI/CD Pipeline" in Actions tab

**Solution:**

1. Check workflow file syntax:
   ```bash
   # Install yamllint
   pip install yamllint
   
   # Validate workflow files
   yamllint .github/workflows/*.yml
   ```

2. Verify triggers in workflow:
   ```yaml
   on:
     push:
       tags:
         - 'v*.*.*'  # Make sure this matches your tag format
   ```

3. Check if Actions are enabled:
   - Settings → Actions → General
   - Ensure "Allow all actions" is selected

---

### Issue 6: Manual Workflow Doesn't Appear

**Solution:**

1. Ensure workflow has `workflow_dispatch`:
   ```yaml
   on:
     workflow_dispatch:
       inputs:
         version:
           description: 'Version to publish'
           required: true
   ```

2. Commit and push workflow file:
   ```bash
   git add .github/workflows/manual-publish.yml
   git commit -m "Add manual publish workflow"
   git push
   ```

3. Refresh GitHub Actions tab

---

## 📊 Workflow Status Badges

Add to README.md:

```markdown
[![CI/CD](https://github.com/yourusername/hexa-framework/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/yourusername/hexa-framework/actions/workflows/ci-cd.yml)
[![Test CLI](https://github.com/yourusername/hexa-framework/actions/workflows/test-cli.yml/badge.svg)](https://github.com/yourusername/hexa-framework/actions/workflows/test-cli.yml)
```

---

## 🎯 Best Practices

### Version Numbering

Follow [Semantic Versioning](https://semver.org/):

- **Major (X.0.0)**: Breaking changes
- **Minor (x.Y.0)**: New features, backwards compatible
- **Patch (x.y.Z)**: Bug fixes

Examples:
- `v2.1.1 → v2.1.2` - Bug fix
- `v2.1.2 → v2.2.0` - New feature (CLI commands)
- `v2.2.0 → v3.0.0` - Breaking change (API change)

### Release Process

1. **Before release:**
   - Update CHANGELOG.md
   - Update version in package.json
   - Create release notes
   - Test locally

2. **During release:**
   - Create git tag
   - Push to GitHub
   - Monitor CI/CD pipeline

3. **After release:**
   - Verify npm package
   - Test published package
   - Announce release
   - Monitor for issues

### Rollback Process

If a release has critical bugs:

1. **Deprecate bad version:**
   ```bash
   npm deprecate create-hexa-framework-app@2.1.2 "Critical bug, use 2.1.3 instead"
   ```

2. **Publish fixed version:**
   ```bash
   npm version patch
   git push origin master --tags
   ```

3. **Notify users:**
   - Post on GitHub
   - Update documentation
   - Social media announcement

---

## 📞 Support

If you encounter issues:

1. Check [GitHub Actions logs](https://github.com/yourusername/hexa-framework/actions)
2. Review this documentation
3. Search [GitHub Issues](https://github.com/yourusername/hexa-framework/issues)
4. Create new issue with:
   - Error message
   - Workflow run link
   - Steps to reproduce

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [npm Publishing Guide](https://docs.npmjs.com/cli/v8/commands/npm-publish)
- [Semantic Versioning](https://semver.org/)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)

---

**Last Updated:** December 5, 2025  
**Pipeline Version:** 1.0.0  
**Maintained by:** Hexa Framework Team
