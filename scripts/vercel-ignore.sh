#!/usr/bin/env bash
# vercel-ignore.sh — DEPRECATED
#
# This script has been replaced by `npx turbo-ignore` in each app's vercel.json.
# Turborepo's built-in ignore command is more reliable because it:
#   - Works correctly with Vercel's shallow clones
#   - Uses the Turborepo dependency graph to detect transitive changes
#   - Is maintained by the Vercel/Turborepo team
#
# This file is kept for reference only. It is no longer called by any vercel.json.
#
# Previous issues with this script:
#   - git diff unreliable in Vercel's shallow clone environment
#   - VERCEL_GIT_PREVIOUS_SHA fetch failures in depth=1 clones
#   - Silent failures causing deployments to be incorrectly skipped
#
# See: https://turbo.build/repo/docs/guides/ci-vendors/vercel

echo "DEPRECATED: This script is no longer used. See vercel.json for the new ignoreCommand."
echo "Proceeding with deployment as a safety fallback."
exit 1
