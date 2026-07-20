#!/usr/bin/env bash
# Create local working copies from tracked templates.
# Safe to re-run — never overwrites an existing working copy.
set -euo pipefail
cd "$(dirname "$0")/.."

created=0
for t in voice/*.template.md; do
  work="${t%.template.md}.md"
  if [ -e "$work" ]; then
    echo "  skip  $work (already exists)"
  else
    cp "$t" "$work"
    echo "  new   $work"
    created=$((created + 1))
  fi
done

for s in sources/x-accounts sources/substacks sources/rednote; do
  work="$s.local.md"
  if [ -e "$work" ]; then
    echo "  skip  $work (already exists)"
  else
    cat > "$work" <<EOF
# $(basename "$s") — private annotations

Your editorial notes on the accounts in \`$(basename "$s").md\`. Gitignored.

\`⚡\` = "right, but they're missing something" — the Oracle weights these up,
and they generate better ideas than the highest-engagement accounts.

| Account | ⚡ | Read | Note |
|---|---|---|---|
| | | | |
EOF
    echo "  new   $work"
    created=$((created + 1))
  fi
done

echo
echo "Created $created file(s). These are gitignored — your voice and your"
echo "annotations stay local; the framework and clean lists are what get pushed."
echo
echo "Next: fill in voice/style-guide.md by hand, then run /bootstrap-voice."
