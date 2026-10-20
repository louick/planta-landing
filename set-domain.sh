#!/usr/bin/env bash
# Troca o domínio usado no card de compartilhamento (og:image, og:url, canonical).
# Uso: ./set-domain.sh https://planta.com.br
set -euo pipefail
url="${1:?Informe o domínio, ex.: ./set-domain.sh https://planta.com.br}"
url="${url%/}"
cd "$(dirname "$0")"
python3 - "$url" <<'PY'
import re, sys
url = sys.argv[1]
p = "index.html"; h = open(p).read()
h = re.sub(r'(<link rel="canonical" href=")[^"]*(")', rf'\g<1>{url}/\2', h)
h = re.sub(r'(<meta property="og:url" content=")[^"]*(")', rf'\g<1>{url}/\2', h)
h = re.sub(r'(content=")[^"]*/og-image\.jpg(")', rf'\g<1>{url}/og-image.jpg\2', h)
open(p, "w").write(h)
print("Domínio configurado:", url)
PY
