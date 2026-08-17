# 客家AICODE

客家 AICODE 是一個給新手用的 AI coding 啟動包。目標很簡單：複製一段短提示詞到 Claude Code 或 Codex，貼上 OpenCode Zen 的金鑰，讓 agent 自動把 CC Switch 和 [zen-header-injector](https://github.com/xup61069/zen-header-injector) 裝好，再用免費額度開始寫程式。

第一次使用：先到 <https://opencode.ai/auth> 拿 OpenCode Zen 的 API key，再把下面的提示詞貼給 Claude Code 或 Codex。金鑰是本人帳號的一部分，註冊步驟不能由 agent 全自動代辦，但貼上金鑰之後的安裝與設定可以全部自動完成。

## 快速開始（提示詞）

把下面的 `你的 OPENCODE ZEN KEY` 換成自己的金鑰，整段複製貼到 Claude Code 或 Codex：

```text
請依照 https://github.com/xup61069/HakkaAICODE 的 README，把我這台電腦的 AI coding 環境設定成 OpenCode Zen 免費後端。

OPEN_CODE_ZEN_KEY=你的 OPENCODE ZEN KEY

請自動完成：
1. 如果 OPEN_CODE_ZEN_KEY 還是空值，先開啟 https://opencode.ai/auth 引導我完成註冊/登入並複製金鑰；我貼給你後再繼續。
2. 如果沒有 CC Switch，先安裝 CC Switch（Windows 用官方最新 release）。
3. 下載並啟動 zen-header-injector（https://github.com/xup61069/zen-header-injector），確認 http://127.0.0.1:15722/v1 有回應。
4. 依照我目前使用的 agent（Claude Code 或 Codex）設定 provider：base URL 指向 http://127.0.0.1:15722/v1，model 選 mimo-v2.5-free（或 API 回傳的最新 -free 模型）。
5. 不要把我提供的金鑰寫進 repo、log 或任何公開檔案。
6. 完成後列出：CC Switch 安裝位置、injector 是否在跑、設定檔改了哪裡。
```

## 註冊 OpenCode Zen（第一次使用）

1. 打開 <https://opencode.ai/auth>，選擇註冊或登入方式（以頁面當下提供的為準）。
2. 登入後進入 OpenCode Zen 的 API keys 或 Dashboard 頁面。
3. 依照官方流程完成必要設定（部分畫面會要求付款資料；以官方頁面實際顯示為準），複製 API key。
4. 回到本 README，把 key 貼進上面提示詞的 `OPEN_CODE_ZEN_KEY=...`。

官方文件：<https://opencode.ai/docs/zen/>

> 註冊、付款資料與金鑰只能由你本人完成。自動化能做到的是：你貼上金鑰後，agent 自己安裝 CC Switch、啟動 zen-header-injector、寫好 provider 設定。

## 為什麼這樣設計

- **CC Switch** 負責管理 Claude Code / Codex 的 provider 切換。
- **zen-header-injector** 負責在 CC Switch 轉送請求時補上 OpenCode Zen 免費方案需要的 `x-opencode-client` 與 `User-Agent` 標頭，避免 Codex 出現 `429 FreeUsageLimitError`。
- **OpenCode Zen** 提供一批 `-free` 結尾的模型，可從 `https://opencode.ai/zen/v1/models` 即時查詢。

> 這裡只整理「免費額度、官方免費層、或公開免費 endpoint」的使用方法。額度、模型清單與政策隨時可能被上游調整，請以官方公告為準。

## 你需要準備

1. 這台電腦已經能跑 Claude Code 或 Codex。
2. 一個 OpenCode Zen 金鑰（登入 [opencode.ai](https://opencode.ai) 後從你的帳戶取得，就是拿來當 API key 的那一組）。
3. Node.js 16 以上。Windows 可以用：

```powershell
winget install OpenJS.NodeJS.LTS --silent
```

## 手動安裝

### 1. 安裝 CC Switch

到 <https://github.com/farion1231/cc-switch/releases> 下載 Windows 安裝檔：

- 推薦 `CC-Switch-v{version}-Windows.msi`
- 或 `CC-Switch-v{version}-Windows-Portable.zip`

### 2. 啟動 zen-header-injector

```powershell
git clone https://github.com/xup61069/zen-header-injector.git "$HOME\HakkaAICODE\zen-header-injector"
Set-Location "$HOME\HakkaAICODE\zen-header-injector"
node server.js
```

預設會監聽 `http://127.0.0.1:15722`，把 `/v1/*` 轉送到 `https://opencode.ai/zen/v1`。

### 3. 在 CC Switch 加入 OpenCode Zen provider

- Base URL：`http://127.0.0.1:15722/v1`
- API key：你的 OpenCode Zen 金鑰
- 模型：從 `-free` 清單挑，例如 `mimo-v2.5-free`

Free 模型清單可用指令確認：

```bash
curl https://opencode.ai/zen/v1/models
```

### 4. 切換 provider

在 CC Switch 把 provider 啟用給 Codex 或 Claude Code，再重開對應的終端機。

## 自動化腳本

Windows 使用者可以試跑：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-zen-windows.ps1
```

這個腳本會處理 zen-header-injector 的下載與背景啟動，並嘗試下載 CC Switch 的 Windows portable 版。詳見 [scripts/install-zen-windows.ps1](scripts/install-zen-windows.ps1)。

## 免費 AI 路線

持續收集可以合法免費/低門檻開始用的路線：

- OpenCode Zen 免費模型：`https://opencode.ai/zen/v1` + zen-header-injector
- OpenRouter 的 `:free` 模型：<https://openrouter.ai/models?q=:free>
- GitHub Models：<https://github.com/marketplace/models>
- Gemini API 免費層：<https://ai.google.dev/gemini-api/docs/pricing>
- Cloudflare Workers AI：<https://developers.cloudflare.com/workers-ai/>
- Groq 免費額度：<https://console.groq.com/>

更完整的筆記放在 [docs/opencode-zen.md](docs/opencode-zen.md)，之後會繼續補。

## 安全提醒

- 不要把金鑰寫進 repo 或公開檔案。
- 只把本地 proxy 綁在 `127.0.0.1`，不要開到區網。
- 若上游回 `429`，通常是免費共用額度真的到頂了，休息一下再試；也可以直接去辦新帳號，但請先確認上游服務條款允許多帳號，避免被判定濫用。

## License

MIT
