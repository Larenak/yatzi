export const AD_BONUS_COINS = 10;
export const VICTORY_REWARD_COINS = 25;
export const EXTRA_ROLL_COST = 50;
export const MAX_PAID_ROLLS = 3;
export const REWARD_TURN_INTERVAL = 10;

export const COIN_PRODUCTS = Object.freeze([
  Object.freeze({ id: "coins_50", coins: 50, fallbackPriceValue: "49" }),
  Object.freeze({ id: "coins_200", coins: 200, fallbackPriceValue: "99" }),
  Object.freeze({ id: "coins_500", coins: 500, fallbackPriceValue: "199" }),
  Object.freeze({ id: "coins_1000", coins: 1000, fallbackPriceValue: "349" }),
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

export function spendWalletCoins(value, amount) {
  const wallet = normalizeWallet(value);
  const cost = Number.isFinite(Number(amount)) ? Math.max(0, Math.floor(Number(amount))) : 0;
  if (!cost || wallet.coins < cost) return { wallet, spent: false };
  return { wallet: { ...wallet, coins: wallet.coins - cost }, spent: true };
}

export function completePlayerTurn(value) {
  const wallet = normalizeWallet(value);
  const nextTurns = wallet.turnsSinceReward + 1;
  return {
    wallet: { ...wallet, turnsSinceReward: nextTurns >= REWARD_TURN_INTERVAL ? 0 : nextTurns },
    adDue: nextTurns >= REWARD_TURN_INTERVAL,
  };
}

export function getInterstitialBonus(wasShown) {
  return wasShown === true ? AD_BONUS_COINS : 0;
}

export function recordProcessedPurchase(value, purchaseToken) {
  const wallet = normalizeWallet(value);
  if (!purchaseToken || wallet.processedPurchaseTokens.includes(purchaseToken)) return wallet;
  return {
    ...wallet,
    processedPurchaseTokens: [...wallet.processedPurchaseTokens, purchaseToken].slice(-100),
  };
}
