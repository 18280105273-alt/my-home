(() => {
  "use strict";

  const canvas = document.getElementById("gameCanvas");
  const arena = document.getElementById("arena");
  const ctx = canvas.getContext("2d");

  const startOverlay = document.getElementById("startOverlay");
  const buffOverlay = document.getElementById("buffOverlay");
  const pauseOverlay = document.getElementById("pauseOverlay");
  const gameOverOverlay = document.getElementById("gameOverOverlay");
  const buffSummary = document.getElementById("buffSummary");
  const buffCards = document.getElementById("buffCards");
  const startButton = document.getElementById("startButton");
  const resumeButton = document.getElementById("resumeButton");
  const restartButton = document.getElementById("restartButton");
  const restartFromPause = document.getElementById("restartFromPause");
  const pauseButton = document.getElementById("pauseButton");
  const specialButton = document.getElementById("specialButton");
  const waveValue = document.getElementById("waveValue");
  const scoreValue = document.getElementById("scoreValue");
  const healthText = document.getElementById("healthText");
  const healthBar = document.getElementById("healthBar");
  const energyText = document.getElementById("energyText");
  const energyBar = document.getElementById("energyBar");
  const waveLabel = document.getElementById("waveLabel");
  const waveTimer = document.getElementById("waveTimer");
  const difficultyLabel = document.getElementById("difficultyLabel");
  const buffCountLabel = document.getElementById("buffCountLabel");
  const reloadText = document.getElementById("reloadText");
  const ammoPips = document.getElementById("ammoPips");
  const combatMessage = document.getElementById("combatMessage");
  const finalScore = document.getElementById("finalScore");
  const finalWave = document.getElementById("finalWave");
  const finalKills = document.getElementById("finalKills");
  const movePad = document.getElementById("movePad");
  const moveKnob = document.getElementById("moveKnob");
  const aimPad = document.getElementById("aimPad");
  const aimKnob = document.getElementById("aimKnob");

  const WORLD = { width: 2400, height: 1600 };
  const COLORS = {
    ground: "#17201e",
    groundDeep: "#111918",
    grid: "rgba(162, 184, 169, 0.07)",
    player: "#4ca99f",
    playerLight: "#8bd8cb",
    playerDark: "#236861",
    scout: "#dd7843",
    gunner: "#c65246",
    heavy: "#c99a45",
    enemyDark: "#5a2925",
    steel: "#4c5854",
    steelLight: "#82908a",
    rubble: "#544e42",
    bullet: "#ffe07d",
  };

  const ENEMY_TYPES = {
    scout: {
      name: "侦察坦克",
      maxHealth: 42,
      speed: 162,
      radius: 20,
      damage: 9,
      fireDelay: 1.45,
      bulletSpeed: 540,
      desiredRange: 330,
      color: COLORS.scout,
      score: 120,
      shots: 1,
    },
    gunner: {
      name: "突击坦克",
      maxHealth: 72,
      speed: 112,
      radius: 23,
      damage: 13,
      fireDelay: 1.12,
      bulletSpeed: 500,
      desiredRange: 520,
      color: COLORS.gunner,
      score: 220,
      shots: 1,
    },
    heavy: {
      name: "重型坦克",
      maxHealth: 170,
      speed: 72,
      radius: 29,
      damage: 16,
      fireDelay: 1.72,
      bulletSpeed: 430,
      desiredRange: 430,
      color: COLORS.heavy,
      score: 520,
      shots: 3,
    },
  };

  const RARITY_LABELS = {
    standard: "标准",
    rare: "稀有",
    epic: "史诗",
  };

  const BUFFS = [
    {
      id: "armor-piercing",
      name: "穿甲弹芯",
      icon: "攻",
      rarity: "rare",
      description: "主炮炮弹伤害提升 18%。",
      apply() {
        player.damageMultiplier *= 1.18;
      },
    },
    {
      id: "autoloader",
      name: "速装机构",
      icon: "连",
      rarity: "rare",
      description: "射速提升 14%，自动装填时间减少 10%。",
      apply() {
        player.fireRateMultiplier *= 1.14;
        player.reloadMultiplier *= 0.9;
      },
    },
    {
      id: "composite-armor",
      name: "复合装甲",
      icon: "甲",
      rarity: "standard",
      description: "最大装甲增加 20，并立即修复 20 点装甲。",
      apply() {
        player.maxHealth += 20;
        player.health = Math.min(player.maxHealth, player.health + 20);
      },
    },
    {
      id: "turbo-engine",
      name: "涡轮增压",
      icon: "速",
      rarity: "standard",
      description: "坦克移动速度提升 10%。",
      apply() {
        player.speed *= 1.1;
      },
    },
    {
      id: "super-capacitor",
      name: "超导电容",
      icon: "能",
      rarity: "rare",
      description: "冲击波能量恢复速度提升 22%，并立即充满能量。",
      apply() {
        player.energyRegenMultiplier *= 1.22;
        player.energy = player.maxEnergy;
      },
    },
    {
      id: "recovery-armor",
      name: "回收装甲",
      icon: "愈",
      rarity: "epic",
      description: "每击毁一名敌军恢复 4 点装甲。",
      apply() {
        player.armorPerKill += 4;
      },
    },
    {
      id: "heavy-shell",
      name: "重型炮弹",
      icon: "炮",
      rarity: "rare",
      description: "炮弹体积增大，并获得额外 10% 伤害。",
      apply() {
        player.bulletRadiusBonus += 2;
        player.damageMultiplier *= 1.1;
      },
    },
    {
      id: "reactive-armor",
      name: "反应装甲",
      icon: "防",
      rarity: "epic",
      description: "受到的全部伤害降低 8%，最多降低 48%。",
      apply() {
        player.damageReduction = Math.min(0.48, player.damageReduction + 0.08);
      },
    },
    {
      id: "shock-amplifier",
      name: "冲击增幅器",
      icon: "震",
      rarity: "epic",
      description: "冲击波作用半径提升 14%，伤害提升 20%。",
      apply() {
        player.shockwaveRadiusMultiplier *= 1.14;
        player.shockwaveDamageMultiplier *= 1.2;
      },
    },
    {
      id: "field-maintenance",
      name: "战地维护",
      icon: "维",
      rarity: "standard",
      description: "每次区域肃清额外恢复 18 点装甲。",
      apply() {
        player.waveHealBonus += 18;
      },
    },
  ];

  const keys = new Set();
  const pointer = { x: 0, y: 0, worldX: 0, worldY: 0, active: false, down: false };
  const moveStick = { x: 0, y: 0, active: false };
  const aimStick = { x: 0, y: 0, active: false };
  const view = { width: 1, height: 1, scale: 1, dpr: 1 };
  const camera = { x: WORLD.width / 2, y: WORLD.height / 2, shakeX: 0, shakeY: 0, shake: 0 };

  let gameState = "menu";
  let player;
  let enemies = [];
  let bullets = [];
  let particles = [];
  let pickups = [];
  let obstacles = [];
  let scenery = [];
  let spawnQueue = [];
  let wave = 0;
  let score = 0;
  let kills = 0;
  let intermission = 2.8;
  let spawnClock = 0;
  let pendingBuffChoices = [];
  let messageTimer = 0;
  let lastTime = performance.now();
  let elapsed = 0;
  let audioContext = null;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function lerp(start, end, amount) {
    return start + (end - start) * amount;
  }

  function lerpAngle(start, end, amount) {
    let delta = ((end - start + Math.PI) % (Math.PI * 2)) - Math.PI;
    if (delta < -Math.PI) delta += Math.PI * 2;
    return start + delta * amount;
  }

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function randomRange(min, max) {
    return min + Math.random() * (max - min);
  }

  function formatScore(value) {
    return Math.max(0, Math.floor(value)).toString().padStart(6, "0");
  }

  function getDifficulty(level) {
    const safeLevel = Math.max(1, level);
    const step = safeLevel - 1;
    return {
      multiplier: 1 + step * 0.14,
      health: 1 + step * 0.16,
      speed: 1 + Math.min(0.55, step * 0.035),
      damage: 1 + step * 0.075,
      fireRate: 1 + Math.min(0.7, step * 0.045),
      eliteChance: Math.min(0.55, Math.max(0, (safeLevel - 2) * 0.055)),
      scoreBonus: step * 125,
    };
  }

  class Sound {
    ensure() {
      if (!audioContext) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) audioContext = new AudioContext();
      }
      if (audioContext && audioContext.state === "suspended") {
        audioContext.resume().catch(() => {});
      }
    }

    tone(frequency, duration, type = "sine", volume = 0.035, endFrequency = null) {
      if (!audioContext) return;
      const now = audioContext.currentTime;
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, now);
      if (endFrequency) {
        oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, endFrequency), now + duration);
      }
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(now);
      oscillator.stop(now + duration);
    }

    shot() {
      this.tone(150, 0.09, "square", 0.028, 70);
    }

    enemyShot() {
      this.tone(110, 0.08, "sawtooth", 0.018, 58);
    }

    hit() {
      this.tone(82, 0.12, "square", 0.025, 42);
    }

    explosion() {
      this.tone(65, 0.28, "sawtooth", 0.04, 28);
    }

    pickup() {
      this.tone(520, 0.1, "sine", 0.035, 880);
    }

    shockwave() {
      this.tone(180, 0.4, "sine", 0.055, 42);
    }

    wave() {
      this.tone(330, 0.16, "triangle", 0.035, 440);
      window.setTimeout(() => this.tone(440, 0.2, "triangle", 0.03, 660), 120);
    }
  }

  const sound = new Sound();

  function createArena() {
    obstacles = [];
    scenery = [];

    const borderBlocks = [
      { x: 110, y: 90, w: 150, h: 72, type: "wall" },
      { x: 420, y: 80, w: 90, h: 190, type: "wall" },
      { x: 680, y: 120, w: 220, h: 72, type: "wall" },
      { x: 1080, y: 80, w: 110, h: 210, type: "wall" },
      { x: 1450, y: 92, w: 180, h: 72, type: "wall" },
      { x: 1830, y: 90, w: 92, h: 220, type: "wall" },
      { x: 2120, y: 110, w: 170, h: 78, type: "wall" },
      { x: 94, y: 360, w: 90, h: 220, type: "wall" },
      { x: 335, y: 450, w: 210, h: 78, type: "wall" },
      { x: 1830, y: 420, w: 220, h: 78, type: "wall" },
      { x: 2200, y: 350, w: 100, h: 220, type: "wall" },
      { x: 120, y: 1120, w: 100, h: 210, type: "wall" },
      { x: 380, y: 1280, w: 220, h: 78, type: "wall" },
      { x: 1785, y: 1270, w: 220, h: 78, type: "wall" },
      { x: 2190, y: 1120, w: 100, h: 210, type: "wall" },
      { x: 92, y: 1420, w: 180, h: 78, type: "wall" },
      { x: 520, y: 1440, w: 100, h: 120, type: "wall" },
      { x: 850, y: 1400, w: 220, h: 78, type: "wall" },
      { x: 1320, y: 1440, w: 100, h: 120, type: "wall" },
      { x: 1590, y: 1400, w: 220, h: 78, type: "wall" },
      { x: 2100, y: 1420, w: 190, h: 78, type: "wall" },
    ];

    const centerBlocks = [
      { x: 650, y: 620, w: 210, h: 68, type: "concrete" },
      { x: 1010, y: 530, w: 78, h: 210, type: "concrete" },
      { x: 1340, y: 620, w: 210, h: 68, type: "concrete" },
      { x: 1080, y: 900, w: 230, h: 70, type: "concrete" },
      { x: 770, y: 930, w: 78, h: 210, type: "concrete" },
      { x: 1510, y: 930, w: 78, h: 210, type: "concrete" },
      { x: 950, y: 770, w: 78, h: 78, type: "concrete" },
      { x: 1370, y: 770, w: 78, h: 78, type: "concrete" },
    ];

    obstacles.push(...borderBlocks, ...centerBlocks);

    const randomBlocks = [
      { minX: 250, maxX: 560, minY: 260, maxY: 620 },
      { minX: 1820, maxX: 2140, minY: 260, maxY: 620 },
      { minX: 250, maxX: 580, minY: 960, maxY: 1270 },
      { minX: 1810, maxX: 2140, minY: 960, maxY: 1270 },
      { minX: 650, maxX: 900, minY: 250, maxY: 500 },
      { minX: 1500, maxX: 1780, minY: 270, maxY: 530 },
      { minX: 1600, maxX: 1880, minY: 1060, maxY: 1250 },
      { minX: 600, maxX: 880, minY: 1080, maxY: 1260 },
    ];

    randomBlocks.forEach((zone, index) => {
      const horizontal = index % 2 === 0;
      const w = horizontal ? randomRange(120, 200) : randomRange(64, 88);
      const h = horizontal ? randomRange(64, 88) : randomRange(120, 200);
      obstacles.push({
        x: randomRange(zone.minX, zone.maxX - w),
        y: randomRange(zone.minY, zone.maxY - h),
        w,
        h,
        type: index % 3 === 0 ? "concrete" : "wall",
      });
    });

    for (let i = 0; i < 76; i += 1) {
      scenery.push({
        x: randomRange(70, WORLD.width - 70),
        y: randomRange(70, WORLD.height - 70),
        radius: randomRange(2, 6),
        alpha: randomRange(0.06, 0.22),
        kind: i % 3,
      });
    }
  }

  function createPlayer() {
    return {
      x: WORLD.width / 2,
      y: WORLD.height / 2,
      radius: 23,
      bodyAngle: -Math.PI / 2,
      turretAngle: -Math.PI / 2,
      speed: 210,
      vx: 0,
      vy: 0,
      health: 100,
      maxHealth: 100,
      energy: 100,
      maxEnergy: 100,
      magazine: 8,
      magazineSize: 8,
      reloadTimer: 0,
      fireTimer: 0,
      fireDelay: 0.2,
      muzzleFlash: 0,
      overdrive: 0,
      invulnerable: 0,
      hitFlash: 0,
      damageMultiplier: 1,
      fireRateMultiplier: 1,
      reloadMultiplier: 1,
      energyRegenMultiplier: 1,
      bulletSpeedMultiplier: 1,
      bulletRadiusBonus: 0,
      armorPerKill: 0,
      damageReduction: 0,
      shockwaveRadiusMultiplier: 1,
      shockwaveDamageMultiplier: 1,
      waveHealBonus: 0,
      buffLevels: {},
      buffCount: 0,
    };
  }

  function createEnemy(typeName, x, y) {
    const type = ENEMY_TYPES[typeName];
    const difficulty = getDifficulty(wave);
    const angle = Math.atan2(player.y - y, player.x - x);
    const elite = Math.random() < difficulty.eliteChance;
    const eliteHealthMultiplier = elite ? 1.35 : 1;
    const maxHealth = Math.round(type.maxHealth * difficulty.health * eliteHealthMultiplier);
    const fireDelayMultiplier = (1 / difficulty.fireRate) * (elite ? 0.9 : 1);
    return {
      typeName,
      type,
      x,
      y,
      radius: type.radius,
      bodyAngle: angle,
      turretAngle: angle,
      health: maxHealth,
      maxHealth,
      fireTimer: randomRange(0.3, type.fireDelay * fireDelayMultiplier),
      fireDelayMultiplier,
      speedMultiplier: difficulty.speed * (elite ? 1.06 : 1),
      damageMultiplier: difficulty.damage * (elite ? 1.08 : 1),
      scoreMultiplier: elite ? 1.65 : 1,
      elite,
      muzzleFlash: 0,
      hitFlash: 0,
      strafeDirection: Math.random() > 0.5 ? 1 : -1,
      strafeTimer: randomRange(1.2, 2.8),
      spawnTimer: 0.75,
      turnAmount: 0,
    };
  }

  function resetGame() {
    createArena();
    player = createPlayer();
    enemies = [];
    bullets = [];
    particles = [];
    pickups = [];
    spawnQueue = [];
    wave = 0;
    score = 0;
    kills = 0;
    intermission = 3;
    pendingBuffChoices = [];
    spawnClock = 0;
    messageTimer = 0;
    elapsed = 0;
    camera.x = player.x;
    camera.y = player.y;
    camera.shake = 0;
    updateHud();
    updateAmmoPips();
    showMessage("阵地已部署", 1.8);
  }

  function beginGame() {
    sound.ensure();
    resetGame();
    gameState = "playing";
    startOverlay.classList.remove("visible");
    buffOverlay.classList.remove("visible");
    pauseOverlay.classList.remove("visible");
    gameOverOverlay.classList.remove("visible");
    sound.wave();
    lastTime = performance.now();
  }

  function pauseGame() {
    if (gameState !== "playing") return;
    gameState = "paused";
    pauseOverlay.classList.add("visible");
    pointer.down = false;
    keys.clear();
  }

  function resumeGame() {
    if (gameState !== "paused") return;
    sound.ensure();
    gameState = "playing";
    pauseOverlay.classList.remove("visible");
    lastTime = performance.now();
  }

  function endGame() {
    gameState = "gameover";
    pointer.down = false;
    finalScore.textContent = formatScore(score);
    finalWave.textContent = String(Math.max(1, wave));
    finalKills.textContent = String(kills);
    gameOverOverlay.classList.add("visible");
    sound.explosion();
  }

  function showMessage(text, duration = 1.4) {
    combatMessage.textContent = text;
    combatMessage.classList.add("visible");
    messageTimer = duration;
  }

  function updateMessage(dt) {
    if (messageTimer <= 0) return;
    messageTimer -= dt;
    if (messageTimer <= 0) combatMessage.classList.remove("visible");
  }

  function rollBuffs(count = 3) {
    const pool = [...BUFFS];
    const choices = [];
    const rarityWeights = { standard: 1, rare: 0.58, epic: 0.24 };

    while (pool.length && choices.length < count) {
      const totalWeight = pool.reduce(
        (sum, buff) => sum + rarityWeights[buff.rarity],
        0
      );
      let roll = Math.random() * totalWeight;
      let selectedIndex = 0;

      for (let index = 0; index < pool.length; index += 1) {
        roll -= rarityWeights[pool[index].rarity];
        if (roll <= 0) {
          selectedIndex = index;
          break;
        }
      }

      choices.push(pool.splice(selectedIndex, 1)[0]);
    }

    return choices;
  }

  function showBuffSelection() {
    gameState = "buff";
    pointer.down = false;
    keys.clear();
    pendingBuffChoices = rollBuffs(3);
    waveLabel.textContent = "区域肃清";
    waveTimer.textContent = "BUFF";
    buffSummary.textContent = `第 ${wave} 波已肃清，选择下一轮作战增益。`;
    buffCards.innerHTML = pendingBuffChoices
      .map(
        (buff, index) => `
          <button class="buff-card ${buff.rarity}" data-buff-id="${buff.id}" type="button">
            <span class="buff-card-top">
              <span class="buff-icon">${buff.icon}</span>
              <span class="buff-rarity">${RARITY_LABELS[buff.rarity]} ${String(index + 1).padStart(2, "0")}</span>
            </span>
            <span class="buff-name">${buff.name}</span>
            <span class="buff-description">${buff.description}</span>
          </button>
        `
      )
      .join("");
    buffOverlay.classList.add("visible");
  }

  function applyBuff(buffId) {
    const buff = BUFFS.find((candidate) => candidate.id === buffId);
    if (!buff || gameState !== "buff") return;

    buff.apply();
    player.buffLevels[buff.id] = (player.buffLevels[buff.id] || 0) + 1;
    player.buffCount += 1;
    buffOverlay.classList.remove("visible");
    gameState = "playing";
    intermission = 4;
    lastTime = performance.now();
    updateHud();
    updateAmmoPips();
    showMessage(`${buff.name} 已装备`, 1.8);
  }

  function resizeCanvas() {
    const rect = arena.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    view.width = Math.max(1, rect.width);
    view.height = Math.max(1, rect.height);
    view.dpr = dpr;
    canvas.width = Math.round(view.width * dpr);
    canvas.height = Math.round(view.height * dpr);
    view.scale = Math.max(view.width / 1500, view.height / 900);
    view.scale = clamp(view.scale, 0.34, 1.35);
  }

  function getCanvasPoint(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  function screenToWorld(screenX, screenY) {
    return {
      x: camera.x + (screenX - view.width / 2) / view.scale,
      y: camera.y + (screenY - view.height / 2) / view.scale,
    };
  }

  function worldToScreen(x, y) {
    return {
      x: (x - camera.x) * view.scale + view.width / 2,
      y: (y - camera.y) * view.scale + view.height / 2,
    };
  }

  function circleIntersectsRect(x, y, radius, rect) {
    const nearestX = clamp(x, rect.x, rect.x + rect.w);
    const nearestY = clamp(y, rect.y, rect.y + rect.h);
    const dx = x - nearestX;
    const dy = y - nearestY;
    return dx * dx + dy * dy < radius * radius;
  }

  function tankCollides(x, y, radius) {
    if (x - radius < 30 || y - radius < 30 || x + radius > WORLD.width - 30 || y + radius > WORLD.height - 30) {
      return true;
    }
    return obstacles.some((obstacle) => circleIntersectsRect(x, y, radius, obstacle));
  }

  function moveTank(tank, dx, dy) {
    const nextX = tank.x + dx;
    if (!tankCollides(nextX, tank.y, tank.radius)) tank.x = nextX;

    const nextY = tank.y + dy;
    if (!tankCollides(tank.x, nextY, tank.radius)) tank.y = nextY;
  }

  function lineIntersectsRect(x1, y1, x2, y2, rect, padding = 0) {
    const minX = rect.x - padding;
    const maxX = rect.x + rect.w + padding;
    const minY = rect.y - padding;
    const maxY = rect.y + rect.h + padding;
    let tMin = 0;
    let tMax = 1;
    const dx = x2 - x1;
    const dy = y2 - y1;

    const checks = [
      [-dx, x1 - minX],
      [dx, maxX - x1],
      [-dy, y1 - minY],
      [dy, maxY - y1],
    ];

    for (const [p, q] of checks) {
      if (Math.abs(p) < 0.00001) {
        if (q < 0) return false;
      } else {
        const ratio = q / p;
        if (p < 0) {
          if (ratio > tMax) return false;
          if (ratio > tMin) tMin = ratio;
        } else {
          if (ratio < tMin) return false;
          if (ratio < tMax) tMax = ratio;
        }
      }
    }
    return true;
  }

  function hasLineOfSight(from, to) {
    return !obstacles.some((obstacle) =>
      lineIntersectsRect(from.x, from.y, to.x, to.y, obstacle, 5)
    );
  }

  function findSpawnPoint() {
    for (let attempt = 0; attempt < 80; attempt += 1) {
      const angle = Math.random() * Math.PI * 2;
      const distanceFromPlayer = randomRange(780, 1040);
      const x = clamp(player.x + Math.cos(angle) * distanceFromPlayer, 100, WORLD.width - 100);
      const y = clamp(player.y + Math.sin(angle) * distanceFromPlayer, 100, WORLD.height - 100);
      if (!tankCollides(x, y, 34) && distance({ x, y }, player) > 650) {
        return { x, y };
      }
    }
    return { x: 140, y: 140 };
  }

  function startWave() {
    wave += 1;
    spawnQueue = [];
    const difficulty = getDifficulty(wave);
    const scoutCount = 2 + Math.floor(wave * 0.9);
    const gunnerCount = wave >= 2 ? 1 + Math.floor(wave * 0.5) : 0;
    const heavyCount = wave >= 4 ? 1 + Math.floor((wave - 4) / 3) : 0;

    for (let i = 0; i < scoutCount; i += 1) spawnQueue.push({ type: "scout", time: i * 0.24 });
    for (let i = 0; i < gunnerCount; i += 1) spawnQueue.push({ type: "gunner", time: 0.8 + i * 0.46 });
    for (let i = 0; i < heavyCount; i += 1) spawnQueue.push({ type: "heavy", time: 1.9 + i * 0.72 });

    spawnQueue.sort((a, b) => a.time - b.time);
    spawnClock = 0;
    waveLabel.textContent = `第 ${wave} 波`;
    waveTimer.textContent = String(spawnQueue.length).padStart(2, "0");
    difficultyLabel.textContent = `威胁 x${difficulty.multiplier.toFixed(1)}`;
    showMessage(`第 ${wave} 波 · 威胁 x${difficulty.multiplier.toFixed(1)}`, 1.8);
    sound.wave();
  }

  function spawnEnemy(typeName) {
    const spawn = findSpawnPoint();
    enemies.push(createEnemy(typeName, spawn.x, spawn.y));
    createRing(spawn.x, spawn.y, typeName === "heavy" ? 78 : 48, ENEMY_TYPES[typeName].color, 0.6);
  }

  function updateWave(dt) {
    if (intermission > 0) {
      intermission -= dt;
      waveLabel.textContent = "准备迎战";
      waveTimer.textContent = String(Math.max(1, Math.ceil(intermission)));
      if (intermission <= 0) startWave();
      return;
    }

    spawnClock += dt;
    while (spawnQueue.length && spawnQueue[0].time <= spawnClock) {
      const next = spawnQueue.shift();
      spawnEnemy(next.type);
    }

    waveTimer.textContent = String(spawnQueue.length + enemies.length).padStart(2, "0");

    if (!spawnQueue.length && !enemies.length) {
      const difficulty = getDifficulty(wave);
      score += 300 + wave * 75 + difficulty.scoreBonus;
      player.health = Math.min(player.maxHealth, player.health + 22 + player.waveHealBonus);
      player.energy = player.maxEnergy;
      showBuffSelection();
    }
  }

  function updatePlayer(dt) {
    if (!player) return;

    let moveX = moveStick.x;
    let moveY = moveStick.y;

    if (keys.has("KeyW") || keys.has("ArrowUp")) moveY -= 1;
    if (keys.has("KeyS") || keys.has("ArrowDown")) moveY += 1;
    if (keys.has("KeyA") || keys.has("ArrowLeft")) moveX -= 1;
    if (keys.has("KeyD") || keys.has("ArrowRight")) moveX += 1;

    const moveLength = Math.hypot(moveX, moveY);
    if (moveLength > 1) {
      moveX /= moveLength;
      moveY /= moveLength;
    } else if (moveLength > 0 && moveLength < 0.08) {
      moveX = 0;
      moveY = 0;
    }

    const targetVX = moveX * player.speed;
    const targetVY = moveY * player.speed;
    const acceleration = moveLength > 0 ? 14 : 10;
    player.vx = lerp(player.vx, targetVX, Math.min(1, acceleration * dt));
    player.vy = lerp(player.vy, targetVY, Math.min(1, acceleration * dt));
    moveTank(player, player.vx * dt, player.vy * dt);

    if (moveLength > 0.15) {
      const targetAngle = Math.atan2(moveY, moveX);
      player.bodyAngle = lerpAngle(player.bodyAngle, targetAngle, Math.min(1, 10 * dt));
    }

    let aimX = pointer.worldX;
    let aimY = pointer.worldY;
    if (aimStick.active && Math.hypot(aimStick.x, aimStick.y) > 0.12) {
      aimX = player.x + aimStick.x * 500;
      aimY = player.y + aimStick.y * 500;
    }
    player.turretAngle = lerpAngle(
      player.turretAngle,
      Math.atan2(aimY - player.y, aimX - player.x),
      Math.min(1, 16 * dt)
    );

    player.fireTimer = Math.max(0, player.fireTimer - dt);
    player.muzzleFlash = Math.max(0, player.muzzleFlash - dt);
    player.hitFlash = Math.max(0, player.hitFlash - dt);
    player.invulnerable = Math.max(0, player.invulnerable - dt);
    player.overdrive = Math.max(0, player.overdrive - dt);

    if (player.reloadTimer > 0) {
      player.reloadTimer -= dt;
      if (player.reloadTimer <= 0) {
        player.magazine = player.magazineSize;
        player.reloadTimer = 0;
        updateAmmoPips();
      }
    }

    const wantsToFire = pointer.down || keys.has("KeyJ") || (aimStick.active && Math.hypot(aimStick.x, aimStick.y) > 0.42);
    if (wantsToFire) firePlayerCannon();

    player.energy = Math.min(
      player.maxEnergy,
      player.energy + 11 * player.energyRegenMultiplier * dt
    );
  }

  function firePlayerCannon() {
    if (player.fireTimer > 0 || player.reloadTimer > 0) return;
    if (player.magazine <= 0) {
      startReload();
      return;
    }

    const spread = player.overdrive > 0 ? 0.018 : 0.035;
    const angle = player.turretAngle + randomRange(-spread, spread);
    const muzzleX = player.x + Math.cos(angle) * (player.radius + 19);
    const muzzleY = player.y + Math.sin(angle) * (player.radius + 19);
    const speed = (player.overdrive > 0 ? 760 : 690) * player.bulletSpeedMultiplier;
    const baseDamage = player.overdrive > 0 ? 48 : 38;
    bullets.push({
      x: muzzleX,
      y: muzzleY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 5 + player.bulletRadiusBonus,
      damage: baseDamage * player.damageMultiplier,
      owner: "player",
      life: 1.5,
      color: COLORS.bullet,
      glow: "#fff1b2",
    });

    player.magazine -= 1;
    const fireDelay = player.overdrive > 0 ? player.fireDelay * 0.62 : player.fireDelay;
    player.fireTimer = fireDelay / player.fireRateMultiplier;
    player.muzzleFlash = 0.08;
    player.vx -= Math.cos(angle) * 13;
    player.vy -= Math.sin(angle) * 13;
    createMuzzleParticles(muzzleX, muzzleY, angle, COLORS.bullet);
    updateAmmoPips();
    sound.shot();

    if (player.magazine <= 0) startReload();
  }

  function startReload() {
    if (player.reloadTimer > 0 || player.magazine === player.magazineSize) return;
    player.reloadTimer = 1.18 * player.reloadMultiplier;
    showMessage("自动装填", 0.85);
  }

  function useShockwave() {
    if (gameState !== "playing" || !player || player.energy < player.maxEnergy) return;
    const radius = 275 * player.shockwaveRadiusMultiplier;
    const clearRadius = 310 * player.shockwaveRadiusMultiplier;
    player.energy = 0;
    camera.shake = 16;
    createRing(player.x, player.y, radius, COLORS.teal, 0.8, 9);
    createRing(player.x, player.y, radius * 0.64, "#d9fff9", 0.55, 5);
    sound.shockwave();

    bullets = bullets.filter((bullet) => {
      if (bullet.owner === "enemy" && distance(bullet, player) < clearRadius) {
        createBurst(bullet.x, bullet.y, "#d9fff9", 4, 90);
        return false;
      }
      return true;
    });

    enemies.forEach((enemy) => {
      const dist = distance(enemy, player);
      if (dist < clearRadius) {
        const angle = Math.atan2(enemy.y - player.y, enemy.x - player.x);
        const damage = Math.round(
          72 *
            player.shockwaveDamageMultiplier *
            (1 - dist / (clearRadius + 70))
        );
        damageEnemy(enemy, damage, angle, 220);
      }
    });

    showMessage("冲击波释放", 1);
  }

  function updateEnemies(dt) {
    enemies.forEach((enemy) => {
      if (enemy.spawnTimer > 0) {
        enemy.spawnTimer -= dt;
        return;
      }

      enemy.fireTimer -= dt;
      enemy.muzzleFlash = Math.max(0, enemy.muzzleFlash - dt);
      enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
      enemy.strafeTimer -= dt;
      if (enemy.strafeTimer <= 0) {
        enemy.strafeDirection *= -1;
        enemy.strafeTimer = randomRange(1.1, 2.8);
      }

      const dx = player.x - enemy.x;
      const dy = player.y - enemy.y;
      const dist = Math.max(1, Math.hypot(dx, dy));
      const targetAngle = Math.atan2(dy, dx);
      const rangeError = dist - enemy.type.desiredRange;
      let movementAngle = targetAngle;

      if (rangeError < -90) {
        movementAngle = targetAngle + Math.PI;
      } else if (Math.abs(rangeError) < 130) {
        movementAngle = targetAngle + Math.PI / 2 * enemy.strafeDirection;
      }

      movementAngle = chooseAvoidanceAngle(enemy, movementAngle);
      enemy.bodyAngle = lerpAngle(enemy.bodyAngle, movementAngle, Math.min(1, 5 * dt));
      const canSeePlayer = hasLineOfSight(enemy, player);
      const lookAngle = canSeePlayer ? targetAngle : movementAngle;
      enemy.turretAngle = lerpAngle(enemy.turretAngle, lookAngle, Math.min(1, 8 * dt));

      const speedScale = Math.abs(rangeError) < 58 ? 0.82 : 1;
      const moveSpeed = enemy.type.speed * speedScale * enemy.speedMultiplier;
      moveTank(
        enemy,
        Math.cos(enemy.bodyAngle) * moveSpeed * dt,
        Math.sin(enemy.bodyAngle) * moveSpeed * dt
      );

      if (
        canSeePlayer &&
        dist < 840 &&
        enemy.fireTimer <= 0 &&
        Math.abs(lerpAngle(enemy.turretAngle, targetAngle, 1) - targetAngle) < 0.12
      ) {
        fireEnemyCannon(enemy, targetAngle);
      }

      if (dist < player.radius + enemy.radius + 2) {
        const pushAngle = Math.atan2(enemy.y - player.y, enemy.x - player.x);
        moveTank(enemy, Math.cos(pushAngle) * 95 * dt, Math.sin(pushAngle) * 95 * dt);
      }
    });
  }

  function chooseAvoidanceAngle(enemy, desiredAngle) {
    const offsets = [0, -0.55, 0.55, -1.05, 1.05, Math.PI];
    let bestAngle = desiredAngle;
    let bestScore = -Infinity;

    offsets.forEach((offset) => {
      const angle = desiredAngle + offset;
      let score = Math.cos(offset) * 2;
      const probeDistances = [55, 100];
      for (const probeDistance of probeDistances) {
        const x = clamp(enemy.x + Math.cos(angle) * probeDistance, 0, WORLD.width);
        const y = clamp(enemy.y + Math.sin(angle) * probeDistance, 0, WORLD.height);
        if (tankCollides(x, y, enemy.radius + 2)) score -= probeDistance > 70 ? 5 : 3;
      }
      if (score > bestScore) {
        bestScore = score;
        bestAngle = angle;
      }
    });

    return bestAngle;
  }

  function fireEnemyCannon(enemy, targetAngle) {
    const shots = enemy.type.shots;
    const spread = shots > 1 ? 0.15 : 0.045;

    for (let i = 0; i < shots; i += 1) {
      const angle = targetAngle + (i - (shots - 1) / 2) * spread + randomRange(-0.025, 0.025);
      const muzzleX = enemy.x + Math.cos(angle) * (enemy.radius + 18);
      const muzzleY = enemy.y + Math.sin(angle) * (enemy.radius + 18);
      bullets.push({
        x: muzzleX,
        y: muzzleY,
        vx: Math.cos(angle) * enemy.type.bulletSpeed,
        vy: Math.sin(angle) * enemy.type.bulletSpeed,
        radius: enemy.typeName === "heavy" ? 7 : 5,
        damage: Math.round(enemy.type.damage * enemy.damageMultiplier),
        owner: "enemy",
        life: 2,
        color: enemy.type.color,
        glow: "#ffc28f",
      });
      createMuzzleParticles(muzzleX, muzzleY, angle, enemy.type.color);
    }

    enemy.fireTimer =
      enemy.type.fireDelay *
      enemy.fireDelayMultiplier *
      randomRange(0.88, 1.18);
    enemy.muzzleFlash = 0.09;
    sound.enemyShot();
  }

  function updateBullets(dt) {
    const remaining = [];

    bullets.forEach((bullet) => {
      let dead = false;
      bullet.life -= dt;
      if (bullet.life <= 0) dead = true;

      const travelX = bullet.vx * dt;
      const travelY = bullet.vy * dt;
      const travelDistance = Math.hypot(travelX, travelY);
      const steps = Math.max(1, Math.ceil(travelDistance / 10));

      for (let step = 0; step < steps && !dead; step += 1) {
        bullet.x += travelX / steps;
        bullet.y += travelY / steps;

        if (bullet.x < 25 || bullet.y < 25 || bullet.x > WORLD.width - 25 || bullet.y > WORLD.height - 25) {
          dead = true;
          createBurst(bullet.x, bullet.y, bullet.color, 5, 65);
          break;
        }

        const hitObstacle = obstacles.find((obstacle) =>
          circleIntersectsRect(bullet.x, bullet.y, bullet.radius, obstacle)
        );
        if (hitObstacle) {
          dead = true;
          createBurst(bullet.x, bullet.y, bullet.color, 7, 100);
          break;
        }

        if (bullet.owner === "player") {
          const enemy = enemies.find((candidate) =>
            candidate.spawnTimer <= 0 &&
            Math.hypot(candidate.x - bullet.x, candidate.y - bullet.y) < candidate.radius + bullet.radius
          );
          if (enemy) {
            const angle = Math.atan2(bullet.vy, bullet.vx);
            damageEnemy(enemy, bullet.damage, angle, 105);
            dead = true;
          }
        } else if (
          player.invulnerable <= 0 &&
          Math.hypot(player.x - bullet.x, player.y - bullet.y) < player.radius + bullet.radius
        ) {
          damagePlayer(bullet.damage);
          dead = true;
        }
      }

      if (!dead) remaining.push(bullet);
    });

    bullets = remaining;
  }

  function damageEnemy(enemy, damage, angle, knockback) {
    if (enemy.health <= 0) return;
    enemy.health -= damage;
    enemy.hitFlash = 0.1;
    enemy.x = clamp(enemy.x + Math.cos(angle) * knockback * 0.05, enemy.radius, WORLD.width - enemy.radius);
    enemy.y = clamp(enemy.y + Math.sin(angle) * knockback * 0.05, enemy.radius, WORLD.height - enemy.radius);
    createBurst(enemy.x, enemy.y, enemy.type.color, 5, 90);
    sound.hit();

    if (enemy.health <= 0) destroyEnemy(enemy);
  }

  function destroyEnemy(enemy) {
    const index = enemies.indexOf(enemy);
    if (index === -1) return;
    enemies.splice(index, 1);
    kills += 1;
    score += Math.round(enemy.type.score * enemy.scoreMultiplier);
    if (player.armorPerKill > 0) {
      player.health = Math.min(player.maxHealth, player.health + player.armorPerKill);
    }
    camera.shake = Math.max(camera.shake, enemy.typeName === "heavy" ? 12 : 6);
    createExplosion(enemy.x, enemy.y, enemy.type.color, enemy.typeName === "heavy" ? 30 : 18);
    sound.explosion();

    if (Math.random() < (enemy.typeName === "heavy" ? 0.72 : 0.2)) {
      const type = Math.random() < 0.58 ? "repair" : "overdrive";
      pickups.push({
        x: enemy.x,
        y: enemy.y,
        radius: 17,
        type,
        life: 16,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  function damagePlayer(damage) {
    if (player.invulnerable > 0 || gameState !== "playing") return;
    const reducedDamage = Math.max(1, damage * (1 - player.damageReduction));
    player.health = Math.max(0, player.health - reducedDamage);
    player.hitFlash = 0.18;
    player.invulnerable = 0.22;
    camera.shake = 8;
    createBurst(player.x, player.y, "#ff9f72", 8, 130);
    sound.hit();

    if (player.health <= 0) {
      createExplosion(player.x, player.y, COLORS.player, 32);
      endGame();
    }
  }

  function updatePickups(dt) {
    const remaining = [];
    pickups.forEach((pickup) => {
      pickup.life -= dt;
      pickup.phase += dt * 3;
      if (pickup.life <= 0) return;

      if (distance(pickup, player) < player.radius + pickup.radius + 4) {
        if (pickup.type === "repair") {
          player.health = Math.min(player.maxHealth, player.health + 38);
          showMessage("装甲修复 +38", 1.2);
        } else {
          player.overdrive = 8;
          player.magazine = player.magazineSize;
          player.reloadTimer = 0;
          showMessage("火力超载", 1.2);
        }
        createRing(pickup.x, pickup.y, 52, pickup.type === "repair" ? "#78d39c" : "#ffd66e", 0.45);
        sound.pickup();
        return;
      }
      remaining.push(pickup);
    });
    pickups = remaining;
  }

  function createMuzzleParticles(x, y, angle, color) {
    for (let i = 0; i < 7; i += 1) {
      const spread = angle + randomRange(-0.45, 0.45);
      const speed = randomRange(80, 260);
      particles.push({
        x,
        y,
        vx: Math.cos(spread) * speed,
        vy: Math.sin(spread) * speed,
        life: randomRange(0.08, 0.2),
        maxLife: 0.2,
        size: randomRange(2, 5),
        color,
        kind: "spark",
        drag: 7,
      });
    }
  }

  function createBurst(x, y, color, count, speed) {
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = randomRange(speed * 0.25, speed);
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life: randomRange(0.18, 0.48),
        maxLife: 0.48,
        size: randomRange(2, 5),
        color,
        kind: "spark",
        drag: 5,
      });
    }
    trimParticles();
  }

  function createExplosion(x, y, color, count) {
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = randomRange(30, 250);
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life: randomRange(0.3, 0.9),
        maxLife: 0.9,
        size: randomRange(4, 11),
        color: i % 3 === 0 ? "#f7d883" : color,
        kind: "smoke",
        drag: 2.8,
      });
    }
    createRing(x, y, 30, "#ffd66e", 0.4, 6);
    trimParticles();
  }

  function createRing(x, y, maxRadius, color, life, lineWidth = 3) {
    particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      life,
      maxLife: life,
      size: maxRadius,
      lineWidth,
      color,
      kind: "ring",
      drag: 0,
    });
    trimParticles();
  }

  function trimParticles() {
    if (particles.length > 650) {
      particles.splice(0, particles.length - 650);
    }
  }

  function updateParticles(dt) {
    const remaining = [];
    particles.forEach((particle) => {
      particle.life -= dt;
      if (particle.life <= 0) return;

      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      const dragFactor = Math.max(0, 1 - particle.drag * dt);
      particle.vx *= dragFactor;
      particle.vy *= dragFactor;
      if (particle.kind === "smoke") {
        particle.size += 9 * dt;
      }
      remaining.push(particle);
    });
    particles = remaining;
  }

  function updateCamera(dt) {
    const lookAheadX = pointer.active && !aimStick.active ? (pointer.worldX - player.x) * 0.09 : 0;
    const lookAheadY = pointer.active && !aimStick.active ? (pointer.worldY - player.y) * 0.09 : 0;
    camera.x = lerp(camera.x, player.x + lookAheadX, Math.min(1, 6 * dt));
    camera.y = lerp(camera.y, player.y + lookAheadY, Math.min(1, 6 * dt));

    const visibleHalfWidth = view.width / (2 * view.scale);
    const visibleHalfHeight = view.height / (2 * view.scale);
    camera.x = clamp(camera.x, Math.min(visibleHalfWidth, WORLD.width / 2), Math.max(WORLD.width - visibleHalfWidth, WORLD.width / 2));
    camera.y = clamp(camera.y, Math.min(visibleHalfHeight, WORLD.height / 2), Math.max(WORLD.height - visibleHalfHeight, WORLD.height / 2));

    if (camera.shake > 0.05) {
      camera.shakeX = randomRange(-camera.shake, camera.shake);
      camera.shakeY = randomRange(-camera.shake, camera.shake);
      camera.shake = Math.max(0, camera.shake - 38 * dt);
    } else {
      camera.shakeX = 0;
      camera.shakeY = 0;
      camera.shake = 0;
    }
  }

  function updateHud() {
    const healthPercent = clamp(player ? player.health / player.maxHealth : 0, 0, 1);
    const energyPercent = clamp(player ? player.energy / player.maxEnergy : 0, 0, 1);
    healthText.textContent = String(Math.ceil(player ? player.health : 0));
    healthBar.style.width = `${healthPercent * 100}%`;
    energyText.textContent = `${Math.floor(energyPercent * 100)}%`;
    energyBar.style.width = `${energyPercent * 100}%`;
    const displayedWave = Math.max(1, wave);
    waveValue.textContent = String(displayedWave).padStart(2, "0");
    scoreValue.textContent = formatScore(score);
    difficultyLabel.textContent = `威胁 x${getDifficulty(displayedWave).multiplier.toFixed(1)}`;
    buffCountLabel.textContent = `强化 ${player ? player.buffCount : 0}`;
    specialButton.disabled = energyPercent < 1 || gameState !== "playing";
  }

  function updateAmmoPips() {
    if (!player) {
      ammoPips.innerHTML = "";
      return;
    }
    let markup = "";
    for (let i = 0; i < player.magazineSize; i += 1) {
      markup += `<span class="ammo-pip${i < player.magazine ? " active" : ""}"></span>`;
    }
    ammoPips.innerHTML = markup;
    reloadText.textContent = player.reloadTimer > 0 ? "装填" : "弹药";
  }

  function update(dt) {
    elapsed += dt;
    updateMessage(dt);
    updateWave(dt);
    updatePlayer(dt);
    updateEnemies(dt);
    updateBullets(dt);
    updatePickups(dt);
    updateParticles(dt);
    updateCamera(dt);
    updateHud();
    updateAmmoPips();
  }

  function drawGround() {
    ctx.fillStyle = COLORS.ground;
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);

    const startX = Math.max(0, Math.floor((camera.x - view.width / view.scale / 2 - 120) / 80) * 80);
    const endX = Math.min(WORLD.width, camera.x + view.width / view.scale / 2 + 120);
    const startY = Math.max(0, Math.floor((camera.y - view.height / view.scale / 2 - 120) / 80) * 80);
    const endY = Math.min(WORLD.height, camera.y + view.height / view.scale / 2 + 120);

    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let x = startX; x <= endX; x += 80) {
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
    }
    for (let y = startY; y <= endY; y += 80) {
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
    }
    ctx.stroke();

    scenery.forEach((item) => {
      ctx.globalAlpha = item.alpha;
      ctx.fillStyle = item.kind === 0 ? "#c5a962" : item.kind === 1 ? "#6c7c73" : "#393d35";
      ctx.beginPath();
      ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    ctx.strokeStyle = "rgba(225, 179, 74, 0.16)";
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, WORLD.width - 60, WORLD.height - 60);
    ctx.strokeStyle = "rgba(225, 179, 74, 0.35)";
    ctx.lineWidth = 8;
    ctx.strokeRect(16, 16, WORLD.width - 32, WORLD.height - 32);
  }

  function drawObstacles() {
    obstacles.forEach((obstacle) => {
      ctx.save();
      ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
      ctx.fillRect(obstacle.x + 10, obstacle.y + 12, obstacle.w, obstacle.h);

      if (obstacle.type === "concrete") {
        ctx.fillStyle = COLORS.rubble;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
        ctx.fillStyle = "#696050";
        ctx.fillRect(obstacle.x + 7, obstacle.y + 7, obstacle.w - 14, obstacle.h - 14);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.09)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(obstacle.x + obstacle.w * 0.25, obstacle.y + 6);
        ctx.lineTo(obstacle.x + obstacle.w * 0.34, obstacle.y + obstacle.h - 6);
        ctx.moveTo(obstacle.x + obstacle.w * 0.72, obstacle.y + 5);
        ctx.lineTo(obstacle.x + obstacle.w * 0.61, obstacle.y + obstacle.h - 5);
        ctx.stroke();
      } else {
        ctx.fillStyle = "#3a4744";
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
        ctx.fillStyle = COLORS.steel;
        ctx.fillRect(obstacle.x + 6, obstacle.y + 6, obstacle.w - 12, obstacle.h - 12);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
        ctx.lineWidth = 3;
        ctx.strokeRect(obstacle.x + 11, obstacle.y + 11, obstacle.w - 22, obstacle.h - 22);
        ctx.fillStyle = "rgba(16, 21, 20, 0.5)";
        for (let x = obstacle.x + 18; x < obstacle.x + obstacle.w - 12; x += 30) {
          ctx.fillRect(x, obstacle.y + obstacle.h - 18, 4, 4);
        }
      }

      ctx.strokeStyle = "rgba(8, 12, 11, 0.7)";
      ctx.lineWidth = 4;
      ctx.strokeRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
      ctx.restore();
    });
  }

  function drawTank(tank, isPlayer) {
    const bodyColor = isPlayer ? COLORS.player : tank.type.color;
    const darkColor = isPlayer ? COLORS.playerDark : COLORS.enemyDark;
    const lightColor = isPlayer ? COLORS.playerLight : "#f2b27e";
    const flash = tank.hitFlash > 0;

    if (!isPlayer && tank.elite) {
      ctx.save();
      ctx.translate(tank.x, tank.y);
      ctx.rotate(elapsed * 1.6);
      ctx.strokeStyle = "#ffe69c";
      ctx.globalAlpha = 0.8;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 7]);
      ctx.beginPath();
      ctx.arc(0, 0, tank.radius + 13, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(tank.x, tank.y);
    ctx.rotate(tank.bodyAngle);

    ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
    ctx.beginPath();
    ctx.ellipse(5, 8, tank.radius + 7, tank.radius + 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#202927";
    roundedRect(-tank.radius - 4, -tank.radius + 3, tank.radius * 0.62, tank.radius * 1.7, 5);
    ctx.fill();
    roundedRect(tank.radius - tank.radius * 0.18, -tank.radius + 3, tank.radius * 0.62, tank.radius * 1.7, 5);
    ctx.fill();

    ctx.strokeStyle = "#7d8b84";
    ctx.lineWidth = 2;
    for (let y = -tank.radius + 7; y < tank.radius - 4; y += 8) {
      ctx.beginPath();
      ctx.moveTo(-tank.radius - 1, y);
      ctx.lineTo(-tank.radius + tank.radius * 0.42, y);
      ctx.moveTo(tank.radius - tank.radius * 0.12, y);
      ctx.lineTo(tank.radius + 1, y);
      ctx.stroke();
    }

    ctx.fillStyle = flash ? "#f4f0e5" : bodyColor;
    ctx.strokeStyle = darkColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(tank.radius + 5, 0);
    ctx.lineTo(tank.radius * 0.35, -tank.radius * 0.82);
    ctx.lineTo(-tank.radius * 0.72, -tank.radius * 0.72);
    ctx.lineTo(-tank.radius - 4, 0);
    ctx.lineTo(-tank.radius * 0.72, tank.radius * 0.72);
    ctx.lineTo(tank.radius * 0.35, tank.radius * 0.82);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(255, 255, 255, 0.09)";
    ctx.fillRect(-tank.radius * 0.65, -tank.radius * 0.55, tank.radius * 1.18, tank.radius * 0.24);

    ctx.restore();

    ctx.save();
    ctx.translate(tank.x, tank.y);
    ctx.rotate(tank.turretAngle);
    ctx.fillStyle = flash ? "#ffffff" : darkColor;
    ctx.strokeStyle = lightColor;
    ctx.lineWidth = 3;
    ctx.fillRect(4, -5, tank.radius + (isPlayer ? 22 : 18), 10);
    ctx.strokeRect(4, -5, tank.radius + (isPlayer ? 22 : 18), 10);

    ctx.fillStyle = flash ? "#ffffff" : bodyColor;
    ctx.beginPath();
    ctx.arc(0, 0, tank.radius * (isPlayer ? 0.76 : 0.7), 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.arc(-2, 0, tank.radius * 0.29, 0, Math.PI * 2);
    ctx.fill();

    if (tank.muzzleFlash > 0) {
      ctx.fillStyle = "#fff3ae";
      ctx.beginPath();
      ctx.moveTo(tank.radius + 20, -10);
      ctx.lineTo(tank.radius + 42, 0);
      ctx.lineTo(tank.radius + 20, 10);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    if (!isPlayer && tank.health < tank.maxHealth) {
      const width = 54;
      const ratio = clamp(tank.health / tank.maxHealth, 0, 1);
      ctx.fillStyle = "rgba(8, 12, 11, 0.75)";
      ctx.fillRect(tank.x - width / 2, tank.y - tank.radius - 18, width, 6);
      ctx.fillStyle = ratio > 0.45 ? "#d7bd61" : "#e2614f";
      ctx.fillRect(tank.x - width / 2 + 1, tank.y - tank.radius - 17, (width - 2) * ratio, 4);
    }
  }

  function drawBullets() {
    ctx.save();
    ctx.lineCap = "round";
    bullets.forEach((bullet) => {
      const speed = Math.hypot(bullet.vx, bullet.vy);
      const tailX = bullet.x - (bullet.vx / speed) * 28;
      const tailY = bullet.y - (bullet.vy / speed) * 28;
      const gradient = ctx.createLinearGradient(tailX, tailY, bullet.x, bullet.y);
      gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
      gradient.addColorStop(1, bullet.color);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = bullet.radius * 0.8;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(bullet.x, bullet.y);
      ctx.stroke();

      ctx.shadowColor = bullet.glow;
      ctx.shadowBlur = 15;
      ctx.fillStyle = "#fff9dc";
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  function drawParticles() {
    ctx.save();
    particles.forEach((particle) => {
      const alpha = clamp(particle.life / particle.maxLife, 0, 1);
      ctx.globalAlpha = particle.kind === "smoke" ? alpha * 0.45 : alpha;
      if (particle.kind === "ring") {
        const progress = 1 - alpha;
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = particle.lineWidth * (1 - progress * 0.65);
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * progress, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * (particle.kind === "smoke" ? 1 : alpha), 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.restore();
  }

  function drawPickups() {
    pickups.forEach((pickup) => {
      const bob = Math.sin(pickup.phase) * 4;
      const color = pickup.type === "repair" ? "#72d89a" : "#ffd66e";
      ctx.save();
      ctx.translate(pickup.x, pickup.y + bob);
      ctx.rotate(pickup.phase * 0.22);
      ctx.shadowColor = color;
      ctx.shadowBlur = 16;
      ctx.fillStyle = "rgba(16, 24, 22, 0.9)";
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      roundedRect(-16, -16, 32, 32, 5);
      ctx.fill();
      ctx.stroke();

      ctx.rotate(-pickup.phase * 0.22);
      ctx.fillStyle = color;
      if (pickup.type === "repair") {
        ctx.fillRect(-4, -10, 8, 20);
        ctx.fillRect(-10, -4, 20, 8);
      } else {
        ctx.beginPath();
        ctx.moveTo(1, -11);
        ctx.lineTo(-7, 2);
        ctx.lineTo(-1, 2);
        ctx.lineTo(-4, 11);
        ctx.lineTo(8, -3);
        ctx.lineTo(1, -3);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    });
  }

  function drawCrosshair() {
    if (!pointer.active || aimStick.active || gameState !== "playing") return;
    const radius = player.overdrive > 0 ? 17 : 14;
    ctx.save();
    ctx.translate(pointer.worldX, pointer.worldY);
    ctx.strokeStyle = player.overdrive > 0 ? "#ffd66e" : "#eaf5ec";
    ctx.globalAlpha = 0.9;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-radius - 8, 0);
    ctx.lineTo(-radius + 3, 0);
    ctx.moveTo(radius - 3, 0);
    ctx.lineTo(radius + 8, 0);
    ctx.moveTo(0, -radius - 8);
    ctx.lineTo(0, -radius + 3);
    ctx.moveTo(0, radius - 3);
    ctx.lineTo(0, radius + 8);
    ctx.stroke();
    ctx.restore();
  }

  function drawOffscreenIndicators() {
    if (enemies.length === 0) return;
    const margin = 34;

    enemies.forEach((enemy) => {
      const screen = worldToScreen(enemy.x, enemy.y);
      if (screen.x > 24 && screen.x < view.width - 24 && screen.y > 24 && screen.y < view.height - 24) return;

      const angle = Math.atan2(enemy.y - player.y, enemy.x - player.x);
      const radiusX = view.width / 2 - margin;
      const radiusY = view.height / 2 - margin;
      const scale = Math.min(
        Math.abs(radiusX / (Math.cos(angle) || 0.0001)),
        Math.abs(radiusY / (Math.sin(angle) || 0.0001))
      );
      const x = view.width / 2 + Math.cos(angle) * scale;
      const y = view.height / 2 + Math.sin(angle) * scale;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = enemy.type.color;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(-8, -6);
      ctx.lineTo(-8, 6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
  }

  function drawDamageVignette() {
    const damage = 1 - clamp(player.health / player.maxHealth, 0, 1);
    if (damage < 0.25) return;
    const gradient = ctx.createRadialGradient(
      view.width / 2,
      view.height / 2,
      Math.min(view.width, view.height) * 0.25,
      view.width / 2,
      view.height / 2,
      Math.max(view.width, view.height) * 0.72
    );
    gradient.addColorStop(0, "rgba(111, 15, 12, 0)");
    gradient.addColorStop(1, `rgba(111, 15, 12, ${damage * 0.42})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, view.width, view.height);
  }

  function roundedRect(x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  function draw() {
    ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
    ctx.clearRect(0, 0, view.width, view.height);
    ctx.save();
    ctx.translate(
      view.width / 2 - camera.x * view.scale + camera.shakeX,
      view.height / 2 - camera.y * view.scale + camera.shakeY
    );
    ctx.scale(view.scale, view.scale);

    drawGround();
    drawObstacles();
    drawPickups();

    enemies.forEach((enemy) => {
      if (enemy.spawnTimer > 0) {
        ctx.save();
        ctx.globalAlpha = 0.45;
        ctx.strokeStyle = enemy.type.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius + 12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else {
        drawTank(enemy, false);
      }
    });

    if (gameState !== "gameover") drawTank(player, true);
    drawBullets();
    drawParticles();
    drawCrosshair();
    ctx.restore();

    drawOffscreenIndicators();
    drawDamageVignette();
  }

  function frame(now) {
    const rawDt = (now - lastTime) / 1000;
    const dt = Math.min(0.04, Math.max(0, rawDt));
    lastTime = now;

    if (gameState === "playing") {
      update(dt);
    } else {
      updateParticles(dt * 0.4);
      updateCamera(dt);
    }
    draw();
    requestAnimationFrame(frame);
  }

  function updatePointer(event) {
    const point = getCanvasPoint(event.clientX, event.clientY);
    pointer.x = point.x;
    pointer.y = point.y;
    const world = screenToWorld(point.x, point.y);
    pointer.worldX = world.x;
    pointer.worldY = world.y;
    pointer.active = true;
  }

  function bindStick(element, knob, state) {
    let pointerId = null;

    function updateStick(event) {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const maxDistance = rect.width * 0.34;
      let dx = event.clientX - centerX;
      let dy = event.clientY - centerY;
      const length = Math.hypot(dx, dy);
      if (length > maxDistance) {
        dx = (dx / length) * maxDistance;
        dy = (dy / length) * maxDistance;
      }
      state.x = dx / maxDistance;
      state.y = dy / maxDistance;
      state.active = true;
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
    }

    function endStick(event) {
      if (pointerId !== null && event.pointerId !== pointerId) return;
      pointerId = null;
      state.x = 0;
      state.y = 0;
      state.active = false;
      knob.style.transform = "";
    }

    element.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      pointerId = event.pointerId;
      element.setPointerCapture(pointerId);
      updateStick(event);
    });
    element.addEventListener("pointermove", (event) => {
      if (event.pointerId !== pointerId) return;
      event.preventDefault();
      updateStick(event);
    });
    element.addEventListener("pointerup", endStick);
    element.addEventListener("pointercancel", endStick);
    element.addEventListener("lostpointercapture", endStick);
  }

  function bindInputs() {
    window.addEventListener("keydown", (event) => {
      if (["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(event.code)) {
        event.preventDefault();
      }
      keys.add(event.code);

      if (event.code === "Space") useShockwave();
      if (event.code === "Escape" || event.code === "KeyP") {
        if (gameState === "playing") pauseGame();
        else if (gameState === "paused") resumeGame();
      }
    });

    window.addEventListener("keyup", (event) => {
      keys.delete(event.code);
    });

    canvas.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "touch") updatePointer(event);
    });
    canvas.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "touch") return;
      event.preventDefault();
      updatePointer(event);
      pointer.down = true;
      sound.ensure();
      if (gameState === "playing") firePlayerCannon();
    });
    window.addEventListener("pointerup", (event) => {
      if (event.pointerType !== "touch") pointer.down = false;
    });
    canvas.addEventListener("contextmenu", (event) => event.preventDefault());

    startButton.addEventListener("click", beginGame);
    restartButton.addEventListener("click", beginGame);
    restartFromPause.addEventListener("click", beginGame);
    resumeButton.addEventListener("click", resumeGame);
    buffCards.addEventListener("click", (event) => {
      const card = event.target.closest(".buff-card");
      if (!card) return;
      applyBuff(card.dataset.buffId);
    });
    pauseButton.addEventListener("click", () => {
      if (gameState === "playing") pauseGame();
      else if (gameState === "paused") resumeGame();
    });
    specialButton.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      useShockwave();
    });

    bindStick(movePad, moveKnob, moveStick);
    bindStick(aimPad, aimKnob, aimStick);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden && gameState === "playing") pauseGame();
    });

    window.addEventListener("blur", () => {
      pointer.down = false;
      keys.clear();
      if (gameState === "playing") pauseGame();
    });

    window.addEventListener("resize", resizeCanvas);
    if ("ResizeObserver" in window) {
      new ResizeObserver(resizeCanvas).observe(arena);
    }
  }

  createArena();
  player = createPlayer();
  bindInputs();
  resizeCanvas();
  updateAmmoPips();
  updateHud();
  requestAnimationFrame(frame);
})();
