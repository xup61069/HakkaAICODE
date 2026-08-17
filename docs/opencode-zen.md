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

## 已知的使用提醒

- 免費額度是共用配額，不是「無限」。
- 如果回 `429`，通常代表該時段免費額度已用滿；可以休息一下再試，或直接去辦新帳號（先確認上游服務條款允許，避免被判定濫用）。
- 圖片支援以實際模型回應為準；`sync-free-models.py` 會把能力表寫回 Codex 的模型目錄。
- 付費模型不需要這個 header injector。

## 相關工具

- <https://github.com/xup61069/zen-header-injector>
- <https://github.com/farion1231/cc-switch>
- <https://opencode.ai>
