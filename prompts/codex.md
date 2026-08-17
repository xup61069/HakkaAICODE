# Codex 設定提示詞

複製下面整段，把 `你的 OPENCODE ZEN KEY` 換成自己的金鑰，貼到 Codex：

```text
請依照 https://github.com/xup61069/HakkaAICODE 的 README，幫我在這台電腦完成 OpenCode Zen 免費後端設定。

OPEN_CODE_ZEN_KEY=你的 OPENCODE ZEN KEY

請執行：
1. 如果沒有 CC Switch，先安裝 CC Switch（Windows 用官方最新 release）。
2. 下載並啟動 zen-header-injector（https://github.com/xup61069/zen-header-injector），確認 http://127.0.0.1:15722/v1 在跑。
3. 建立/切換 Codex 的 Zen provider，base URL 用 http://127.0.0.1:15722/v1，Model 選 mimo-v2.5-free（或最近 API 回傳的 -free 模型）。
4. 不要把我提供的金鑰寫進任何公開檔案。
5. 完成後列出：CC Switch 安裝路徑、injector 是否在跑、Codex config 改了哪一行。
```
