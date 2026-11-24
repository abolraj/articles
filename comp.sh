#!/usr/bin/env bash
set -Eeuo pipefail

# Convert every .png file under a directory to .webp, keeping the directory structure.
# Usage:
#   ./comp.sh [directory] [quality]
# Examples:
#   ./comp.sh
#   ./comp.sh ./public/images
#   ./comp.sh ./public/images 80

INPUT_DIR="${1:-.}"
QUALITY="${2:-85}"

if ! command -v cwebp >/dev/null 2>&1; then
    echo "Error: cwebp is not installed. Install it with: sudo apt install webp" >&2
    exit 1
fi

if [[ ! -d "$INPUT_DIR" ]]; then
    echo "Error: directory not found: $INPUT_DIR" >&2
    exit 1
fi

if ! [[ "$QUALITY" =~ ^[0-9]+$ ]] || (( QUALITY < 0 || QUALITY > 100 )); then
    echo "Error: quality must be an integer from 0 to 100." >&2
    exit 1
fi

converted=0
failed=0

while IFS= read -r -d '' file; do
    output="${file%.*}.webp"

    if cwebp -q "$QUALITY" -m 6 -mt "$file" -o "$output"; then
        ((converted += 1))
        printf 'Converted: %s -> %s\n' "$file" "$output"
    else
        ((failed += 1))
        printf 'Failed: %s\n' "$file" >&2
    fi
done < <(find "$INPUT_DIR" -type f -name '*.png' -print0)

printf '\nFinished. Converted: %d | Failed: %d\n' "$converted" "$failed"

if (( failed > 0 )); then
    exit 1
fi
