export const AD_REWARD_COINS = 10;
export const VICTORY_REWARD_COINS = 25;
export const REWARD_TURN_INTERVAL = 10;

export const COIN_PRODUCTS = Object.freeze([
  Object.freeze({ id: "coins_50", coins: 50, fallbackPrice: "49 YAN" }),
  Object.freeze({ id: "coins_200", coins: 200, fallbackPrice: "99 YAN" }),
  Object.freeze({ id: "coins_500", coins: 500, fallbackPrice: "199 YAN" }),
  Object.freeze({ id: "coins_1000", coins: 1000, fallbackPrice: "349 YAN" }),
]);

export function getCoinProduct(productId) {
  return COIN_PRODUCTS.find((product) => product.id === productId) || null;
}

export function normalizeWallet(value) {
  const coins = Number.isFinite(Number(value?.coins)) ? Math.max(0, Math.floor(Number(value.coins))) : 0;
  const turns = Number.isFinite(Number(value?.turnsSinceReward))
    ? Math.max(0, Math.floor(Number(value.turnsSinceReward))) % REWARD_TURN_INTERVAL
    : 0;
  const tokens = Array.isArray(value?.processedPurchaseTokens)
    ? [...new Set(value.processedPurchaseTokens.filter((token) => typeof token === "string" && token))].slice(-100)
    : [];

  return {
    version: 1,
    coins,
    turnsSinceReward: turns,
    processedPurchaseTokens: tokens,
  };
}

export function addWalletCoins(value, amount) {
  const wallet = normalizeWallet(value);
  const increment = Number.isFinite(Number(amount)) ? Math.max(0, Math.floor(Number(amount))) : 0;
  return { ...wallet, coins: wallet.coins + increment };
}

export function completePlayerTurn(value) {
  const wallet = normalizeWallet(value);
  const nextTurns = wallet.turnsSinceReward + 1;
  return {
    wallet: { ...wallet, turnsSinceReward: nextTurns >= REWARD_TURN_INTERVAL ? 0 : nextTurns },
    rewardDue: nextTurns >= REWARD_TURN_INTERVAL,
  };
}

export function recordProcessedPurchase(value, purchaseToken) {
  const wallet = normalizeWallet(value);
  if (!purchaseToken || wallet.processedPurchaseTokens.includes(purchaseToken)) return wallet;
  return {
    ...wallet,
    processedPurchaseTokens: [...wallet.processedPurchaseTokens, purchaseToken].slice(-100),
  };
}
