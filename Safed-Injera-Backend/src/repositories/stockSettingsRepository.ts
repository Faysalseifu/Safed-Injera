import { pool } from '../config/db';

export interface StockSettingsRecord {
  id: number;
  category: string;
  minimum_threshold: number;
  updated_by: string | null;
  updated_at: Date;
}

export const getStockSettings = async (): Promise<StockSettingsRecord[]> => {
  const { rows } = await pool.query<StockSettingsRecord>(
    `SELECT * FROM stock_settings ORDER BY category`
  );
  return rows;
};

export const getStockSettingByCategory = async (
  category: string
): Promise<StockSettingsRecord | null> => {
  const { rows } = await pool.query<StockSettingsRecord>(
    `SELECT * FROM stock_settings WHERE category = $1 LIMIT 1`,
    [category]
  );
  return rows[0] ?? null;
};

export const updateStockSetting = async (
  category: string,
  minimum_threshold: number,
  updated_by?: string
): Promise<StockSettingsRecord> => {
  const { rows } = await pool.query<StockSettingsRecord>(
    `INSERT INTO stock_settings (category, minimum_threshold, updated_by, updated_at)
     VALUES ($1, $2, $3, now())
     ON CONFLICT (category)
     DO UPDATE SET
       minimum_threshold = EXCLUDED.minimum_threshold,
       updated_by = EXCLUDED.updated_by,
       updated_at = now()
     RETURNING *`,
    [category, minimum_threshold, updated_by ?? null]
  );
  return rows[0];
};

export const getDefaultThresholds = (): Record<string, number> => {
  return {
    Injera: 200,
    'Teff Flour': 100,
    Packaging: 500,
    Other: 50,
  };
};
