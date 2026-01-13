import { NextRequest, NextResponse } from 'next/server'
import { updateModelPrice } from '@/lib/db/client'
import { verifyApiToken } from '@/lib/auth'

interface PriceUpdate {
    id: string
    input_price: number
    output_price: number
    per_msg_price: number
}

export async function POST(request: NextRequest) {
    const authError = verifyApiToken(request)
    if (authError) {
        return authError
    }

    try {
        const data = await request.json()
        console.log('Raw data received:', data)

        const updates = data.updates || data
        if (!Array.isArray(updates)) {
            console.error('Invalid data format - expected array:', updates)
            return NextResponse.json(
                { error: 'Invalid data format' },
                { status: 400 }
            )
        }

        const validUpdates = updates
            .map((update: any) => ({
                id: update.id,
                input_price: Number(update.input_price),
                output_price: Number(update.output_price),
                per_msg_price: Number(update.per_msg_price ?? -1),
            }))
            .filter((update: PriceUpdate) => {
                const isValidPrice = (price: number) =>
                    !isNaN(price) && isFinite(price)

                if (
                    !update.id ||
                    !isValidPrice(update.input_price) ||
                    !isValidPrice(update.output_price) ||
                    !isValidPrice(update.per_msg_price)
                ) {
                    console.log('Skipping invalid data:', update)
                    return false
                }
                return true
            })

        console.log('Update data after processing:', validUpdates)
        console.log(
            `Successfully verified price updating requests of ${validUpdates.length} models`
        )

        const results = await Promise.all(
            validUpdates.map(async (update: PriceUpdate) => {
                try {
                    console.log('Updating model prices:', {
                        id: update.id,
                        input_price: update.input_price,
                        output_price: update.output_price,
                        per_msg_price: update.per_msg_price,
                    })

                    const result = await updateModelPrice(
                        update.id,
                        update.input_price,
                        update.output_price,
                        update.per_msg_price
                    )

                    console.log('Update results:', {
                        id: update.id,
                        success: !!result,
                        result,
                    })

                    return {
                        id: update.id,
                        success: !!result,
                        data: result,
                    }
                } catch (error) {
                    console.error('Fail to update:', {
                        id: update.id,
                        error:
                            error instanceof Error
                                ? error.message
                                : 'Unknown error',
                    })
                    return {
                        id: update.id,
                        success: false,
                        error:
                            error instanceof Error
                                ? error.message
                                : 'Unknown error',
                    }
                }
            })
        )

        const successCount = results.filter((r) => r.success).length
        console.log(`Successfully updated prices of ${successCount} models`)

        return NextResponse.json({
            success: true,
            message: `Successfully updated prices of ${successCount} models`,
            results,
        })
    } catch (error) {
        console.error('Batch update failed:', error)
        return NextResponse.json(
            { error: 'Batch update failed' },
            { status: 500 }
        )
    }
}

export async function OPTIONS() {
    return NextResponse.json({}, { status: 200 })
}
