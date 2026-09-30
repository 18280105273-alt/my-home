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
  const soundButton = document.getElementById("soundButton");
  const recordStrip = document.getElementById("recordStrip");
  const recordScore = document.getElementById("recordScore");
  const recordWave = document.getElementById("recordWave");
  const newRecordBadge = document.getElementById("newRecordBadge");
  const pauseLoadout = document.getElementById("pauseLoadout");
  const pauseLoadoutList = document.getElementById("pauseLoadoutList");
  const onlineOverlay = document.getElementById("onlineOverlay");
  const onlineButton = document.getElementById("onlineButton");
  const onlineStatus = document.getElementById("onlineStatus");
  const onlineActions = document.getElementById("onlineActions");
  const createRoomButton = document.getElementById("createRoomButton");
  const joinRoomButton = document.getElementById("joinRoomButton");
  const roomCodeInput = document.getElementById("roomCodeInput");
  const roomPanel = document.getElementById("roomPanel");
  const roomCodeText = document.getElementById("roomCodeText");
  const roomHint = document.getElementById("roomHint");
  const netDot = document.getElementById("netDot");
  const netText = document.getElementById("netText");
  const netLatency = document.getElementById("netLatency");
  const leaveOnlineButton = document.getElementById("leaveOnlineButton");
  const foeReadout = document.getElementById("foeReadout");
  const foeHealthBar = document.getElementById("foeHealthBar");
  const foeHealthText = document.getElementById("foeHealthText");
  const waveChipLabel = document.getElementById("waveChipLabel");
  const scoreChipLabel = document.getElementById("scoreChipLabel");
  const gameOverKicker = document.getElementById("gameOverKicker");
  const gameOverTitle = document.getElementById("gameOverTitle");
  const finalScoreLabel = document.getElementById("finalScoreLabel");
  const finalWaveLabel = document.getElementById("finalWaveLabel");
  const finalKillsLabel = document.getElementById("finalKillsLabel");

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
    teal: "#79e2d3",
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
    ricochet: {
      name: "弹跳炮坦克",
      maxHealth: 86,
      speed: 104,
      radius: 23,
      damage: 12,
      fireDelay: 1.58,
      bulletSpeed: 470,
      desiredRange: 480,
      color: "#58a7c9",
      score: 280,
      shots: 1,
      attackType: "ricochet",
      bounces: 2,
    },
    laser: {
      name: "激光坦克",
      maxHealth: 96,
      speed: 88,
      radius: 25,
      damage: 24,
      fireDelay: 2.35,
      bulletSpeed: 0,
      desiredRange: 560,
      color: "#b86ed6",
      score: 390,
      shots: 0,
      attackType: "laser",
      chargeTime: 0.82,
      beamRange: 980,
    },
    seeker: {
      name: "追踪炮坦克",
      maxHealth: 78,
      speed: 122,
      radius: 22,
      damage: 15,
      fireDelay: 2.15,
      bulletSpeed: 315,
      desiredRange: 620,
      color: "#7fc76b",
      score: 350,
      shots: 1,
      attackType: "homing",
      turnRate: 2.4,
      homingDuration: 2.4,
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
    {
      id: "ricochet-shell",
      name: "弹跳弹头",
      icon: "弹",
      rarity: "rare",
      description: "主炮炮弹可在障碍和边界上反弹，最多叠加三层。",
      apply() {
        player.ricochetShots = Math.min(3, player.ricochetShots + 1);
      },
    },
    {
      id: "homing-shell",
      name: "追踪炮",
      icon: "锁",
      rarity: "epic",
      description: "主炮炮弹会自动转向追踪最近敌军，叠加后转向更快。",
      apply() {
        player.homingShots += 1;
      },
    },
    {
      id: "auxiliary-laser",
      name: "激光副炮",
      icon: "光",
      rarity: "epic",
      description: "周期性自动锁定并发射激光，叠加后提高伤害与射速。",
      apply() {
        player.auxLaserLevel += 1;
        player.auxLaserTimer = Math.min(player.auxLaserTimer, 0.6);
      },
    },
    {
      id: "explosive-shell",
      name: "爆裂弹",
      icon: "爆",
      rarity: "rare",
      description: "主炮命中或撞墙时产生爆炸，对周围敌军造成范围伤害。",
      apply() {
        player.explosiveShots += 1;
      },
    },
    {
      id: "scatter-shot",
      name: "散射炮管",
      icon: "散",
      rarity: "standard",
      description: "每次主炮射击额外发射一发散射炮弹。",
      apply() {
        player.extraProjectiles += 1;
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
  let beams = [];
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
  let arenaLayoutIndex = 0;
  let messageTimer = 0;
  let lastTime = performance.now();
  let elapsed = 0;
  let audioContext = null;

  const STORAGE_KEYS = {
    best: "tank-game:best-record",
    muted: "tank-game:muted",
  };
  const EMPTY_RECORD = { score: 0, wave: 0, kills: 0 };
  const textCache = new WeakMap();
  const widthCache = new WeakMap();
  const disabledCache = new WeakMap();
  const ammoPipState = { size: -1, magazine: -1, reloading: null };
  let bestRecord = readRecord();
  let soundMuted = readMuted();
  let playerCanFire = true;
  let remoteTank = null;

  // 联机对战状态：房间码通过公共 MQTT 中继交换，无需自建服务器
  const VERSUS = {
    active: false,
    role: null,
    roomCode: "",
    phase: "idle",
    timer: 0,
    round: 1,
    myScore: 0,
    foeScore: 0,
    target: 3,
    pendingOver: false,
    lastWinner: null,
  };

  const NET = {
    brokers: [
      { url: "wss://broker.emqx.io:8084/mqtt", label: "EMQX 中继" },
      { url: "wss://broker-cn.emqx.io:8084/mqtt", label: "EMQX 中国" },
      { url: "wss://test.mosquitto.org:8081/", label: "Mosquitto 中继" },
      { url: "wss://broker.hivemq.com:8884/mqtt", label: "HiveMQ 中继" },
    ],
    topicPrefix: "lizhongxing-tank-arena/v1/",
    clients: [],
    clientBrokerIndexes: [],
    peerBrokerIndex: -1,
    labels: [],
    failedBrokers: 0,
    retryCount: 0,
    clientId: "",
    peerId: "",
    seq: 0,
    seen: new Set(),
    seenOrder: [],
    pc: null,
    channel: null,
    p2pReady: false,
    p2pLastReceive: 0,
    offerCount: 0,
    lastOfferAt: 0,
    pendingCandidates: [],
    topic: "",
    connected: false,
    connecting: false,
    peerOnline: false,
    lastReceiveAt: 0,
    lastStateAt: 0,
    lastHelloAt: 0,
    lastPingAt: 0,
    latency: 0,
  };

  function readRecord() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.best);
      if (!raw) return { ...EMPTY_RECORD };
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return { ...EMPTY_RECORD };
      return {
        score: Number(parsed.score) || 0,
        wave: Number(parsed.wave) || 0,
        kills: Number(parsed.kills) || 0,
      };
    } catch (error) {
      return { ...EMPTY_RECORD };
    }
  }

  function writeRecord(record) {
    try {
      window.localStorage.setItem(STORAGE_KEYS.best, JSON.stringify(record));
    } catch (error) {
      // 隐私模式或存储被禁用时静默跳过，不影响游戏进行。
    }
  }

  function readMuted() {
    try {
      return window.localStorage.getItem(STORAGE_KEYS.muted) === "1";
    } catch (error) {
      return false;
    }
  }

  function writeMuted(muted) {
    try {
      window.localStorage.setItem(STORAGE_KEYS.muted, muted ? "1" : "0");
    } catch (error) {
      // 同上，存储不可用时仅本次会话生效。
    }
  }

  function setText(element, value) {
    const text = String(value);
    if (!element || textCache.get(element) === text) return;
    textCache.set(element, text);
    element.textContent = text;
  }

  function setBarWidth(element, ratio) {
    const percent = clamp(ratio, 0, 1) * 100;
    if (!element || widthCache.get(element) === percent) return;
    widthCache.set(element, percent);
    element.style.width = `${percent}%`;
  }

  function setDisabled(element, disabled) {
    if (!element || disabledCache.get(element) === disabled) return;
    disabledCache.set(element, disabled);
    element.disabled = disabled;
  }

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
    constructor() {
      this.muted = false;
    }

    ensure() {
      if (this.muted) return;
      if (!audioContext) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) audioContext = new AudioContext();
      }
      if (audioContext && audioContext.state === "suspended") {
        audioContext.resume().catch(() => {});
      }
    }

    tone(frequency, duration, type = "sine", volume = 0.035, endFrequency = null) {
      if (!audioContext || this.muted) return;
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

    laser() {
      this.tone(880, 0.24, "sawtooth", 0.035, 180);
    }

    wave() {
      this.tone(330, 0.16, "triangle", 0.035, 440);
      window.setTimeout(() => this.tone(440, 0.2, "triangle", 0.03, 660), 120);
    }
  }

  const sound = new Sound();

  // ---------------------------------------------------------------------------
  // 联机模块：用公共 MQTT 中继转发双方状态，不依赖自建后端
  // ---------------------------------------------------------------------------
  const ROOM_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

  function makeRoomCode(length = 6) {
    let code = "";
    for (let index = 0; index < length; index += 1) {
      code += ROOM_ALPHABET[Math.floor(Math.random() * ROOM_ALPHABET.length)];
    }
    return code;
  }

  function makeClientId() {
    return `tank-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  // 房间码决定地图，双方各自算出一致的地形，无需额外同步
  function layoutIndexFromCode(code) {
    let hash = 0;
    for (let index = 0; index < code.length; index += 1) {
      hash = (hash * 31 + code.charCodeAt(index)) % 100000;
    }
    return hash;
  }

  function updateNetStatus(kind, text) {
    netDot.classList.remove("online", "offline");
    if (kind === "online") netDot.classList.add("online");
    if (kind === "offline") netDot.classList.add("offline");
    setText(netText, text);
  }

  function netSend(payload) {
    const channelOpen =
      NET.p2pReady && NET.channel && NET.channel.readyState === "open";
    if (!channelOpen && !NET.clients.length) return;

    const text = buildMessage(payload);

    if (channelOpen) {
      try {
        NET.channel.send(text);
      } catch (error) {
        // 直连发送失败时下面仍会走中继
      }
    }

    // 只有关键事件用 QoS 1；心跳和状态用 QoS 0，避免公共中继重投递造成过期消息
    const reliable =
      payload.t === "hit" ||
      payload.t === "round" ||
      payload.t === "rematch" ||
      payload.t === "bye";
    const qos = reliable ? 1 : 0;

    // 高频状态只发对端活跃的那条中继；关键事件发全部中继做冗余
    const targets = payload.t === "state" ? statePublishTargets() : NET.clients;
    targets.forEach((client) => {
      try {
        // 页面关闭或中继正在断开时不再发布，避免产生无意义的 WebSocket 报错
        if (!client.connected) return;
        client.publish(NET.topic, text, { qos });
      } catch (error) {
        // 单条中继异常不影响其它中继
      }
    });
  }

  function statePublishTargets() {
    if (NET.peerBrokerIndex < 0 || !NET.clients.length) return NET.clients;
    const position = NET.clientBrokerIndexes.indexOf(NET.peerBrokerIndex);
    return position === -1 ? NET.clients : [NET.clients[position]];
  }

  function buildMessage(payload) {
    NET.seq += 1;
    const message = { ...payload, from: NET.clientId, id: `${NET.clientId}-${NET.seq}` };
    if (payload.t === "state") message.ts = Date.now();
    return JSON.stringify(message);
  }

  function sendOnChannel(payload) {
    if (!NET.channel || NET.channel.readyState !== "open") return;
    try {
      NET.channel.send(buildMessage(payload));
    } catch (error) {
      // 直连发送失败时静默忽略，中继仍可用
    }
  }

  function netStart(role, roomCode) {
    if (typeof mqtt === "undefined") {
      onlineStatus.textContent = "联机组件加载失败，请刷新页面后重试。";
      updateNetStatus("offline", "组件缺失");
      return false;
    }

    netClose();
    VERSUS.role = role;
    VERSUS.roomCode = roomCode;
    VERSUS.phase = "lobby";
    VERSUS.active = false;
    VERSUS.myScore = 0;
    VERSUS.foeScore = 0;
    VERSUS.round = 1;

    NET.clientId = makeClientId();
    NET.peerId = "";
    NET.topic = `${NET.topicPrefix}${roomCode}`;
    NET.peerOnline = false;
    NET.latency = 0;
    NET.lastReceiveAt = performance.now();
    NET.lastHelloAt = 0;
    NET.lastStateAt = 0;
    NET.lastPingAt = 0;
    NET.clients = [];
    NET.clientBrokerIndexes = [];
    NET.labels = [];
    NET.peerBrokerIndex = -1;
    NET.failedBrokers = 0;
    NET.retryCount = 0;
    NET.seq = 0;
    NET.seen = new Set();
    NET.seenOrder = [];

    roomCodeText.textContent = roomCode;
    roomPanel.hidden = false;
    onlineActions.hidden = true;
    setText(netLatency, "");
    updateNetStatus("", "正在连接中继");
    // 同时连接所有中继：只有双方至少在一条相同中继上，就能互相发现
    NET.brokers.forEach((broker, index) => connectBroker(broker, index));
    return true;
  }

  function netClose() {
    if (NET.clients.length) {
      netSend({ t: "bye" });
    }
    NET.clients.forEach((client) => {
      try {
        client.end(true);
      } catch (error) {
        // 已断开时忽略
      }
    });
    NET.clients = [];
    NET.clientBrokerIndexes = [];
    NET.labels = [];
    NET.peerBrokerIndex = -1;
    closePeerLink();
    NET.offerCount = 0;
    NET.lastOfferAt = 0;
    NET.pendingCandidates = [];
    NET.connected = false;
    NET.connecting = false;
    NET.peerOnline = false;
    NET.latency = 0;
    NET.topic = "";
  }

  // ---------------------------------------------------------------------------
  // WebRTC 直连：MQTT 只用来交换 SDP，连上后游戏数据点对点直传
  // ---------------------------------------------------------------------------
  const RTC_CONFIG = {
    iceServers: [
      { urls: "stun:stun.qq.com:3478" },
      { urls: "stun:stun.miwifi.com:3478" },
      { urls: "stun:stun.chat.bilibili.com:3478" },
      { urls: "stun:stun.l.google.com:19302" },
    ],
    iceCandidatePoolSize: 2,
  };

  function closePeerLink() {
    const wasReady = NET.p2pReady;
    NET.p2pReady = false;
    // 换路径后旧的延迟样本会失真，重置读数
    if (wasReady) NET.latency = 0;
    if (NET.channel) {
      try {
        NET.channel.close();
      } catch (error) {
        // 忽略
      }
      NET.channel = null;
    }
    if (NET.pc) {
      try {
        NET.pc.close();
      } catch (error) {
        // 忽略
      }
      NET.pc = null;
    }
  }

  function attachDataChannel(channel) {
    NET.channel = channel;
    channel.onopen = () => {
      NET.p2pLastReceive = performance.now();
      // 先证明双向都通，再整体切到直连，避免单边可用导致掉线
      sendOnChannel({ t: "p2p-hello", role: VERSUS.role });
    };
    channel.onclose = () => {
      NET.p2pReady = false;
    };
    channel.onerror = () => {
      NET.p2pReady = false;
    };
    channel.onmessage = (event) => {
      NET.p2pLastReceive = performance.now();
      handleRawMessage(event.data, "p2p");
    };
  }

  function rememberRemoteCandidate(candidate) {
    if (!candidate || !NET.pc) return;
    if (!NET.pc.remoteDescription) {
      // 远端描述还没设好时先排队，等 setRemoteDescription 之后统一补入
      NET.pendingCandidates.push(candidate);
      return;
    }
    NET.pc.addIceCandidate(candidate).catch(() => {});
  }

  function flushRemoteCandidates() {
    if (!NET.pc || !NET.pc.remoteDescription) return;
    const queued = NET.pendingCandidates;
    NET.pendingCandidates = [];
    queued.forEach((candidate) => {
      NET.pc.addIceCandidate(candidate).catch(() => {});
    });
  }

  function createPeerConnection() {
    if (NET.pc) return NET.pc;
    if (typeof RTCPeerConnection === "undefined") return null;

    let pc = null;
    try {
      pc = new RTCPeerConnection(RTC_CONFIG);
    } catch (error) {
      return null;
    }

    NET.pc = pc;
    pc.onicecandidate = (event) => {
      // trickle ICE：候选一收集到就单独发，双方都要发
      if (event.candidate) netSend({ t: "rtc-ice", c: event.candidate.toJSON() });
    };
    pc.ondatachannel = (event) => attachDataChannel(event.channel);
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      if (state === "failed" || state === "closed") closePeerLink();
      else if (state === "disconnected") NET.p2pReady = false;
    };
    return pc;
  }

  function startPeerLink() {
    if (NET.pc || !NET.peerId) return;
    if (mySide() !== "left") return;

    const pc = createPeerConnection();
    if (!pc) return;

    NET.offerCount += 1;
    NET.lastOfferAt = performance.now();
    attachDataChannel(
      pc.createDataChannel("tank", { ordered: false, maxRetransmits: 0 })
    );
    pc.createOffer()
      .then((offer) => pc.setLocalDescription(offer))
      .then(() => netSend({ t: "rtc-offer", sdp: pc.localDescription.sdp }))
      .catch(() => closePeerLink());
  }

  function handleRtcOffer(payload) {
    if (!payload.sdp || mySide() === "left") return;
    // 对端重发 offer（首次连接超时后重试）时重建连接
    if (NET.pc && NET.pc.currentRemoteDescription) closePeerLink();
    const pc = createPeerConnection();
    if (!pc) return;

    pc.setRemoteDescription({ type: "offer", sdp: payload.sdp })
      .then(() => flushRemoteCandidates())
      .then(() => pc.createAnswer())
      .then((answer) => pc.setLocalDescription(answer))
      .then(() => netSend({ t: "rtc-answer", sdp: pc.localDescription.sdp }))
      .catch(() => closePeerLink());
  }

  function handleRtcAnswer(payload) {
    if (!payload.sdp || !NET.pc || NET.pc.currentRemoteDescription) return;
    NET.pc
      .setRemoteDescription({ type: "answer", sdp: payload.sdp })
      .then(() => flushRemoteCandidates())
      .catch(() => closePeerLink());
  }

  function parseMessage(raw) {
    try {
      return JSON.parse(typeof raw === "string" ? raw : raw.toString());
    } catch (error) {
      return null;
    }
  }

  function handlePayload(payload, transport) {
    if (!payload) return;

    if (transport === "p2p" && !NET.p2pReady) {
      NET.p2pReady = true;
      NET.latency = 0;
      updateNetStatus("online", "已直连对手");
      showMessage("已建立点对点直连", 1.8);
      sound.pickup();
    }

    handleNetMessage(payload);
  }

  function handleRawMessage(raw, transport = "mqtt") {
    handlePayload(parseMessage(raw), transport);
  }

  function markBrokerFailed() {
    NET.failedBrokers += 1;
    if (NET.clients.length > 0 || NET.failedBrokers < NET.brokers.length) return;

    // 公共中继偶发限流，全部失败时过几秒整轮重试
    NET.retryCount += 1;
    if (NET.retryCount <= 2 && NET.topic) {
      const delay = 2500 * NET.retryCount;
      updateNetStatus("connecting", `中继不稳，${delay / 1000}s 后重试`);
      window.setTimeout(() => {
        if (!NET.topic || NET.clients.length > 0) return;
        NET.failedBrokers = 0;
        NET.brokers.forEach((broker, index) => connectBroker(broker, index));
      }, delay);
      return;
    }

    NET.connecting = false;
    updateNetStatus("offline", "中继连接失败");
    roomHint.textContent = "公共中继都连不上，请检查网络后重试。";
  }

  function connectBroker(broker, index) {
    NET.connecting = true;
    roomHint.textContent =
      VERSUS.role === "host" ? "等待对手输入房间码加入…" : "正在加入房间…";

    let settled = false;
    let client = null;

    try {
      client = mqtt.connect(broker.url, {
        clientId: NET.clientId,
        keepalive: 30,
        clean: true,
        reconnectPeriod: 0,
        connectTimeout: 8000,
        protocolVersion: 4,
      });
    } catch (error) {
      markBrokerFailed();
      return;
    }

    const giveUp = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      try {
        client.end(true);
      } catch (error) {
        // 忽略
      }
      markBrokerFailed();
    }, 9000);

    client.on("connect", () => {
      settled = true;
      window.clearTimeout(giveUp);
      NET.clients.push(client);
      NET.clientBrokerIndexes.push(index);
      NET.labels.push(broker.label);
      NET.connected = true;
      NET.connecting = false;
      NET.lastReceiveAt = performance.now();
      updateNetStatus("online", `已连接${NET.labels.join(" + ")}`);
      client.subscribe(NET.topic, { qos: 0 });
      netSend({ t: "hello", role: VERSUS.role });
    });

    client.on("message", (topic, buffer) => {
      if (topic !== NET.topic) return;
      const payload = parseMessage(buffer);
      if (!payload) return;
      // 记录对端在哪条中继上活跃，高频状态包只发这一条以降低公共中继压力
      if (payload.from && payload.from !== NET.clientId) NET.peerBrokerIndex = index;
      handlePayload(payload, "mqtt");
    });

    client.on("error", () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(giveUp);
      try {
        client.end(true);
      } catch (error) {
        // 忽略
      }
      markBrokerFailed();
    });

    client.on("close", () => {
      const position = NET.clients.indexOf(client);
      if (position === -1) return;
      NET.clients.splice(position, 1);
      NET.clientBrokerIndexes.splice(position, 1);
      NET.labels.splice(position, 1);
      if (NET.peerBrokerIndex === index) NET.peerBrokerIndex = -1;
      if (NET.clients.length === 0) {
        NET.connected = false;
        updateNetStatus("offline", "中继连接已断开");
      } else {
        updateNetStatus("online", `已连接${NET.labels.join(" + ")}`);
      }
    });
  }

  function handleNetMessage(payload) {
    if (!payload || payload.from === NET.clientId) return;

    // 同时连接多条中继时同一条消息会到达两次，按消息 ID 去重
    if (payload.id) {
      if (NET.seen.has(payload.id)) return;
      NET.seen.add(payload.id);
      NET.seenOrder.push(payload.id);
      if (NET.seenOrder.length > 600) {
        NET.seen.delete(NET.seenOrder.shift());
      }
    }

    NET.lastReceiveAt = performance.now();
    if (payload.from) NET.peerId = payload.from;

    if (!NET.peerOnline) {
      NET.peerOnline = true;
      updateNetStatus("online", "对手已连接");
      roomHint.textContent = "对手已就位，正在进入战场…";
      sound.pickup();
      // 双方都靠"收到对方消息"判定就绪，随后各自进入倒计时
      window.setTimeout(() => {
        if (NET.peerOnline && VERSUS.phase === "lobby") startVersusMatch();
      }, 500);
    }

    switch (payload.t) {
      case "hello":
        netSend({ t: "hello-ack", role: VERSUS.role });
        break;
      case "state":
        applyRemoteState(payload);
        break;
      case "fire":
        spawnRemoteBullet(payload);
        break;
      case "hit":
        applyIncomingHit(payload);
        break;
      case "rtc-offer":
        handleRtcOffer(payload);
        break;
      case "rtc-answer":
        handleRtcAnswer(payload);
        break;
      case "rtc-ice":
        rememberRemoteCandidate(payload.c);
        break;
      case "round":
        resolveVersusRound(payload.w, false);
        break;
      case "rematch":
        if (VERSUS.active && VERSUS.phase === "over") {
          showMessage("对手发起了再战", 1.6);
          startVersusMatch();
        }
        break;
      case "ping":
        netSend({ t: "pong", at: payload.at });
        break;
      case "pong":
        {
          // 公共中继偶发抖动，过滤异常样本并取加权平均让读数稳定
          const sample = Date.now() - payload.at;
          if (sample >= 0 && sample < 4000) {
            NET.latency = NET.latency
              ? Math.round(NET.latency * 0.7 + sample * 0.3)
              : sample;
          }
        }
        break;
      case "bye":
        handlePeerLeft();
        break;
      default:
        break;
    }
  }

  function netTick(dt) {
    if (!NET.connected && !NET.p2pReady) return;
    if (!VERSUS.active && VERSUS.phase !== "lobby") return;
    const now = performance.now();

    // 大厅阶段持续打招呼，避免后加入的一方错过对方的第一条消息
    if (!NET.peerOnline && now - NET.lastHelloAt > 1200) {
      NET.lastHelloAt = now;
      netSend({ t: "hello", role: VERSUS.role });
    }

    // 直连静默超时就自动降级回中继
    if (NET.p2pReady && now - NET.p2pLastReceive > 2500) {
      closePeerLink();
      showMessage("直连中断，已切回中继", 1.8);
      updateNetStatus("online", `已连接${NET.labels.join(" + ")}`);
    }

    // 左路负责发起直连：首轮给足 20 秒建立时间，避免打断正在进行中的 ICE 协商
    if (NET.peerOnline && !NET.p2pReady && mySide() === "left" && NET.offerCount < 3) {
      const sinceOffer = NET.lastOfferAt ? now - NET.lastOfferAt : Infinity;
      const canStart = !NET.pc || sinceOffer > 12000;
      if (canStart && sinceOffer > 3000) {
        closePeerLink();
        startPeerLink();
      }
    }

    // 直连可用时把同步频率提到 30Hz
    const stateInterval = NET.p2pReady ? 33 : 50;
    if (VERSUS.active && NET.peerOnline && now - NET.lastStateAt > stateInterval) {
      NET.lastStateAt = now;
      netSend({
        t: "state",
        x: Math.round(player.x * 10) / 10,
        y: Math.round(player.y * 10) / 10,
        vx: Math.round(player.vx),
        vy: Math.round(player.vy),
        b: Math.round(player.bodyAngle * 100) / 100,
        a: Math.round(player.turretAngle * 100) / 100,
        h: Math.max(0, Math.round(player.health)),
        m: player.maxHealth,
        o: player.overdrive > 0 ? 1 : 0,
        s: VERSUS.myScore,
      });
    }

    if (NET.peerOnline && now - NET.lastPingAt > 2000) {
      NET.lastPingAt = now;
      netSend({ t: "ping", at: Date.now() });
    }

    if (NET.peerOnline && now - NET.lastReceiveAt > 8000) {
      handlePeerLeft();
    }
  }

  function handlePeerLeft() {
    if (!VERSUS.active && VERSUS.phase !== "lobby") return;
    NET.peerOnline = false;
    NET.peerId = "";
    VERSUS.active = false;
    VERSUS.phase = "lobby";
    VERSUS.myScore = 0;
    VERSUS.foeScore = 0;
    VERSUS.round = 1;
    VERSUS.pendingOver = false;
    playerCanFire = false;
    updateNetStatus("online", `已连接${NET.labels.join(" + ")}`);
    roomHint.textContent = "对手已离开，房间仍然有效，可以把房间码发给新对手。";
    if (remoteTank) remoteTank.alive = false;
    showMessage("对手已断开连接", 2.4);
    // 回到大厅继续等待，房间与中继连接都保留
    gameState = "lobby";
    onlineActions.hidden = true;
    onlineOverlay.classList.add("visible");
    pauseOverlay.classList.remove("visible");
    gameOverOverlay.classList.remove("visible");
    buffOverlay.classList.remove("visible");
    foeReadout.hidden = true;
    roomPanel.hidden = false;
  }

  function createArena(forceIndex = null) {
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

    const layouts = [
      () => [
        { x: 1080, y: 420, w: 76, h: 220, type: "concrete" },
        { x: 1080, y: 960, w: 76, h: 220, type: "concrete" },
        { x: 710, y: 760, w: 260, h: 72, type: "concrete" },
        { x: 1430, y: 760, w: 260, h: 72, type: "concrete" },
        { x: 930, y: 640, w: 72, h: 140, type: "wall" },
        { x: 1398, y: 820, w: 72, h: 140, type: "wall" },
      ],
      () => [
        { x: 1080, y: 490, w: 240, h: 72, type: "concrete" },
        { x: 1080, y: 1038, w: 240, h: 72, type: "concrete" },
        { x: 820, y: 670, w: 72, h: 260, type: "concrete" },
        { x: 1508, y: 670, w: 72, h: 260, type: "concrete" },
        { x: 920, y: 650, w: 120, h: 64, type: "wall" },
        { x: 1360, y: 886, w: 120, h: 64, type: "wall" },
        { x: 1360, y: 650, w: 120, h: 64, type: "wall" },
        { x: 920, y: 886, w: 120, h: 64, type: "wall" },
      ],
      () => [
        { x: 520, y: 560, w: 360, h: 72, type: "concrete" },
        { x: 1120, y: 560, w: 360, h: 72, type: "concrete" },
        { x: 920, y: 780, w: 72, h: 300, type: "concrete" },
        { x: 1408, y: 780, w: 72, h: 300, type: "concrete" },
        { x: 520, y: 980, w: 360, h: 72, type: "concrete" },
        { x: 1120, y: 980, w: 360, h: 72, type: "concrete" },
      ],
      () =>
        Array.from({ length: 11 }, (_, index) => {
          const horizontal = index % 3 === 0;
          const w = horizontal ? randomRange(130, 250) : randomRange(64, 100);
          const h = horizontal ? randomRange(64, 100) : randomRange(130, 250);
          const zoneX = 430 + (index % 4) * 410;
          const zoneY = 440 + Math.floor(index / 4) * 360;
          return {
            x: clamp(zoneX + randomRange(-70, 70), 260, WORLD.width - w - 180),
            y: clamp(zoneY + randomRange(-50, 50), 260, WORLD.height - h - 180),
            w,
            h,
            type: index % 2 === 0 ? "concrete" : "wall",
          };
        }),
      () => [
        { x: 880, y: 560, w: 72, h: 190, type: "wall" },
        { x: 1448, y: 560, w: 72, h: 190, type: "wall" },
        { x: 880, y: 870, w: 72, h: 190, type: "wall" },
        { x: 1448, y: 870, w: 72, h: 190, type: "wall" },
        { x: 1040, y: 760, w: 320, h: 72, type: "concrete" },
        { x: 760, y: 760, w: 120, h: 72, type: "concrete" },
        { x: 1520, y: 760, w: 120, h: 72, type: "concrete" },
      ],
    ];

    if (Number.isInteger(forceIndex)) {
      arenaLayoutIndex = ((forceIndex % layouts.length) + layouts.length) % layouts.length;
    } else {
      const nextLayout = Math.floor(Math.random() * layouts.length);
      arenaLayoutIndex = nextLayout === arenaLayoutIndex
        ? (nextLayout + 1 + Math.floor(Math.random() * (layouts.length - 1))) % layouts.length
        : nextLayout;
    }
    obstacles.push(...borderBlocks, ...layouts[arenaLayoutIndex]());

    for (let i = 0; i < 94; i += 1) {
      scenery.push({
        x: randomRange(70, WORLD.width - 70),
        y: randomRange(70, WORLD.height - 70),
        radius: randomRange(2, 6),
        alpha: randomRange(0.06, 0.22),
        kind: i % 3,
      });
    }
    arena.dataset.layout = String(arenaLayoutIndex + 1);
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
      ricochetShots: 0,
      homingShots: 0,
      auxLaserLevel: 0,
      auxLaserTimer: 1.2,
      explosiveShots: 0,
      extraProjectiles: 0,
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
      laserCharge: 0,
      laserAngle: angle,
      strafeDirection: Math.random() > 0.5 ? 1 : -1,
      strafeTimer: randomRange(1.2, 2.8),
      spawnTimer: 0.75,
      turnAmount: 0,
    };
  }

  function resetGame() {
    createArena();
    player = createPlayer();
    const spawn = findSafePlayerSpawn();
    player.x = spawn.x;
    player.y = spawn.y;
    enemies = [];
    bullets = [];
    beams = [];
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
    netClose();
    VERSUS.active = false;
    VERSUS.phase = "idle";
    VERSUS.role = null;
    VERSUS.roomCode = "";
    remoteTank = null;
    playerCanFire = true;
    foeReadout.hidden = true;
    onlineOverlay.classList.remove("visible");
    setText(waveChipLabel, "波次");
    setText(scoreChipLabel, "得分");
    setText(gameOverKicker, "装甲损毁");
    setText(gameOverTitle, "阵地失守");
    setText(finalScoreLabel, "最终得分");
    setText(finalWaveLabel, "抵达波次");
    setText(finalKillsLabel, "击毁敌军");
    setText(restartButton, "再次出击");
    resetGame();
    gameState = "playing";
    newRecordBadge.hidden = true;
    startOverlay.classList.remove("visible");
    buffOverlay.classList.remove("visible");
    pauseOverlay.classList.remove("visible");
    gameOverOverlay.classList.remove("visible");
    sound.wave();
    lastTime = performance.now();
  }

  function pauseGame() {
    if (gameState !== "playing") return;
    if (VERSUS.active) {
      showMessage("联机对战不支持暂停", 1.4);
      return;
    }
    gameState = "paused";
    renderPauseLoadout();
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
    const reachedWave = Math.max(1, wave);
    setText(finalScore, formatScore(score));
    setText(finalWave, reachedWave);
    setText(finalKills, kills);

    const isNewRecord = score > bestRecord.score;
    if (isNewRecord) {
      bestRecord = { score, wave: reachedWave, kills };
      writeRecord(bestRecord);
    }
    newRecordBadge.hidden = !isNewRecord;
    renderBestRecord();

    gameOverOverlay.classList.add("visible");
    sound.explosion();
  }

  function renderBestRecord() {
    const hasRecord = bestRecord.score > 0;
    recordStrip.hidden = !hasRecord;
    if (!hasRecord) return;
    setText(recordScore, formatScore(bestRecord.score));
    setText(recordWave, bestRecord.wave);
  }

  function renderPauseLoadout() {
    if (!player) {
      pauseLoadout.hidden = true;
      return;
    }
    const owned = BUFFS.filter((buff) => player.buffLevels[buff.id] > 0);
    pauseLoadout.hidden = owned.length === 0;
    pauseLoadoutList.innerHTML = owned
      .map((buff) => {
        const level = player.buffLevels[buff.id];
        const levelTag = level > 1 ? `<em>×${level}</em>` : "";
        return `<span class="loadout-chip" title="${buff.description}"><i>${buff.icon}</i>${buff.name}${levelTag}</span>`;
      })
      .join("");
  }

  function syncSoundUi() {
    soundButton.classList.toggle("muted", soundMuted);
    soundButton.setAttribute("aria-pressed", soundMuted ? "false" : "true");
    soundButton.setAttribute(
      "aria-label",
      soundMuted ? "音效已关闭，点击开启" : "音效已开启，点击关闭"
    );
  }

  function setSoundMuted(muted) {
    soundMuted = muted;
    sound.muted = muted;
    syncSoundUi();
    writeMuted(muted);
    if (!muted) sound.ensure();
  }

  // ---------------------------------------------------------------------------
  // 双人对战流程：房间 → 倒计时 → 交火 → 回合结算
  // ---------------------------------------------------------------------------
  // 双方按 clientId 排序自动分左右阵营，不需要额外协商
  function mySide() {
    if (!NET.peerId) return VERSUS.role === "host" ? "left" : "right";
    return NET.clientId < NET.peerId ? "left" : "right";
  }

  function foeSide() {
    return mySide() === "left" ? "right" : "left";
  }

  function versusSpawnFor(side) {
    const preferred = side === "left"
      ? { x: 250, y: WORLD.height / 2 }
      : { x: WORLD.width - 250, y: WORLD.height / 2 };
    if (!tankCollides(preferred.x, preferred.y, 26)) return preferred;

    for (let radius = 60; radius <= 420; radius += 60) {
      for (let step = 0; step < 12; step += 1) {
        const angle = (step / 12) * Math.PI * 2;
        const point = {
          x: clamp(preferred.x + Math.cos(angle) * radius, 90, WORLD.width - 90),
          y: clamp(preferred.y + Math.sin(angle) * radius, 90, WORLD.height - 90),
        };
        if (!tankCollides(point.x, point.y, 26)) return point;
      }
    }
    return preferred;
  }

  function createRemoteTank(side) {
    const spawn = versusSpawnFor(side);
    return {
      x: spawn.x,
      y: spawn.y,
      targetX: spawn.x,
      targetY: spawn.y,
      vx: 0,
      vy: 0,
      errorX: 0,
      errorY: 0,
      radius: 24,
      bodyAngle: 0,
      turretAngle: 0,
      targetBody: 0,
      targetTurret: 0,
      health: 100,
      maxHealth: 100,
      muzzleFlash: 0,
      hitFlash: 0,
      elite: false,
      alive: true,
      overdrive: false,
      type: { color: "#d2604a", attackType: "straight", name: "对手" },
    };
  }

  function startVersusMatch() {
    if (!VERSUS.role) return;
    VERSUS.active = true;
    VERSUS.myScore = 0;
    VERSUS.foeScore = 0;
    VERSUS.round = 1;
    VERSUS.pendingOver = false;
    VERSUS.lastWinner = null;
    gameState = "playing";
    onlineOverlay.classList.remove("visible");
    startOverlay.classList.remove("visible");
    buffOverlay.classList.remove("visible");
    gameOverOverlay.classList.remove("visible");
    pauseOverlay.classList.remove("visible");
    foeReadout.hidden = false;
    resetVersusRound();
    sound.wave();
    showMessage("对战开始 · 先到 3 分获胜", 2.2);
  }

  function resetVersusRound() {
    createArena(layoutIndexFromCode(VERSUS.roomCode));
    player = createPlayer();
    const mySpawn = versusSpawnFor(mySide());
    player.x = mySpawn.x;
    player.y = mySpawn.y;
    player.invulnerable = 1.2;

    const foeSpawn = versusSpawnFor(foeSide());
    remoteTank = createRemoteTank(foeSide());
    remoteTank.x = foeSpawn.x;
    remoteTank.y = foeSpawn.y;
    remoteTank.targetX = foeSpawn.x;
    remoteTank.targetY = foeSpawn.y;

    enemies = [];
    bullets = [];
    beams = [];
    particles = [];
    pickups = [];
    spawnQueue = [];
    intermission = 0;
    camera.x = player.x;
    camera.y = player.y;
    camera.shake = 0;

    VERSUS.phase = "countdown";
    VERSUS.timer = 3;
    VERSUS.lastWinner = null;
    playerCanFire = false;

    createRing(player.x, player.y, 110, COLORS.teal, 0.7, 5);
    createRing(remoteTank.x, remoteTank.y, 110, "#d2604a", 0.7, 5);
    updateHud();
    updateAmmoPips();
  }

  function updateVersus(dt) {
    updateRemoteTank(dt);

    if (VERSUS.phase === "countdown") {
      VERSUS.timer -= dt;
      setText(waveLabel, "对战准备");
      setText(waveTimer, Math.max(1, Math.ceil(VERSUS.timer)));
      if (VERSUS.timer <= 0) {
        VERSUS.phase = "live";
        playerCanFire = true;
        showMessage("开火！", 1);
        sound.wave();
      }
      return;
    }

    if (VERSUS.phase === "live") {
      setText(waveLabel, "比分");
      setText(waveTimer, `${VERSUS.myScore} : ${VERSUS.foeScore}`);
      // 对手血量归零时本方也自行结算，避免单条消息丢失导致比分不同步
      if (remoteTank && remoteTank.health <= 0) {
        resolveVersusRound(mySide(), true);
      }
      return;
    }

    if (VERSUS.phase === "roundEnd") {
      VERSUS.timer -= dt;
      setText(
        waveLabel,
        VERSUS.lastWinner === mySide() ? "本回合胜利" : "本回合失利"
      );
      setText(waveTimer, Math.max(1, Math.ceil(VERSUS.timer)));
      if (VERSUS.timer <= 0) {
        if (VERSUS.pendingOver) {
          endVersusMatch();
        } else {
          VERSUS.round += 1;
          resetVersusRound();
        }
      }
    }
  }

  function updateRemoteTank(dt) {
    if (!remoteTank) return;

    // 先按对手上报的速度外推，让对手坦克不再"卡在过去的时刻"
    remoteTank.x += remoteTank.vx * dt;
    remoteTank.y += remoteTank.vy * dt;

    // 再把与权威位置的偏差平滑消掉（约 110ms 收敛），避免瞬移跳帧
    const correction = 1 - Math.exp(-9 * dt);
    remoteTank.x += remoteTank.errorX * correction;
    remoteTank.y += remoteTank.errorY * correction;
    remoteTank.errorX *= 1 - correction;
    remoteTank.errorY *= 1 - correction;

    remoteTank.bodyAngle = lerpAngle(
      remoteTank.bodyAngle,
      remoteTank.targetBody,
      Math.min(1, 20 * dt)
    );
    remoteTank.turretAngle = lerpAngle(
      remoteTank.turretAngle,
      remoteTank.targetTurret,
      Math.min(1, 26 * dt)
    );
    remoteTank.muzzleFlash = Math.max(0, remoteTank.muzzleFlash - dt);
    remoteTank.hitFlash = Math.max(0, remoteTank.hitFlash - dt);
  }

  function applyRemoteState(payload) {
    if (!remoteTank) return;
    const x = Number(payload.x);
    const y = Number(payload.y);
    const vx = Number(payload.vx) || 0;
    const vy = Number(payload.vy) || 0;
    if (Number.isFinite(x) && Number.isFinite(y)) {
      // 状态包描述的是"发出时刻"的位置，按单向延迟补偿到"当前时刻"
      const oneWay = clamp((NET.latency || 0) / 2000, 0, 0.5);
      const targetX = x + vx * oneWay;
      const targetY = y + vy * oneWay;

      const jump = Math.hypot(targetX - remoteTank.x, targetY - remoteTank.y);
      if (jump > 280) {
        // 复活、传送等大跳变直接对齐，不做事后修正
        remoteTank.x = targetX;
        remoteTank.y = targetY;
        remoteTank.errorX = 0;
        remoteTank.errorY = 0;
      } else {
        remoteTank.errorX = targetX - remoteTank.x;
        remoteTank.errorY = targetY - remoteTank.y;
      }
      remoteTank.targetX = targetX;
      remoteTank.targetY = targetY;
    }
    remoteTank.vx = vx;
    remoteTank.vy = vy;
    remoteTank.targetBody = Number(payload.b) || 0;
    remoteTank.targetTurret = Number(payload.a) || 0;
    remoteTank.maxHealth = Number(payload.m) || 100;
    remoteTank.health = clamp(Number(payload.h) || 0, 0, remoteTank.maxHealth);
    remoteTank.overdrive = Boolean(payload.o);
    remoteTank.alive = remoteTank.health > 0;
  }

  function spawnRemoteBullet(payload) {
    const angle = Number(payload.a) || 0;
    const speed = clamp(Number(payload.s) || 690, 200, 1200);
    const originX = Number(payload.x);
    const originY = Number(payload.y);
    const x = Number.isFinite(originX) ? originX : remoteTank ? remoteTank.x : player.x;
    const y = Number.isFinite(originY) ? originY : remoteTank ? remoteTank.y : player.y;

    // 消息在路上花掉的时间里炮弹已经飞了一段，按单程延迟补上，避免画面"晚发射"
    const oneWayDelay = clamp((NET.latency || 0) / 2000, 0, 0.4);
    const travelCompensation = speed * oneWayDelay;
    const bulletX = x + Math.cos(angle) * travelCompensation;
    const bulletY = y + Math.sin(angle) * travelCompensation;

    // 对手的炮弹只做视觉表现，命中判定由开火方本地计算后发 "hit" 通知
    bullets.push({
      x: bulletX,
      y: bulletY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 5,
      damage: 0,
      owner: "remote",
      life: 1.8,
      color: "#ffb07a",
      glow: "#ffd9b0",
      behavior: "straight",
      bounces: 0,
      homingStrength: 0,
      homingDuration: 0,
      explosive: false,
    });
    if (remoteTank) remoteTank.muzzleFlash = 0.08;
    createMuzzleParticles(x, y, angle, "#ffb07a");
  }

  function versusTargetHit(bullet) {
    if (!VERSUS.active || !remoteTank || !remoteTank.alive) return false;
    return (
      Math.hypot(remoteTank.x - bullet.x, remoteTank.y - bullet.y) <
      remoteTank.radius + bullet.radius
    );
  }

  function hitRemoteTank(damage, angle) {
    if (!remoteTank || !remoteTank.alive) return;
    const applied = Math.max(1, Math.round(damage));
    remoteTank.health = Math.max(0, remoteTank.health - applied);
    remoteTank.hitFlash = 0.12;
    remoteTank.x = clamp(
      remoteTank.x + Math.cos(angle) * 3,
      remoteTank.radius,
      WORLD.width - remoteTank.radius
    );
    remoteTank.y = clamp(
      remoteTank.y + Math.sin(angle) * 3,
      remoteTank.radius,
      WORLD.height - remoteTank.radius
    );
    createBurst(remoteTank.x, remoteTank.y, "#ffb3a2", 6, 110);
    sound.hit();
    netSend({ t: "hit", d: applied });

    if (remoteTank.health <= 0) {
      createExplosion(remoteTank.x, remoteTank.y, "#d2604a", 30);
      camera.shake = Math.max(camera.shake, 10);
    }
  }

  function applyIncomingHit(payload) {
    if (!VERSUS.active || VERSUS.phase !== "live") return;
    const damage = clamp(Number(payload.d) || 0, 0, 60);
    player.health = Math.max(0, player.health - damage);
    player.hitFlash = 0.18;
    camera.shake = Math.max(camera.shake, 8);
    createBurst(player.x, player.y, "#ff9f72", 8, 130);
    sound.hit();

    if (player.health <= 0) {
      createExplosion(player.x, player.y, COLORS.player, 30);
      resolveVersusRound(foeSide(), true);
    }
  }

  function resolveVersusRound(winnerSide, broadcast) {
    if (!VERSUS.active) return;
    if (VERSUS.phase !== "live") return;

    VERSUS.phase = "roundEnd";
    VERSUS.timer = 3.2;
    VERSUS.lastWinner = winnerSide;
    playerCanFire = false;

    const iWon = winnerSide === mySide();
    if (iWon) VERSUS.myScore += 1;
    else VERSUS.foeScore += 1;

    if (broadcast) netSend({ t: "round", w: winnerSide });
    VERSUS.pendingOver =
      VERSUS.myScore >= VERSUS.target || VERSUS.foeScore >= VERSUS.target;

    showMessage(iWon ? "本回合胜利" : "本回合失利", 2);
    sound.explosion();
  }

  function endVersusMatch() {
    VERSUS.phase = "over";
    playerCanFire = false;
    gameState = "gameover";

    const iWon = VERSUS.myScore > VERSUS.foeScore;
    setText(gameOverKicker, "对战结束");
    setText(gameOverTitle, iWon ? "胜利" : "失败");
    setText(finalScoreLabel, "我方比分");
    setText(finalWaveLabel, "对手比分");
    setText(finalKillsLabel, "总回合");
    setText(finalScore, VERSUS.myScore);
    setText(finalWave, VERSUS.foeScore);
    setText(finalKills, VERSUS.round);
    setText(restartButton, "再来一局");
    newRecordBadge.hidden = true;

    gameOverOverlay.classList.add("visible");
    sound.wave();
  }

  function showOnlineLobby() {
    gameState = "lobby";
    VERSUS.active = false;
    VERSUS.phase = "lobby";
    VERSUS.role = null;
    VERSUS.roomCode = "";
    playerCanFire = true;
    remoteTank = null;
    foeReadout.hidden = true;

    onlineActions.hidden = false;
    roomPanel.hidden = true;
    roomCodeText.textContent = "------";
    roomCodeInput.value = "";
    onlineStatus.textContent = "创建房间后把房间码发给朋友，对方输入房间码即可加入。";
    updateNetStatus("", "未连接");
    setText(netLatency, "");

    startOverlay.classList.remove("visible");
    onlineOverlay.classList.add("visible");
    sound.ensure();
  }

  function startHosting() {
    const code = makeRoomCode();
    if (!netStart("host", code)) return;
    onlineStatus.textContent = "把下面的房间码发给朋友，对方加入后会自动开战。";
  }

  function joinRoomByCode() {
    const code = roomCodeInput.value
      .trim()
      .toUpperCase()
      .replace(/[^0-9A-Z]/g, "");
    roomCodeInput.value = code;
    if (code.length !== 6) {
      onlineStatus.textContent = "房间码是 6 位字符，请检查后重新输入。";
      sound.hit();
      roomCodeInput.focus();
      return;
    }
    if (!netStart("guest", code)) return;
    onlineStatus.textContent = "正在加入房间，请稍候…";
  }

  function leaveOnlineLobby() {
    netClose();
    VERSUS.active = false;
    VERSUS.phase = "idle";
    VERSUS.role = null;
    VERSUS.roomCode = "";
    playerCanFire = true;
    remoteTank = null;
    foeReadout.hidden = true;
    onlineOverlay.classList.remove("visible");
    startOverlay.classList.add("visible");
    gameState = "menu";
    resetGame();
    renderBestRecord();
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
    setText(waveLabel, "区域肃清");
    setText(waveTimer, "BUFF");
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
    rebuildArenaForNextWave();
    gameState = "playing";
    intermission = 4;
    lastTime = performance.now();
    updateHud();
    updateAmmoPips();
    showMessage(`${buff.name} 已装备 · 地图重构`, 2);
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

  function findSafePlayerSpawn() {
    const preferred = [
      { x: WORLD.width / 2, y: WORLD.height / 2 },
      { x: WORLD.width / 2 + 260, y: WORLD.height / 2 },
      { x: WORLD.width / 2 - 260, y: WORLD.height / 2 },
      { x: WORLD.width / 2, y: WORLD.height / 2 + 250 },
      { x: WORLD.width / 2, y: WORLD.height / 2 - 250 },
    ];

    const preferredSpawn = preferred.find(
      (point) => !tankCollides(point.x, point.y, 30)
    );
    if (preferredSpawn) return preferredSpawn;

    for (let attempt = 0; attempt < 120; attempt += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = randomRange(80, 430);
      const point = {
        x: clamp(WORLD.width / 2 + Math.cos(angle) * radius, 80, WORLD.width - 80),
        y: clamp(WORLD.height / 2 + Math.sin(angle) * radius, 80, WORLD.height - 80),
      };
      if (!tankCollides(point.x, point.y, 30)) return point;
    }

    return { x: 160, y: 160 };
  }

  function rebuildArenaForNextWave() {
    createArena();
    const spawn = findSafePlayerSpawn();
    player.x = spawn.x;
    player.y = spawn.y;
    player.vx = 0;
    player.vy = 0;
    player.invulnerable = 1.5;
    bullets = [];
    beams = [];
    pickups = [];
    camera.x = player.x;
    camera.y = player.y;
    createRing(player.x, player.y, 110, "#79e2d3", 0.7, 5);
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
    const ricochetCount = wave >= 3 ? 1 + Math.floor((wave - 3) / 2) : 0;
    const heavyCount = wave >= 4 ? 1 + Math.floor((wave - 4) / 3) : 0;
    const laserCount = wave >= 5 ? 1 + Math.floor((wave - 5) / 3) : 0;
    const seekerCount = wave >= 7 ? 1 + Math.floor((wave - 7) / 3) : 0;

    for (let i = 0; i < scoutCount; i += 1) spawnQueue.push({ type: "scout", time: i * 0.24 });
    for (let i = 0; i < gunnerCount; i += 1) spawnQueue.push({ type: "gunner", time: 0.8 + i * 0.46 });
    for (let i = 0; i < ricochetCount; i += 1) spawnQueue.push({ type: "ricochet", time: 1.25 + i * 0.58 });
    for (let i = 0; i < heavyCount; i += 1) spawnQueue.push({ type: "heavy", time: 1.9 + i * 0.72 });
    for (let i = 0; i < laserCount; i += 1) spawnQueue.push({ type: "laser", time: 2.35 + i * 0.82 });
    for (let i = 0; i < seekerCount; i += 1) spawnQueue.push({ type: "seeker", time: 2.8 + i * 0.74 });

    spawnQueue.sort((a, b) => a.time - b.time);
    spawnClock = 0;
    setText(waveLabel, `第 ${wave} 波`);
    setText(waveTimer, String(spawnQueue.length).padStart(2, "0"));
    setText(difficultyLabel, `威胁 x${difficulty.multiplier.toFixed(1)}`);
    const weaponIntel =
      wave === 3
        ? " · 弹跳炮入场"
        : wave === 5
          ? " · 激光炮入场"
          : wave === 7
            ? " · 追踪炮入场"
            : "";
    showMessage(
      `第 ${wave} 波 · 威胁 x${difficulty.multiplier.toFixed(1)}${weaponIntel}`,
      2.2
    );
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
      setText(waveLabel, "准备迎战");
      setText(waveTimer, Math.max(1, Math.ceil(intermission)));
      if (intermission <= 0) startWave();
      return;
    }

    spawnClock += dt;
    while (spawnQueue.length && spawnQueue[0].time <= spawnClock) {
      const next = spawnQueue.shift();
      spawnEnemy(next.type);
    }

    setText(waveTimer, String(spawnQueue.length + enemies.length).padStart(2, "0"));

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
    if (wantsToFire && playerCanFire) firePlayerCannon();

    if (player.auxLaserLevel > 0) {
      player.auxLaserTimer -= dt;
      if (player.auxLaserTimer <= 0) firePlayerAuxiliaryLaser();
    }

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
    const speed = (player.overdrive > 0 ? 760 : 690) * player.bulletSpeedMultiplier;
    const baseDamage = player.overdrive > 0 ? 48 : 38;
    const projectileCount = 1 + player.extraProjectiles;
    let muzzleX = player.x;
    let muzzleY = player.y;
    let lastAngle = player.turretAngle;

    for (let index = 0; index < projectileCount; index += 1) {
      const scatterOffset = (index - (projectileCount - 1) / 2) * 0.075;
      const angle =
        player.turretAngle +
        scatterOffset +
        randomRange(-spread, spread);
      lastAngle = angle;
      muzzleX = player.x + Math.cos(angle) * (player.radius + 19);
      muzzleY = player.y + Math.sin(angle) * (player.radius + 19);
      if (VERSUS.active) {
        netSend({ t: "fire", x: muzzleX, y: muzzleY, a: angle, s: speed });
      }
      bullets.push({
        x: muzzleX,
        y: muzzleY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 5 + player.bulletRadiusBonus,
        damage: baseDamage * player.damageMultiplier,
        owner: "player",
        // 对战地图双方出生点相距较远，子弹需要更长的飞行时间才够得着
        life: VERSUS.active ? 2.6 : 1.65,
        color: COLORS.bullet,
        glow: "#fff1b2",
        behavior: player.homingShots > 0 ? "homing" : "straight",
        bounces: player.ricochetShots,
        homingStrength: 2.7 + player.homingShots * 1.15,
        homingDuration: 1.25 + player.homingShots * 0.35,
        explosive: player.explosiveShots > 0,
      });
    }

    player.magazine -= 1;
    const fireDelay = player.overdrive > 0 ? player.fireDelay * 0.62 : player.fireDelay;
    player.fireTimer = fireDelay / player.fireRateMultiplier;
    player.muzzleFlash = 0.08;
    player.vx -= Math.cos(lastAngle) * 13;
    player.vy -= Math.sin(lastAngle) * 13;
    createMuzzleParticles(muzzleX, muzzleY, lastAngle, COLORS.bullet);
    updateAmmoPips();
    sound.shot();

    if (player.magazine <= 0) startReload();
  }

  function startReload() {
    if (player.reloadTimer > 0 || player.magazine === player.magazineSize) return;
    player.reloadTimer = 1.18 * player.reloadMultiplier;
    showMessage("自动装填", 0.85);
  }

  function findNearestVisibleEnemy(maxRange) {
    let nearest = null;
    let nearestDistance = maxRange;
    enemies.forEach((enemy) => {
      if (enemy.spawnTimer > 0) return;
      const enemyDistance = distance(enemy, player);
      if (enemyDistance < nearestDistance && hasLineOfSight(player, enemy)) {
        nearest = enemy;
        nearestDistance = enemyDistance;
      }
    });
    return nearest;
  }

  function getBeamLength(origin, angle, maxRange) {
    const step = 14;
    for (let travelled = step; travelled <= maxRange; travelled += step) {
      const x = origin.x + Math.cos(angle) * travelled;
      const y = origin.y + Math.sin(angle) * travelled;
      if (
        x < 28 ||
        y < 28 ||
        x > WORLD.width - 28 ||
        y > WORLD.height - 28 ||
        obstacles.some((obstacle) => circleIntersectsRect(x, y, 4, obstacle))
      ) {
        return travelled;
      }
    }
    return maxRange;
  }

  function firePlayerAuxiliaryLaser() {
    const target = findNearestVisibleEnemy(960);
    if (!target) {
      player.auxLaserTimer = 0.45;
      return;
    }

    const angle = Math.atan2(target.y - player.y, target.x - player.x);
    const length = getBeamLength(player, angle, 980);
    beams.push({
      owner: "player",
      x: player.x + Math.cos(angle) * (player.radius + 18),
      y: player.y + Math.sin(angle) * (player.radius + 18),
      angle,
      length,
      life: 0.2,
      maxLife: 0.2,
      color: "#79e2d3",
      coreColor: "#e8fffb",
      width: 4 + player.auxLaserLevel,
    });
    damageEnemy(
      target,
      34 * player.auxLaserLevel * player.damageMultiplier,
      angle,
      95
    );
    player.auxLaserTimer = Math.max(
      0.75,
      2.8 - (player.auxLaserLevel - 1) * 0.35
    );
    sound.laser();
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
      const incoming =
        bullet.owner === "enemy" || (VERSUS.active && bullet.owner === "remote");
      if (incoming && distance(bullet, player) < clearRadius) {
        createBurst(bullet.x, bullet.y, "#d9fff9", 4, 90);
        return false;
      }
      return true;
    });

    if (VERSUS.active && remoteTank && remoteTank.alive) {
      const foeDistance = distance(remoteTank, player);
      if (foeDistance < clearRadius) {
        const foeAngle = Math.atan2(remoteTank.y - player.y, remoteTank.x - player.x);
        const foeDamage = Math.round(
          34 *
            player.shockwaveDamageMultiplier *
            (1 - foeDistance / (clearRadius + 70))
        );
        if (foeDamage > 0) hitRemoteTank(foeDamage, foeAngle);
      }
    }

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

      const speedScale =
        enemy.type.attackType === "laser" && enemy.laserCharge > 0
          ? 0.42
          : Math.abs(rangeError) < 58
            ? 0.82
            : 1;
      const moveSpeed = enemy.type.speed * speedScale * enemy.speedMultiplier;
      moveTank(
        enemy,
        Math.cos(enemy.bodyAngle) * moveSpeed * dt,
        Math.sin(enemy.bodyAngle) * moveSpeed * dt
      );

      if (enemy.type.attackType === "laser") {
        updateEnemyLaser(enemy, dt, targetAngle, canSeePlayer, dist);
      } else if (
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

  function updateEnemyLaser(enemy, dt, targetAngle, canSeePlayer, targetDistance) {
    if (enemy.laserCharge > 0) {
      enemy.laserCharge -= dt;
      enemy.laserAngle = lerpAngle(
        enemy.laserAngle,
        targetAngle,
        Math.min(1, 2.8 * dt)
      );
      if (enemy.laserCharge <= 0) fireEnemyLaser(enemy);
      return;
    }

    if (
      canSeePlayer &&
      targetDistance < enemy.type.beamRange &&
      enemy.fireTimer <= 0 &&
      Math.abs(lerpAngle(enemy.turretAngle, targetAngle, 1) - targetAngle) < 0.16
    ) {
      enemy.laserCharge = enemy.type.chargeTime;
      enemy.laserAngle = enemy.turretAngle;
      enemy.fireTimer = 999;
      createRing(enemy.x, enemy.y, 62, enemy.type.color, enemy.type.chargeTime, 3);
    }
  }

  function fireEnemyLaser(enemy) {
    const angle = enemy.laserAngle;
    const length = getBeamLength(enemy, angle, enemy.type.beamRange);
    beams.push({
      owner: "enemy",
      x: enemy.x + Math.cos(angle) * (enemy.radius + 17),
      y: enemy.y + Math.sin(angle) * (enemy.radius + 17),
      angle,
      length,
      life: 0.24,
      maxLife: 0.24,
      color: enemy.type.color,
      coreColor: "#fff3ff",
      width: enemy.elite ? 7 : 5,
    });

    const directionX = Math.cos(angle);
    const directionY = Math.sin(angle);
    const toPlayerX = player.x - enemy.x;
    const toPlayerY = player.y - enemy.y;
    const forwardDistance = toPlayerX * directionX + toPlayerY * directionY;
    const perpendicularDistance = Math.abs(
      toPlayerX * directionY - toPlayerY * directionX
    );
    if (
      forwardDistance > 0 &&
      forwardDistance < length &&
      perpendicularDistance < player.radius + 8 &&
      hasLineOfSight(enemy, player)
    ) {
      damagePlayer(enemy.type.damage * enemy.damageMultiplier);
    }

    enemy.fireTimer =
      enemy.type.fireDelay *
      enemy.fireDelayMultiplier *
      randomRange(0.92, 1.14);
    enemy.muzzleFlash = 0.14;
    sound.laser();
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
        behavior: enemy.type.attackType || "straight",
        bounces: enemy.type.bounces || 0,
        homingStrength: enemy.type.turnRate || 0,
        homingDuration: enemy.type.homingDuration || 0,
        explosive: false,
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

      if (
        bullet.behavior === "homing" &&
        bullet.homingDuration > 0 &&
        (bullet.homingTime || 0) < bullet.homingDuration
      ) {
        bullet.homingTime = (bullet.homingTime || 0) + dt;
        let target = player;
        if (bullet.owner === "player") {
          let nearestDistance = Infinity;
          enemies.forEach((enemy) => {
            const enemyDistance = distance(enemy, bullet);
            if (enemy.spawnTimer <= 0 && enemyDistance < nearestDistance) {
              nearestDistance = enemyDistance;
              target = enemy;
            }
          });
        }

        if (target) {
          const speed = Math.hypot(bullet.vx, bullet.vy);
          const currentAngle = Math.atan2(bullet.vy, bullet.vx);
          const targetAngle = Math.atan2(target.y - bullet.y, target.x - bullet.x);
          const guidedAngle = lerpAngle(
            currentAngle,
            targetAngle,
            Math.min(1, bullet.homingStrength * dt)
          );
          bullet.vx = Math.cos(guidedAngle) * speed;
          bullet.vy = Math.sin(guidedAngle) * speed;
        }
      }

      const travelX = bullet.vx * dt;
      const travelY = bullet.vy * dt;
      const travelDistance = Math.hypot(travelX, travelY);
      const steps = Math.max(1, Math.ceil(travelDistance / 10));

      for (let step = 0; step < steps && !dead; step += 1) {
        const previousX = bullet.x;
        const previousY = bullet.y;
        bullet.x += travelX / steps;
        bullet.y += travelY / steps;

        const hitBoundary =
          bullet.x < 25 ||
          bullet.y < 25 ||
          bullet.x > WORLD.width - 25 ||
          bullet.y > WORLD.height - 25;
        if (hitBoundary) {
          if (bullet.bounces > 0) {
            if (bullet.x < 25 || bullet.x > WORLD.width - 25) {
              bullet.x = clamp(bullet.x, 26, WORLD.width - 26);
              bullet.vx *= -1;
            } else {
              bullet.y = clamp(bullet.y, 26, WORLD.height - 26);
              bullet.vy *= -1;
            }
            bullet.bounces -= 1;
            bullet.life = Math.min(2.4, bullet.life + 0.26);
            createBurst(bullet.x, bullet.y, bullet.color, 5, 75);
            break;
          }
          dead = true;
          if (bullet.explosive) detonatePlayerBullet(bullet);
          else createBurst(bullet.x, bullet.y, bullet.color, 5, 65);
          break;
        }

        const hitObstacle = obstacles.find((obstacle) =>
          circleIntersectsRect(bullet.x, bullet.y, bullet.radius, obstacle)
        );
        if (hitObstacle) {
          if (bullet.bounces > 0) {
            reflectBullet(bullet, hitObstacle, previousX, previousY);
            break;
          }
          dead = true;
          if (bullet.explosive) detonatePlayerBullet(bullet);
          else createBurst(bullet.x, bullet.y, bullet.color, 7, 100);
          break;
        }

        if (bullet.owner === "player") {
          if (versusTargetHit(bullet)) {
            const angle = Math.atan2(bullet.vy, bullet.vx);
            hitRemoteTank(bullet.damage, angle);
            if (bullet.explosive) detonatePlayerBullet(bullet);
            dead = true;
          } else {
            const enemy = enemies.find((candidate) =>
              candidate.spawnTimer <= 0 &&
              Math.hypot(candidate.x - bullet.x, candidate.y - bullet.y) < candidate.radius + bullet.radius
            );
            if (enemy) {
              const angle = Math.atan2(bullet.vy, bullet.vx);
              damageEnemy(enemy, bullet.damage, angle, 105);
              if (bullet.explosive) {
                detonatePlayerBullet(bullet, enemy);
              }
              dead = true;
            }
          }
        } else if (
          !VERSUS.active &&
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

  function reflectBullet(bullet, obstacle, previousX, previousY) {
    const hitHorizontal =
      previousX <= obstacle.x ||
      previousX >= obstacle.x + obstacle.w;
    const hitVertical =
      previousY <= obstacle.y ||
      previousY >= obstacle.y + obstacle.h;

    if (hitHorizontal && !hitVertical) bullet.vx *= -1;
    else if (hitVertical && !hitHorizontal) bullet.vy *= -1;
    else {
      bullet.vx *= -1;
      bullet.vy *= -1;
    }

    bullet.x = previousX;
    bullet.y = previousY;
    bullet.bounces -= 1;
    bullet.life = Math.min(2.6, bullet.life + 0.3);
    createBurst(bullet.x, bullet.y, bullet.color, 6, 85);
  }

  function detonatePlayerBullet(bullet, directTarget = null) {
    const radius = 86 + player.explosiveShots * 14;
    const blastDamage = bullet.damage * (0.48 + player.explosiveShots * 0.05);
    createExplosion(bullet.x, bullet.y, "#ffb34f", 14);
    enemies.slice().forEach((enemy) => {
      if (enemy === directTarget || enemy.health <= 0) return;
      const blastDistance = distance(enemy, bullet);
      if (blastDistance < radius + enemy.radius) {
        const angle = Math.atan2(enemy.y - bullet.y, enemy.x - bullet.x);
        damageEnemy(enemy, blastDamage, angle, 125);
      }
    });
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

  function updateBeams(dt) {
    beams = beams.filter((beam) => {
      beam.life -= dt;
      return beam.life > 0;
    });
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
    setText(healthText, Math.ceil(player ? player.health : 0));
    setBarWidth(healthBar, healthPercent);
    setText(energyText, `${Math.floor(energyPercent * 100)}%`);
    setBarWidth(energyBar, energyPercent);

    if (VERSUS.active) {
      setText(waveChipLabel, "比分");
      setText(scoreChipLabel, "回合");
      setText(waveValue, `${VERSUS.myScore}:${VERSUS.foeScore}`);
      setText(scoreValue, String(VERSUS.round).padStart(2, "0"));
      setText(difficultyLabel, `先到 ${VERSUS.target} 分获胜`);
      setText(
        buffCountLabel,
        `${VERSUS.role === "host" ? "房主" : "加入方"} · ${
          NET.p2pReady ? "直连" : "中继"
        } · ${NET.latency}ms`
      );
      const foeRatio = remoteTank
        ? clamp(remoteTank.health / remoteTank.maxHealth, 0, 1)
        : 0;
      setText(foeHealthText, remoteTank ? Math.ceil(remoteTank.health) : 0);
      setBarWidth(foeHealthBar, foeRatio);
      setDisabled(
        specialButton,
        energyPercent < 1 || gameState !== "playing" || !playerCanFire
      );
      return;
    }

    const displayedWave = Math.max(1, wave);
    setText(waveValue, String(displayedWave).padStart(2, "0"));
    setText(scoreValue, formatScore(score));
    setText(difficultyLabel, `威胁 x${getDifficulty(displayedWave).multiplier.toFixed(1)}`);
    setText(buffCountLabel, `强化 ${player ? player.buffCount : 0}`);
    setDisabled(specialButton, energyPercent < 1 || gameState !== "playing");
  }

  function updateAmmoPips() {
    if (!player) {
      ammoPips.innerHTML = "";
      ammoPipState.size = -1;
      ammoPipState.magazine = -1;
      ammoPipState.reloading = null;
      return;
    }

    if (ammoPipState.size !== player.magazineSize) {
      let markup = "";
      for (let i = 0; i < player.magazineSize; i += 1) {
        markup += '<span class="ammo-pip"></span>';
      }
      ammoPips.innerHTML = markup;
      ammoPipState.size = player.magazineSize;
      ammoPipState.magazine = -1;
      ammoPipState.reloading = null;
    }

    if (ammoPipState.magazine !== player.magazine) {
      const pips = ammoPips.children;
      for (let i = 0; i < pips.length; i += 1) {
        pips[i].classList.toggle("active", i < player.magazine);
      }
      ammoPipState.magazine = player.magazine;
    }

    const reloading = player.reloadTimer > 0;
    if (ammoPipState.reloading !== reloading) {
      setText(reloadText, reloading ? "装填" : "弹药");
      ammoPipState.reloading = reloading;
    }
  }

  function update(dt) {
    elapsed += dt;
    updateMessage(dt);
    if (VERSUS.active) {
      updateVersus(dt);
    } else {
      updateWave(dt);
      updateEnemies(dt);
    }
    updatePlayer(dt);
    updateBullets(dt);
    updatePickups(dt);
    updateParticles(dt);
    updateBeams(dt);
    netTick(dt);
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

    if (!isPlayer && tank.type.attackType === "laser" && tank.laserCharge > 0) {
      const chargeRatio = 1 - tank.laserCharge / tank.type.chargeTime;
      ctx.save();
      ctx.globalAlpha = 0.25 + chargeRatio * 0.55;
      ctx.strokeStyle = tank.type.color;
      ctx.lineWidth = 1.5 + chargeRatio * 3;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(
        tank.x + Math.cos(tank.laserAngle) * (tank.radius + 16),
        tank.y + Math.sin(tank.laserAngle) * (tank.radius + 16)
      );
      ctx.lineTo(
        tank.x + Math.cos(tank.laserAngle) * tank.type.beamRange,
        tank.y + Math.sin(tank.laserAngle) * tank.type.beamRange
      );
      ctx.stroke();
      ctx.restore();
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

  function drawBeams() {
    beams.forEach((beam) => {
      const alpha = clamp(beam.life / beam.maxLife, 0, 1);
      const endX = beam.x + Math.cos(beam.angle) * beam.length;
      const endY = beam.y + Math.sin(beam.angle) * beam.length;
      const gradient = ctx.createLinearGradient(beam.x, beam.y, endX, endY);
      gradient.addColorStop(0, beam.coreColor);
      gradient.addColorStop(0.65, beam.color);
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.save();
      ctx.lineCap = "round";
      ctx.globalAlpha = alpha;
      ctx.shadowColor = beam.color;
      ctx.shadowBlur = 24;
      ctx.strokeStyle = gradient;
      ctx.lineWidth = beam.width * 2.4;
      ctx.beginPath();
      ctx.moveTo(beam.x, beam.y);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      ctx.globalAlpha = alpha * 0.95;
      ctx.shadowBlur = 12;
      ctx.strokeStyle = beam.coreColor;
      ctx.lineWidth = beam.width * 0.75;
      ctx.beginPath();
      ctx.moveTo(beam.x, beam.y);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      ctx.restore();
    });
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
    const targets = enemies.map((enemy) => ({
      x: enemy.x,
      y: enemy.y,
      color: enemy.type.color,
    }));
    if (VERSUS.active && remoteTank && remoteTank.health > 0) {
      targets.push({ x: remoteTank.x, y: remoteTank.y, color: "#ff8b64" });
    }
    if (targets.length === 0) return;

    const margin = 34;

    targets.forEach((target) => {
      const screen = worldToScreen(target.x, target.y);
      if (screen.x > 24 && screen.x < view.width - 24 && screen.y > 24 && screen.y < view.height - 24) return;

      const angle = Math.atan2(target.y - player.y, target.x - player.x);
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
      ctx.fillStyle = target.color;
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

    if (VERSUS.active && remoteTank && remoteTank.health > 0) {
      drawTank(remoteTank, false);
    }

    if (gameState !== "gameover" && player.health > 0) drawTank(player, true);
    drawBullets();
    drawBeams();
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
      updateBeams(dt * 0.4);
      // 大厅阶段也要跑联机心跳，才能发现对手加入
      netTick(dt);
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
    restartButton.addEventListener("click", () => {
      if (VERSUS.active) {
        netSend({ t: "rematch" });
        startVersusMatch();
      } else {
        beginGame();
      }
    });
    restartFromPause.addEventListener("click", beginGame);
    resumeButton.addEventListener("click", resumeGame);
    onlineButton.addEventListener("click", showOnlineLobby);
    createRoomButton.addEventListener("click", startHosting);
    joinRoomButton.addEventListener("click", joinRoomByCode);
    leaveOnlineButton.addEventListener("click", leaveOnlineLobby);
    roomCodeInput.addEventListener("input", () => {
      roomCodeInput.value = roomCodeInput.value.toUpperCase().replace(/[^0-9A-Z]/g, "");
    });
    roomCodeInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        joinRoomByCode();
      }
    });
    buffCards.addEventListener("click", (event) => {
      const card = event.target.closest(".buff-card");
      if (!card) return;
      applyBuff(card.dataset.buffId);
    });
    pauseButton.addEventListener("click", () => {
      if (gameState === "playing") pauseGame();
      else if (gameState === "paused") resumeGame();
    });
    soundButton.addEventListener("click", () => {
      setSoundMuted(!soundMuted);
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
    window.addEventListener("beforeunload", () => {
      if (VERSUS.active) netSend({ t: "bye" });
    });
    if ("ResizeObserver" in window) {
      new ResizeObserver(resizeCanvas).observe(arena);
    }
  }

  createArena();
  player = createPlayer();
  bindInputs();
  resizeCanvas();
  sound.muted = soundMuted;
  syncSoundUi();
  renderBestRecord();
  updateAmmoPips();
  updateHud();
  requestAnimationFrame(frame);
})();
