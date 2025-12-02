import { query } from "./client";
import { ensureUserTableExists } from "./users";
import { ModelPrice, updateModelPrice } from "./client";

async function ensureModelPricesTableExists() {
  const defaultInputPrice = parseFloat(
    process.env.DEFAULT_MODEL_INPUT_PRICE || "60"
  );
  const defaultOutputPrice = parseFloat(
    process.env.DEFAULT_MODEL_OUTPUT_PRICE || "60"
  );
  const defaultPerMsgPrice = parseFloat(
    process.env.DEFAULT_MODEL_PER_MSG_PRICE || "-1"
  );

  await query(
    `CREATE TABLE IF NOT EXISTS model_prices (
      id TEXT PRIMARY KEY,
      model_name TEXT NOT NULL,
      input_price DECIMAL(10, 6) DEFAULT CAST($1 AS DECIMAL(10, 6)),
      output_price DECIMAL(10, 6) DEFAULT CAST($2 AS DECIMAL(10, 6)),
      per_msg_price DECIMAL(10, 6) DEFAULT CAST($3 AS DECIMAL(10, 6)),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`,
    [defaultInputPrice, defaultOutputPrice, defaultPerMsgPrice]
  );

  await query(
    `DO $$ 
    BEGIN 
      BEGIN
        ALTER TABLE model_prices ADD COLUMN per_msg_price DECIMAL(10, 6) DEFAULT CAST($1 AS DECIMAL(10, 6));
        ALTER TABLE model_prices ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
      EXCEPTION 
        WHEN duplicate_column THEN NULL;
      END;
    END $$;`,
    [defaultPerMsgPrice]
  );
}

export async function ensureTablesExist() {
  await ensureModelPricesTableExists();
  await ensureUserTableExists();
}

export async function getOrCreateModelPrice(
  id: string,
  name: string
): Promise<ModelPrice> {
  try {
    const defaultPerMsgPrice = parseFloat(
      process.env.DEFAULT_MODEL_PER_MSG_PRICE || "-1"
    );

    const result = await query(
      `INSERT INTO model_prices (id, model_name, per_msg_price, updated_at)
       VALUES ($1, $2, CAST($3 AS DECIMAL(10, 6)), CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE 
       SET model_name = $2, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [id, name, defaultPerMsgPrice]
    );

    return {
      id: result.rows[0].id,
      name: result.rows[0].model_name,
      input_price: Number(result.rows[0].input_price),
      output_price: Number(result.rows[0].output_price),
      per_msg_price: Number(result.rows[0].per_msg_price),
      updated_at: result.rows[0].updated_at,
    };
  } catch (error: any) {
    console.error("Error in getOrCreateModelPrice:", error);
    if (error.message.includes("Connection terminated unexpectedly")) {
      console.log("Retrying database connection...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return getOrCreateModelPrice(id, name);
    }
    throw error;
  }
}

export {
  getUsers,
  getOrCreateUser,
  updateUserBalance,
  updateUserDefaultBalance,
  resetAllBalancesToDefault,
  resetUserBalanceToDefault,
  getLastResetDate,
  updateLastResetDate,
  deleteUser,
} from "./users";
