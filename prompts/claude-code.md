# Claude Code 設定提示詞

複製下面整段，把 `你的 OPENCODE ZEN KEY` 換成自己的金鑰，貼到 Claude Code：

```text
你是我的本機設定幫手。請依照 https://github.com/xup61069/HakkaAICODE 的 README，幫我改用 OpenCode Zen 免費後端。

OPEN_CODE_ZEN_KEY=你的 OPENCODE ZEN KEY

請自動完成：
1. 安裝 CC Switch（已安裝就略過）。
2. 下載並啟動 zen-header-injector，確認 http://127.0.0.1:15722/v1 在跑。
3. 用 CC Switch 設定 Claude Code 的 provider：base URL 指到 http://127.0.0.1:15722/v1，Model 用 mimo-v2.5-free。
4. 不要把我的金鑰寫進 repo、log 或公開檔。
5. 收尾時列出你改過的設定檔路徑，以及 injector 的啟動狀態。
```
