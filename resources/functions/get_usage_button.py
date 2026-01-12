"""
title: Usage Info Button / 计费信息按钮
author: fl0w1nd
author_url: https://github.com/fl0w1nd
version: 0.1.2
icon_url: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAACMElEQVR4nO2ZMWgUQRSGJ4mFgZBGQTAgCqawSbASg6YIFkEsPbCQHNzd/v/sHBe4IvUSUtqlThcCSZEiXUharWxURC20SDCQIGKMxjTBk4E7MhlO7naX3M7C/PCamZud9817M/NuVwgvLy8vZ0VylOQ6ySOSjR7bEYA1kiNpnP+egeMNy74lgmiufMMRW00CkEXaNP5jh0kAzj1E9FhMO78HSCn6CDBeDsbdmM5FgB7gvHwEmPE9kFoeIGvRp1B6AXgOAEqpoVxGAMCenhvAjdiDPUAKlcvlayQJ4FczArO1Wm04FxEAUCV53O6vJYBppwGklKUONdWJlPKukwBRFF0iuW/NuwLgpdkGYMtJAAD3rTnXW2AAvhjtp9Vq9YqLAAVrpecMXxatvknnAEg+tZycb/VJKZ+R3G4ZgAfOAYRhOGYBHJC8mfiBGZxCfSQ/WhBfpZRPEj0to2P0Ybs7AMCmUup2Li6yIAgmrFOnBfFH74Vc1ELFYvGyPoWaL3ZNP05JPs5TMXcVwIYViU96v3Qz+GfcVyVxLE40SL43x4ZheKcbgLVeApD8bazyG6tvwRrfOY30R4U2OXiRAJ+N/h9RFPUbi/nCHBsEwSPRjUql0nX9ceEi0qkNwLL1mxndXq/XBwF8MPsqlcot4ZqklFMWwF+SrwDsWu2vhasCsNQhcicA7glXVSgUBnQRZ25oY2O/1SW3yIOUUkMAKk3nd0iOi7wpPKtO32XtSyJ1C/APUWkkXC3hgzUAAAAASUVORK5CYII=
required_open_webui_version: 0.4.0
"""

from pydantic import BaseModel, Field
from typing import Optional, Union, Generator, Iterator

import os
import requests
import asyncio
import json


class Action:
    class Valves(BaseModel):
        show_cost: bool = Field(
            default=True,
            description="Show cost / 是否显示费用 / Mostrar costo",
            json_schema_extra={
                "ui:group": "Display Settings / 显示设置 / Configuración de Visualización"
            },
        )
        show_balance: bool = Field(
            default=True,
            description="Show balance / 是否显示余额 / Mostrar saldo",
            json_schema_extra={
                "ui:group": "Display Settings / 显示设置 / Configuración de Visualización"
            },
        )
        show_tokens: bool = Field(
            default=True,
            description="Show tokens / 是否显示token数 / Mostrar tokens",
            json_schema_extra={
                "ui:group": "Display Settings / 显示设置 / Configuración de Visualización"
            },
        )
        show_tokens_per_sec: bool = Field(
            default=True,
            description="Show tokens per second / 是否显示每秒输出token数 / Mostrar tokens por segundo",
            json_schema_extra={
                "ui:group": "Display Settings / 显示设置 / Configuración de Visualización"
            },
        )

    def __init__(self):
        self.valves = self.Valves()
        pass

    async def action(
        self,
        body: dict,
        __user__=None,
        __event_emitter__=None,
        __event_call__=None,
    ) -> Optional[dict]:
        print(f"action:{__name__}")

        # 查找最新一条assistant消息的索引和内容
        messages = body.get("messages", [])
        assistant_indexes = [
            i for i, msg in enumerate(messages) if msg.get("role") == "assistant"
        ]

        if not assistant_indexes:
            if __event_emitter__:
                await __event_emitter__(
                    {
                        "type": "status",
                        "data": {
                            "description": "No assistant message found / 没有找到assistant消息 / No se encontró mensaje del asistente",
                            "done": True,
                        },
                    }
                )
            return None

        # 获取最后一条assistant消息的索引和内容
        last_assistant_index = assistant_indexes[-1]
        last_assistant_message = messages[last_assistant_index]

        # 获取消息 ID
        message_id = last_assistant_message.get("id")

        if not message_id:
            if __event_emitter__:
                await __event_emitter__(
                    {
                        "type": "status",
                        "data": {
                            "description": "Unable to get message ID / 无法获取消息ID / No se puede obtener el ID del mensaje",
                            "done": True,
                        },
                    }
                )
            return None

        # 构建文件路径
        file_path = os.path.join("/app/backend/data/record", f"{message_id}.json")

        # 检查文件是否存在
        if not os.path.exists(file_path):
            if __event_emitter__:
                await __event_emitter__(
                    {
                        "type": "status",
                        "data": {
                            "description": f"Billing record not found, please contact admin / 未查找到该消息的计费记录，请联系管理员 / Registro de facturación no encontrado, contacte al administrador",
                            "done": True,
                        },
                    }
                )
            return None

        # 读取统计信息
        try:
            with open(file_path, "r") as f:
                stats_data = json.load(f)
        except Exception as e:
            if __event_emitter__:
                await __event_emitter__(
                    {
                        "type": "status",
                        "data": {
                            "description": f"Failed to read stats file / 读取统计文件失败 / Error al leer archivo de estadísticas: {str(e)}",
                            "done": True,
                        },
                    }
                )
            return None

        # 构建状态栏显示的统计信息
        stats_array = []

        if self.valves.show_cost and "total_cost" in stats_data:
            stats_array.append(f"Cost: ${stats_data['total_cost']:.6f}")
        if self.valves.show_balance and "new_balance" in stats_data:
            stats_array.append(f"Balance: ${stats_data['new_balance']:.6f}")
        if (
            self.valves.show_tokens
            and "input_tokens" in stats_data
            and "output_tokens" in stats_data
        ):
            stats_array.append(
                f"Token: {stats_data['input_tokens']}+{stats_data['output_tokens']}"
            )

        # 计算耗时（如果有elapsed_time）
        if "elapsed_time" in stats_data:
            elapsed_time = stats_data["elapsed_time"]
            stats_array.append(f"Time: {elapsed_time:.2f}s")

            # 计算每秒输出速度
            if (
                self.valves.show_tokens_per_sec
                and "output_tokens" in stats_data
                and elapsed_time > 0
            ):
                stats_array.append(
                    f"{(stats_data['output_tokens'] / elapsed_time):.2f} T/s"
                )

        stats = " | ".join(stat for stat in stats_array)

        # 发送状态更新
        if __event_emitter__:
            await __event_emitter__(
                {
                    "type": "status",
                    "data": {
                        "description": stats,
                        "done": True,
                    },
                }
            )

        return None
