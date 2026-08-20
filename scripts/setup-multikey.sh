#!/usr/bin/env bash
# 客家 AICODE - macOS / Linux / WSL 多 KEY 輪換代理安裝與啟動腳本
set -e

INSTALL_ROOT="${INSTALL_ROOT:-$HOME/HakkaAICODE}"
KEYS_FILE="${ZEN_INJECTOR_KEYS_FILE:-$INSTALL_ROOT/zen-keys.txt}"
INJECTOR_PORT="${ZEN_INJECTOR_PORT:-15722}"
INJECTOR_REPO="https://github.com/xup61069/zen-header-injector.git"
INJECTOR_DIR="$INSTALL_ROOT/zen-header-injector"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MULTIKEY_SERVER="$SCRIPT_DIR/server-multikey.js"

echo "==> 檢查前置環境"
if ! command -v node >/dev/null 2>&1; then
    echo "❌ 錯誤：未安裝 Node.js (16+)。請先安裝 Node.js。"
    exit 1
fi

if [ ! -f "$MULTIKEY_SERVER" ]; then
    echo "❌ 錯誤：找不到 server-multikey.js: $MULTIKEY_SERVER"
    exit 1
fi

echo "==> 確認 zen-header-injector 目錄"
if [ ! -d "$INJECTOR_DIR" ]; then
    if ! command -v git >/dev/null 2>&1; then
        echo "❌ 錯誤：未安裝 Git。"
        exit 1
    fi
    mkdir -p "$INSTALL_ROOT"
    echo "正在下載 zen-header-injector..."
    git clone "$INJECTOR_REPO" "$INJECTOR_DIR"
fi

echo "==> 部署多 KEY 輪換版 server-multikey.js"
cp -f "$MULTIKEY_SERVER" "$INJECTOR_DIR/server-multikey.js"
echo "已部署至: $INJECTOR_DIR/server-multikey.js"

echo "==> 確認金鑰檔案"
mkdir -p "$(dirname "$KEYS_FILE")"
if [ ! -f "$KEYS_FILE" ]; then
    cat << 'EOF' > "$KEYS_FILE"
# 客家 AICODE - OpenCode Zen 多金鑰輪換清單
# 每行一把 OpenCode Zen API key，'#' 開頭的行會被忽略。
# 注意：不要把這個檔案 commit 進 git 或分享給他人。
# 修改存檔後，正在運行的 injector 會自動熱重載，無需重啟。

# 範例：
# sk-zen-example-key-1
# sk-zen-example-key-2
EOF
    echo "已建立金鑰清單模板: $KEYS_FILE"
    echo "⚠️ 請將您的 OpenCode Zen 金鑰貼入 $KEYS_FILE（一行一把）。"
else
    echo "金鑰檔案已存在: $KEYS_FILE"
fi

echo "==> 重啟多 KEY 轉發代理 (127.0.0.1:$INJECTOR_PORT)"
if command -v lsof >/dev/null 2>&1; then
    PIDS=$(lsof -ti :"$INJECTOR_PORT" || true)
    for PID in $PIDS; do
        PNAME=$(ps -p "$PID" -o comm= 2>/dev/null || true)
        if [[ "$PNAME" == *"node"* ]]; then
            echo "停止佔用端口 $INJECTOR_PORT 的舊 Node 進程 (PID $PID)"
            kill -9 "$PID" 2>/dev/null || true
        else
            echo "警告：端口 $INJECTOR_PORT 被非 Node 進程 ($PNAME, PID $PID) 佔用，略過自動終止。"
        fi
    done
    sleep 1
fi

# 背景啟動 server-multikey.js
cd "$INJECTOR_DIR"
nohup node server-multikey.js >/dev/null 2>&1 &
sleep 2

echo "==> 完成"
echo "金鑰檔案    : $KEYS_FILE"
echo "服務端點    : http://127.0.0.1:$INJECTOR_PORT/v1"
echo "健康檢測    : http://127.0.0.1:$INJECTOR_PORT/__health"
echo "模型查詢    : node $SCRIPT_DIR/check-models.js"
