#!/usr/bin/env bash
# Fixes ERR_CERT_AUTHORITY_INVALID when Chrome (Remotion's renderer) loads Google Fonts or
# other HTTPS assets behind a TLS-inspecting egress proxy. Chrome ignores the system CA
# bundle on Linux and reads its own NSS store, so the proxy's CA has to be added there.
# This keeps TLS verification ON. Never "fix" it with --ignore-certificate-errors.
#   trust-egress-ca.sh [cert.crt ...]   (default: every .crt in /usr/local/share/ca-certificates)
set -euo pipefail
command -v certutil >/dev/null || { echo "certutil missing: apt-get install -y libnss3-tools"; exit 1; }
db="sql:$HOME/.pki/nssdb"
mkdir -p "$HOME/.pki/nssdb"
[ -f "$HOME/.pki/nssdb/cert9.db" ] || certutil -d "$db" -N --empty-password
certs=("$@")
[ ${#certs[@]} -gt 0 ] || certs=(/usr/local/share/ca-certificates/*.crt)
for c in "${certs[@]}"; do
  [ -f "$c" ] || continue
  certutil -d "$db" -A -t "C,," -n "$(basename "$c" .crt)" -i "$c"
  echo "trusted $(basename "$c")"
done
certutil -d "$db" -L
