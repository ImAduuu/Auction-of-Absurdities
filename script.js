/* ==========================================================================
   1. SOUND SYNTHESIZER (WEB AUDIO API)
   ========================================================================== */
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.muted = false;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playBidPing() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    }

    playTick() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    playGavelBang() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.25);

        gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.25);
    }

    playRevealSound(isGenuine) {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        if (isGenuine) {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, now);
            osc.frequency.setValueAtTime(659.25, now + 0.1);
            osc.frequency.setValueAtTime(783.99, now + 0.2);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        } else {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.linearRampToValueAtTime(100, now + 0.4);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        }

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(now + 0.5);
    }
}

const soundEngine = new SoundEngine();

/* ==========================================================================
   2. ABSURD ITEMS DATABASE
   ========================================================================== */
const ABSURD_ITEMS = [
    {
        id: 1,
        title: "Jar of Certified Haunted Air",
        emoji: "🏺",
        category: "Oddity",
        appraisedValue: 5500,
        isGenuine: true,
        description: "Sealed in 1842 by a frightened Victorian chimney sweep. Ghostly whispers not guaranteed, but highly likely."
    },
    {
        id: 2,
        title: "The Left Shoe of a Time Traveler",
        emoji: "👟",
        category: "Relic",
        appraisedValue: 8000,
        isGenuine: true,
        description: "Made of futuristic self-lacing cyber-leather. Smells faintly of ozone and the year 2154."
    },
    {
        id: 3,
        title: "NFT of a Half-Eaten Sandwich",
        emoji: "🥪",
        category: "Digital",
        appraisedValue: 3500,
        isGenuine: false,
        description: "Minted on the blockchain during lunch. The crust is permanently non-fungible."
    },
    {
        id: 4,
        title: "Slightly Used Invisible Ink",
        emoji: "🧪",
        category: "Alchemy",
        appraisedValue: 4200,
        isGenuine: true,
        description: "Half the bottle is empty, though you'll have to take our word for it because you can't see it."
    },
    {
        id: 5,
        title: "Deed to a Plot on Pluto",
        emoji: "🪐",
        category: "Real Estate",
        appraisedValue: 9000,
        isGenuine: false,
        description: "Includes mineral rights and prime waterfront property on frozen nitrogen glaciers."
    }
];

/* ==========================================================================
   3. GAME ENGINE CORE
   ========================================================================== */
class AuctionGame {
    constructor() {
        this.playerName = "Anonymous Bidderson";
        this.roomCode = null;
        this.isHost = false;
        this.role = "collector";
        this.balance = 10000;
        this.inventory = [];
        this.players = [];
        this.currentItemIndex = 0;
        this.currentBid = 500;
        this.highestBidder = "Starting Price";
        this.timer = 15;
        this.timerInterval = null;
        this.botNames = ["Duchess Beatrice", "Sir Sterling", "Lord Pennyworth", "Lady Cashmere", "Baron Crypto"];
    }

    toggleAudio() {
        soundEngine.muted = !soundEngine.muted;
        const icon = document.getElementById('audio-icon');
        const label = document.getElementById('audio-label');
        if (soundEngine.muted) {
            icon.className = "fas fa-volume-mute text-slate-500";
            label.textContent = "Sound OFF";
        } else {
            icon.className = "fas fa-volume-up text-amber-400";
            label.textContent = "Sound ON";
            soundEngine.playBidPing();
        }
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');

        let bgClass = "bg-slate-800 border-slate-700 text-white";
        if (type === 'success') bgClass = "bg-emerald-950 border-emerald-700 text-emerald-200";
        if (type === 'warning') bgClass = "bg-amber-950 border-amber-700 text-amber-200";
        if (type === 'error') bgClass = "bg-red-950 border-red-700 text-red-200";

        toast.className = `p-3 rounded-xl border shadow-xl text-xs font-semibold flex items-center gap-2 pointer-events-auto transition-all transform translate-x-full ${bgClass}`;
        toast.innerHTML = `<i class="fas fa-info-circle"></i> <span>${message}</span>`;

        container.appendChild(toast);

        setTimeout(() => toast.classList.remove('translate-x-full'), 10);
        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-x-full');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    showScreen(screenId) {
        ['screen-lobby', 'screen-waiting', 'screen-arena', 'screen-gameover'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('hidden');
        });
        const target = document.getElementById(screenId);
        if (target) target.classList.remove('hidden');

        // Toggle visibility of top header exit button based on lobby state
        const headerExit = document.getElementById('header-exit-btn');
        if (screenId === 'screen-lobby') {
            headerExit.classList.add('hidden');
        } else {
            headerExit.classList.remove('hidden');
        }
    }

    confirmExit() {
        if (confirm("Are you sure you want to exit the game session?")) {
            this.exitToMainMenu();
        }
    }

    exitToMainMenu() {
        clearInterval(this.timerInterval);
        this.timerInterval = null;

        this.roomCode = null;
        this.players = [];
        this.inventory = [];
        this.balance = 10000;
        this.currentItemIndex = 0;

        document.getElementById('modal-role-reveal').classList.add('hidden');
        document.getElementById('modal-item-result').classList.add('hidden');
        document.getElementById('header-room-info').classList.add('hidden');

        this.showScreen('screen-lobby');
        this.showToast("Exited to main lobby.", "info");
    }

    createRoom() {
        const nameInput = document.getElementById('input-player-name').value.trim();
        this.playerName = nameInput || "Baron Von Bidderson";
        this.roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
        this.isHost = true;

        this.setupLobby();
    }

    joinRoom() {
        const nameInput = document.getElementById('input-player-name').value.trim();
        const codeInput = document.getElementById('input-room-code').value.trim().toUpperCase();

        if (!codeInput || codeInput.length < 4) {
            this.showToast("Please enter a valid 4-character Room Code!", "error");
            return;
        }

        this.playerName = nameInput || "Lady Bidderson";
        this.roomCode = codeInput;
        this.isHost = false;

        this.setupLobby();
    }

    setupLobby() {
        document.getElementById('header-room-info').classList.remove('hidden');
        document.getElementById('header-room-info').classList.add('flex');
        document.getElementById('header-room-code').textContent = this.roomCode;
        document.getElementById('waiting-room-code').textContent = this.roomCode;

        this.players = [{ name: this.playerName, isHost: this.isHost, isBot: false }];

        const fillBots = document.getElementById('checkbox-fill-bots').checked;
        if (fillBots) {
            this.botNames.slice(0, 3).forEach(bot => {
                this.players.push({ name: bot, isHost: false, isBot: true });
            });
        }

        this.updateWaitingRoomList();

        if (!this.isHost) {
            document.getElementById('btn-start-game').classList.add('hidden');
            document.getElementById('waiting-guest-msg').classList.remove('hidden');
        } else {
            document.getElementById('btn-start-game').classList.remove('hidden');
            document.getElementById('waiting-guest-msg').classList.add('hidden');
        }

        this.showScreen('screen-waiting');
    }

    updateWaitingRoomList() {
        const list = document.getElementById('waiting-players-list');
        list.innerHTML = '';

        this.players.forEach(p => {
            const card = document.createElement('div');
            card.className = "p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs";
            card.innerHTML = `
                <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full ${p.isBot ? 'bg-cyan-400' : 'bg-emerald-400'}"></span>
                    <span class="font-bold text-white">${p.name} ${p.name === this.playerName ? '(You)' : ''}</span>
                </div>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded ${p.isHost ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-400'}">
                    ${p.isHost ? 'HOST' : p.isBot ? 'BOT' : 'PLAYER'}
                </span>
            `;
            list.appendChild(card);
        });

        document.getElementById('waiting-player-count').textContent = this.players.length;
    }

    copyRoomCode() {
        navigator.clipboard.writeText(this.roomCode);
        this.showToast("Room code copied to clipboard!", "success");
    }

    startGame() {
        const fraudsterIndex = Math.floor(Math.random() * this.players.length);
        this.players.forEach((p, idx) => {
            p.role = (idx === fraudsterIndex) ? 'fraudster' : 'collector';
            p.balance = 10000;
            p.inventory = [];
        });

        const me = this.players.find(p => p.name === this.playerName);
        this.role = me ? me.role : 'collector';

        this.revealRoleModal();
    }

    revealRoleModal() {
        const modal = document.getElementById('modal-role-reveal');
        const badgeIcon = document.getElementById('role-badge-icon');
        const badgeTitle = document.getElementById('role-badge-title');
        const roleName = document.getElementById('role-name');
        const roleDescCard = document.getElementById('role-desc-card');
        const accentBg = document.getElementById('role-accent-bg');

        if (this.role === 'fraudster') {
            badgeIcon.textContent = "🕵️‍♂️";
            badgeTitle.textContent = "Your Secret Identity";
            badgeTitle.className = "block text-xs font-black uppercase tracking-widest text-purple-400 mb-1";
            roleName.textContent = "THE FRAUDSTER";
            roleName.className = "text-3xl font-black text-purple-400 mb-3";
            accentBg.className = "absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-30 bg-purple-500";

            roleDescCard.innerHTML = `
                <p>⚠️ <strong>Goal:</strong> Trick collectors into buying fake items at inflated prices.</p>
                <p>• You know which items are <strong>FAKE</strong> beforehand.</p>
                <p>• Whenever a player buys a FAKE item, <strong>100% of their money goes directly to YOUR bank!</strong></p>
                <p>• Bid up items to trap rivals, but don't accidentally win fakes yourself!</p>
            `;
        } else {
            badgeIcon.textContent = "🎩";
            badgeTitle.textContent = "Your Secret Identity";
            badgeTitle.className = "block text-xs font-black uppercase tracking-widest text-amber-400 mb-1";
            roleName.textContent = "HONEST COLLECTOR";
            roleName.className = "text-3xl font-black text-amber-400 mb-3";
            accentBg.className = "absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-30 bg-amber-500";

            roleDescCard.innerHTML = `
                <p>🏆 <strong>Goal:</strong> Acquire real, valuable relics and maximize your Net Worth.</p>
                <p>• Bid on genuine artifacts to add their full appraisal value to your portfolio.</p>
                <p>• Beware of FAKES! Buying fake items wastes your money and pays off the hidden Fraudster!</p>
            `;
        }

        modal.classList.remove('hidden');
    }

    dismissRoleModal() {
        document.getElementById('modal-role-reveal').classList.add('hidden');
        this.currentItemIndex = 0;
        this.showScreen('screen-arena');
        this.loadItemRound();
    }

    loadItemRound() {
        const item = ABSURD_ITEMS[this.currentItemIndex];

        document.getElementById('arena-item-index').textContent = this.currentItemIndex + 1;
        document.getElementById('item-category').textContent = item.category;
        document.getElementById('item-appraisal').innerHTML = `Appraised: <strong class="text-amber-300 font-bold">$${item.appraisedValue.toLocaleString()}</strong>`;
        document.getElementById('item-emoji').textContent = item.emoji;
        document.getElementById('item-title').textContent = item.title;
        document.getElementById('item-description').textContent = `"${item.description}"`;

        this.currentBid = 500;
        this.highestBidder = "Starting Price";
        document.getElementById('arena-high-bid').textContent = `$${this.currentBid.toLocaleString()}`;
        document.getElementById('arena-high-bidder').textContent = this.highestBidder;
        document.getElementById('arena-user-balance').textContent = `$${this.balance.toLocaleString()}`;

        const roleInd = document.getElementById('user-role-indicator');
        if (this.role === 'fraudster') {
            roleInd.innerHTML = `<i class="fas fa-user-secret text-purple-400 mr-1"></i> FRAUDSTER`;
            roleInd.className = "text-xs font-bold px-3 py-1 rounded-lg bg-purple-950/80 border border-purple-800 text-purple-300";
        } else {
            roleInd.innerHTML = `<i class="fas fa-gem text-amber-400 mr-1"></i> COLLECTOR`;
            roleInd.className = "text-xs font-bold px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300";
        }

        const intelBox = document.getElementById('intel-secret-box');
        const intelText = document.getElementById('intel-secret-text');

        if (this.role === 'fraudster') {
            intelBox.classList.remove('hidden');
            if (!item.isGenuine) {
                intelText.textContent = "Secret Intel: FAKE ITEM! Pump the bid to bankrupt other collectors!";
                intelBox.className = "mt-4 p-3 rounded-xl bg-purple-950/60 border border-purple-700/60 text-xs text-purple-200 flex items-center gap-2";
            } else {
                intelText.textContent = "Secret Intel: GENUINE ITEM. You earn nothing from this sale.";
                intelBox.className = "mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2";
            }
        } else {
            intelBox.classList.add('hidden');
        }

        const log = document.getElementById('arena-bid-log');
        log.innerHTML = `<div class="text-slate-500 italic">Bidding started at $500...</div>`;

        this.startTimer();
    }

    startTimer() {
        clearInterval(this.timerInterval);
        this.timer = 15;
        this.updateTimerDisplay();

        this.timerInterval = setInterval(() => {
            this.timer--;
            this.updateTimerDisplay();

            soundEngine.playTick();

            if (this.timer > 2 && Math.random() < 0.45) {
                this.triggerBotBid();
            }

            if (this.timer <= 0) {
                clearInterval(this.timerInterval);
                this.concludeRound();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const timerEl = document.getElementById('arena-timer');
        timerEl.textContent = `${this.timer}s`;

        if (this.timer <= 5) {
            timerEl.className = "text-xl sm:text-2xl font-mono font-black text-red-500 animate-pulse";
        } else {
            timerEl.className = "text-xl sm:text-2xl font-mono font-black text-amber-400";
        }
    }

    placeBid(amount) {
        const newBid = this.currentBid + amount;

        if (newBid > this.balance) {
            this.showToast("You don't have enough cash for this bid!", "error");
            return;
        }

        this.currentBid = newBid;
        this.highestBidder = this.playerName;

        this.updateBidUI(this.playerName, newBid);
        soundEngine.playBidPing();

        if (this.timer < 5) {
            this.timer = 5;
            this.showToast("Late bid! Timer extended to 5s!", "warning");
        }
    }

    placeAllInBid() {
        if (this.balance <= this.currentBid) {
            this.showToast("Your remaining purse isn't higher than current bid!", "error");
            return;
        }
        this.placeBid(this.balance - this.currentBid);
    }

    triggerBotBid() {
        const item = ABSURD_ITEMS[this.currentItemIndex];
        const botBidders = this.players.filter(p => p.isBot && p.balance > this.currentBid + 100);

        if (botBidders.length === 0) return;

        const bot = botBidders[Math.floor(Math.random() * botBidders.length)];
        const increments = [100, 200, 500];
        const inc = increments[Math.floor(Math.random() * increments.length)];

        const proposedBid = this.currentBid + inc;

        if (proposedBid <= item.appraisedValue + 1500) {
            this.currentBid = proposedBid;
            this.highestBidder = bot.name;
            bot.balance -= inc;
            this.updateBidUI(bot.name, proposedBid);
            soundEngine.playBidPing();
        }
    }

    updateBidUI(bidder, amount) {
        document.getElementById('arena-high-bid').textContent = `$${amount.toLocaleString()}`;
        document.getElementById('arena-high-bidder').textContent = bidder;

        const log = document.getElementById('arena-bid-log');
        const entry = document.createElement('div');
        entry.className = "flex justify-between items-center py-1 border-b border-slate-900";
        entry.innerHTML = `
            <span class="font-bold text-slate-200">${bidder}</span>
            <span class="font-mono text-amber-400 font-bold">+$${amount.toLocaleString()}</span>
        `;
        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;
    }

    concludeRound() {
        soundEngine.playGavelBang();
        const item = ABSURD_ITEMS[this.currentItemIndex];

        const modal = document.getElementById('modal-item-result');
        document.getElementById('result-item-name').textContent = item.title;
        document.getElementById('result-price-paid').textContent = `Sold for $${this.currentBid.toLocaleString()}`;
        document.getElementById('result-winner-name').textContent = `Won by: ${this.highestBidder}`;

        const badge = document.getElementById('result-authenticity-badge');
        const statusCard = document.getElementById('result-status-card');
        const impactBox = document.getElementById('result-financial-impact');

        let winnerObj = this.players.find(p => p.name === this.highestBidder);
        if (!winnerObj) {
            winnerObj = { name: this.highestBidder, isBot: true, balance: 10000, inventory: [] };
        }

        winnerObj.balance -= this.currentBid;
        winnerObj.inventory.push({ ...item, pricePaid: this.currentBid });

        if (this.highestBidder === this.playerName) {
            this.balance -= this.currentBid;
            this.inventory.push({ ...item, pricePaid: this.currentBid });
        }

        const fraudster = this.players.find(p => p.role === 'fraudster');
        if (!item.isGenuine && fraudster) {
            fraudster.balance += this.currentBid;
        }

        if (item.isGenuine) {
            badge.textContent = "GENUINE ARTIFACT";
            badge.className = "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 inline-block mb-2";
            statusCard.className = "p-5 rounded-2xl mb-4 border border-emerald-500/30 bg-emerald-950/20";
            soundEngine.playRevealSound(true);

            impactBox.innerHTML = `
                <p>• <strong>Appraisal Value:</strong> +$${item.appraisedValue.toLocaleString()} added to ${this.highestBidder}'s valuation!</p>
                <p>• Genuine item verified by high-society appraisers.</p>
            `;
        } else {
            badge.textContent = "COUNTERFEIT / FAKE!";
            badge.className = "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-500/20 text-red-400 border border-red-500/40 inline-block mb-2";
            statusCard.className = "p-5 rounded-2xl mb-4 border border-red-500/30 bg-red-950/20";
            soundEngine.playRevealSound(false);

            impactBox.innerHTML = `
                <p>• <strong>Worthless Fake:</strong> $0 valuation added!</p>
                <p>• 💰 <strong>Heist!</strong> The $${this.currentBid.toLocaleString()} paid was stolen by <strong>The Secret Fraudster!</strong></p>
            `;
        }

        if (this.highestBidder === this.playerName && item.isGenuine && typeof confetti === 'function') {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }

        modal.classList.remove('hidden');
    }

    nextRound() {
        document.getElementById('modal-item-result').classList.add('hidden');
        this.currentItemIndex++;

        if (this.currentItemIndex < ABSURD_ITEMS.length) {
            this.loadItemRound();
        } else {
            this.showGameOver();
        }
    }

    showGameOver() {
        this.showScreen('screen-gameover');

        const fraudster = this.players.find(p => p.role === 'fraudster') || { name: 'Unknown', balance: 0 };
        document.getElementById('gameover-fraudster-name').textContent = fraudster.name + (fraudster.name === this.playerName ? " (You)" : "");
        document.getElementById('gameover-fraudster-stats').textContent = `Scammed $${(fraudster.balance - 10000 > 0 ? fraudster.balance - 10000 : 0).toLocaleString()} out of auction bidders!`;

        const standings = this.players.map(p => {
            const cash = p.name === this.playerName ? this.balance : p.balance;
            const inv = p.name === this.playerName ? this.inventory : p.inventory || [];

            const genuineVal = inv.reduce((sum, item) => item.isGenuine ? sum + item.appraisedValue : sum, 0);
            const netWorth = cash + genuineVal;

            return {
                name: p.name,
                cash: cash,
                valuation: genuineVal,
                netWorth: netWorth
            };
        });

        standings.sort((a, b) => b.netWorth - a.netWorth);

        const rows = document.getElementById('gameover-leaderboard-rows');
        rows.innerHTML = '';

        standings.forEach((s, idx) => {
            const tr = document.createElement('tr');
            tr.className = idx === 0 ? "bg-amber-500/10 text-white font-bold" : "text-slate-300";
            tr.innerHTML = `
                <td class="p-3 font-black text-amber-400">${idx === 0 ? '👑 #1' : `#${idx + 1}`}</td>
                <td class="p-3">${s.name} ${s.name === this.playerName ? '(You)' : ''}</td>
                <td class="p-3 text-right font-mono">$${s.cash.toLocaleString()}</td>
                <td class="p-3 text-right font-mono text-purple-300">$${s.valuation.toLocaleString()}</td>
                <td class="p-3 text-right font-mono font-black text-emerald-400">$${s.netWorth.toLocaleString()}</td>
            `;
            rows.appendChild(tr);
        });

        if (typeof confetti === 'function') {
            confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
        }
    }
}

// Global Game Instance
const game = new AuctionGame();