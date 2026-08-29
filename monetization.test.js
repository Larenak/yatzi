import test from "node:test";
import assert from "node:assert/strict";
import {
  AD_BONUS_COINS,
  COIN_PRODUCTS,
  EXTRA_ROLL_COST,
  MAX_PAID_ROLLS,
  VICTORY_REWARD_COINS,
  addWalletCoins,
  completePlayerTurn,
  getCoinProduct,
  getInterstitialBonus,
  normalizeWallet,
  recordProcessedPurchase,
  spendWalletCoins,
} from "./monetization.js";

test("wallet values are normalized and protected from negative balances", () => {
  assert.deepEqual(normalizeWallet({ coins: -20, turnsSinceReward: 23, processedPurchaseTokens: ["a", "a", 4] }), {
    version: 1,
    coins: 0,
    turnsSinceReward: 3,
    processedPurchaseTokens: ["a"],
  });
  assert.equal(addWalletCoins({ coins: 8 }, 10).coins, 18);
  assert.equal(addWalletCoins({ coins: 18 }, 25).coins, 43);
  assert.deepEqual(spendWalletCoins({ coins: 75 }, 50), {
    wallet: { version: 1, coins: 25, turnsSinceReward: 0, processedPurchaseTokens: [] },
    spent: true,
  });
  assert.equal(spendWalletCoins({ coins: 49 }, 50).spent, false);
});

test("a compensated interstitial becomes due on every tenth completed player turn", () => {
  let wallet = normalizeWallet(null);
  for (let turn = 1; turn <= 20; turn += 1) {
    const result = completePlayerTurn(wallet);
    wallet = result.wallet;
    assert.equal(result.adDue, turn === 10 || turn === 20);
  }
  assert.equal(wallet.turnsSinceReward, 0);
});

test("coin products and processed purchase tokens are deterministic", () => {
  assert.deepEqual(COIN_PRODUCTS.map(({ coins, fallbackPriceValue }) => [coins, fallbackPriceValue]), [
    [50, "49"],
    [200, "99"],
    [500, "199"],
    [1000, "349"],
  ]);
  assert.equal(AD_BONUS_COINS, 10);
  assert.equal(getInterstitialBonus(true), 10);
  assert.equal(getInterstitialBonus(false), 0);
  assert.equal(VICTORY_REWARD_COINS, 25);
  assert.equal(EXTRA_ROLL_COST, 50);
  assert.equal(MAX_PAID_ROLLS, 3);
  assert.equal(getCoinProduct("coins_500").coins, 500);
  assert.equal(getCoinProduct("missing"), null);
  const wallet = recordProcessedPurchase({ coins: 50 }, "token-1");
  assert.deepEqual(recordProcessedPurchase(wallet, "token-1").processedPurchaseTokens, ["token-1"]);
});
