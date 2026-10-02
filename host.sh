#!/bin/sh
set -e
here=$(cd "$(dirname "$0")" && pwd)
alx="${ALX:-alx}"
dir=$(mktemp -d)
trap 'rm -rf "$dir"' EXIT
cp -R "$here/alx/." "$dir/"
printf 'now %s\nurl %s\n' "$(date -u +%Y-%m-%dT%H:%M:%S.000Z)" "$1" > "$dir/req0"
n=0
while :; do
  cp "$dir/req0" "$dir/request"
  out=$(cd "$dir" && "$alx" run main.alx)
  case "$out" in
    fetch\ *)
      set -- $out
      echo "> $out" >&2
      if curl -fsS "$3" -o "$dir/body$n"; then echo "got $2 body$n" >> "$dir/req0"; else echo "failed $2" >> "$dir/req0"; fi
      n=$((n + 1)) ;;
    *) echo "$out"; break ;;
  esac
done
