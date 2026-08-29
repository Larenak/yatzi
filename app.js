import {
  CATEGORY_IDS,
  UPPER_IDS,
  calculateScore,
  getRequiredJokerCategory,
  getTotalScore,
  getUpperSubtotal,
  isJokerRoll,
  isYahtzee,
  simulateRivalTurn,
} from "./game.js?v=1.8.7";
import { isCyrillicFree, resolveGameLanguage } from "./i18n.js?v=1.8.7";
import {
  AD_BONUS_COINS,
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
} from "./monetization.js?v=1.8.7";

const PORTAL_CURRENCY_ICON_FALLBACK = "./currency-icon.svg";

const translations = {
  ru: {
    pageTitle: "Ятзи — быстрая дуэль",
    metaDescription: "Ятзи — быстрая дуэль в кости с виртуальным соперником.",
    mode: "БЫСТРАЯ ДУЭЛЬ",
    you: "ВЫ",
    youShort: "вы",
    categories: "КОМБИНАЦИИ",
    howToPlay: "Как играть?",
    settingsTitle: "Настройки",
    soundLabel: "Звук",
    soundEnabled: "Вкл.",
    soundDisabled: "Выкл.",
    soundOn: "Выключить звук",
    soundOff: "Включить звук",
    openSettings: "Открыть настройки",
    restartMatch: "Начать заново",
    duelScore: "Счёт дуэли",
    scoreBoard: "Таблица очков",
    upperSection: "Верхняя секция",
    lowerSection: "Комбинации",
    diceArea: "Игровые кости",
    rolls: "Броски",
    close: "Закрыть",
    paused: "Пауза",
    rulesEyebrow: "КАК ИГРАТЬ",
    rulesTitle: "Всего 3 простых шага",
    tutorialIntro: "Сыграй против соперника и набери больше очков.",
    step1Title: "Брось кубики",
    rule1: "Нажми большую кнопку «БРОСИТЬ». За ход можно бросить до 3 раз.",
    step2Title: "Оставь нужные",
    rule2: "Нажми на хороший кубик — он останется. Остальные можно бросить ещё раз.",
    step3Title: "Запиши очки",
    rule3: "Нажми на свободную клетку в колонке «ВЫ». После этого ходит соперник.",
    tutorialGoalTitle: "Как победить?",
    tutorialGoal: "Заполни 13 клеток и набери больше очков, чем соперник.",
    continueGame: "ПОНЯТНО — ИГРАТЬ!",
    shopTitle: "Пополнить монеты",
    watchAd: "Смотреть рекламу",
    orBuy: "ИЛИ КУПИТЬ",
    coinsShort: "монет",
    popular: "ВЫГОДНО",
    bestValue: "ЛУЧШАЯ ЦЕНА",
    shopNote: "Цены и валюта загружаются из Яндекс Игр.",
    coinsAdded: "+{coins} монет",
    adUnavailable: "Реклама сейчас недоступна. Попробуйте позже.",
    purchasesUnavailable: "Покупки доступны в Яндекс Играх.",
    purchaseComplete: "Покупка готова: +{coins} монет",
    purchasePending: "Платёж сохранён. Монеты начислятся при следующем запуске.",
    purchaseCancelled: "Покупка не завершена.",
    topUpCoins: "Пополнить монеты",
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
    extraRoll: "ЕЩЁ БРОСОК",
    extraRollProgress: "Платный бросок {current} из {total}",
    extraRollBought: "Дополнительный бросок: −{coins} монет",
    needCoinsForRoll: "Для броска нужно 50 монет",
    chooseScore: "ВЫБЕРИТЕ СЧЁТ",
    held: "СТОП",
    bonus: "БОНУС",
    playerScored: "{category}: +{score}",
    rivalScored: "{name}: {category} · +{score}",
    categoryHints: {
      ones: "Сумма всех единиц",
      twos: "Сумма всех двоек",
      threes: "Сумма всех троек",
      fours: "Сумма всех четвёрок",
      fives: "Сумма всех пятёрок",
      sixes: "Сумма всех шестёрок",
      threeKind: "Три одинаковых — сумма всех кубиков",
      fourKind: "Четыре одинаковых — сумма всех кубиков",
      fullHouse: "Три одинаковых и пара — 25 очков",
      smallStraight: "Четыре числа подряд — 30 очков",
      largeStraight: "Пять чисел подряд — 40 очков",
      yahtzee: "Пять одинаковых — 50 очков",
      chance: "Сумма всех пяти кубиков",
    },
    yahtzeeBonus: "Ятзи! Дополнительный бонус +100",
    victory: "Победа!",
    defeat: "Почти!",
    draw: "Ничья!",
    victoryRewardLabel: "+{coins} монет",
    defeatText: "Реванш? До победы не хватило {points}.",
    drawText: "Редкий случай: абсолютно равный счёт.",
    categoryNames: {
      ones: "Единицы", twos: "Двойки", threes: "Тройки", fours: "Четвёрки", fives: "Пятёрки", sixes: "Шестёрки",
      threeKind: "Три одинаковых", fourKind: "Четыре одинаковых", fullHouse: "Фул-хаус",
      smallStraight: "Малый стрит", largeStraight: "Большой стрит", yahtzee: "Ятзи", chance: "Шанс",
    },
  },
  en: {
    pageTitle: "Yatzy — quick duel",
    metaDescription: "Yatzy — a quick dice duel against a virtual rival.",
    mode: "QUICK DUEL",
    you: "YOU",
    youShort: "you",
    categories: "CATEGORIES",
    howToPlay: "How to play?",
    settingsTitle: "Settings",
    soundLabel: "Sound",
    soundEnabled: "On",
    soundDisabled: "Off",
    soundOn: "Mute sound",
    soundOff: "Turn sound on",
    openSettings: "Open settings",
    restartMatch: "Restart match",
    duelScore: "Duel score",
    scoreBoard: "Score board",
    upperSection: "Upper section",
    lowerSection: "Combinations",
    diceArea: "Game dice",
    rolls: "Rolls",
    close: "Close",
    paused: "Paused",
    rulesEyebrow: "HOW TO PLAY",
    rulesTitle: "Only 3 easy steps",
    tutorialIntro: "Play against a rival and score more points.",
    step1Title: "Roll the dice",
    rule1: "Press the big ROLL button. You can roll up to 3 times each turn.",
    step2Title: "Keep useful dice",
    rule2: "Tap a good die to keep it. Roll the other dice again.",
    step3Title: "Score points",
    rule3: "Tap an open cell in the YOU column. Then your rival takes a turn.",
    tutorialGoalTitle: "How do I win?",
    tutorialGoal: "Fill all 13 cells and score more points than your rival.",
    continueGame: "GOT IT — PLAY!",
    shopTitle: "Get more coins",
    watchAd: "Watch an ad",
    orBuy: "OR BUY",
    coinsShort: "coins",
    popular: "POPULAR",
    bestValue: "BEST VALUE",
    shopNote: "Prices and currency are loaded from Yandex Games.",
    coinsAdded: "+{coins} coins",
    adUnavailable: "No ad is available right now. Try again later.",
    purchasesUnavailable: "Purchases are available in Yandex Games.",
    purchaseComplete: "Purchase complete: +{coins} coins",
    purchasePending: "Payment saved. Coins will be credited on the next launch.",
    purchaseCancelled: "The purchase was not completed.",
    topUpCoins: "Get more coins",
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
    extraRoll: "EXTRA ROLL",
    extraRollProgress: "Paid roll {current} of {total}",
    extraRollBought: "Extra roll: −{coins} coins",
    needCoinsForRoll: "You need 50 coins for this roll",
    chooseScore: "CHOOSE SCORE",
    held: "HOLD",
    bonus: "BONUS",
    playerScored: "{category}: +{score}",
    rivalScored: "{name}: {category} · +{score}",
    categoryHints: {
      ones: "Total of all ones",
      twos: "Total of all twos",
      threes: "Total of all threes",
      fours: "Total of all fours",
      fives: "Total of all fives",
      sixes: "Total of all sixes",
      threeKind: "Three alike — total of all dice",
      fourKind: "Four alike — total of all dice",
      fullHouse: "Three alike and a pair — 25 points",
      smallStraight: "Four consecutive numbers — 30 points",
      largeStraight: "Five consecutive numbers — 40 points",
      yahtzee: "Five alike — 50 points",
      chance: "Total of all five dice",
    },
    yahtzeeBonus: "Yatzy! Extra +100 bonus",
    victory: "Victory!",
    defeat: "So close!",
    draw: "Draw!",
    victoryRewardLabel: "+{coins} coins",
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
  "Бублик", "Vovan", "Mira", "JackPot", "Кубыч", "Polina", "FoxFire", "Denis",
  "Зефирка", "RollKing", "Sonya", "Maxim", "PandaRoll", "КатяКэт", "Leo", "Sova",
  "Арбузик", "MoonDice", "Roma", "Anya", "BearRoll", "Морковка", "NickSix", "Alisa",
  "Кексик", "TurboCat", "Ilya", "Eva", "DiceNinja", "Тучка", "Gleb", "Vika",
  "Персик", "RollStar", "Margo", "Sema", "WhiteFox", "Кнопка", "Alex", "Lera",
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
  smallStraight: "SMALL",
  largeStraight: "LARGE",
  yahtzee: "YATZY",
  chance: "?",
};

const WALLET_STORAGE_KEY = "yatzy-wallet-v1";
const CLOUD_WALLET_KEY = "yatzyWallet";

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
  rollButton: document.querySelector("#rollButton"),
  rollLabel: document.querySelector("#rollLabel"),
  rollMarksPanel: document.querySelector("#rollMarks"),
  rollMarks: [...document.querySelectorAll("#rollMarks i")],
  extraRollPrice: document.querySelector("#extraRollPrice"),
  extraRollProgress: document.querySelector("#extraRollProgress"),
  settingsButton: document.querySelector("#settingsButton"),
  settingsPanel: document.querySelector("#settingsPanel"),
  walletControl: document.querySelector(".wallet-control"),
  coinBalance: document.querySelector("#coinBalance"),
  openShopButton: document.querySelector("#openShopButton"),
  footerRulesButton: document.querySelector("#footerRulesButton"),
  newGameButton: document.querySelector("#newGameButton"),
  rulesModal: document.querySelector("#rulesModal"),
  rulesRewardButton: document.querySelector("#rulesRewardButton"),
  shopModal: document.querySelector("#shopModal"),
  shopRewardButton: document.querySelector("#shopRewardButton"),
  purchaseGrid: document.querySelector("#purchaseGrid"),
  shopNote: document.querySelector("#shopNote"),
  resetModal: document.querySelector("#resetModal"),
  confirmResetButton: document.querySelector("#confirmResetButton"),
  finishModal: document.querySelector("#finishModal"),
  finishCard: document.querySelector("#finishCard"),
  finishTitle: document.querySelector("#finishTitle"),
  finishPlayerScore: document.querySelector("#finishPlayerScore"),
  finishRivalScore: document.querySelector("#finishRivalScore"),
  finishRivalName: document.querySelector("#finishRivalName"),
  finishMessage: document.querySelector("#finishMessage"),
  victoryReward: document.querySelector("#victoryReward"),
  victoryRewardAmount: document.querySelector("#victoryRewardAmount"),
  playAgainButton: document.querySelector("#playAgainButton"),
  soundButton: document.querySelector("#soundButton"),
  soundIcon: document.querySelector("#soundIcon"),
  pauseCover: document.querySelector("#pauseCover"),
  toast: document.querySelector("#toast"),
  categoryTooltip: document.querySelector("#categoryTooltip"),
};

let lang = getInitialLanguage();
let t = translations[lang];
let previousRival = "";
let rivalTurnToken = 0;
let toastTimer = null;
let ysdk = null;
let yandexPlayer = null;
let payments = null;
let platformReadyPromise = null;
let gameplayStarted = false;
let soundEnabled = getStoredSoundPreference();
let wallet = getStoredWallet();
let monetizationBusy = false;
let walletOperation = Promise.resolve();
let catalogLoaded = false;
const catalog = new Map();
const ALL_MODALS = [elements.rulesModal, elements.shopModal, elements.resetModal, elements.finishModal];

const audioEngine = {
  context: null,
  effectsGain: null,
  musicGain: null,
  musicTimer: null,
  musicStep: 0,
};

const MUSIC_SEQUENCE = [261.63, 329.63, 392, 329.63, 293.66, 349.23, 440, 349.23, 261.63, 392, 523.25, 392];

function getStoredSoundPreference() {
  try {
    return window.localStorage.getItem("yatzy-sound") !== "off";
  } catch {
    return true;
  }
}

function storeSoundPreference() {
  try {
    window.localStorage.setItem("yatzy-sound", soundEnabled ? "on" : "off");
  } catch {
    // The preference remains active for the current session when storage is unavailable.
  }
}

function getStoredWallet() {
  try {
    return normalizeWallet(JSON.parse(window.localStorage.getItem(WALLET_STORAGE_KEY)));
  } catch {
    return normalizeWallet(null);
  }
}

function storeWallet() {
  try {
    window.localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(wallet));
  } catch {
    // The wallet remains available for the current session when storage is unavailable.
  }
}

function setWallet(nextWallet, animate = false) {
  const previousCoins = wallet.coins;
  wallet = normalizeWallet(nextWallet);
  storeWallet();
  renderWallet();
  if (animate && wallet.coins > previousCoins) {
    elements.walletControl.classList.remove("coins-added");
    void elements.walletControl.offsetWidth;
    elements.walletControl.classList.add("coins-added");
    window.setTimeout(() => elements.walletControl.classList.remove("coins-added"), 680);
  }
}

function queueWalletMutation(mutator, { requireCloud = false, flush = true, animate = true } = {}) {
  const task = walletOperation.catch(() => undefined).then(async () => {
    const result = mutator(normalizeWallet(wallet));
    const nextWallet = normalizeWallet(result?.wallet || result);

    if (requireCloud) {
      if (!yandexPlayer) throw new Error("PLAYER_UNAVAILABLE");
      await yandexPlayer.setData({ [CLOUD_WALLET_KEY]: nextWallet }, flush);
      setWallet(nextWallet, animate);
    } else {
      setWallet(nextWallet, animate);
      if (yandexPlayer) {
        try {
          await yandexPlayer.setData({ [CLOUD_WALLET_KEY]: nextWallet }, flush);
        } catch {
          // Reward remains in the local safe storage if cloud sync is temporarily unavailable.
        }
      }
    }

    return result?.wallet ? { ...result, wallet: nextWallet } : nextWallet;
  });
  walletOperation = task.catch(() => undefined);
  return task;
}

function addCoins(amount) {
  return queueWalletMutation((currentWallet) => addWalletCoins(currentWallet, amount));
}

async function spendCoins(amount) {
  const result = await queueWalletMutation((currentWallet) => spendWalletCoins(currentWallet, amount), { animate: false });
  return result.spent;
}

async function registerCompletedPlayerTurn() {
  return queueWalletMutation((currentWallet) => completePlayerTurn(currentWallet), { animate: false });
}

function renderWallet() {
  elements.coinBalance.textContent = String(wallet.coins);
  elements.walletControl.setAttribute("aria-label", `${wallet.coins} ${t.coinsShort}`);
}

function updateSoundButton() {
  if (!elements.soundButton) return;
  elements.soundButton.classList.toggle("muted", !soundEnabled);
  elements.soundButton.setAttribute("aria-pressed", String(soundEnabled));
  elements.soundButton.setAttribute("aria-label", soundEnabled ? t.soundOn : t.soundOff);
  elements.soundIcon.textContent = soundEnabled ? t.soundEnabled : t.soundDisabled;
}

function createAudioEngine() {
  if (audioEngine.context) return audioEngine.context;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  const context = new AudioContextClass();
  const masterGain = context.createGain();
  const effectsGain = context.createGain();
  const musicGain = context.createGain();
  masterGain.gain.value = .76;
  effectsGain.gain.value = .54;
  musicGain.gain.value = .12;
  effectsGain.connect(masterGain);
  musicGain.connect(masterGain);
  masterGain.connect(context.destination);
  audioEngine.context = context;
  audioEngine.effectsGain = effectsGain;
  audioEngine.musicGain = musicGain;
  return context;
}

function scheduleTone(frequency, duration = .08, volume = .08, type = "sine", delay = 0, destination = audioEngine.effectsGain) {
  const context = audioEngine.context;
  if (!soundEnabled || !context || context.state !== "running" || !destination) return;
  const start = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(.0001, start);
  gain.gain.exponentialRampToValueAtTime(Math.max(.0002, volume), start + .012);
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(destination);
  oscillator.start(start);
  oscillator.stop(start + duration + .025);
}

function scheduleNoise(delay = 0, duration = .08, volume = .055, frequency = 900) {
  const context = audioEngine.context;
  if (!soundEnabled || !context || context.state !== "running") return;
  const frameCount = Math.max(1, Math.floor(context.sampleRate * duration));
  const buffer = context.createBuffer(1, frameCount, context.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let index = 0; index < frameCount; index += 1) channel[index] = Math.random() * 2 - 1;

  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  const start = context.currentTime + delay;
  source.buffer = buffer;
  filter.type = "bandpass";
  filter.frequency.value = frequency;
  filter.Q.value = .8;
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(audioEngine.effectsGain);
  source.start(start);
}

function playMusicStep() {
  if (!soundEnabled || !audioEngine.context || audioEngine.context.state !== "running") return;
  const note = MUSIC_SEQUENCE[audioEngine.musicStep % MUSIC_SEQUENCE.length];
  scheduleTone(note, .52, .075, "triangle", 0, audioEngine.musicGain);
  scheduleTone(note * 2, .22, .025, "sine", .08, audioEngine.musicGain);
  if (audioEngine.musicStep % 4 === 0) scheduleTone(note / 2, .72, .055, "sine", 0, audioEngine.musicGain);
  audioEngine.musicStep += 1;
}

function startBackgroundMusic() {
  if (!soundEnabled || !audioEngine.context || audioEngine.context.state !== "running" || audioEngine.musicTimer) return;
  playMusicStep();
  audioEngine.musicTimer = window.setInterval(playMusicStep, 620);
}

function stopBackgroundMusic() {
  if (!audioEngine.musicTimer) return;
  window.clearInterval(audioEngine.musicTimer);
  audioEngine.musicTimer = null;
}

async function ensureAudioReady() {
  if (!soundEnabled) return null;
  const context = createAudioEngine();
  if (!context) return null;
  try {
    if (context.state === "suspended") await context.resume();
    startBackgroundMusic();
    return context;
  } catch {
    return null;
  }
}

function playClickSound() {
  void ensureAudioReady().then((context) => {
    if (context) scheduleTone(610, .055, .075, "sine");
  });
}

function playHoldSound(held) {
  void ensureAudioReady().then((context) => {
    if (!context) return;
    scheduleTone(held ? 760 : 430, .11, .09, "triangle");
    scheduleTone(held ? 980 : 560, .08, .045, "sine", .045);
  });
}

function playDiceHoverSound(index) {
  void ensureAudioReady().then((context) => {
    if (!context) return;
    scheduleTone(315 + index * 20, .045, .018, "sine");
  });
}

function playDiceRollSound(duration, diceCount) {
  void ensureAudioReady().then((context) => {
    if (!context) return;
    const timeScale = Math.max(.72, duration / 610);
    const bursts = Math.max(4, diceCount + 1);
    for (let index = 0; index < bursts; index += 1) {
      scheduleNoise(index * .055 * timeScale, .065, .045 + index * .005, 720 + index * 120);
    }
    const impactDelay = duration * .54 / 1000;
    scheduleTone(128, .13, .13, "triangle", impactDelay);
    scheduleNoise(impactDelay, .11, .1, 420);
    scheduleTone(180, .09, .07, "sine", impactDelay + .15);
  });
}

function playScoreSound(side, score) {
  void ensureAudioReady().then((context) => {
    if (!context) return;
    const base = side === "player" ? 392 : 294;
    const direction = score > 0 ? 1 : .78;
    [1, 1.25, 1.5].forEach((step, index) => scheduleTone(base * step * direction, .25, .09 - index * .015, "triangle", index * .105));
  });
}

function playScoreImpactSound(side, score) {
  void ensureAudioReady().then((context) => {
    if (!context) return;
    const strength = Math.min(1, .38 + Math.max(0, score) / 55);
    const base = side === "player" ? 460 : 360;
    scheduleNoise(0, .13, .085 * strength, side === "player" ? 1150 : 850);
    scheduleTone(side === "player" ? 170 : 145, .16, .14 * strength, "triangle");
    const sparkleCount = 3 + Math.ceil(Math.max(0, score) / 12);
    for (let index = 0; index < sparkleCount; index += 1) {
      scheduleTone(base + index * 95, .19, .065 * strength, "sine", .035 + index * .045);
    }
  });
}

function playFinishSound(won) {
  void ensureAudioReady().then((context) => {
    if (!context) return;
    const notes = won ? [523.25, 659.25, 783.99, 1046.5] : [392, 349.23, 293.66];
    notes.forEach((note, index) => scheduleTone(note, .42, .11, "triangle", index * .13));
  });
}

function setSoundEnabled(enabled) {
  soundEnabled = enabled;
  storeSoundPreference();
  updateSoundButton();
  if (!enabled) {
    stopBackgroundMusic();
    void audioEngine.context?.suspend();
    return;
  }
  void ensureAudioReady().then((context) => {
    if (!context) return;
    scheduleTone(523.25, .12, .1, "triangle");
    scheduleTone(783.99, .18, .08, "triangle", .08);
  });
}

function createClickBurst(event, button) {
  const point = event.clientX || event.clientY
    ? { x: event.clientX, y: event.clientY }
    : (() => {
        const rect = button.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      })();
  const burst = document.createElement("span");
  burst.className = "click-burst";
  burst.style.left = `${point.x}px`;
  burst.style.top = `${point.y}px`;
  burst.append(...Array.from({ length: 6 }, () => document.createElement("i")));
  document.body.append(burst);
  window.setTimeout(() => burst.remove(), 560);
}

function showCategoryTooltip(icon) {
  if (!elements.categoryTooltip || !icon?.dataset.categoryHint) return;
  elements.categoryTooltip.textContent = icon.dataset.categoryHint;
  elements.categoryTooltip.hidden = false;
  const iconRect = icon.getBoundingClientRect();
  const tooltipRect = elements.categoryTooltip.getBoundingClientRect();
  const left = Math.min(
    window.innerWidth - tooltipRect.width - 8,
    Math.max(8, iconRect.left + iconRect.width / 2 - tooltipRect.width / 2),
  );
  let top = iconRect.top - tooltipRect.height - 10;
  if (top < 8) top = iconRect.bottom + 10;
  elements.categoryTooltip.style.left = `${left}px`;
  elements.categoryTooltip.style.top = `${top}px`;
}

function hideCategoryTooltip() {
  if (elements.categoryTooltip) elements.categoryTooltip.hidden = true;
}

function createScoreStarBurst(targetCell, score, side) {
  const rect = targetCell.getBoundingClientRect();
  const points = Math.max(0, Math.min(50, score));
  const starCount = 6 + Math.round(points / 3);
  const radius = 38 + points * 1.12;
  const burst = document.createElement("span");
  burst.className = `score-star-burst ${side}-burst`;
  burst.style.left = `${rect.left + rect.width / 2}px`;
  burst.style.top = `${rect.top + rect.height / 2}px`;

  for (let index = 0; index < starCount; index += 1) {
    const angle = (Math.PI * 2 * index) / starCount + (Math.random() - .5) * .38;
    const distance = radius * (.58 + Math.random() * .52);
    const star = document.createElement("i");
    star.textContent = index % 3 === 0 ? "★" : "✦";
    star.style.setProperty("--star-x", `${Math.cos(angle) * distance}px`);
    star.style.setProperty("--star-y", `${Math.sin(angle) * distance}px`);
    star.style.setProperty("--star-size", `${8 + Math.random() * 8 + points * .055}px`);
    star.style.setProperty("--star-rotate", `${180 + Math.random() * 420}deg`);
    star.style.setProperty("--star-delay", `${Math.random() * 80}ms`);
    burst.append(star);
  }

  const value = document.createElement("strong");
  value.textContent = `+${score}`;
  burst.append(value);
  document.body.append(burst);
  playScoreImpactSound(side, score);
  window.setTimeout(() => burst.remove(), 980);
}

let state = createInitialState();

function createInitialState() {
  const rivalNick = pickRivalName();
  previousRival = rivalNick;
  return {
    dice: [1, 2, 3, 4, 5],
    held: [false, false, false, false, false],
    rollCount: 0,
    paidRollCount: 0,
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
    victoryRewardGranted: false,
  };
}

function pickRivalName() {
  const languageNames = lang === "en" ? RIVAL_NAMES.filter(isCyrillicFree) : RIVAL_NAMES;
  const choices = languageNames.filter((name) => name !== previousRival);
  return choices[Math.floor(Math.random() * choices.length)];
}

function getInitialLanguage() {
  return resolveGameLanguage(navigator.language);
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
  elements.app.classList.add("roll-energy");
  playDiceRollSound(duration, animatedDice.length);
  animatedDice.forEach((die) => {
    const index = Number(die.dataset.index);
    die.classList.add("throwing");
    die.style.setProperty("--throw-x", `${(index - 2) * 11}px`);
    die.style.setProperty("--throw-delay", `${index * 38}ms`);
    die.style.setProperty("--throw-duration", `${duration}ms`);
  });

  const throwStartedAt = performance.now();
  const settledDice = new Set();
  const faceTicker = window.setInterval(() => {
    const elapsed = performance.now() - throwStartedAt;
    animatedDice.forEach((die) => {
      const index = Number(die.dataset.index);
      const revealAt = duration * .78 + index * 38;
      if (elapsed >= revealAt) {
        if (!settledDice.has(index)) {
          paintDieElement(die, finalDice[index]);
          settledDice.add(index);
        }
      } else {
        paintDieElement(die, randomDie());
      }
    });
  }, 68);

  await wait(duration + 175);
  window.clearInterval(faceTicker);
  state.dice = [...finalDice];
  state.rolling = false;
  elements.app.classList.remove("roll-energy");
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

  const effectClass = side === "player" ? "player-score-effect" : "rival-score-effect";
  elements.app.classList.add(effectClass);
  playScoreSound(side, categoryScore);
  targetCell.textContent = "0";
  const numberAnimation = animateNumber(targetCell, 0, categoryScore, 500);
  const totalAnimation = animateNumber(totalElement, totalBefore, totalAfter, 500);
  await Promise.all([flyDiceToCell(targetCell), numberAnimation, totalAnimation]);
  createScoreStarBurst(targetCell, categoryScore, side);
  targetCell.classList.add("score-pop");
  await wait(120);
  targetCell.classList.remove("score-pop");
  elements.app.classList.remove(effectClass);
}

function applyTranslations() {
  document.documentElement.lang = lang;
  document.title = t.pageTitle;
  document.querySelector('meta[name="description"]')?.setAttribute("content", t.metaDescription);
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const translation = t[node.dataset.i18n];
    if (typeof translation === "string") node.textContent = translation;
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
    const translation = t[node.dataset.i18nAriaLabel];
    if (typeof translation === "string") node.setAttribute("aria-label", translation);
  });
  elements.settingsButton.setAttribute("aria-label", t.openSettings);
  elements.newGameButton.setAttribute("aria-label", t.restartMatch);
  elements.openShopButton.setAttribute("aria-label", t.topUpCoins);
  elements.victoryReward.setAttribute("aria-label", format(t.victoryRewardLabel, { coins: VICTORY_REWARD_COINS }));
  elements.victoryRewardAmount.textContent = `+${VICTORY_REWARD_COINS}`;
  updateSoundButton();
  renderWallet();
}

function setSettingsOpen(open) {
  elements.settingsPanel.hidden = !open;
  elements.settingsButton.classList.toggle("active", open);
  elements.settingsButton.setAttribute("aria-expanded", String(open));
}

function getRound() {
  return Math.min(Object.keys(state.rivalScores).length + 1, 13);
}

function getPlayerPotential(categoryId) {
  return calculateScore(categoryId, state.dice, { joker: isJokerRoll(state.dice, state.playerScores) });
}

function isExtraRollAvailable() {
  return state.rollCount >= 3 && state.paidRollCount < MAX_PAID_ROLLS && !state.rivalThinking;
}

function canAdjustHeldDice() {
  return state.rollCount > 0 && (state.rollCount < 3 || isExtraRollAvailable());
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
  } else if (categoryId === "fullHouse") {
    icon.className = "category-icon house-icon";
    icon.innerHTML = `
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path class="house-roof" d="M5 23.5 24 6.5l19 17-4.5 5L24 15.5 9.5 28.5z" />
        <path class="house-body" d="M11.5 24.5 24 13.5l12.5 11v16H11.5z" />
        <rect class="house-door" x="20" y="27" width="8" height="13.5" rx="1.8" />
      </svg>`;
  } else {
    icon.className = `category-icon${["smallStraight", "largeStraight", "yahtzee"].includes(categoryId) ? " word-icon" : ""}`;
    icon.textContent = LOWER_ICONS[categoryId];
  }
  icon.dataset.categoryHint = t.categoryHints[categoryId];
  icon.tabIndex = 0;
  icon.setAttribute("aria-label", `${t.categoryNames[categoryId]}. ${t.categoryHints[categoryId]}`);
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

  const playerCell = document.createElement("button");
  playerCell.type = "button";
  playerCell.className = "score-cell player-cell";
  playerCell.dataset.category = categoryId;
  playerCell.disabled = !available || state.rolling || state.paused;
  if (playerScored) playerCell.classList.add("scored");
  else if (available) playerCell.classList.add("available");
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
  if (state.rollCount > 0) die.classList.add("has-value");
  if (state.held[index]) die.classList.add("held");
  if (state.rivalThinking && state.held[index]) die.classList.add("rival-held");
  if (state.rolling && !state.held[index]) die.classList.add("rolling");
  die.disabled = !canAdjustHeldDice() || state.rolling || state.scoring || state.rivalThinking || state.paused;
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
  const extraRollAvailable = isExtraRollAvailable();
  if (state.rivalThinking) {
    elements.rollLabel.textContent = "…";
  } else if (state.rollCount === 0) {
    elements.rollLabel.textContent = t.roll;
  } else if (state.rollCount < 3) {
    elements.rollLabel.textContent = t.reroll;
  } else if (extraRollAvailable) {
    elements.rollLabel.textContent = t.extraRoll;
  } else {
    elements.rollLabel.textContent = t.chooseScore;
  }

  const canRoll = state.rollCount < 3 || extraRollAvailable;
  elements.rollButton.disabled = !canRoll || state.rolling || state.scoring || state.rivalThinking || state.paused;
  elements.rollButton.classList.toggle("paid-roll-ready", extraRollAvailable);
  elements.rollButton.classList.toggle("needs-coins", extraRollAvailable && wallet.coins < EXTRA_ROLL_COST);
  elements.newGameButton.disabled = state.rolling || state.scoring || state.rivalThinking || state.paused;
  elements.openShopButton.disabled = state.paused || monetizationBusy;
  elements.rollMarksPanel.hidden = extraRollAvailable;
  elements.extraRollPrice.hidden = !extraRollAvailable;
  elements.extraRollPrice.setAttribute("aria-label", format(t.extraRollProgress, { current: state.paidRollCount + 1, total: MAX_PAID_ROLLS }));
  elements.extraRollProgress.textContent = `${state.paidRollCount + 1}/${MAX_PAID_ROLLS}`;
  elements.rollMarks.forEach((mark, index) => {
    mark.classList.toggle("used", index < Math.min(state.rollCount, 3));
    mark.classList.toggle("current", index === state.rollCount && state.rollCount < 3 && !state.rivalThinking);
  });
}

function render() {
  applyTranslations();
  renderHeader();
  renderScorecard();
  renderDice();
  renderControls();
  renderWallet();
  elements.pauseCover.hidden = !state.paused;
}

function showToast(message) {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  toastTimer = window.setTimeout(() => elements.toast.classList.remove("show"), 2100);
}

function setMonetizationBusy(busy) {
  monetizationBusy = busy;
  elements.rulesRewardButton.disabled = busy;
  elements.shopRewardButton.disabled = busy;
  elements.purchaseGrid.querySelectorAll(".purchase-card").forEach((button) => {
    button.disabled = busy;
  });
  renderControls();
}

function getPortalCurrencyIcon(product) {
  if (typeof product?.getPriceCurrencyImage === "function") {
    for (const size of ["svg", "small"]) {
      try {
        const imageUrl = product.getPriceCurrencyImage(size);
        if (imageUrl) return imageUrl.startsWith("//") ? `https:${imageUrl}` : imageUrl;
      } catch {
        // Try the next supported format before falling back to the Yandex asset.
      }
    }
  }
  return PORTAL_CURRENCY_ICON_FALLBACK;
}

function renderPurchaseCatalog() {
  elements.purchaseGrid.querySelectorAll(".purchase-card").forEach((button) => {
    const productConfig = getCoinProduct(button.dataset.productId);
    const product = catalog.get(button.dataset.productId);
    const price = button.querySelector("[data-price]");
    const currencyImage = button.querySelector("[data-currency-image]");

    if (catalogLoaded) button.hidden = !product;
    else button.hidden = false;

    const priceValue = product?.priceValue || productConfig?.fallbackPriceValue || "—";
    const currencyCode = product?.priceCurrencyCode || "YAN";
    price.textContent = priceValue;
    currencyImage.src = getPortalCurrencyIcon(product);
    currencyImage.alt = currencyCode;
    currencyImage.hidden = false;
    button.disabled = monetizationBusy;
    button.setAttribute("aria-label", `${product?.title || `${productConfig?.coins || ""} ${t.coinsShort}`}. ${product?.price || `${priceValue} ${currencyCode}`}`);
  });

  const hasVisibleProducts = [...elements.purchaseGrid.querySelectorAll(".purchase-card")].some((button) => !button.hidden);
  elements.purchaseGrid.hidden = catalogLoaded && !hasVisibleProducts;
  elements.shopNote.textContent = catalogLoaded && !hasVisibleProducts ? t.purchasesUnavailable : t.shopNote;
}

async function initializePlayerWallet() {
  try {
    yandexPlayer = await ysdk.getPlayer();
    const data = await yandexPlayer.getData([CLOUD_WALLET_KEY]);
    const cloudWallet = data?.[CLOUD_WALLET_KEY];
    if (cloudWallet && typeof cloudWallet === "object") {
      setWallet(cloudWallet);
    } else {
      await yandexPlayer.setData({ [CLOUD_WALLET_KEY]: wallet }, true);
    }
  } catch {
    yandexPlayer = null;
  }
}

async function processPurchase(purchase) {
  const productConfig = getCoinProduct(purchase?.productID);
  const purchaseToken = purchase?.purchaseToken;
  if (!productConfig || !purchaseToken || !payments) return null;

  if (!wallet.processedPurchaseTokens.includes(purchaseToken)) {
    await queueWalletMutation((currentWallet) => {
      const rewardedWallet = addWalletCoins(currentWallet, productConfig.coins);
      return recordProcessedPurchase(rewardedWallet, purchaseToken);
    }, { requireCloud: true, flush: true });
  }

  await payments.consumePurchase(purchaseToken);
  return productConfig;
}

async function initializePayments() {
  try {
    payments = await ysdk.getPayments();
    const products = await payments.getCatalog();
    products.forEach((product) => catalog.set(product.id, product));
    catalogLoaded = true;
    renderPurchaseCatalog();
  } catch {
    payments = null;
    catalogLoaded = true;
    renderPurchaseCatalog();
    return;
  }

  try {
    const pendingPurchases = await payments.getPurchases();
    for (const purchase of pendingPurchases) {
      if (!getCoinProduct(purchase.productID)) continue;
      try {
        await processPurchase(purchase);
      } catch {
        // The unconsumed purchase stays pending and will be retried on the next launch.
      }
    }
  } catch {
    // Pending purchases will be checked again on the next launch.
  }
}

async function initializeMonetization() {
  await initializePlayerWallet();
  await initializePayments();
}

async function purchaseCoins(productId) {
  if (monetizationBusy) return;
  await platformReadyPromise;
  const product = catalog.get(productId);
  if (!payments || !product) {
    showToast(t.purchasesUnavailable);
    return;
  }

  setMonetizationBusy(true);
  let purchase = null;
  try {
    purchase = await payments.purchase({ id: productId });
    const productConfig = await processPurchase(purchase);
    if (productConfig) showToast(format(t.purchaseComplete, { coins: productConfig.coins }));
  } catch {
    showToast(purchase ? t.purchasePending : t.purchaseCancelled);
  } finally {
    setMonetizationBusy(false);
  }
}

async function showRewardedAd() {
  if (monetizationBusy) return false;
  setMonetizationBusy(true);
  stopGameplay();
  state.paused = true;
  render();
  await platformReadyPromise;
  if (!ysdk?.adv?.showRewardedVideo) {
    state.paused = false;
    render();
    setMonetizationBusy(false);
    if (ALL_MODALS.every((modal) => modal.hidden)) startGameplay();
    showToast(t.adUnavailable);
    return false;
  }

  return new Promise((resolve) => {
    let completed = false;
    let rewarded = false;
    let rewardTask = Promise.resolve();

    const finish = async () => {
      if (completed) return;
      completed = true;
      await rewardTask;
      state.paused = false;
      render();
      setMonetizationBusy(false);
      if (ALL_MODALS.every((modal) => modal.hidden)) startGameplay();
      if (rewarded) showToast(format(t.coinsAdded, { coins: AD_BONUS_COINS }));
      resolve(rewarded);
    };

    try {
      ysdk.adv.showRewardedVideo({
        callbacks: {
          onOpen: () => {
            stopBackgroundMusic();
            void audioEngine.context?.suspend();
          },
          onRewarded: () => {
            if (rewarded) return;
            rewarded = true;
            rewardTask = addCoins(AD_BONUS_COINS);
          },
          onClose: () => { void finish(); },
          onError: () => { void finish(); },
        },
      });
    } catch {
      void finish();
    }
  });
}

async function showCompensatedInterstitial() {
  if (monetizationBusy) return false;
  setMonetizationBusy(true);
  stopGameplay();
  state.paused = true;
  render();
  await platformReadyPromise;
  if (!ysdk?.adv?.showFullscreenAdv) {
    state.paused = false;
    render();
    setMonetizationBusy(false);
    if (ALL_MODALS.every((modal) => modal.hidden)) startGameplay();
    showToast(t.adUnavailable);
    return false;
  }

  return new Promise((resolve) => {
    let completed = false;

    const finish = async (wasShown) => {
      if (completed) return;
      completed = true;
      const bonus = getInterstitialBonus(wasShown);
      if (bonus) await addCoins(bonus);
      state.paused = false;
      render();
      setMonetizationBusy(false);
      if (ALL_MODALS.every((modal) => modal.hidden)) startGameplay();
      if (bonus) showToast(format(t.coinsAdded, { coins: bonus }));
      resolve(Boolean(wasShown));
    };

    try {
      ysdk.adv.showFullscreenAdv({
        callbacks: {
          onOpen: () => {
            stopBackgroundMusic();
            void audioEngine.context?.suspend();
          },
          onClose: (wasShown) => { void finish(wasShown === true); },
          onError: () => { void finish(false); },
        },
      });
    } catch {
      void finish(false);
    }
  });
}

async function startWithMandatoryInterstitial() {
  closeModal(elements.rulesModal);
  await showCompensatedInterstitial();
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
  const paidRoll = state.rollCount >= 3;
  if ((paidRoll && !isExtraRollAvailable()) || state.rolling || state.scoring || state.rivalThinking || state.paused) return;

  if (paidRoll && wallet.coins < EXTRA_ROLL_COST) {
    renderPurchaseCatalog();
    openModal(elements.shopModal);
    showToast(t.needCoinsForRoll);
    return;
  }

  if (paidRoll) {
    state.rolling = true;
    render();
    const spent = await spendCoins(EXTRA_ROLL_COST);
    if (!spent) {
      state.rolling = false;
      render();
      return;
    }
    state.paidRollCount += 1;
    state.rolling = false;
    showToast(format(t.extraRollBought, { coins: EXTRA_ROLL_COST }));
  }

  startGameplay();
  const heldDice = [...state.held];
  const finalDice = state.dice.map((value, index) => heldDice[index] ? value : randomDie());
  state.rollCount += 1;
  await performDiceThrow(finalDice, heldDice);
}

function toggleHold(index) {
  if (!canAdjustHeldDice() || state.rolling || state.scoring || state.rivalThinking || state.paused) return;
  state.held[index] = !state.held[index];
  playHoldSound(state.held[index]);
  render();
  const toggledDie = elements.diceStage.querySelector(`.die[data-index="${index}"]`);
  toggledDie?.classList.add("die-tap-pulse");
  window.setTimeout(() => toggledDie?.classList.remove("die-tap-pulse"), 280);
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

  const turnProgress = await registerCompletedPlayerTurn();
  if (turnProgress.adDue) await showCompensatedInterstitial();

  const token = ++rivalTurnToken;
  await wait(260);
  await playRivalTurn(token);
}

async function showRivalHoldDecision(heldDice) {
  state.held = [...heldDice];
  render();
  const heldIndexes = heldDice.map((held, index) => held ? index : -1).filter((index) => index >= 0);
  if (heldIndexes.length) playHoldSound(true);
  heldIndexes.forEach((dieIndex, order) => {
    const die = elements.diceStage.querySelector(`.die[data-index="${dieIndex}"]`);
    if (!die) return;
    die.style.animationDelay = `${order * 85}ms`;
    die.classList.add("die-tap-pulse");
  });
  await wait(540 + heldIndexes.length * 65);
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
  state.paidRollCount = 0;
  state.dice = [1, 2, 3, 4, 5];
  state.held = [false, false, false, false, false];
  render();
  await wait(170);

  for (let rollIndex = 0; rollIndex < 3; rollIndex += 1) {
    if (token !== rivalTurnToken) return;
    const roll = result.rolls[rollIndex];
    state.rollCount = rollIndex + 1;
    state.held = [...roll.held];
    await performDiceThrow(roll.dice, roll.held, 500);
    if (rollIndex === 2) await wait(1050);
    else {
      await wait(330);
      await showRivalHoldDecision(roll.nextHeld);
    }
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
  state.paidRollCount = 0;
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
  const playerWon = playerScore > rivalScore;
  elements.finishCard.classList.toggle("is-victory", playerWon);
  elements.victoryReward.hidden = !playerWon;
  elements.finishMessage.hidden = playerWon;
  if (playerWon) {
    elements.finishTitle.textContent = t.victory;
    if (!state.victoryRewardGranted) {
      state.victoryRewardGranted = true;
      void addCoins(VICTORY_REWARD_COINS);
    }
    elements.finishMessage.textContent = "";
  } else if (playerScore < rivalScore) {
    elements.finishTitle.textContent = t.defeat;
    elements.finishMessage.textContent = format(t.defeatText, { points: difference });
  } else {
    elements.finishTitle.textContent = t.draw;
    elements.finishMessage.textContent = t.drawText;
  }
  clearTimeout(toastTimer);
  elements.toast.classList.remove("show");
  playFinishSound(playerScore > rivalScore);
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
  openModal(elements.resetModal);
}

function openModal(modal) {
  stopGameplay();
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  window.setTimeout(() => (modal.querySelector("[data-autofocus]") || modal.querySelector("button"))?.focus(), 0);
}

function closeModal(modal) {
  modal.hidden = true;
  if (ALL_MODALS.every((item) => item.hidden)) {
    document.body.style.overflow = "";
    if (!state.paused) startGameplay();
  }
}

function attachEvents() {
  document.addEventListener("pointerdown", (event) => {
    const button = event.target.closest("button");
    if (!button || button.disabled) return;
    createClickBurst(event, button);
    playClickSound();
  }, { passive: true });

  document.addEventListener("click", (event) => {
    if (event.detail !== 0) return;
    const button = event.target.closest("button");
    if (!button || button.disabled) return;
    createClickBurst(event, button);
    playClickSound();
  });

  elements.app.addEventListener("pointerover", (event) => {
    const icon = event.target.closest(".category-icon[data-category-hint]");
    if (icon) showCategoryTooltip(icon);

    const die = event.target.closest(".die:not(.held):not(:disabled)");
    if (die && event.pointerType === "mouse" && !die.contains(event.relatedTarget)) {
      playDiceHoverSound(Number(die.dataset.index));
    }
  });
  elements.app.addEventListener("pointerout", (event) => {
    const icon = event.target.closest(".category-icon[data-category-hint]");
    if (icon && !icon.contains(event.relatedTarget)) hideCategoryTooltip();
  });
  elements.app.addEventListener("focusin", (event) => {
    const icon = event.target.closest(".category-icon[data-category-hint]");
    if (icon) showCategoryTooltip(icon);
  });
  elements.app.addEventListener("focusout", (event) => {
    if (event.target.closest(".category-icon[data-category-hint]")) hideCategoryTooltip();
  });
  window.addEventListener("scroll", hideCategoryTooltip, { passive: true });
  window.addEventListener("resize", hideCategoryTooltip, { passive: true });

  elements.rollButton.addEventListener("click", rollDice);
  elements.diceStage.addEventListener("click", (event) => {
    const die = event.target.closest(".die");
    if (die) toggleHold(Number(die.dataset.index));
  });
  elements.app.addEventListener("click", (event) => {
    const scoreCell = event.target.closest(".player-cell");
    if (scoreCell) scorePlayerCategory(scoreCell.dataset.category);
  });
  elements.settingsButton.addEventListener("click", () => setSettingsOpen(elements.settingsPanel.hidden));
  elements.openShopButton.addEventListener("click", () => {
    renderPurchaseCatalog();
    openModal(elements.shopModal);
  });
  elements.footerRulesButton.addEventListener("click", () => openModal(elements.rulesModal));
  elements.rulesRewardButton.addEventListener("click", () => { void startWithMandatoryInterstitial(); });
  elements.shopRewardButton.addEventListener("click", () => { void showRewardedAd(); });
  elements.purchaseGrid.addEventListener("click", (event) => {
    const purchaseButton = event.target.closest(".purchase-card[data-product-id]");
    if (purchaseButton) void purchaseCoins(purchaseButton.dataset.productId);
  });
  elements.newGameButton.addEventListener("click", requestReset);
  elements.confirmResetButton.addEventListener("click", resetMatch);
  elements.playAgainButton.addEventListener("click", resetMatch);
  elements.soundButton.addEventListener("click", () => setSoundEnabled(!soundEnabled));
  document.addEventListener("pointerdown", (event) => {
    if (!event.target.closest(".settings-control")) setSettingsOpen(false);
  }, { passive: true });
  document.querySelectorAll("[data-close-shop]").forEach((button) => button.addEventListener("click", () => closeModal(elements.shopModal)));
  document.querySelectorAll("[data-close-reset]").forEach((button) => button.addEventListener("click", () => closeModal(elements.resetModal)));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (!elements.settingsPanel.hidden) setSettingsOpen(false);
      else if (!elements.shopModal.hidden) closeModal(elements.shopModal);
      else if (!elements.resetModal.hidden) closeModal(elements.resetModal);
      return;
    }
    if (ALL_MODALS.some((modal) => !modal.hidden) || state.paused) return;
    if (event.code === "Space") {
      event.preventDefault();
      rollDice();
    }
    if (/^[1-5]$/.test(event.key)) toggleHold(Number(event.key) - 1);
  });

  document.addEventListener("contextmenu", (event) => {
    if (event.target.closest("#gameApp")) event.preventDefault();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopBackgroundMusic();
      void audioEngine.context?.suspend();
    } else if (soundEnabled && audioEngine.context) {
      void ensureAudioReady();
    }
  });
}

function getSdkSource() {
  const hostname = window.location.hostname;
  if (!hostname || hostname === "localhost" || hostname === "127.0.0.1") return null;
  return "/sdk.js";
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
    const nextLang = resolveGameLanguage(ysdk?.environment?.i18n?.lang);
    if (nextLang !== lang) {
      lang = nextLang;
      t = translations[lang];
      if (lang === "en" && !isCyrillicFree(state.rivalNick)) {
        previousRival = state.rivalNick;
        state.rivalNick = pickRivalName();
        previousRival = state.rivalNick;
      }
      render();
    }
    ysdk.on?.("game_api_pause", () => {
      state.paused = true;
      stopBackgroundMusic();
      void audioEngine.context?.suspend();
      render();
    });
    ysdk.on?.("game_api_resume", () => {
      state.paused = false;
      if (soundEnabled && audioEngine.context) void ensureAudioReady();
      render();
    });
    ysdk.features?.LoadingAPI?.ready();
    if (gameplayStarted) ysdk.features?.GameplayAPI?.start();
    else if (ALL_MODALS.every((modal) => modal.hidden)) startGameplay();
    await initializeMonetization();
  } catch {
    // The local game remains playable when the platform SDK is unavailable.
  }
}

attachEvents();
render();
renderPurchaseCatalog();
openModal(elements.rulesModal);
platformReadyPromise = initPlatform();
