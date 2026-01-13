interface ModelInletCost {
    [key: string]: number
}

function parseInletCostConfig(config: string | undefined): ModelInletCost {
    if (!config) return {}

    const numericValue = Number(config)
    if (!isNaN(numericValue)) {
        return { default: numericValue }
    }

    try {
        const costs: ModelInletCost = {}
        config.split(',').forEach((pair) => {
            const [model, cost] = pair.trim().split(':')
            const costValue = Number(cost)
            if (!isNaN(costValue)) {
                costs[model.trim()] = costValue
            }
        })
        return costs
    } catch (error) {
        console.error('Error parsing COST_ON_INLET config:', error)
        return {}
    }
}

export function getModelInletCost(modelId: string): number {
    if (!process.env.COST_ON_INLET) {
        return 0
    }
    const costConfig = parseInletCostConfig(process.env.COST_ON_INLET)
    return costConfig[modelId] ?? costConfig['default'] ?? 0
}
