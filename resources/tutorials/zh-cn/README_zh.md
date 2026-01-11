<div align="center">

![output_2](https://github.com/user-attachments/assets/b1716788-93c5-49d5-abb1-b0ef3a29356d)

# OpenWebUI Monitor

[English](../../../README.md) / **简体中文** / [Español](../es/README_es.md)

</div>

专为 OpenWebUI 设计的用量监控和用户余额管理面板。只需要向 OpenWebUI 添加一个简单的[函数](https://github.com/VariantConst/OpenWebUI-Monitor/blob/main/resources/functions/openwebui_monitor.py)，就能在一个面板统一查看用户使用情况和余额。

> **注意**：如果你使用的是 OpenWebUI 0.5.8 及以上版本，请确保将[函数](https://github.com/VariantConst/OpenWebUI-Monitor/blob/main/resources/functions/openwebui_monitor.py)更新到最新版本。

## 特性

- 为 OpenWebUI 中的每个模型设置价格；
- 为每个用户设置余额，根据对话消耗 tokens 和模型价格扣除，并在每条聊天末尾提示；
- 查看用户使用数据和可视化。
- 一键测试所有模型的可用性。

## 部署

支持 Vercel 一键部署 [![Deploy on Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FVariantConst%2FOpenWebUI-Monitor&project-name=openwebui-monitor&repository-name=openwebui-monitor&env=OPENWEBUI_DOMAIN,OPENWEBUI_API_KEY,ACCESS_TOKEN,API_KEY) 和 Docker 部署。**详见 [部署指南](https://github.com/VariantConst/OpenWebUI-Monitor/blob/main/resources/tutorials/zh-cn/deployment_guide_zh.md)。详见 [部署指南](https://github.com/VariantConst/OpenWebUI-Monitor/blob/main/resources/tutorials/zh-cn/deployment_guide_zh.md)。详见 [部署指南](https://github.com/VariantConst/OpenWebUI-Monitor/blob/main/resources/tutorials/zh-cn/deployment_guide_zh.md)。**

## 更新

对于 Vercel，同步 fork 并重新部署项目。对于 Docker，拉取最新镜像后重启容器即可：

```bash
sudo docker compose pull
sudo docker compose up -d
```

## 环境变量

### 必填

| 变量名            | 说明                                                          | 示例                       |
| ----------------- | ------------------------------------------------------------- | -------------------------- |
| OPENWEBUI_DOMAIN  | OpenWebUI 的域名                                              | `https://chat.example.com` |
| OPENWEBUI_API_KEY | OpenWebUI 的 API Key，在 `个人设置 -> 账号 -> API密钥` 中获取 | `sk-xxxxxxxxxxxxxxxx`      |
| API_KEY           | 用于 API 请求验证 (必须少于 56 个字符)                        | `your-api-key-here`        |
| ACCESS_TOKEN      | 用于页面访问验证                                              | `your-access-token-here`   |

### 可选

| 变量名                      | 说明                                                                                                                       | 默认值 |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------ |
| DEFAULT_MODEL_INPUT_PRICE   | 默认模型输入价格，单位为元/百万 tokens                                                                                     | `60`   |
| DEFAULT_MODEL_OUTPUT_PRICE  | 默认模型输出价格，单位为元/百万 tokens                                                                                     | `60`   |
| DEFAULT_MODEL_PER_MSG_PRICE | 模型默认每条消息价格，设为负数将按 token 计费                                                                              | `-1`   |
| INIT_BALANCE                | 用户初始余额                                                                                                               | `0`    |
| COST_ON_INLET               | inlet 时的预扣费金额。可以是所有模型统一的固定数字（如 `0.1`），也可以是针对不同模型的配置（如 `gpt-4:0.32,gpt-3.5:0.01`） | `0`    |

## 函数变量配置

| 变量名       | 说明                                                                     |
| ------------ | ------------------------------------------------------------------------ |
| Api Endpoint | 填你部署的 OpenWebUI Monitor 后端域名或 OpenWebUI 容器内可访问的 ip 地址 |
| Api Key      | 填后端部署的 `API_KEY` 环境变量                                          |
| Language     | 消息显示语言 (en/zh)                                                     |

## 常见问题

### 1. `OPENWEBUI_DOMAIN` 环境变量怎么填写？

填写原则是在 OpenWebUI Monitor 的容器内能访问到这个地址。

- 推荐填写 OpenWebUI 的公网域名，例如 `https://chat.example.com`。
- 假如你的 OpenWebUI Monitor 部署在同一台机器，则这个环境变量也可以填 `http://[Docker容器宿主机的本地ip]:[OpenWebUI后端服务端口]`。可以通过 `ifconfig | grep "inet "` 获取宿主机的本地 ip。
- **不可以**填 `http://127.0.0.1:port` 或省略 `http://`。

### 2. `Api Endpoint` 函数参数怎么填写？

填你部署的 OpenWebUI Monitor 后端域名或 OpenWebUI 容器内可访问的 ip 地址。例如 `http://[宿主机的本地ip]:7878`，其中 `7878` 是 OpenWebUI Monitor 的默认端口。

### 3. 为什么用户管理页面看不见用户？

只有用户首次进行聊天请求后，OpenWebUI Monitor 才会开始追踪该用户的信息。

<h2>Gallery</h2>

![](https://github.com/user-attachments/assets/2777c1fc-a8c6-4397-9665-a6a559d4bab1)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=VariantConst/OpenWebUI-Monitor&type=Date)](https://star-history.com/#VariantConst/OpenWebUI-Monitor&Date)
