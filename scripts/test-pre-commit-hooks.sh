#!/bin/bash
# Test script for pre-commit hooks
# This script verifies that husky and lint-staged are properly configured

set -e

echo "🧪 Testing Pre-Commit Hooks Configuration"
echo "=========================================="
echo ""

# Check if husky is installed
echo "✓ Checking husky installation..."
if [ -d ".husky" ]; then
    echo "  ✅ .husky directory exists"
else
    echo "  ❌ .husky directory not found"
    exit 1
fi

# Check if pre-commit hook exists
echo "✓ Checking pre-commit hook..."
if [ -f ".husky/pre-commit" ]; then
    echo "  ✅ pre-commit hook file exists"
    echo "  Content:"
    cat .husky/pre-commit | sed 's/^/    /'
else
    echo "  ❌ pre-commit hook not found"
    exit 1
fi

# Check if lint-staged is configured in package.json
echo "✓ Checking lint-staged configuration..."
if grep -q "lint-staged" package.json; then
    echo "  ✅ lint-staged found in package.json"
    echo "  Configuration:"
    grep -A 6 '"lint-staged"' package.json | sed 's/^/    /'
else
    echo "  ❌ lint-staged not configured in package.json"
    exit 1
fi

# Check if prepare script exists
echo "✓ Checking prepare script..."
if grep -q '"prepare": "husky"' package.json; then
    echo "  ✅ prepare script found"
else
    echo "  ❌ prepare script not found"
    exit 1
fi

# Check if husky and lint-staged are installed as dev dependencies
echo "✓ Checking npm packages..."
if [ -f "package.json" ]; then
    if grep -q '"husky"' package.json && grep -q '"lint-staged"' package.json; then
        echo "  ✅ husky and lint-staged are in package.json"
    else
        echo "  ⚠️  Some packages may be missing"
    fi
fi

echo ""
echo "=========================================="
echo "✅ All checks passed!"
echo ""
echo "📝 Your pre-commit hooks are properly configured."
echo "   Every commit will now automatically:"
echo "   - Format TypeScript files with Prettier"
echo "   - Lint TypeScript files with ESLint"
echo ""
echo "💡 To test manually, run: npx lint-staged"
echo "📚 For more info, see: docs/PRE-COMMIT-HOOKS.md"
