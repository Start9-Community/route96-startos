# Upstream route96 with a current CA bundle; its image can lag Debian's ca-certificates.
FROM voidic/route96:v0.8.0@sha256:fbe58c00357245292a05feb5ae9b1f4aa29002bc320a23468777f242bfc7e377
RUN apt-get update \
 && apt-get install -y --no-install-recommends --only-upgrade ca-certificates \
 && rm -rf /var/lib/apt/lists/*
