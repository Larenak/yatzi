import test from "node:test";
import assert from "node:assert/strict";
import {
  CATEGORY_IDS,
  calculateScore,
  chooseRivalCategory,
  getRequiredJokerCategory,
  getTotalScore,
  getUpperBonus,
  isJokerRoll,
  simulateRivalTurn,
} from "./game.js";

test("upper categories count only matching dice", () => {
  assert.equal(calculateScore("threes", [3, 3, 1, 5, 3]), 9);
  assert.equal(calculateScore("sixes", [1, 2, 3, 4, 5]), 0);
});

test("kind categories score the sum of all dice", () => {
  assert.equal(calculateScore("threeKind", [4, 4, 4, 2, 5]), 19);
  assert.equal(calculateScore("fourKind", [2, 2, 2, 2, 6]), 14);
  assert.equal(calculateScore("fourKind", [3, 3, 3, 2, 2]), 0);
});

test("full house and straights follow standard fixed scores", () => {
  assert.equal(calculateScore("fullHouse", [2, 2, 5, 5, 5]), 25);
  assert.equal(calculateScore("fullHouse", [6, 6, 6, 6, 6]), 0);
  assert.equal(calculateScore("smallStraight", [1, 2, 3, 4, 4]), 30);
  assert.equal(calculateScore("smallStraight", [2, 3, 4, 5, 6]), 30);
  assert.equal(calculateScore("largeStraight", [2, 3, 4, 5, 6]), 40);
});

test("yatzy and chance are calculated correctly", () => {
  assert.equal(calculateScore("yahtzee", [5, 5, 5, 5, 5]), 50);
  assert.equal(calculateScore("yahtzee", [5, 5, 5, 5, 4]), 0);
  assert.equal(calculateScore("chance", [1, 2, 3, 4, 5]), 15);
});

test("upper bonus is awarded at 63", () => {
  assert.equal(getUpperBonus({ ones: 3, twos: 6, threes: 9, fours: 12, fives: 15, sixes: 18 }), 35);
  assert.equal(getUpperBonus({ ones: 2, twos: 4, threes: 6, fours: 8, fives: 10, sixes: 12 }), 0);
});

test("total includes upper and extra yatzy bonuses", () => {
  const scores = { ones: 3, twos: 6, threes: 9, fours: 12, fives: 15, sixes: 18, yahtzee: 50 };
  assert.equal(getTotalScore(scores, 100), 248);
});

test("joker rule requires the matching upper category when open", () => {
  const scores = { yahtzee: 50 };
  assert.equal(getRequiredJokerCategory([4, 4, 4, 4, 4], scores), "fours");
  scores.fours = 12;
  assert.equal(getRequiredJokerCategory([4, 4, 4, 4, 4], scores), null);
  assert.equal(isJokerRoll([4, 4, 4, 4, 4], scores), true);
  assert.equal(calculateScore("fullHouse", [4, 4, 4, 4, 4], { joker: true }), 25);
});

test("rival always chooses an open category", () => {
  const scores = { ones: 3, twos: 4, threes: 6 };
  const category = chooseRivalCategory([6, 6, 6, 2, 3], scores);
  assert.equal(category, "threeKind");
  assert.equal(scores[category], undefined);
});

test("simulated rival turn returns five dice and a valid score", () => {
  const sequence = [0.01, 0.2, 0.4, 0.6, 0.8, 0.01, 0.2, 0.4, 0.6, 0.8, 0.01, 0.2, 0.4, 0.6, 0.8];
  let index = 0;
  const turn = simulateRivalTurn({}, () => sequence[index++ % sequence.length]);
  assert.equal(turn.dice.length, 5);
  assert.ok(CATEGORY_IDS.includes(turn.categoryId));
  assert.equal(Number.isInteger(turn.score), true);
});
