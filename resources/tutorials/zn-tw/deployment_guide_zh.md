# OpenWebUI Monitor 部署詳細教學

OpenWebUI Monitor 是搭配 [OpenWebUI](https://github.com/open-webui/open-webui) 使用的，你應該已經擁有一個良好運行且具有公網域名的 OpenWebUI 網站。為了使用 OpenWebUI Monitor，你需要分別部署一個後端伺服器，並安裝一個 OpenWebUI 的函數插件。

## 一、部署後端伺服器

### 方式 1：Vercel 部署

1. 點擊下方按鈕，一鍵 fork 本項目並部署到 Vercel。

[![Deploy on Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FVariantConst%2FOpenWebUI-Monitor&project-name=openwebui-monitor&repository-name=OpenWebUI-Monitor)

2. 配置環境變數。點擊 Vercel 中本項目的 Settings，打開 Environment Variables，然後添加如下環境變數：

- `OPENWEBUI_DOMAIN`：你的 OpenWebUI 的域名，例如 `https://chat.example.com`
- `OPENWEBUI_API_KEY`：OpenWebUI 的 API Key，在 `個人設定 -> 帳號 -> API金鑰` 中獲取
  <img width="884" alt="image" src="https://github.com/user-attachments/assets/da03a58a-4bfb-4371-b7f7-c6aa915eacdb">
- `API_KEY`：這是你稍後要填寫在 OpenWebUI 函數插件中 `Api Key` 的，用於向 OpenWebUI Monitor 伺服器發送請求的鑒權。建議使用 [1Password](https://1password.com/) 生成一個少於 56 個字元的強密碼。
- `ACCESS_TOKEN`：訪問 OpenWebUI Monitor 網頁時要輸入的訪問金鑰
- `INIT_BALANCE`（可選）：用戶初始餘額，例如 `1.14`
- `COST_ON_INLET`（可選）：開始對話時的預扣費金額。可以配置為：
  - 所有模型統一的固定數字，例如 `0.1`
  - 針對不同模型的配置，例如 `gpt-4:0.32,gpt-3.5:0.01`

3. 前往項目中的 Storage 選項，Create 或者 Connect 到一個 Neon Postgres 資料庫<img width="1138" alt="image" src="https://github.com/user-attachments/assets/365e6dea-5d25-42ab-9421-766e2633f389">

4. 回到 Deployments 頁面，重新部署<img width="1492" alt="image" src="https://github.com/user-attachments/assets/45ed44d0-6b1a-43a8-a093-c5068b36d596">

至此已部署完成。請記住 Vercel 給你分配的域名，或者在設置中添加自訂域名。稍後這個域名會作為 OpenWebUI Monitor 函數插件中的 `Api Endpoint` 使用。

請注意，由於 Vercel 免費套餐的限制，資料庫連接會比較緩慢，每條消息的 token 計算可能需要長達 2 秒的時間。自己有伺服器的話建議使用 Docker compose 部署。

### 方式 2：Docker compose 部署

1. 複製本項目

```bash
git clone https://github.com/VariantConst/OpenWebUI-Monitor.git
```

2. 配置環境變數

```bash
cp .env.example .env
```

然後編輯 `.env` 文件。如果你想要連接到現有的 Postgres 資料庫，請取消注釋並填寫 `POSTGRES_*` 系列環境變數。如果沒有指定 `POSTGRES_HOST` 變數，稍後會自動新起一個 Postgres 資料庫的 Docker 容器。

3. 啟動 Docker 容器。在項目根目錄下執行

```bash
sudo docker compose up -d
```

至此部署已完成！請自行發布網站到公網。如果想修改埠，請修改 `docker-compose.yml` 文件中的 `ports` 中 `:` 前面的埠數字。

## 二、安裝 OpenWebUI 函數插件（二選一）

<details>
<summary><strong>方法一（推薦）：顯式顯示計費資訊函數</strong></summary>

1. 打開 OpenWebUI 管理員面板的 `函數` 頁面，點擊 `+` 創建新函數，將 [這個函數](https://github.com/VariantConst/OpenWebUI-Monitor/blob/main/resources/functions/openwebui_monitor.py) 的代碼黏貼進去並保存。

2. 填寫配置

- `Api Key`：Vercel 環境變數中設置的 `API_KEY`
- `Api Endpoint`：OpenWebUI Monitor 部署後的域名或內網地址，例如 `https://openwebui-monitor.vercel.app` 或 `http://192.168.x.xxx:7878`

3. 啟用函數，並點擊 `…` 打開詳細配置，全局啟用函數

<img width="1165" alt="image" src="https://github.com/user-attachments/assets/2d707df4-65c3-4bb9-a628-50db62db5488">

4. 該函數會預設在每個回覆消息頂部直接顯示計費資訊

</details>
<details>
<summary><strong>方法二：隱式（手動觸發）顯示計費資訊函數</strong></summary>

若你選擇隱式顯示計費，則取而代之用 [這個函數](https://github.com/VariantConst/OpenWebUI-Monitor/blob/main/resources/functions/openwebui_monitor_invisible.py) 的代碼黏貼進去並保存，同樣需要啟用函數，並點擊 `…` 打開詳細配置，全局啟用函數。但是要額外再安裝一個 Action 函數插件

- Action 函數

同理，選擇添加並複製[Action 函數](https://github.com/VariantConst/OpenWebUI-Monitor/blob/main/resources/functions/get_usage_button.py)的代碼黏貼進去保存,啟用函數，並點擊 `…` 打開詳細配置，全局啟用函數。
該函數會接管原先計費插件的統計資訊顯示選項配置

- 使用

![CleanShot 2024-12-10 at 13 41 08](https://github.com/user-attachments/assets/e999d022-339e-41d3-9bf9-a6f8d9877fe8)

手動點擊底部的"計費資訊"按鈕來顯示消息，但要注意的是該方式只能顯示對話最新（最底部）的消息計費資訊

</details>
