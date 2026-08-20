# ⚠️ GitHub Models 已停止服務（RETIRED）

**GitHub Models 已於 2026 年 7 月 30 日全面退役**，playground、模型目錄、inference API、BYOK 全部關閉。此提示詞檔案保留僅作歷史紀錄，**請勿再使用**。

## 時間線
| 日期 | 事件 |
|---|---|
| 2025-07-17 | 舊端點 `models.inference.ai.azure.com` 棄用，遷移至 `models.github.ai` |
| 2025-10-17 | 舊端點停止支援 |
| 2026-06-16 | 停止新用戶註冊 |
| 2026-07-16 / 07-23 | 兩次計畫性 brownout |
| 2026-07-30 | **全面關閉，無任何繼任服務** |

## 原文件的其他錯誤（順帶糾正）
- 原提示詞聲稱 GitHub Models 提供「Claude 3.5 Sonnet」——**從未上架過**，該目錄是 Azure AI 托管的 OpenAI / Meta / Mistral / DeepSeek / xAI 模型。
- 原 endpoint `models.inference.ai.azure.com` 在 2025-10 後就已失效。

## 替代方案
| 原用途 | 替代 |
|---|---|
| 免費模型試用 | OpenRouter `:free` 模型（見 setup-openrouter-free.md） |
| 免費 coding API | Mistral Codestral 免費層（見 setup-mistral-codestral.md） |
| GitHub 生態整合 | GitHub Copilot（付費訂閱，與 GitHub Models 是不同服務） |
| 正式生產遷移 | Azure AI Foundry（OpenAI 相容，prompt 可直接搬移） |
