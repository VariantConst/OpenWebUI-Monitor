# Guía Detallada de Despliegue de OpenWebUI Monitor

OpenWebUI Monitor está diseñado para funcionar junto con [OpenWebUI](https://github.com/open-webui/open-webui). Ya debería tener una instancia de OpenWebUI completamente funcional con un dominio público. Para usar OpenWebUI Monitor, necesitará desplegar un servidor backend e instalar un plugin de función en OpenWebUI.

## 1. Desplegar el Servidor Backend

### Método 1: Desplegar en Vercel

1. Haga clic en el botón a continuación para bifurcar este repositorio y desplegarlo en Vercel con un solo clic.

[![Deploy on Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FVariantConst%2FOpenWebUI-Monitor&project-name=openwebui-monitor&repository-name=OpenWebUI-Monitor)

2. Configure las variables de entorno. Vaya a la sección **Settings** de su proyecto en Vercel, abra **Environment Variables** y agregue lo siguiente:

- `OPENWEBUI_DOMAIN`: El dominio de su instancia de OpenWebUI, por ejemplo, `https://chat.example.com`
- `OPENWEBUI_API_KEY`: La clave API para OpenWebUI, que se puede encontrar en **Configuración de Usuario -> Cuenta -> Claves API**
  <img width="877" alt="image" src="https://github.com/user-attachments/assets/f52554ea-27b2-4654-9820-c302766541ee">
- `API_KEY`: Esta es la clave que usará más adelante en la configuración del plugin de función de OpenWebUI como `Api Key`. Use un generador de contraseñas seguras como [1Password](https://1password.com/) para crear esto. La longitud debe ser menor a 56 caracteres.
- `ACCESS_TOKEN`: Una contraseña requerida para acceder a la página web de OpenWebUI Monitor.
- `INIT_BALANCE` (opcional): El saldo inicial para los usuarios, por ejemplo, `1.14`.
- `COST_ON_INLET` (opcional): Monto de prededucción cuando comienza un chat. Se puede configurar como:
    - Un número fijo para todos los modelos, por ejemplo, `0.1`
    - Formato específico por modelo, por ejemplo, `gpt-4:0.32,gpt-3.5:0.01`

3. Navegue a la sección **Storage** del proyecto y cree o conéctese a una base de datos Neon Postgres.
   <img width="1138" alt="image" src="https://github.com/user-attachments/assets/365e6dea-5d25-42ab-9421-766e2633f389">

4. Regrese a la página **Deployments** y vuelva a desplegar el proyecto.
   <img width="1492" alt="image" src="https://github.com/user-attachments/assets/45ed44d0-6b1a-43a8-a093-c5068b36d596">

El despliegue ahora está completo. Anote el dominio asignado por Vercel o agregue un dominio personalizado en la configuración. Este dominio se utilizará como `Api Endpoint` en el plugin de función de OpenWebUI.

> **Nota:** Debido a las limitaciones del plan gratuito de Vercel, las conexiones a la base de datos pueden ser lentas, y los cálculos de tokens para cada mensaje podrían tardar hasta 2 segundos. Si tiene su propio servidor, se recomienda usar el método Docker Compose para el despliegue.

### Método 2: Desplegar con Docker Compose

1. Clone este repositorio:

```bash
git clone https://github.com/VariantConst/OpenWebUI-Monitor.git
```

2. Configure las variables de entorno:

```bash
cp .env.example .env
```

Edite el archivo .env. Si planea conectarse a una base de datos Postgres existente, descomente y complete las variables `POSTGRES_*`. Si no se especifica `POSTGRES_HOST`, se creará automáticamente un nuevo contenedor de Postgres durante el despliegue.

3. Inicie el contenedor Docker. Ejecute el siguiente comando en el directorio raíz del proyecto:

```bash
sudo docker compose up -d
```

¡El despliegue ahora está completo! Publique el sitio al público según sea necesario. Para modificar el puerto, edite la sección de puertos en el archivo docker-compose.yml cambiando el número antes de los dos puntos (`:`).

## 2. Instalar el Plugin de Función de OpenWebUI (Elija Uno)

<details>
<summary><strong>Método 1 (Recomendado): Función de Visualización Explícita de Información de Facturación</strong></summary>

1. Abra la página de Funciones en el Panel de Administración de OpenWebUI. Haga clic en + para crear una nueva función, luego pegue el código de [esta función](https://github.com/VariantConst/OpenWebUI-Monitor/blob/main/resources/functions/openwebui_monitor.py) y guárdelo.

2. Complete la configuración:

- `Api Key`: La `API_KEY` establecida en las variables de entorno de Vercel.
- `Api Endpoint`: El dominio o dirección de red local de su instancia de OpenWebUI Monitor desplegada, por ejemplo, `https://openwebui-monitor.vercel.app` o `http://192.168.x.xxx:7878`.

3. Habilite la función y haga clic en ... para abrir la configuración detallada. Habilite la función globalmente.

<img width="1097" alt="image" src="https://github.com/user-attachments/assets/6cb5094a-5a03-4719-bc0a-11c5c871498f">

4. Esta función mostrará información de facturación en la parte superior de cada mensaje de respuesta de forma predeterminada.

</details>
<details>
<summary><strong>Método 2: Función de Visualización Implícita (Activada Manualmente) de Información de Facturación</strong></summary>

Si prefiere la visualización implícita de facturación, use [esta función](https://github.com/VariantConst/OpenWebUI-Monitor/blob/main/resources/functions/openwebui_monitor_invisible.py) en su lugar. Siga los mismos pasos para habilitar y configurar la función globalmente. Además, necesitará instalar un plugin de función de Acción.

- Función de Acción

De manera similar, agregue una nueva función y pegue el código de la [función de Acción](https://github.com/VariantConst/OpenWebUI-Monitor/blob/main/resources/functions/get_usage_button.py), guárdelo, habilítelo y configúrelo globalmente. Esta función manejará las opciones de visualización de información de facturación que anteriormente eran gestionadas por el plugin de facturación.

- Uso

![CleanShot 2024-12-10 at 13 41 08](https://github.com/user-attachments/assets/e999d022-339e-41d3-9bf9-a6f8d9877fe8)

Haga clic en el botón "Información de Facturación" en la parte inferior para mostrar el mensaje. Tenga en cuenta que este método solo puede mostrar información de facturación para el último mensaje (el más reciente) en la conversación.

</details>
