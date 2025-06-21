<div align="center">

![output_2](https://github.com/user-attachments/assets/b1716788-93c5-49d5-abb1-b0ef3a29356d)

# OpenWebUI Monitor

[English](../../../README.md) / **簡體中文**

</div>

專為 OpenWebUI 設計的用量監控和用户餘額管理面板。只需要向 OpenWebUI 添加一個簡單的[函數](https://github.com/VariantConst/OpenWebUI-Monitor/blob/main/resources/functions/openwebui_monitor.py)，就能在一個面板統一查看用户使用情況和餘額。

> **注意**：如果你使用的是 OpenWebUI 0.5.8 及以上版本，請確保將[函數](https://github.com/VariantConst/OpenWebUI-Monitor/blob/main/resources/functions/openwebui_monitor.py)更新到最新版本。

## 特性

- 為 OpenWebUI 中的每個模型設置價格；
- 為每個用户設置餘額，根據對話消耗 tokens 和模型價格扣除，並在每條聊天末尾提示；
- 查看用户使用數據和可視化。
- 一鍵測試所有模型的可用性。

## 部署

支持 Vercel 一鍵部署 [![Deploy on Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FVariantConst%2FOpenWebUI-Monitor&project-name=openwebui-monitor&repository-name=openwebui-monitor&env=OPENWEBUI_DOMAIN,OPENWEBUI_API_KEY,ACCESS_TOKEN,API_KEY) 和 Docker 部署。**詳見 [部署指南](https://github.com/VariantConst/OpenWebUI-Monitor/blob/main/resources/tutorials/zh-cn/deployment_guide_zh.md)。詳見 [部署指南](https://github.com/VariantConst/OpenWebUI-Monitor/blob/main/resources/tutorials/zh-cn/deployment_guide_zh.md)。詳見 [部署指南](https://github.com/VariantConst/OpenWebUI-Monitor/blob/main/resources/tutorials/zh-cn/deployment_guide_zh.md)。**

## 更新

對於 Vercel，同步 fork 並重新部署項目。對於 Docker，拉取最新鏡像後重啓容器即可：

```bash
sudo docker compose pull
sudo docker compose up -d
```

## 環境變量

### 必填

| 變量名            | 説明                                                          | 示例                       |
| ----------------- | ------------------------------------------------------------- | -------------------------- |
| OPENWEBUI_DOMAIN  | OpenWebUI 的域名                                              | `https://chat.example.com` |
| OPENWEBUI_API_KEY | OpenWebUI 的 API Key，在 `個人設置 -> 賬號 -> API密鑰` 中獲取 | `sk-xxxxxxxxxxxxxxxx`      |
| API_KEY           | 用於 API 請求驗證 (必須少於 56 個字符)                        | `your-api-key-here`        |
| ACCESS_TOKEN      | 用於頁面訪問驗證                                              | `your-access-token-here`   |

### 可選

| 變量名                      | 説明                                                                                                                       | 默認值 |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------ |
| DEFAULT_MODEL_INPUT_PRICE   | 默認模型輸入價格，單位為元/百萬 tokens                                                                                     | `60`   |
| DEFAULT_MODEL_OUTPUT_PRICE  | 默認模型輸出價格，單位為元/百萬 tokens                                                                                     | `60`   |
| DEFAULT_MODEL_PER_MSG_PRICE | 模型默認每條消息價格，設為負數將按 token 計費                                                                              | `-1`   |
| INIT_BALANCE                | 用户初始餘額                                                                                                               | `0`    |
| COST_ON_INLET               | inlet 時的預扣費金額。可以是所有模型統一的固定數字（如 `0.1`），也可以是針對不同模型的配置（如 `gpt-4:0.32,gpt-3.5:0.01`） | `0`    |

## 函數變量配置

| 變量名       | 説明                                                                     |
| ------------ | ------------------------------------------------------------------------ |
| Api Endpoint | 填你部署的 OpenWebUI Monitor 後端域名或 OpenWebUI 容器內可訪問的 ip 地址 |
| Api Key      | 填後端部署的 `API_KEY` 環境變量                                          |
| Language     | 消息顯示語言 (en/zh)                                                     |

## 常見問題

### 1. `OPENWEBUI_DOMAIN` 環境變量怎麼填寫？

填寫原則是在 OpenWebUI Monitor 的容器內能訪問到這個地址。

- 推薦填寫 OpenWebUI 的公網域名，例如 `https://chat.example.com`。
- 假如你的 OpenWebUI Monitor 部署在同一台機器，則這個環境變量也可以填 `http://[Docker容器宿主機的本地ip]:[OpenWebUI後端服務端口]`。可以通過 `ifconfig | grep "inet "` 獲取宿主機的本地 ip。
- **不可以**填 `http://127.0.0.1:port` 或省略 `http://`。

### 2. `Api Endpoint` 函數參數怎麼填寫？

填你部署的 OpenWebUI Monitor 後端域名或 OpenWebUI 容器內可訪問的 ip 地址。例如 `http://[宿主機的本地ip]:7878`，其中 `7878` 是 OpenWebUI Monitor 的默認端口。

### 3. 為什麼用户管理頁面看不見用户？

只有用户首次進行聊天請求後，OpenWebUI Monitor 才會開始追蹤該用户的信息。

<h2>Gallery</h2>

![](https://github.com/user-attachments/assets/2777c1fc-a8c6-4397-9665-a6a559d4bab1)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=VariantConst/OpenWebUI-Monitor&type=Date)](https://star-history.com/#VariantConst/OpenWebUI-Monitor&Date)
