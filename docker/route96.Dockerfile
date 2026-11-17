# Upstream route96 v0.8.0, unchanged except for a current CA bundle.
# Upstream images can lag behind Debian ca-certificates updates (e.g. the
# eMudhra/emSign G3 and Sectigo AAA distrust, Debian DSA 2026-10-20).
FROM voidic/route96:v0.8.0@sha256:fbe58c00357245292a05feb5ae9b1f4aa29002bc320a23468777f242bfc7e377
RUN apt-get update \
 && apt-get install -y --no-install-recommends --only-upgrade ca-certificates \
 && rm -rf /var/lib/apt/lists/*
