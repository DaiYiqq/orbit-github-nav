#!/usr/bin/env bash
# Orbit · 一键安装 / 一键启动
set -e
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "[ERROR] Node.js not found. Install Node.js 18+ from https://nodejs.org"
  exit 1
fi

node scripts/install.mjs "$@"
