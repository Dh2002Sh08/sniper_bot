// utils/config.ts

export interface BotConfig {
    slippage: number;       // in percentage, e.g., 0.5 for 0.5%
    buyPercent: number;     // in percentage of SOL balance to use for buy, e.g., 50 for 50%
  }
  
  let config: BotConfig = {
    slippage: 0.5,
    buyPercent: 50,
  };
  
  export const setConfig = (newConfig: Partial<BotConfig>) => {
    config = { ...config, ...newConfig };
  };
  
  export const getConfig = (): BotConfig => {
    return config;
  };
  
  export const BOT_CONFIG = {
    // Use 5% of available SOL balance for each token
    BUY_PERCENTAGE: 0.05, // 5%
  
    // Slippage allowed for swap (e.g. 1%)
    SLIPPAGE: 0.01, // 1%
  
    // Optionally: max buy per token (in SOL)
    MAX_BUY_SOL: 1.0,
  
    // Minimum liquidity in USD to consider buying
    MIN_LIQUIDITY: 1000,
  
    // Optional: only buy tokens younger than this (in seconds)
    MAX_AGE_SECONDS: 600, // 10 minutes
  };