# OpenWebUI Monitor Deployment Detailed Guide

OpenWebUI Monitor is designed to work alongside [OpenWebUI](https://github.com/open-webui/open-webui). You should already have a fully functioning OpenWebUI instance with a public domain. To use OpenWebUI Monitor, you'll need to deploy a backend server and install a function plugin in OpenWebUI.

## 1. Deploying the Backend Server

### Method 1: Deploy on Vercel

1. Click the button below to fork this repository and deploy it to Vercel with one click.

[![Deploy on Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FVariantConst%2FOpenWebUI-Monitor&project-name=openwebui-monitor&repository-name=OpenWebUI-Monitor)

2. Configure the environment variables. Go to the **Settings** section of your project on Vercel, open **Environment Variables**, and add the following:

- `OPENWEBUI_DOMAIN`: The domain of your OpenWebUI instance, e.g., `https://chat.example.com`
- `OPENWEBUI_API_KEY`: The API Key for OpenWebUI, which can be found in **User Settings -> Account -> API Keys**
  <img width="877" alt="image" src="https://github.com/user-attachments/assets/f52554ea-27b2-4654-9820-c302766541ee">
- `API_KEY`: This is the key you'll use later in the OpenWebUI function plugin configuration as the `Api Key`. Use a strong password generator like [1Password](https://1password.com/) to create this. The length must be less than 56 characters.
- `ACCESS_TOKEN`: A password required to access the OpenWebUI Monitor webpage.
- `INIT_BALANCE` (optional): The initial balance for users, e.g., `1.14`.
- `COST_ON_INLET` (optional): Pre-deduction amount when a chat starts. Can be configured as:
    - A fixed number for all models, e.g., `0.1`
    - Model-specific format, e.g., `gpt-4:0.32,gpt-3.5:0.01`

3. Navigate to the **Storage** section of the project and create or connect to a Neon Postgres database.
   <img width="1138" alt="image" src="https://github.com/user-attachments/assets/365e6dea-5d25-42ab-9421-766e2633f389">

4. Go back to the **Deployments** page and redeploy the project.
   <img width="1492" alt="image" src="https://github.com/user-attachments/assets/45ed44d0-6b1a-43a8-a093-c5068b36d596">

The deployment is now complete. Note the domain assigned by Vercel or add a custom domain in the settings. This domain will be used as the `Api Endpoint` in the OpenWebUI function plugin.

> **Note:** Due to Vercel's free plan limitations, database connections may be slow, and token calculations for each message could take up to 2 seconds. If you have your own server, it's recommended to use the Docker Compose method for deployment.

### Method 2: Deploy with Docker Compose

1. Clone this repository:

```bash
git clone https://github.com/VariantConst/OpenWebUI-Monitor.git
```

2. Configure environment variables:

```bash
cp .env.example .env
```

Edit the .env file. If you plan to connect to an existing Postgres database, uncomment and fill in the `POSTGRES_*` variables. If `POSTGRES_HOST` is not specified, a new Postgres container will be automatically created during deployment.

3. Start the Docker container. Run the following command in the project root directory:

```bash
sudo docker compose up -d
```

The deployment is now complete! Publish the site to the public as needed. To modify the port, edit the ports section in the docker-compose.yml file by changing the number before the colon (`:`).

## 2. Installing the OpenWebUI Function Plugin (Choose One)

<details>
<summary><strong>Method 1 (Recommended): Explicit Billing Information Display Function</strong></summary>

1. Open the Functions page in the OpenWebUI Admin Panel. Click + to create a new function, then paste the code from [this function](https://github.com/VariantConst/OpenWebUI-Monitor/blob/main/resources/functions/openwebui_monitor.py) and save it.

2. Fill in the configuration:

- `Api Key`: The `API_KEY` set in the Vercel environment variables.
- `Api Endpoint`: The domain or local network address of your deployed OpenWebUI Monitor instance, e.g., `https://openwebui-monitor.vercel.app` or `http://192.168.x.xxx:7878`.

3. Enable the function and click ... to open detailed settings. Globally enable the function.

<img width="1097" alt="image" src="https://github.com/user-attachments/assets/6cb5094a-5a03-4719-bc0a-11c5c871498f">

4. This function will display billing information at the top of each reply message by default.

</details>
<details>
<summary><strong>Method 2: Implicit (Manually Triggered) Billing Information Display Function</strong></summary>

If you prefer implicit billing display, use [this function](https://github.com/VariantConst/OpenWebUI-Monitor/blob/main/resources/functions/openwebui_monitor_invisible.py) instead. Follow the same steps to enable and configure the function globally. Additionally, you'll need to install an Action function plugin.

- Action Function

Similarly, add a new function and paste the code from the [Action function](https://github.com/VariantConst/OpenWebUI-Monitor/blob/main/resources/functions/get_usage_button.py), save it, enable it, and configure it globally. This function will handle the billing information display options that were previously managed by the billing plugin.

- Usage

![CleanShot 2024-12-10 at 13 41 08](https://github.com/user-attachments/assets/e999d022-339e-41d3-9bf9-a6f8d9877fe8)

Click the "Billing Information" button at the bottom to display the message. Note that this method can only show billing information for the latest (bottom-most) message in the conversation.

</details>
