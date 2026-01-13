import { NextResponse } from 'next/server'
import { ensureTablesExist, getOrCreateModelPrices } from '@/lib/db/client'
import { verifyApiToken } from '@/lib/auth'

interface ModelInfo {
    id: string
    base_model_id: string
    name: string
    params: {
        system: string
    }
    meta: {
        profile_image_url: string
    }
}

interface ModelResponse {
    data: {
        id: string
        name: string
        info: ModelInfo
    }[]
}

export async function GET(req: Request) {
    const authError = verifyApiToken(req)
    if (authError) {
        return authError
    }

    try {
        await ensureTablesExist()

        const domain = process.env.OPENWEBUI_DOMAIN
        if (!domain) {
            throw new Error('OPENWEBUI_DOMAIN environment variable is not set.')
        }

        const apiUrl = domain.replace(/\/+$/, '') + '/api/models'

        const response = await fetch(apiUrl, {
            headers: {
                Authorization: `Bearer ${process.env.OPENWEBUI_API_KEY}`,
                Accept: 'application/json',
            },
        })

        if (!response.ok) {
            console.error('API response status:', response.status)
            console.error('API response text:', await response.text())
            throw new Error(`Failed to fetch models: ${response.status}`)
        }

        const responseText = await response.text()

        let data: ModelResponse
        try {
            data = JSON.parse(responseText)
        } catch (error) {
            console.error('Failed to parse JSON:', error)
            throw new Error('Invalid JSON response from API')
        }

        if (!data || !Array.isArray(data.data)) {
            console.error('Unexpected API response structure:', data)
            throw new Error('Unexpected API response structure')
        }

        const apiModelsMap = new Map()
        data.data.forEach((item) => {
            apiModelsMap.set(String(item.id), {
                name: String(item.name),
                base_model_id: item.info?.base_model_id || '',
                imageUrl:
                    item.info?.meta?.profile_image_url || '/static/favicon.png',
                system_prompt: item.info?.params?.system || '',
            })
        })

        const modelsWithPrices = await getOrCreateModelPrices(
            data.data.map((item) => {
                let baseModelId = item.info?.base_model_id

                if (!baseModelId && item.id) {
                    const idParts = String(item.id).split('.')
                    if (idParts.length > 1) {
                        baseModelId = idParts[idParts.length - 1]
                    }
                }

                return {
                    id: String(item.id),
                    name: String(item.name),
                    base_model_id: baseModelId,
                }
            })
        )

        const dbModelsMap = new Map()
        modelsWithPrices.forEach((model) => {
            dbModelsMap.set(model.id, {
                input_price: model.input_price,
                output_price: model.output_price,
                per_msg_price: model.per_msg_price,
                updated_at: model.updated_at,
            })
        })

        const validModels = Array.from(apiModelsMap.entries()).map(
            ([id, apiModel]) => {
                const dbModel = dbModelsMap.get(id) || {
                    input_price: 60,
                    output_price: 60,
                    per_msg_price: -1,
                    updated_at: new Date(),
                }

                let baseModelId = apiModel.base_model_id
                if (!baseModelId && id) {
                    const idParts = String(id).split('.')
                    if (idParts.length > 1) {
                        baseModelId = idParts[idParts.length - 1]
                    }
                }

                return {
                    id: id,
                    base_model_id: baseModelId,
                    name: apiModel.name,
                    imageUrl: apiModel.imageUrl,
                    system_prompt: apiModel.system_prompt,
                    input_price: dbModel.input_price,
                    output_price: dbModel.output_price,
                    per_msg_price: dbModel.per_msg_price,
                    updated_at: dbModel.updated_at,
                }
            }
        )

        return NextResponse.json(validModels)
    } catch (error) {
        console.error('Error fetching models:', error)
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to fetch models',
            },
            { status: 500 }
        )
    }
}

export async function POST(req: Request) {
    const authError = verifyApiToken(req)
    if (authError) {
        return authError
    }

    const data = await req.json()

    return new Response('Inlet placeholder response', {
        headers: { 'Content-Type': 'application/json' },
    })
}

export async function PUT(req: Request) {
    const authError = verifyApiToken(req)
    if (authError) {
        return authError
    }

    const data = await req.json()

    return new Response('Outlet placeholder response', {
        headers: { 'Content-Type': 'application/json' },
    })
}
