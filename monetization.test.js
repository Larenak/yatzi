import test from "node:test";
import assert from "node:assert/strict";
import {
  AD_REWARD_COINS,
  COIN_PRODUCTS,
  VICTORY_REWARD_COINS,
  addWalletCoins,
  completePlayerTurn,
  getCoinProduct,
  normalizeWallet,
  recordProcessedPurchase,
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
});

test("a reward offer becomes due on every tenth completed player turn", () => {
  let wallet = normalizeWallet(null);
  for (let turn = 1; turn <= 20; turn += 1) {
    const result = completePlayerTurn(wallet);
    wallet = result.wallet;
    assert.equal(result.rewardDue, turn === 10 || turn === 20);
  }
  assert.equal(wallet.turnsSinceReward, 0);
});

test("coin products and processed purchase tokens are deterministic", () => {
  assert.deepEqual(COIN_PRODUCTS.map(({ coins, fallbackPrice }) => [coins, fallbackPrice]), [
    [50, "49 YAN"],
    [200, "99 YAN"],
    [500, "199 YAN"],
    [1000, "349 YAN"],
  ]);
  assert.equal(AD_REWARD_COINS, 10);
  assert.equal(VICTORY_REWARD_COINS, 25);
  assert.equal(getCoinProduct("coins_500").coins, 500);
  assert.equal(getCoinProduct("missing"), null);
  const wallet = recordProcessedPurchase({ coins: 50 }, "token-1");
  assert.deepEqual(recordProcessedPurchase(wallet, "token-1").processedPurchaseTokens, ["token-1"]);
});
