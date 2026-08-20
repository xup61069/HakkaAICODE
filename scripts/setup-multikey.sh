#!/usr/bin/env bash
set -e

KEYS_FILE="${ZEN_INJECTOR_KEYS_FILE:-$HOME/HakkaAICODE/zen-keys.txt}"
INJECTOR_PORT="${ZEN_INJECTOR_PORT:-15722}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_FILE="$SCRIPT_DIR/server-multikey.js"

echo "==> 檢查前置環境"
if ! command -v node >/dev/null 2>&1; then
    echo "錯誤：未安裝 Node.js。請先安裝 Node.js。"
    exit 1
fi

if [ ! -f "$SERVER_FILE" ]; then
    echo "錯誤：找不到代理程式: $SERVER_FILE"
    exit 1
fi

echo "==> 確認金鑰檔案"
mkdir -p "$(dirname "$KEYS_FILE")"
if [ ! -f "$KEYS_FILE" ]; then
    cat > "$KEYS_FILE" <<'EOF'
# HakkaAICODE - API Keys List
# Put one API key per line. Lines starting with '#' are ignored.
# DO NOT commit or share this file.
# Saving this file hot-reloads the running proxy.

# Example:
# sk-example-key-1
EOF
    echo "已建立金鑰清單模板: $KEYS_FILE"
    echo "請將您的 API keys 貼入 $KEYS_FILE（一行一把）。"
else
    echo "金鑰檔案已存在: $KEYS_FILE"
fi

echo "==> 重啟本機代理 (127.0.0.1:$INJECTOR_PORT)"
if command -v lsof >/dev/null 2>&1; then
    PIDS=$(lsof -ti :"$INJECTOR_PORT" || true)
    for PID in $PIDS; do
        PNAME=$(ps -p "$PID" -o comm= 2>/dev/null || true)
        if [[ "$PNAME" == *node* ]]; then
            echo "停止佔用端口 $INJECTOR_PORT 的舊 Node 進程 (PID $PID)"
            kill -9 "$PID" 2>/dev/null || true
        else
            echo "警告：端口 $INJECTOR_PORT 被非 Node 進程 ($PNAME, PID $PID) 佔用，略過自動終止。"
        fi
    done
    sleep 1
fi

export ZEN_INJECTOR_PORT="$INJECTOR_PORT"
export ZEN_INJECTOR_KEYS_FILE="$KEYS_FILE"
cd "$SCRIPT_DIR"
nohup node server-multikey.js >/dev/null 2>&1 &
sleep 2

echo "==> 完成"
echo "金鑰檔案    : $KEYS_FILE"
echo "服務端點    : http://127.0.0.1:$INJECTOR_PORT/v1"
echo "健康檢測    : http://127.0.0.1:$INJECTOR_PORT/__health"
echo "模型查詢    : node $SCRIPT_DIR/check-models.js"
