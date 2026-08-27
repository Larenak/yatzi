import {
  CATEGORY_IDS,
  UPPER_IDS,
  calculateScore,
  chooseRivalCategory,
  getRequiredJokerCategory,
  getTotalScore,
  getUpperSubtotal,
  isJokerRoll,
  isYahtzee,
  simulateRivalTurn,
} from "./game.js";

const translations = {
  ru: {
    mode: "БЫСТРАЯ ДУЭЛЬ",
    you: "ВЫ",
    youShort: "вы",
    categories: "КОМБИНАЦИИ",
    howToPlay: "Как играть?",
    virtualNotice: "Соперник управляется игрой",
    paused: "Пауза",
    rulesEyebrow: "ПРАВИЛА ДУЭЛИ",
    rulesTitle: "Три броска — один выбор",
    rule1: "Бросьте пять костей. За ход доступно до трёх бросков.",
    rule2: "Нажмите на удачные кости, чтобы оставить их перед перебросом.",
    rule3: "Запишите результат в одну свободную красную ячейку. Затем ход сделает виртуальный соперник.",
    bonusTitle: "Бонус +35",
    bonusText: "Наберите 63 очка в верхней секции.",
    continueGame: "Продолжить игру",
    newMatch: "НОВАЯ ДУЭЛЬ",
    resetTitle: "Начать заново?",
    resetText: "Текущий счёт будет сброшен, а соперник изменится.",
    cancel: "Отмена",
    restart: "Начать",
    matchComplete: "ДУЭЛЬ ЗАВЕРШЕНА",
    playAgain: "Новый соперник",
    round: "РАУНД",
    yourTurn: "ВАШ ХОД",
    rivalTurn: "ХОД {name}",
    roll: "БРОСИТЬ",
    reroll: "ЕЩЁ РАЗ",
    chooseScore: "ВЫБЕРИТЕ СЧЁТ",
    startHint: "Бросьте кости, затем оставьте нужные",
    holdHint: "Нажмите на кость, чтобы оставить · осталось бросков: {count}",
    scoreHint: "Выберите свободную красную ячейку",
    thinkingHint: "{name} бросает кости…",
    rivalRoll: "{name}: бросок {roll} из 3",
    rivalResult: "Выпало: {dice}",
    held: "СТОП",
    bonus: "БОНУС",
    playerScored: "{category}: +{score}",
    rivalScored: "{name}: {category} · +{score}",
    yahtzeeBonus: "Ятзи! Дополнительный бонус +100",
    victory: "Победа!",
    defeat: "Почти!",
    draw: "Ничья!",
    victoryText: "Отличная партия — соперник повержен.",
    defeatText: "Реванш? До победы не хватило {points}.",
    drawText: "Редкий случай: абсолютно равный счёт.",
    categoryNames: {
      ones: "Единицы", twos: "Двойки", threes: "Тройки", fours: "Четвёрки", fives: "Пятёрки", sixes: "Шестёрки",
      threeKind: "Три одинаковых", fourKind: "Четыре одинаковых", fullHouse: "Фул-хаус",
      smallStraight: "Малый стрит", largeStraight: "Большой стрит", yahtzee: "Ятзи", chance: "Шанс",
    },
  },
  en: {
    mode: "QUICK DUEL",
    you: "YOU",
    youShort: "you",
    categories: "CATEGORIES",
    howToPlay: "How to play?",
    virtualNotice: "The rival is controlled by the game",
    paused: "Paused",
    rulesEyebrow: "DUEL RULES",
    rulesTitle: "Three rolls, one choice",
    rule1: "Roll five dice. You have up to three rolls per turn.",
    rule2: "Tap useful dice to hold them before your next roll.",
    rule3: "Score one open red cell. Then the virtual rival takes a turn.",
    bonusTitle: "+35 bonus",
    bonusText: "Score 63 points in the upper section.",
    continueGame: "Continue",
    newMatch: "NEW DUEL",
    resetTitle: "Start over?",
    resetText: "The current score will reset and your rival will change.",
    cancel: "Cancel",
    restart: "Start",
    matchComplete: "DUEL COMPLETE",
    playAgain: "New rival",
    round: "ROUND",
    yourTurn: "YOUR TURN",
    rivalTurn: "{name}'S TURN",
    roll: "ROLL",
    reroll: "ROLL AGAIN",
    chooseScore: "CHOOSE SCORE",
    startHint: "Roll the dice, then hold the ones you need",
    holdHint: "Tap a die to hold · {count} rolls left",
    scoreHint: "Choose an open red cell",
    thinkingHint: "{name} is rolling…",
    rivalRoll: "{name}: roll {roll} of 3",
    rivalResult: "Rolled: {dice}",
    held: "HOLD",
    bonus: "BONUS",
    playerScored: "{category}: +{score}",
    rivalScored: "{name}: {category} · +{score}",
    yahtzeeBonus: "Yatzy! Extra +100 bonus",
    victory: "Victory!",
    defeat: "So close!",
    draw: "Draw!",
    victoryText: "Great game — you beat your rival.",
    defeatText: "Rematch? You were {points} points short.",
    drawText: "A rare result: perfectly even scores.",
    categoryNames: {
      ones: "Ones", twos: "Twos", threes: "Threes", fours: "Fours", fives: "Fives", sixes: "Sixes",
      threeKind: "Three of a kind", fourKind: "Four of a kind", fullHouse: "Full house",
      smallStraight: "Small straight", largeStraight: "Large straight", yahtzee: "Yatzy", chance: "Chance",
    },
  },
};

const RIVAL_NAMES = [
  "Mila", "DiceFox", "Vega", "Nika", "MaxRoll", "Luna", "Dima_Dice", "SunnyCat",
  "Arsen", "Kira", "КосмоКот", "Лис_в_кедах", "Рыжик", "Nastya", "Tim", "LuckyOwl",
];

const PIPS = {
  1: ["mc"],
  2: ["tl", "br"],
  3: ["tl", "mc", "br"],
  4: ["tl", "tr", "bl", "br"],
  5: ["tl", "tr", "mc", "bl", "br"],
  6: ["tl", "tr", "ml", "mr", "bl", "br"],
};

const LOWER_ICONS = {
  threeKind: "3×",
  fourKind: "4×",
  fullHouse: "⌂",
  smallStraight: "SMALL",
  largeStraight: "LARGE",
  yahtzee: "YATZY",
  chance: "?",
};

const elements = {
  app: document.querySelector("#gameApp"),
  playerTotal: document.querySelector("#playerTotal"),
  rivalTotal: document.querySelector("#rivalTotal"),
  rivalName: document.querySelector("#rivalName"),
  rivalKeyName: document.querySelector("#rivalKeyName"),
  roundLabel: document.querySelector("#roundLabel"),
  turnStrip: document.querySelector(".turn-strip"),
  turnStatus: document.querySelector("#turnStatus"),
  upperScoreList: document.querySelector("#upperScoreList"),
  lowerScoreList: document.querySelector("#lowerScoreList"),
  diceStage: document.querySelector("#diceStage"),
  diceHint: document.querySelector("#diceHint"),
  rollButton: document.querySelector("#rollButton"),
  rollLabel: document.querySelector("#rollLabel"),
  rollMarks: [...document.querySelectorAll("#rollMarks i")],
  rulesButton: document.querySelector("#rulesButton"),
  footerRulesButton: document.querySelector("#footerRulesButton"),
  newGameButton: document.querySelector("#newGameButton"),
  rulesModal: document.querySelector("#rulesModal"),
  resetModal: document.querySelector("#resetModal"),
  confirmResetButton: document.querySelector("#confirmResetButton"),
  finishModal: document.querySelector("#finishModal"),
  finishTitle: document.querySelector("#finishTitle"),
  finishPlayerScore: document.querySelector("#finishPlayerScore"),
  finishRivalScore: document.querySelector("#finishRivalScore"),
  finishRivalName: document.querySelector("#finishRivalName"),
  finishMessage: document.querySelector("#finishMessage"),
  playAgainButton: document.querySelector("#playAgainButton"),
  pauseCover: document.querySelector("#pauseCover"),
  toast: document.querySelector("#toast"),
};

let lang = getInitialLanguage();
let t = translations[lang];
let previousRival = "";
let rivalTurnToken = 0;
let toastTimer = null;
let ysdk = null;
let gameplayStarted = false;

let state = createInitialState();

function createInitialState() {
  const rivalNick = pickRivalName();
  previousRival = rivalNick;
  return {
    dice: [1, 2, 3, 4, 5],
    held: [false, false, false, false, false],
    rollCount: 0,
    playerScores: {},
    rivalScores: {},
    playerYahtzeeBonus: 0,
    rivalYahtzeeBonus: 0,
    rivalNick,
    rivalThinking: false,
    lastRivalCategory: null,
    rolling: false,
    scoring: false,
    paused: false,
  };
}

function pickRivalName() {
  const choices = RIVAL_NAMES.filter((name) => name !== previousRival);
  return choices[Math.floor(Math.random() * choices.length)];
}

function getInitialLanguage() {
  return (navigator.language || "ru").toLowerCase().startsWith("ru") ? "ru" : "en";
}

function format(template, values) {
  return Object.entries(values).reduce((result, [key, value]) => result.replace(`{${key}}`, value), template);
}

function randomDie() {
  return Math.floor(Math.random() * 6) + 1;
}

function wait(milliseconds) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function paintDieElement(die, value) {
  let face = die.querySelector(".die-face");
  if (!face) {
    face = document.createElement("span");
    face.className = "die-face";
    die.append(face);
  }
  face.replaceChildren(...createPips(value));
  die.classList.add("has-value");
  const index = Number(die.dataset.index) + 1;
  die.setAttribute("aria-label", `${lang === "ru" ? "Кость" : "Die"} ${index}: ${value}`);
}

async function animateNumber(element, from, to, duration = 500) {
  const start = performance.now();
  element.textContent = String(from);
  return new Promise((resolve) => {
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = String(Math.round(from + (to - from) * eased));
      if (progress < 1) window.requestAnimationFrame(tick);
      else resolve();
    };
    window.requestAnimationFrame(tick);
  });
}

async function performDiceThrow(finalDice, heldDice = [false, false, false, false, false], duration = 610) {
  state.rolling = true;
  render();
  const diceElements = [...elements.diceStage.querySelectorAll(".die")];
  const animatedDice = diceElements.filter((_, index) => !heldDice[index]);
  animatedDice.forEach((die) => {
    const index = Number(die.dataset.index);
    die.classList.add("throwing");
    die.style.setProperty("--throw-x", `${(index - 2) * 11}px`);
    die.style.setProperty("--throw-delay", `${index * 38}ms`);
    die.style.setProperty("--throw-duration", `${duration}ms`);
  });

  const faceTicker = window.setInterval(() => {
    animatedDice.forEach((die) => paintDieElement(die, randomDie()));
  }, 68);

  await wait(duration + 175);
  window.clearInterval(faceTicker);
  state.dice = [...finalDice];
  state.rolling = false;
  render();
}

async function flyDiceToCell(targetCell) {
  const targetRect = targetCell.getBoundingClientRect();
  const diceElements = [...elements.diceStage.querySelectorAll(".die")];
  const animations = [];
  const clones = [];

  diceElements.forEach((die, index) => {
    const source = die.querySelector(".die-face") || die;
    const sourceRect = source.getBoundingClientRect();
    const clone = source.cloneNode(true);
    clone.classList.remove("held", "throwing", "rolling");
    clone.classList.add("flying-die");
    clone.style.left = `${sourceRect.left}px`;
    clone.style.top = `${sourceRect.top}px`;
    clone.style.width = `${sourceRect.width}px`;
    clone.style.height = `${sourceRect.height}px`;
    document.body.append(clone);
    clones.push(clone);

    const deltaX = targetRect.left + targetRect.width / 2 - (sourceRect.left + sourceRect.width / 2);
    const deltaY = targetRect.top + targetRect.height / 2 - (sourceRect.top + sourceRect.height / 2);
    if (typeof clone.animate === "function") {
      const animation = clone.animate([
        { transform: "translate(0, 0) rotate(0deg) scale(1)", opacity: 1 },
        { offset: .54, transform: `translate(${deltaX * .54}px, ${deltaY * .54 - 72}px) rotate(${130 + index * 35}deg) scale(.78)`, opacity: 1 },
        { offset: .82, transform: `translate(${deltaX * .84}px, ${deltaY * .84 - 18}px) rotate(${270 + index * 48}deg) scale(.48)`, opacity: 1 },
        { transform: `translate(${deltaX}px, ${deltaY}px) rotate(${360 + index * 55}deg) scale(.2)`, opacity: .18 },
      ], {
        duration: 700,
        delay: index * 45,
        easing: "cubic-bezier(.32,.03,.2,1)",
        fill: "forwards",
      });
      animations.push(animation.finished.catch(() => undefined));
    }
  });

  diceElements.forEach((die) => die.classList.add("dice-leaving"));
  targetCell.classList.add("score-receiving");
  if (animations.length) await Promise.all(animations);
  else await wait(900);
  clones.forEach((clone) => clone.remove());
  diceElements.forEach((die) => die.classList.remove("dice-leaving"));
  targetCell.classList.remove("score-receiving");
}

async function animateScoreTransfer(categoryId, side, categoryScore, totalBefore, totalAfter) {
  const targetSelector = side === "player" ? ".player-cell" : ".rival-cell";
  const targetCell = elements.app.querySelector(`.category-row[data-category="${categoryId}"] ${targetSelector}`);
  const totalElement = side === "player" ? elements.playerTotal : elements.rivalTotal;
  if (!targetCell) return;

  targetCell.textContent = "0";
  const numberAnimation = animateNumber(targetCell, 0, categoryScore, 500);
  const totalAnimation = animateNumber(totalElement, totalBefore, totalAfter, 500);
  await Promise.all([flyDiceToCell(targetCell), numberAnimation, totalAnimation]);
  targetCell.classList.add("score-pop");
  await wait(120);
  targetCell.classList.remove("score-pop");
}

function applyTranslations() {
  document.documentElement.lang = lang;
  document.title = lang === "ru" ? "Ятзи — быстрая дуэль" : "Yatzy — quick duel";
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const translation = t[node.dataset.i18n];
    if (typeof translation === "string") node.textContent = translation;
  });
  elements.rulesButton.setAttribute("aria-label", lang === "ru" ? "Открыть правила" : "Open rules");
  elements.newGameButton.setAttribute("aria-label", lang === "ru" ? "Начать заново" : "Restart match");
}

function getRound() {
  return Math.min(Object.keys(state.rivalScores).length + 1, 13);
}

function getPlayerPotential(categoryId) {
  return calculateScore(categoryId, state.dice, { joker: isJokerRoll(state.dice, state.playerScores) });
}

function getRecommendedCategory() {
  if (state.rollCount === 0) return null;
  return chooseRivalCategory(state.dice, state.playerScores);
}

function createPips(value, className = "pip") {
  return PIPS[value].map((position) => {
    const pip = document.createElement("span");
    pip.className = `${className} ${position}`;
    return pip;
  });
}

function createCategoryIcon(categoryId) {
  const icon = document.createElement("span");
  if (UPPER_IDS.includes(categoryId)) {
    icon.className = "category-icon upper-icon";
    icon.append(...createPips(UPPER_IDS.indexOf(categoryId) + 1, "mini-pip"));
  } else {
    icon.className = `category-icon${["smallStraight", "largeStraight", "yahtzee"].includes(categoryId) ? " word-icon" : ""}`;
    icon.textContent = LOWER_ICONS[categoryId];
  }
  icon.setAttribute("aria-hidden", "true");
  return icon;
}

function createCategoryRow(categoryId) {
  const row = document.createElement("div");
  row.className = "category-row";
  row.dataset.category = categoryId;

  const playerScored = state.playerScores[categoryId] !== undefined;
  const rivalScored = state.rivalScores[categoryId] !== undefined;
  const required = state.rollCount > 0 ? getRequiredJokerCategory(state.dice, state.playerScores) : null;
  const locked = Boolean(required && required !== categoryId);
  const available = state.rollCount > 0 && !playerScored && !locked && !state.rivalThinking && !state.scoring;
  const potential = available ? getPlayerPotential(categoryId) : null;
  const recommended = getRecommendedCategory() === categoryId && available;

  const playerCell = document.createElement("button");
  playerCell.type = "button";
  playerCell.className = "score-cell player-cell";
  playerCell.dataset.category = categoryId;
  playerCell.disabled = !available || state.rolling || state.paused;
  if (playerScored) playerCell.classList.add("scored");
  else if (available) playerCell.classList.add("available");
  if (recommended) playerCell.classList.add("recommended");
  playerCell.textContent = playerScored ? state.playerScores[categoryId] : available ? potential : "";
  playerCell.setAttribute("aria-label", `${t.categoryNames[categoryId]}: ${playerScored ? state.playerScores[categoryId] : available ? potential : "—"}`);
  if (locked) playerCell.title = t.categoryNames[required];

  const rivalCell = document.createElement("span");
  rivalCell.className = "score-cell rival-cell";
  if (rivalScored) rivalCell.classList.add("scored");
  if (state.lastRivalCategory === categoryId) rivalCell.classList.add("just-scored");
  rivalCell.textContent = rivalScored ? state.rivalScores[categoryId] : "";
  rivalCell.setAttribute("aria-label", `${state.rivalNick}, ${t.categoryNames[categoryId]}: ${rivalScored ? state.rivalScores[categoryId] : "—"}`);

  row.append(createCategoryIcon(categoryId), playerCell, rivalCell);
  return row;
}

function createBonusStrip() {
  const strip = document.createElement("div");
  strip.className = "bonus-strip";
  const label = document.createElement("span");
  label.className = "bonus-label";
  label.innerHTML = `${t.bonus}<strong>+35</strong>`;

  const playerProgress = document.createElement("span");
  playerProgress.className = "bonus-progress";
  playerProgress.textContent = `${getUpperSubtotal(state.playerScores)}/63`;

  const rivalProgress = document.createElement("span");
  rivalProgress.className = "bonus-progress rival-progress";
  rivalProgress.textContent = `${getUpperSubtotal(state.rivalScores)}/63`;
  strip.append(label, playerProgress, rivalProgress);
  return strip;
}

function renderScorecard() {
  elements.upperScoreList.replaceChildren(...UPPER_IDS.map(createCategoryRow), createBonusStrip());
  elements.lowerScoreList.replaceChildren(...CATEGORY_IDS.filter((id) => !UPPER_IDS.includes(id)).map(createCategoryRow));
}

function createDie(index) {
  const value = state.dice[index];
  const die = document.createElement("button");
  die.type = "button";
  die.className = "die";
  die.dataset.index = String(index);
  die.dataset.heldLabel = t.held;
  if (state.rollCount > 0) die.classList.add("has-value");
  if (state.held[index]) die.classList.add("held");
  if (state.rolling && !state.held[index]) die.classList.add("rolling");
  die.disabled = state.rollCount === 0 || state.rollCount >= 3 || state.rolling || state.scoring || state.rivalThinking || state.paused;
  die.setAttribute("aria-pressed", String(state.held[index]));
  die.setAttribute("aria-label", `${lang === "ru" ? "Кость" : "Die"} ${index + 1}: ${state.rollCount > 0 ? value : "—"}`);
  if (state.rollCount > 0) {
    const face = document.createElement("span");
    face.className = "die-face";
    face.append(...createPips(value));
    die.append(face);
  }
  return die;
}

function renderDice() {
  elements.diceStage.replaceChildren(...state.dice.map((_, index) => createDie(index)));
}

function renderHeader() {
  elements.playerTotal.textContent = getTotalScore(state.playerScores, state.playerYahtzeeBonus);
  elements.rivalTotal.textContent = getTotalScore(state.rivalScores, state.rivalYahtzeeBonus);
  elements.rivalName.textContent = state.rivalNick;
  elements.rivalKeyName.textContent = state.rivalNick;
  elements.roundLabel.textContent = `${t.round} ${getRound()} / 13`;
  elements.turnStatus.textContent = state.rivalThinking
    ? format(t.rivalTurn, { name: state.rivalNick })
    : t.yourTurn;
  elements.turnStrip.classList.toggle("thinking", state.rivalThinking);
}

function renderControls() {
  if (state.rivalThinking) {
    elements.rollLabel.textContent = "…";
    elements.diceHint.textContent = format(t.thinkingHint, { name: state.rivalNick });
  } else if (state.rollCount === 0) {
    elements.rollLabel.textContent = t.roll;
    elements.diceHint.textContent = t.startHint;
  } else if (state.rollCount < 3) {
    elements.rollLabel.textContent = t.reroll;
    elements.diceHint.textContent = format(t.holdHint, { count: 3 - state.rollCount });
  } else {
    elements.rollLabel.textContent = t.chooseScore;
    elements.diceHint.textContent = t.scoreHint;
  }

  elements.rollButton.disabled = state.rollCount >= 3 || state.rolling || state.scoring || state.rivalThinking || state.paused;
  elements.newGameButton.disabled = state.rolling || state.scoring || state.rivalThinking || state.paused;
  elements.rollMarks.forEach((mark, index) => {
    mark.classList.toggle("used", index < state.rollCount);
    mark.classList.toggle("current", index === state.rollCount && state.rollCount < 3 && !state.rivalThinking);
  });
}

function render() {
  applyTranslations();
  renderHeader();
  renderScorecard();
  renderDice();
  renderControls();
  elements.pauseCover.hidden = !state.paused;
}

function showToast(message) {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  toastTimer = window.setTimeout(() => elements.toast.classList.remove("show"), 2100);
}

function startGameplay() {
  if (gameplayStarted) return;
  gameplayStarted = true;
  ysdk?.features?.GameplayAPI?.start();
}

function stopGameplay() {
  if (!gameplayStarted) return;
  gameplayStarted = false;
  ysdk?.features?.GameplayAPI?.stop();
}

async function rollDice() {
  if (state.rollCount >= 3 || state.rolling || state.scoring || state.rivalThinking || state.paused) return;
  startGameplay();
  const heldDice = [...state.held];
  const finalDice = state.dice.map((value, index) => heldDice[index] ? value : randomDie());
  state.rollCount += 1;
  await performDiceThrow(finalDice, heldDice);
}

function toggleHold(index) {
  if (state.rollCount === 0 || state.rollCount >= 3 || state.rolling || state.scoring || state.rivalThinking || state.paused) return;
  state.held[index] = !state.held[index];
  render();
}

async function scorePlayerCategory(categoryId) {
  if (state.rollCount === 0 || state.playerScores[categoryId] !== undefined || state.rolling || state.scoring || state.rivalThinking || state.paused) return;
  const required = getRequiredJokerCategory(state.dice, state.playerScores);
  if (required && categoryId !== required) return;

  const bonusEarned = isYahtzee(state.dice) && state.playerScores.yahtzee === 50;
  const score = getPlayerPotential(categoryId);
  const totalBefore = getTotalScore(state.playerScores, state.playerYahtzeeBonus);
  const nextScores = { ...state.playerScores, [categoryId]: score };
  const nextBonus = state.playerYahtzeeBonus + (bonusEarned ? 100 : 0);
  const totalAfter = getTotalScore(nextScores, nextBonus);
  state.scoring = true;
  elements.app.classList.add("is-scoring");
  await animateScoreTransfer(categoryId, "player", score, totalBefore, totalAfter);
  state.playerScores[categoryId] = score;
  if (bonusEarned) state.playerYahtzeeBonus += 100;
  state.scoring = false;
  state.rivalThinking = true;
  state.held = [false, false, false, false, false];
  elements.app.classList.remove("is-scoring");
  render();
  showToast(bonusEarned ? t.yahtzeeBonus : format(t.playerScored, { category: t.categoryNames[categoryId], score }));

  const token = ++rivalTurnToken;
  await wait(260);
  await playRivalTurn(token);
}

async function playRivalTurn(token) {
  if (token !== rivalTurnToken) return;
  if (state.paused) {
    await wait(250);
    await playRivalTurn(token);
    return;
  }

  const result = simulateRivalTurn(state.rivalScores);
  state.rollCount = 0;
  state.dice = [1, 2, 3, 4, 5];
  state.held = [false, false, false, false, false];
  render();
  await wait(170);

  for (let rollIndex = 0; rollIndex < 3; rollIndex += 1) {
    if (token !== rivalTurnToken) return;
    state.rollCount = rollIndex + 1;
    const previewDice = rollIndex === 2 ? result.dice : Array.from({ length: 5 }, randomDie);
    await performDiceThrow(previewDice, [false, false, false, false, false], 500);
    elements.diceHint.textContent = rollIndex === 2
      ? format(t.rivalResult, { dice: result.dice.join(" · ") })
      : format(t.rivalRoll, { name: state.rivalNick, roll: rollIndex + 1 });
    await wait(rollIndex === 2 ? 1050 : 420);
  }

  const totalBefore = getTotalScore(state.rivalScores, state.rivalYahtzeeBonus);
  const nextScores = { ...state.rivalScores, [result.categoryId]: result.score };
  const totalAfter = getTotalScore(nextScores, state.rivalYahtzeeBonus + result.yahtzeeBonus);
  state.scoring = true;
  elements.app.classList.add("is-scoring");
  await animateScoreTransfer(result.categoryId, "rival", result.score, totalBefore, totalAfter);
  state.rivalScores[result.categoryId] = result.score;
  state.rivalYahtzeeBonus += result.yahtzeeBonus;
  state.scoring = false;
  state.lastRivalCategory = result.categoryId;
  state.rivalThinking = false;
  state.rollCount = 0;
  state.dice = [1, 2, 3, 4, 5];
  state.held = [false, false, false, false, false];
  elements.app.classList.remove("is-scoring");
  render();
  showToast(format(t.rivalScored, { name: state.rivalNick, category: t.categoryNames[result.categoryId], score: result.score }));

  if (Object.keys(state.playerScores).length === CATEGORY_IDS.length) {
    window.setTimeout(finishMatch, 520);
  } else {
    window.setTimeout(() => {
      if (state.lastRivalCategory === result.categoryId) {
        state.lastRivalCategory = null;
        renderScorecard();
      }
    }, 700);
  }
}

function finishMatch() {
  const playerScore = getTotalScore(state.playerScores, state.playerYahtzeeBonus);
  const rivalScore = getTotalScore(state.rivalScores, state.rivalYahtzeeBonus);
  const difference = Math.abs(playerScore - rivalScore);

  elements.finishPlayerScore.textContent = playerScore;
  elements.finishRivalScore.textContent = rivalScore;
  elements.finishRivalName.textContent = state.rivalNick;
  if (playerScore > rivalScore) {
    elements.finishTitle.textContent = t.victory;
    elements.finishMessage.textContent = t.victoryText;
  } else if (playerScore < rivalScore) {
    elements.finishTitle.textContent = t.defeat;
    elements.finishMessage.textContent = format(t.defeatText, { points: difference });
  } else {
    elements.finishTitle.textContent = t.draw;
    elements.finishMessage.textContent = t.drawText;
  }
  clearTimeout(toastTimer);
  elements.toast.classList.remove("show");
  stopGameplay();
  openModal(elements.finishModal);
}

function resetMatch() {
  rivalTurnToken += 1;
  state = createInitialState();
  closeModal(elements.resetModal);
  closeModal(elements.finishModal);
  gameplayStarted = false;
  startGameplay();
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function requestReset() {
  const hasProgress = state.rollCount > 0 || Object.keys(state.playerScores).length > 0;
  if (hasProgress) openModal(elements.resetModal);
  else resetMatch();
}

function openModal(modal) {
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  window.setTimeout(() => modal.querySelector("button")?.focus(), 0);
}

function closeModal(modal) {
  modal.hidden = true;
  if ([elements.rulesModal, elements.resetModal, elements.finishModal].every((item) => item.hidden)) document.body.style.overflow = "";
}

function attachEvents() {
  elements.rollButton.addEventListener("click", rollDice);
  elements.diceStage.addEventListener("click", (event) => {
    const die = event.target.closest(".die");
    if (die) toggleHold(Number(die.dataset.index));
  });
  elements.app.addEventListener("click", (event) => {
    const scoreCell = event.target.closest(".player-cell");
    if (scoreCell) scorePlayerCategory(scoreCell.dataset.category);
  });
  [elements.rulesButton, elements.footerRulesButton].forEach((button) => button.addEventListener("click", () => openModal(elements.rulesModal)));
  elements.newGameButton.addEventListener("click", requestReset);
  elements.confirmResetButton.addEventListener("click", resetMatch);
  elements.playAgainButton.addEventListener("click", resetMatch);
  document.querySelectorAll("[data-close-rules]").forEach((button) => button.addEventListener("click", () => closeModal(elements.rulesModal)));
  document.querySelectorAll("[data-close-reset]").forEach((button) => button.addEventListener("click", () => closeModal(elements.resetModal)));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (!elements.rulesModal.hidden) closeModal(elements.rulesModal);
      else if (!elements.resetModal.hidden) closeModal(elements.resetModal);
      return;
    }
    if ([elements.rulesModal, elements.resetModal, elements.finishModal].some((modal) => !modal.hidden) || state.paused) return;
    if (event.code === "Space") {
      event.preventDefault();
      rollDice();
    }
    if (/^[1-5]$/.test(event.key)) toggleHold(Number(event.key) - 1);
  });

  document.addEventListener("contextmenu", (event) => {
    if (event.target.closest("#gameApp")) event.preventDefault();
  });
}

function getSdkSource() {
  const hostname = window.location.hostname;
  if (!hostname || hostname === "localhost" || hostname === "127.0.0.1") return null;
  return hostname.includes("yandex") || hostname.includes("yastatic") ? "/sdk.js" : "https://sdk.games.s3.yandex.net/sdk.js";
}

async function loadYandexSdk() {
  if (window.YaGames) return window.YaGames;
  const source = getSdkSource();
  if (!source) return null;
  return new Promise((resolve) => {
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => resolve(null), 8000);
    script.src = source;
    script.async = true;
    script.onload = () => { clearTimeout(timeout); resolve(window.YaGames || null); };
    script.onerror = () => { clearTimeout(timeout); resolve(null); };
    document.head.append(script);
  });
}

async function initPlatform() {
  const YaGames = await loadYandexSdk();
  if (!YaGames) return;
  try {
    ysdk = await YaGames.init();
    const nextLang = ysdk?.environment?.i18n?.lang === "ru" ? "ru" : "en";
    if (nextLang !== lang) {
      lang = nextLang;
      t = translations[lang];
      render();
    }
    ysdk.on?.("game_api_pause", () => { state.paused = true; render(); });
    ysdk.on?.("game_api_resume", () => { state.paused = false; render(); });
    ysdk.features?.LoadingAPI?.ready();
    startGameplay();
  } catch {
    // The local game remains playable when the platform SDK is unavailable.
  }
}

attachEvents();
render();
initPlatform();
