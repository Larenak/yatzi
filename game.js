export const CATEGORY_IDS = [
  "ones",
  "twos",
  "threes",
  "fours",
  "fives",
  "sixes",
  "threeKind",
  "fourKind",
  "fullHouse",
  "smallStraight",
  "largeStraight",
  "yahtzee",
  "chance",
];

export const UPPER_IDS = ["ones", "twos", "threes", "fours", "fives", "sixes"];

const UPPER_VALUES = {
  ones: 1,
  twos: 2,
  threes: 3,
  fours: 4,
  fives: 5,
  sixes: 6,
};

export function countDice(dice) {
  const counts = Array(7).fill(0);
  dice.forEach((die) => {
    if (Number.isInteger(die) && die >= 1 && die <= 6) counts[die] += 1;
  });
  return counts;
}

export function isYahtzee(dice) {
  return dice.length === 5 && dice.every((die) => die === dice[0]);
}

export function calculateScore(categoryId, dice, { joker = false } = {}) {
  const counts = countDice(dice);
  const total = dice.reduce((sum, die) => sum + die, 0);
  const unique = [...new Set(dice)].sort((a, b) => a - b);

  if (UPPER_VALUES[categoryId]) {
    const face = UPPER_VALUES[categoryId];
    return counts[face] * face;
  }

  switch (categoryId) {
    case "threeKind":
      return counts.some((count) => count >= 3) ? total : 0;
    case "fourKind":
      return counts.some((count) => count >= 4) ? total : 0;
    case "fullHouse":
      return joker || (counts.includes(3) && counts.includes(2)) ? 25 : 0;
    case "smallStraight": {
      const serial = unique.join("");
      return joker || serial.includes("1234") || serial.includes("2345") || serial.includes("3456") ? 30 : 0;
    }
    case "largeStraight": {
      const serial = unique.join("");
      return joker || serial === "12345" || serial === "23456" ? 40 : 0;
    }
    case "yahtzee":
      return isYahtzee(dice) ? 50 : 0;
    case "chance":
      return total;
    default:
      return 0;
  }
}

export function getUpperSubtotal(scores) {
  return UPPER_IDS.reduce((sum, id) => sum + (scores[id] ?? 0), 0);
}

export function getUpperBonus(scores) {
  return getUpperSubtotal(scores) >= 63 ? 35 : 0;
}

export function getTotalScore(scores, yahtzeeBonus = 0) {
  const categoriesTotal = CATEGORY_IDS.reduce((sum, id) => sum + (scores[id] ?? 0), 0);
  return categoriesTotal + getUpperBonus(scores) + yahtzeeBonus;
}

export function getRequiredJokerCategory(dice, scores) {
  if (!isYahtzee(dice) || scores.yahtzee !== 50) return null;
  const matchingUpper = UPPER_IDS[dice[0] - 1];
  return scores[matchingUpper] === undefined ? matchingUpper : null;
}

export function isJokerRoll(dice, scores) {
  return isYahtzee(dice) && scores.yahtzee === 50 && !getRequiredJokerCategory(dice, scores);
}

function scoreCategoryWeight(categoryId, score) {
  const fixedWeights = {
    yahtzee: 1.35,
    largeStraight: 1.22,
    smallStraight: 1.14,
    fullHouse: 1.08,
    fourKind: 1.06,
    threeKind: 1.02,
    chance: 0.78,
  };
  const upperValue = UPPER_VALUES[categoryId] ?? 0;
  return score * (fixedWeights[categoryId] ?? 1) + upperValue * 0.12;
}

export function chooseRivalCategory(dice, scores) {
  const required = getRequiredJokerCategory(dice, scores);
  if (required) return required;

  const joker = isJokerRoll(dice, scores);
  const open = CATEGORY_IDS.filter((id) => scores[id] === undefined);
  const ranked = open
    .map((id) => ({ id, score: calculateScore(id, dice, { joker }) }))
    .sort((a, b) => scoreCategoryWeight(b.id, b.score) - scoreCategoryWeight(a.id, a.score));

  if (ranked[0]?.score > 0) return ranked[0].id;

  const scratchOrder = ["ones", "twos", "threeKind", "fourKind", "yahtzee", "threes", "fullHouse", "smallStraight", "fours", "largeStraight", "fives", "sixes", "chance"];
  return scratchOrder.find((id) => scores[id] === undefined) ?? open[0];
}

function getRivalHolds(dice) {
  const unique = [...new Set(dice)].sort((a, b) => a - b);
  const straightSets = [[1, 2, 3, 4, 5], [2, 3, 4, 5, 6]];
  const bestStraight = straightSets
    .map((sequence) => sequence.filter((value) => unique.includes(value)))
    .sort((a, b) => b.length - a.length)[0];

  const counts = countDice(dice);
  const mostCommon = counts.reduce((best, count, face) => count > best.count ? { face, count } : best, { face: 1, count: 0 });
  const chaseStraight = bestStraight.length >= 4 && mostCommon.count < 3;
  return dice.map((value, index) => chaseStraight ? bestStraight.includes(value) && dice.indexOf(value) === index : value === mostCommon.face);
}

export function simulateRivalTurn(scores, random = Math.random) {
  let dice = Array.from({ length: 5 }, () => Math.floor(random() * 6) + 1);
  let held = [false, false, false, false, false];
  const rolls = [];

  for (let rollIndex = 0; rollIndex < 3; rollIndex += 1) {
    if (rollIndex > 0) {
      dice = dice.map((value, index) => held[index] ? value : Math.floor(random() * 6) + 1);
    }
    const nextHeld = rollIndex < 2 ? getRivalHolds(dice) : held;
    rolls.push({ dice: [...dice], held: [...held], nextHeld: [...nextHeld] });
    held = nextHeld;
  }

  const categoryId = chooseRivalCategory(dice, scores);
  const joker = isJokerRoll(dice, scores);
  return {
    categoryId,
    dice,
    rolls,
    score: calculateScore(categoryId, dice, { joker }),
    yahtzeeBonus: isYahtzee(dice) && scores.yahtzee === 50 ? 100 : 0,
  };
}
