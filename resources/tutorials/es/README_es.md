<div align="center">
  
![](https://github.com/user-attachments/assets/fb90a4cc-2e54-495c-87ca-34c1a54bf2c8)

# OpenWebUI Monitor

[English](../../../README.md) / [简体中文](../zh-cn/README_zh.md) / **Español**

</div>

Un panel de monitoreo para OpenWebUI que rastrea el uso y gestiona los saldos de usuarios. Simplemente agregue una [función](https://github.com/VariantConst/OpenWebUI-Monitor/blob/main/resources/functions/openwebui_monitor.py) a OpenWebUI para ver la actividad y los saldos de los usuarios en un panel unificado.

> **Nota**: Si está utilizando OpenWebUI versión 0.5.8 o superior, asegúrese de actualizar la [función](https://github.com/VariantConst/OpenWebUI-Monitor/blob/main/resources/functions/openwebui_monitor.py) a la última versión.

## Características

- Establecer precios para cada modelo en OpenWebUI;
- Establecer saldo para cada usuario, deducir según el consumo de tokens y los precios de los modelos, con notificaciones al final de cada chat;
- Ver datos de usuario y visualizaciones;
- Prueba con un clic de la disponibilidad de todos los modelos.

## Despliegue

Soporta despliegue con un clic en Vercel [![Deploy on Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FVariantConst%2FOpenWebUI-Monitor&project-name=openwebui-monitor&repository-name=openwebui-monitor&env=OPENWEBUI_DOMAIN,OPENWEBUI_API_KEY,ACCESS_TOKEN,API_KEY) y despliegue con Docker. **Consulte la [Guía de Despliegue](https://github.com/VariantConst/OpenWebUI-Monitor/blob/main/resources/tutorials/es/deployment_guide_es.md) para más detalles. Consulte la [Guía de Despliegue](https://github.com/VariantConst/OpenWebUI-Monitor/blob/main/resources/tutorials/es/deployment_guide_es.md) para más detalles. Consulte la [Guía de Despliegue](https://github.com/VariantConst/OpenWebUI-Monitor/blob/main/resources/tutorials/es/deployment_guide_es.md) para más detalles.**

## Actualizaciones

Para Vercel, sincronice el fork y vuelva a desplegar su proyecto. Para Docker, simplemente extraiga la última imagen y reinicie el contenedor:

```bash
sudo docker compose pull
sudo docker compose up -d
```

## Variables de Entorno

### Obligatorias

| Nombre de Variable | Descripción                                                                             | Ejemplo                    |
| ------------------ | --------------------------------------------------------------------------------------- | -------------------------- |
| OPENWEBUI_DOMAIN   | Dominio de OpenWebUI                                                                    | `https://chat.example.com` |
| OPENWEBUI_API_KEY  | Clave API de OpenWebUI, se encuentra en `Configuración Personal -> Cuenta -> Clave API` | `sk-xxxxxxxxxxxxxxxx`      |
| API_KEY            | Para verificación de solicitudes API (debe tener menos de 56 caracteres)                | `your-api-key-here`        |
| ACCESS_TOKEN       | Para verificación de acceso a la página                                                 | `your-access-token-here`   |

### Opcionales

| Nombre de Variable          | Descripción                                                                                                                                                  | Valor Predeterminado |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------- |
| DEFAULT_MODEL_INPUT_PRICE   | Precio de entrada predeterminado del modelo, en USD por millón de tokens                                                                                     | `60`                 |
| DEFAULT_MODEL_OUTPUT_PRICE  | Precio de salida predeterminado del modelo, en USD por millón de tokens                                                                                      | `60`                 |
| DEFAULT_MODEL_PER_MSG_PRICE | Precio predeterminado del modelo por cada mensaje, en USD                                                                                                    | `-1`                 |
| INIT_BALANCE                | Saldo inicial del usuario                                                                                                                                    | `0`                  |
| COST_ON_INLET               | Monto de prededucción en inlet. Puede ser un número fijo para todos los modelos (ej. `0.1`), o formato específico por modelo (ej. `gpt-4:0.32,gpt-3.5:0.01`) | `0`                  |

## Configuración de Variables de Función

| Nombre de Variable | Descripción                                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Api Endpoint       | Complete el dominio del backend de OpenWebUI Monitor desplegado o la dirección IP accesible dentro del contenedor de OpenWebUI |
| Api Key            | Complete la variable de entorno `API_KEY` establecida en el despliegue del backend                                             |
| Language           | Idioma de visualización de mensajes (en/zh/es)                                                                                 |

## Preguntas Frecuentes

### 1. ¿Cómo completar la variable de entorno `OPENWEBUI_DOMAIN`?

El principio es que esta dirección debe ser accesible desde dentro del contenedor de OpenWebUI Monitor.

- Se recomienda completar el nombre de dominio público de OpenWebUI, por ejemplo `https://chat.example.com`.
- Si su OpenWebUI Monitor está desplegado en la misma máquina, también puede completar `http://[IP local del host Docker]:[puerto del servicio backend de OpenWebUI]`. Puede obtener la IP local del host a través de `ifconfig | grep "inet "`.
- **No puede** completar `http://127.0.0.1:port` u omitir `http://`.

### 2. ¿Cómo completar el parámetro de función `Api Endpoint`?

Complete el dominio del backend de OpenWebUI Monitor desplegado o la dirección IP accesible dentro del contenedor de OpenWebUI. Por ejemplo `http://[IP local del host]:7878`, donde `7878` es el puerto predeterminado para OpenWebUI Monitor.

### 3. ¿Por qué no puedo ver usuarios en la página de gestión de usuarios?

OpenWebUI Monitor solo comenzará a rastrear la información de un usuario después de que el usuario realice su primera solicitud de chat.

<h2>Galería</h2>

![](https://github.com/user-attachments/assets/63f23bfd-f271-41e8-a71c-2016be1d501a)

## Historial de Estrellas

[![Star History Chart](https://api.star-history.com/svg?repos=VariantConst/OpenWebUI-Monitor&type=Date)](https://star-history.com/#VariantConst/OpenWebUI-Monitor&Date)
