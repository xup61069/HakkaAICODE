# 2026 免費與平價 AI Coding 資源指南（v2 修正版）

> 本版修正 v1 的多處過時與錯誤資訊，並新增隱私欄位。所有額度與模型清單**隨時變動，一律以官方頁面為準**。

## ⚠️ v1 重大勘誤

| v1 寫法 | 事實 |
|---|---|
| GitHub Models endpoint `models.inference.ai.azure.com` | 2025-10 已棄用；**GitHub Models 整個服務 2026-07-30 已關閉** |
| GitHub Models 有 Claude 3.5 Sonnet | 從未上架，目錄無 Anthropic 模型 |
| Gemini 免費層「每日 1500 請求」 | 舊版 2.0 時代的數字，3.x 各模型額度不同且常調整 |
| OpenRouter 推薦 `llama-3.3-70b:free`、`qwen-2.5-coder:free` | 多數已下架，`:free` 清單替換極快，勿寫死 |
| Groq `llama-3.3-70b-versatile` | 已被 Llama 4 系列取代 |
| Windsurf (by Codeium) | 2025-07 已被 Cognition 收購 |

## 免費層總表

| 平台 | 額度（以官方為準） | 資料用於訓練？ | 適合場景 |
|---|---|:---:|---|
| OpenCode Zen `-free` 模型 | 約 100 次/日，免信用卡 | ⚠️ 可能 | 日常 coding 主力（需搭配 injector，注意 ToS 風險） |
| Mistral Codestral | 約 1 RPS (~60 RPM) / 500k TPM（Experiment 方案） | ⚠️ 可能 | **coding 專用**，agent 第一備援 |
| Google AI Studio | 依模型而異（Flash 系列每日數十～上千次） | ⚠️ 免費層會 | 1M+ 超大 context、整專案重構 |
| OpenRouter `:free` | 50 次/日；儲值 $10 終身升 1,000 次/日 | ⚠️ 可能 | 模型選擇最多的單一入口 |
| NVIDIA NIM | 約 40 RPM | 以官方條款為準 | 開源模型齊全，需手機驗證 |
| Groq | 依模型而定，小模型每日可破萬次 | 以官方條款為準 | 極速推論、批次小請求 |
| Cerebras | 依模型而定 | 以官方條款為準 | 極速推論 |
| Cloudflare Workers AI | 每日 10,000 neurons | 以官方條款為準 | 邊緣部署、serverless |
| Cohere | 20 RPM、1,000 次/月 | 以官方條款為準 | 輕量應用 |
| ~~GitHub Models~~ | ❌ 已關閉 | — | — |

## 試用金平台（註冊送 credit，輪著用）

| 平台 | 額度 | 備註 |
|---|---|---|
| Baseten | $30 | 依算力時間計費 |
| Modal | 註冊 $5/月，綁卡 $30/月 | 每月重置 |
| Alibaba Model Studio | 每模型 100 萬 tokens | Qwen 全家桶 |
| Scaleway | 100 萬 tokens | 有 Devstral、Qwen Coder |
| SambaNova | $5（3 個月） | DeepSeek、Llama-4 |
| AI21 / Upstage | 各 $10（3 個月） | Jamba、Solar |
| NLP Cloud | $15 | 需手機驗證 |
| Fireworks / Nebius / Hyperbolic | 各 $1 | Hyperbolic 有大型開源模型 |
| Novita | $0.5（1 年） | 開源模型多 |

## 平價付費（免費池乾了用這些）

| 方案 | 價格 | 適合 |
|---|---|---|
| GLM Coding Plan Lite | $18/月（5 小時滾動額度） | 每日大量互動 coding |
| DeepSeek API | ~$0.14/$0.28 per 1M tokens，cache hit $0.0028 | 批次排程、長對話（cache 是關鍵） |
| Qwen Flash 系列 | 約 $0.03/$0.13 per 1M | 目前市場最低價之一 |
| MiniMax M 系列 | 約 $0.60/$2.40 per 1M | 高 SWE-bench 中最便宜 |

## 三級備援架構（更新版）

1. **主力**：OpenCode Zen 免費池（注意 ToS 風險）或 GLM Coding Plan（付費但穩）
2. **第一備援**：Mistral Codestral 免費層（coding 專用、Experiment 方案）
3. **第二備援**：OpenRouter `:free`（儲值 $10 解鎖 1,000 次/日）
4. **大 context 專用**：Google AI Studio（1M+ tokens）
5. **overflow**：DeepSeek API 按量計費（先儲 $5，開啟用量警示）

## 隱私總提醒
**幾乎所有免費層的資料都可能被用於訓練**。公司專案、未公開程式碼、含個資的內容，請一律走付費 API 並確認該方案的資料政策。
