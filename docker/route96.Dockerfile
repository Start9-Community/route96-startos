# Upstream route96 with a current CA bundle; its image can lag Debian's ca-certificates.
FROM voidic/route96:v0.8.1@sha256:06a5cfa3f626a5878afb7e89feda9ba7b84e58a1eac5dc631eefbeb15ea8314f
# Upstream runs as uid 10001 since v0.8.1; apt needs root, then drop back.
USER root
RUN apt-get update \
 && apt-get install -y --no-install-recommends --only-upgrade ca-certificates \
 && rm -rf /var/lib/apt/lists/*
USER 10001:10001
