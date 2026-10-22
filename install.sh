#!/usr/bin/env bash
# Link the skills in this library into an agent's skill directory.
#
#   ./install.sh                 # link everything into ./.claude/skills (project-local)
#   ./install.sh --user          # link into ~/.claude/skills instead
#   ./install.sh --codex         # link into ~/.codex/skills instead
#   ./install.sh --all-agents    # ~/.claude/skills and ~/.codex/skills
#   ./install.sh --copy          # copy instead of symlink (for sandboxes without symlinks)
#   ./install.sh impeccable      # link only the named skills
#   ./install.sh --list          # show install name -> folder
#   ./install.sh --uninstall     # remove links that point into this repo
#
# Links (not copies) so `git pull` updates every installed skill in place.

set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_DIR="$REPO/skills"

mode=install
link_mode=symlink
targets=()
wanted=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --user)        targets+=("$HOME/.claude/skills") ;;
    --claude)      targets+=("$HOME/.claude/skills") ;;
    --codex)       targets+=("$HOME/.codex/skills") ;;
    --all-agents)  targets+=("$HOME/.claude/skills" "$HOME/.codex/skills") ;;
    --copy)        link_mode=copy ;;
    --list)        mode=list ;;
    --uninstall)   mode=uninstall ;;
    -h|--help)     sed -n '2,16p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//' ; exit 0 ;;
    -*)            echo "unknown flag: $1" >&2 ; exit 2 ;;
    *)             wanted+=("$1") ;;
  esac
  shift
done

# Install name is the SKILL.md frontmatter `name`, folder is what we ship.
install_name() {
  awk '/^---$/{n++; next} n==1 && /^name:/{sub(/^name:[[:space:]]*/, ""); gsub(/["'\'']/, ""); print; exit}' "$1/SKILL.md"
}

folders=()
for dir in "$SKILLS_DIR"/*/; do
  [[ -f "$dir/SKILL.md" ]] || continue
  folders+=("${dir%/}")
done

if [[ ${#wanted[@]} -gt 0 ]]; then
  filtered=()
  for dir in "${folders[@]}"; do
    base="$(basename "$dir")"
    name="$(install_name "$dir")"
    for w in "${wanted[@]}"; do
      if [[ "$w" == "$base" || "$w" == "$name" ]]; then filtered+=("$dir"); break; fi
    done
  done
  folders=("${filtered[@]}")
fi

if [[ ${#folders[@]} -eq 0 ]]; then
  echo "no matching skills in $SKILLS_DIR" >&2
  exit 1
fi

if [[ $mode == list ]]; then
  for dir in "${folders[@]}"; do
    printf '%-26s %s\n' "$(install_name "$dir")" "skills/$(basename "$dir")"
  done
  exit 0
fi

if [[ ${#targets[@]} -eq 0 ]]; then
  targets+=("$PWD/.claude/skills")
fi

for target in "${targets[@]}"; do
  mkdir -p "$target"
  for dir in "${folders[@]}"; do
    name="$(install_name "$dir")"
    dest="$target/$name"

    if [[ $mode == uninstall ]]; then
      if [[ -L "$dest" ]]; then rm -f "$dest" && echo "unlinked $dest"; fi
      continue
    fi

    if [[ -e "$dest" && ! -L "$dest" ]]; then
      echo "skip $dest (already exists and is not a link)" >&2
      continue
    fi
    rm -f "$dest"

    if [[ $link_mode == copy ]]; then
      cp -a "$dir" "$dest"
      echo "copied  $(basename "$dir") -> $dest"
    else
      ln -s "$dir" "$dest"
      echo "linked  $(basename "$dir") -> $dest"
    fi
  done
done
