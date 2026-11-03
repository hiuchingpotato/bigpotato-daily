#!/usr/bin/env bash
#
# Point git at the hooks kept in this repo.
#
# Hooks live in tools/githooks so they are reviewed and shared like any other
# code; .git/hooks is not version controlled. Run once per clone:
#
#   ./tools/install-hooks.sh

set -euo pipefail
repo="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
chmod +x "$repo/tools/githooks/"*
git -C "$repo" config core.hooksPath tools/githooks
echo "hooks installed: $(git -C "$repo" config core.hooksPath)"
echo "  pre-push will run typecheck and the test suite before every push."
