# OpenCode Zen 自動配置提示詞 (Prompt)

將下方整段提示詞複製並貼給 **Claude Code** 或 **Codex**，即可引導 Agent 自動為你設定好本機環境。

---

## 複製以下提示詞：

```text
請依照 https://github.com/xup61069/HakkaAICODE 的指引，把我這台電腦的 AI coding 環境設定為 OpenCode Zen 免費後端。

OPEN_CODE_ZEN_KEY=你的 OPENCODE ZEN KEY
OPEN_CODE_ZEN_KEYS=可選，多 KEY 自動輪換用；有多把 key 就一行一把貼在這裡，沒有就留空

請自動完成以下項目：
1. 如果 OPEN_CODE_ZEN_KEY 仍為空，請先打開 https://opencode.ai/auth 引導我登入並複製 API 金鑰。
2. 檢查本機是否安裝 CC Switch，若無則下載並安裝最新版本。
3. 取得並啟動 zen-header-injector（https://github.com/xup61069/zen-header-injector），使用多 KEY 版 scripts/server-multikey.js，確認 http://127.0.0.1:15722/v1 正常響應。
4. 如果提供了 OPEN_CODE_ZEN_KEYS，將金鑰寫入使用者目錄下的 zen-keys.txt（切勿 commit 或上傳公開）。
5. 根據我當前使用的 Agent（Claude Code 或 Codex）設定 Provider：
   - Base URL: http://127.0.0.1:15722/v1
   - 預設模型: mimo-v2.5-free 或 deepseek-v4-flash-free（挑選目前可用的 -free 模型）
6. 驗證連線並列出：CC Switch 安裝位置、Injector 運行狀態、設定檔變更位置與金鑰數量。
```

---

## 說明與注意事項
- **安全保障**：所有金鑰僅存於本機 `zen-keys.txt`，請勿加入版本控制。
- **熱重載**：修改 `zen-keys.txt` 增減金鑰後，代理程式會自動重載生效。
- **免費模型驗證**：可隨時於終端機執行 `node scripts/check-models.js` 查看可用免費模型。
