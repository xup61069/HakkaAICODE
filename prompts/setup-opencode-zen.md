# OpenCode Zen 自動配置提示詞（v2 修正版）

將下方整段提示詞複製並貼給 **Claude Code**、**Codex**、**Roo Code** 或 **Google Antigravity**，即可引導 Agent 自動為你設定好本機環境。

> ⚠️ **使用前請知悉**：
> 1. zen-header-injector 的原理是在轉發時補上官方 CLI 的識別標頭（`x-opencode-client`、`User-Agent: opencode`），屬於**模擬官方客戶端**行為，可能違反 OpenCode Zen 服務條款，帳號有被封鎖的風險，請自行評估。
> 2. Zen 免費額度約為**每日 100 次請求**（免信用卡），是帳號配額，不是無限。多 KEY 輪換若涉及多帳號，可能違反上游條款。
> 3. 免費模型的對話資料**可能被用於訓練**，敏感或公司專案請改用付費 API。

---

## 複製以下提示詞：

```text
請依照 https://github.com/xup61069/HakkaAICODE 的指引，把我這台電腦的 AI coding 環境設定為 OpenCode Zen 免費後端。

OPEN_CODE_ZEN_KEY=你的 OPENCODE ZEN KEY（可留空；若 Zen 免費模型已改為免金鑰，則不需要）

請自動完成以下項目：
1. 先用終端機執行 `opencode auth login` 確認 Zen 官方驗證流程，或開啟 https://opencode.ai/docs/zen/ 查閱目前免費模型是否需要 API key。若需要而我尚未提供，請引導我取得。
2. 檢查本機是否安裝 CC Switch（https://github.com/farion1231/cc-switch），若無則下載安裝最新版本。
3. 下載並啟動 zen-header-injector（https://github.com/xup61069/zen-header-injector），使用多 KEY 版 scripts/server-multikey.js，確認 http://127.0.0.1:15722/v1 正常響應，並用 curl http://127.0.0.1:15722/__health 驗證。
4. 如果提供了 OPEN_CODE_ZEN_KEY，將金鑰寫入使用者目錄下的 zen-keys.txt（Windows: %USERPROFILE%\HakkaAICODE\zen-keys.txt；macOS/Linux: ~/HakkaAICODE/zen-keys.txt），切勿 commit 或上傳。
5. 執行 `node scripts/check-models.js` 取得「當下實際可用」的 -free 模型清單，從清單中挑選模型，不要寫死任何模型名稱（清單隨時會變）。
6. 根據我當前使用的 Agent 設定 Provider：
   - Base URL: http://127.0.0.1:15722/v1
   - 模型: 使用步驟 5 查到排在最前面的 -free 模型
7. 發送一個測試請求確認回應正常；若回 429，明確告訴我「這次請求仍會失敗，輪換從下一次請求生效」，並建議我直接重試。
8. 完成後列出：CC Switch 安裝位置、injector 運行狀態、__health 回傳摘要、設定檔變更位置。
```

---

## 說明與注意事項
- **金鑰非必要**：依 Zen 官方說法，免費模型可能不需要 API key（走 OAuth/客戶端識別），以 `opencode auth login` 與官方文件為準。
- **模型清單是動態的**：README 裡任何寫死的 `-free` 模型名都可能過時，永遠以 `node scripts/check-models.js` 或 `curl https://opencode.ai/zen/v1/models` 的即時回傳為準。
- **429 的真相**：目前的 multikey proxy 是在「下一次請求」才換 key，本次請求照樣失敗。收到 429 請直接重送，或考慮改用 OpenRouter / Gemini 免費層備援。
- **熱重載**：修改 `zen-keys.txt` 存檔後自動生效，無需重啟。
