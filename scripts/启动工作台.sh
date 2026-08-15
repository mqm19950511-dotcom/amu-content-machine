#!/bin/bash
# 启动 AI 内容工作台仪表盘 → http://localhost:8420
cd "$(dirname "$0")/.."
# 优先用 WorkBuddy 管理的 node，否则用系统 node
NODE="/Users/muqimin/.workbuddy/binaries/node/versions/22.12.0/bin/node"
[ -x "$NODE" ] || NODE="node"
exec "$NODE" scripts/serve.mjs 8420 0.0.0.0
