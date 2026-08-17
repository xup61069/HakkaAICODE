# OpenCode Zen 免費後端筆記

OpenCode Zen 的免費額度 endpoint 是：

```text
https://opencode.ai/zen/v1
```

zen-header-injector 把它包成本地端點：

```text
http://127.0.0.1:15722/v1
```

## 註冊與拿金鑰

1. 打開 <https://opencode.ai/auth>。
2. 選擇註冊或登入方式。
3. 登入後到 API keys / Dashboard，依照官方流程完成必要設定（部分畫面會要求付款資料），複製 API key。
4. 把 API key 存進 CC Switch 的 provider 欄位，或貼進客家AICODE 的提示詞。

官方文件：<https://opencode.ai/docs/zen/>

## 目前可查到的模型

```bash
curl https://opencode.ai/zen/v1/models
```

`-free` 結尾的模型是免費額度。其他模型會走付費或 Go endpoint，請自己看官方定價。

## 為什麼要 zen-header-injector

CC Switch 這類轉送代理會重新組裝請求，不會原封不動帶走 OpenCode Zen 需要的兩個標頭：

- `x-opencode-client: terminal`
- `User-Agent: opencode`

zen-header-injector 在轉送時把這兩個標頭補回去，解決 Codex 透過 CC Switch 使用 Zen 免費模型時的 `429 FreeUsageLimitError`。

## 多 KEY 自動輪換

單一把 key 一直被 `429` 擋時，可以準備多把 key，由 injector 自動輪換：

1. 執行 `scripts/setup-multikey.ps1`，它會把 `scripts/server-multikey.js` 部署進 `zen-header-injector` 目錄並重啟。
2. 把 key 一行一把貼進 `zen-keys.txt`（預設 `%USERPROFILE%\HakkaAICODE\zen-keys.txt`，支援 `#` 註解）。這個檔案不要 commit、不要外流。
3. 之後 injector 收到 `429`（或 `401`）時會自動切到下一把 key；被限流的 key 冷卻退避 60 秒起、逐次加倍、最多 30 分鐘。

只改 env 也可以，不一定要用檔案：`ZEN_INJECTOR_KEYS="k1,k2,k3"`。

`server-multikey.js` 是原版 `server.js` 的超集——沒有設定任何 key 時行為跟原版一模一樣，可以放心整份換掉。

> 注意：Zen 免費額度是**共用**配額，多 KEY 輪換解的是「單一 key 被限流」這類問題。如果整個免費池真的乾了，輪換並不會變出額度，這點請以官方實際行為為準。

## 已知的使用提醒

- 免費額度是共用配額，不是「無限」。
- 如果回 `429`，通常代表該時段免費額度已用滿；可以休息一下再試，或使用上面的多 KEY 輪換，或直接去辦新帳號（先確認上游服務條款允許，避免被判定濫用）。
- 圖片支援以實際模型回應為準；`sync-free-models.py` 會把能力表寫回 Codex 的模型目錄。
- 付費模型不需要這個 header injector。

## 相關工具

- <https://github.com/xup61069/zen-header-injector>
- <https://github.com/farion1231/cc-switch>
- <https://opencode.ai>
