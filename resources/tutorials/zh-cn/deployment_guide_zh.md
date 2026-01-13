# OpenWebUI Monitor 部署详细教程

OpenWebUI Monitor 是搭配 [OpenWebUI](https://github.com/open-webui/open-webui) 使用的，你应该已经拥有一个良好运行且具有公网域名的 OpenWebUI 网站。为了使用 OpenWebUI Monitor，你需要分别部署一个后端服务器，并安装一个 OpenWebUI 的函数插件。

## 一、部署后端服务器

### 方式 1：Vercel 部署

1. 点击下方按钮，一键 fork 本项目并部署到 Vercel。

[![Deploy on Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FVariantConst%2FOpenWebUI-Monitor&project-name=openwebui-monitor&repository-name=OpenWebUI-Monitor)

2. 配置环境变量。点击 Vercel 中本项目的 Settings，打开 Environment Variables，然后添加如下环境变量：

- `OPENWEBUI_DOMAIN`：你的 OpenWebUI 的域名，例如 `https://chat.example.com`
- `OPENWEBUI_API_KEY`：OpenWebUI 的 API Key，在 `个人设置 -> 账号 -> API密钥` 中获取
  <img width="884" alt="image" src="https://github.com/user-attachments/assets/da03a58a-4bfb-4371-b7f7-c6aa915eacdb">
- `API_KEY`：这是你稍后要填写在 OpenWebUI 函数插件中 `Api Key` 的，用于向 OpenWebUI Monitor 服务器发送请求的鉴权。建议使用 [1Password](https://1password.com/) 生成一个少于 56 个字符的强密码。
- `ACCESS_TOKEN`：访问 OpenWebUI Monitor 网页时要输入的访问密钥
- `INIT_BALANCE`（可选）：用户初始余额，例如 `1.14`
- `COST_ON_INLET`（可选）：开始对话时的预扣费金额。可以配置为：
    - 所有模型统一的固定数字，例如 `0.1`
    - 针对不同模型的配置，例如 `gpt-4:0.32,gpt-3.5:0.01`

3. 前往项目中的 Storage 选项，Create 或者 Connect 到一个 Neon Postgres 数据库<img width="1138" alt="image" src="https://github.com/user-attachments/assets/365e6dea-5d25-42ab-9421-766e2633f389">

4. 回到 Deployments 页面，重新部署<img width="1492" alt="image" src="https://github.com/user-attachments/assets/45ed44d0-6b1a-43a8-a093-c5068b36d596">

至此已部署完成。请记住 Vercel 给你分配的域名，或者在设置中添加自定义域名。稍后这个域名会作为 OpenWebUI Monitor 函数插件中的 `Api Endpoint` 使用。

请注意，由于 Vercel 免费套餐的限制，数据库连接会比较缓慢，每条消息的 token 计算可能需要长达 2 秒的时间。自己有服务器的话建议使用 Docker compose 部署。

### 方式 2：Docker compose 部署

1. 克隆本项目

```bash
git clone https://github.com/VariantConst/OpenWebUI-Monitor.git
```

2. 配置环境变量

```bash
cp .env.example .env
```

然后编辑 `.env` 文件。如果你想要连接到现有的 Postgres 数据库，请取消注释并填写 `POSTGRES_*` 系列环境变量。如果没有指定 `POSTGRES_HOST` 变量，稍后会自动新起一个 Postgres 数据库的 Docker 容器。

3. 启动 Docker 容器。在项目根目录下执行

```bash
sudo docker compose up -d
```

至此部署已完成！请自行发布网站到公网。如果想修改端口，请修改 `docker-compose.yml` 文件中的 `ports` 中 `:` 前面的端口数字。

## 二、安装 OpenWebUI 函数插件（二选一）

<details>
<summary><strong>方法一（推荐）：显式显示计费信息函数</strong></summary>

1. 打开 OpenWebUI 管理员面板的 `函数` 页面，点击 `+` 创建新函数，将 [这个函数](https://github.com/VariantConst/OpenWebUI-Monitor/blob/main/resources/functions/openwebui_monitor.py) 的代码粘贴进去并保存。

2. 填写配置

- `Api Key`：Vercel 环境变量中设置的 `API_KEY`
- `Api Endpoint`：OpenWebUI Monitor 部署后的域名或内网地址，例如 `https://openwebui-monitor.vercel.app` 或 `http://192.168.x.xxx:7878`

3. 启用函数，并点击 `…` 打开详细配置，全局启用函数

<img width="1165" alt="image" src="https://github.com/user-attachments/assets/2d707df4-65c3-4bb9-a628-50db62db5488">

4. 该函数会默认在每个回复消息顶部直接显示计费信息

</details>
<details>
<summary><strong>方法二：隐式（手动触发）显示计费信息函数</strong></summary>

若你选择隐式显示计费，则取而代之用 [这个函数](https://github.com/VariantConst/OpenWebUI-Monitor/blob/main/resources/functions/openwebui_monitor_invisible.py) 的代码粘贴进去并保存，同样需要启用函数，并点击 `…` 打开详细配置，全局启用函数。但是要额外再安装一个 Action 函数插件

- Action 函数

同理，选择添加并复制[Action 函数](https://github.com/VariantConst/OpenWebUI-Monitor/blob/main/resources/functions/get_usage_button.py)的代码粘贴进去保存,启用函数，并点击 `…` 打开详细配置，全局启用函数。
该函数会接管原先计费插件的统计信息显示选项配置

- 使用

![CleanShot 2024-12-10 at 13 41 08](https://github.com/user-attachments/assets/e999d022-339e-41d3-9bf9-a6f8d9877fe8)

手动点击底部的"计费信息"按钮来显示消息，但要注意的是该方式只能显示对话最新（最底部）的消息计费信息

</details>
