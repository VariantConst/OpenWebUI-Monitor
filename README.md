<div align="center">
  
![](https://github.com/user-attachments/assets/fb90a4cc-2e54-495c-87ca-34c1a54bf2c8)

# OpenWebUI Monitor

**English** / [简体中文](./resources/tutorials/zh-cn/README_zh.md) / [Español](./resources/tutorials/es/README_es.md)

</div>

A monitoring dashboard for OpenWebUI that tracks usage and manages user balances. Simply add a [function](https://github.com/VariantConst/OpenWebUI-Monitor/blob/main/resources/functions/openwebui_monitor.py) to OpenWebUI to view user activity and balances in a unified panel.

> **Note**: If you are using OpenWebUI version 0.5.8 or above, please make sure to update the [function](https://github.com/VariantConst/OpenWebUI-Monitor/blob/main/resources/functions/openwebui_monitor.py) to the latest version.

## Features

- Set prices for each model in OpenWebUI;
- Set balance for each user, deduct based on token consumption and model prices, with notifications at the end of each chat;
- View user data and visualizations;
- One-click test for all model availability.

## Deployment

Supports one-click deployment on Vercel [![Deploy on Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FVariantConst%2FOpenWebUI-Monitor&project-name=openwebui-monitor&repository-name=openwebui-monitor&env=OPENWEBUI_DOMAIN,OPENWEBUI_API_KEY,ACCESS_TOKEN,API_KEY) and Docker deployment. **See [Deployment Guide](https://github.com/VariantConst/OpenWebUI-Monitor/blob/main/resources/tutorials/en/deployment_guide.md) for details. See [Deployment Guide](https://github.com/VariantConst/OpenWebUI-Monitor/blob/main/resources/tutorials/en/deployment_guide.md) for details. See [Deployment Guide](https://github.com/VariantConst/OpenWebUI-Monitor/blob/main/resources/tutorials/en/deployment_guide.md) for details.**

## Updates

For Vercel, sync fork and redeploy your project. For Docker, simply pull the latest image and restart the container:

```bash
sudo docker compose pull
sudo docker compose up -d
```

## Environment Variables

### Required

| Variable Name     | Description                                                           | Example                    |
| ----------------- | --------------------------------------------------------------------- | -------------------------- |
| OPENWEBUI_DOMAIN  | OpenWebUI domain                                                      | `https://chat.example.com` |
| OPENWEBUI_API_KEY | OpenWebUI API Key, found in `Personal Settings -> Account -> API Key` | `sk-xxxxxxxxxxxxxxxx`      |
| API_KEY           | For API request verification (must be less than 56 characters)        | `your-api-key-here`        |
| ACCESS_TOKEN      | For page access verification                                          | `your-access-token-here`   |

### Optional

| Variable Name               | Description                                                                                                                                 | Default Value |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| DEFAULT_MODEL_INPUT_PRICE   | Default model input price, in USD per million tokens                                                                                        | `60`          |
| DEFAULT_MODEL_OUTPUT_PRICE  | Default model output price, in USD per million tokens                                                                                       | `60`          |
| DEFAULT_MODEL_PER_MSG_PRICE | Default model price for each message, in USD                                                                                                | `-1`          |
| INIT_BALANCE                | Initial user balance                                                                                                                        | `0`           |
| COST_ON_INLET               | Pre-deduction amount on inlet. Can be a fixed number for all models (e.g. `0.1`), or model-specific format (e.g. `gpt-4:0.32,gpt-3.5:0.01`) | `0`           |

## Function Variable Configuration

| Variable Name | Description                                                                                                    |
| ------------- | -------------------------------------------------------------------------------------------------------------- |
| Api Endpoint  | Fill in your deployed OpenWebUI Monitor backend domain or IP address accessible within the OpenWebUI container |
| Api Key       | Fill in the `API_KEY` environment variable set in the backend deployment                                       |
| Language      | Message display language (en/zh)                                                                               |

## FAQ

### 1. How to fill in the `OPENWEBUI_DOMAIN` environment variable?

The principle is that this address should be accessible from within the OpenWebUI Monitor container.

- It is recommended to fill in the public domain name of OpenWebUI, for example `https://chat.example.com`.
- If your OpenWebUI Monitor is deployed on the same machine, you can also fill in `http://[Docker host local ip]:[OpenWebUI backend service port]`. You can get the host's local IP through `ifconfig | grep "inet "`.
- You **cannot** fill in `http://127.0.0.1:port` or omit `http://`.

### 2. How to fill in the `Api Endpoint` function parameter?

Fill in your deployed OpenWebUI Monitor backend domain or IP address accessible within the OpenWebUI container. For example `http://[host local ip]:7878`, where `7878` is the default port for OpenWebUI Monitor.

### 3. Why can't I see users in the user management page?

OpenWebUI Monitor will only start tracking a user’s information after the user makes their first chat request.

<h2>Gallery</h2>

![](https://github.com/user-attachments/assets/63f23bfd-f271-41e8-a71c-2016be1d501a)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=VariantConst/OpenWebUI-Monitor&type=Date)](https://star-history.com/#VariantConst/OpenWebUI-Monitor&Date)
