/**
 * ============================================================================
 * DODGE BLOCK DOGS (DBD) — DELUXE 3D HYBRID ENGINE
 * ============================================================================
 * 1. Dual-Canvas Architecture: Hardware-Accelerated 3D WebGL (Three.js) + 2D High-Speed Arcade HUD
 * 2. Procedural 3D Mesh Constructor (6 breeds, beveled vinyl toys, snap-on accessories)
 * 3. Procedural Quadruped Animation & Wobble/Squash Spring Physics
 * 4. Multi-Track Polyphonic FM & Chime Synthesizer + Lo-Fi & Synthwave BGM
 * 5. Roguelite Arcade Overhaul: Combos, Multipliers, FEVER MODE, Power-Ups (Shield, Magnet, Slow-Mo)
 * 6. Tamagotchi Living Room + 3D Bouncing Ball & Interactive Food Bowl
 * 7. Polaroid Photo Studio (360° orbit, poses, photo filters, shareable card)
 * 8. Dog Diary & Achievements with Lore Cards
 * 9. Native Expo Haptics Bridge (window.ReactNativeWebView.postMessage)
 * 10. Persistent Encrypted-Grade LocalStorage State Manager
 */

// --- 1. NATIVE HAPTICS BRIDGE ---
function triggerHaptic(style = 'light') {
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        try {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'HAPTIC', style }));
        } catch (_e) {}
    } else if (navigator.vibrate) {
        if (style === 'heavy') navigator.vibrate(40);
        else if (style === 'medium') navigator.vibrate(25);
        else if (style === 'success') navigator.vibrate([20, 40, 30]);
        else navigator.vibrate(12);
    }
}

// --- 2. AUDIO SYNTHESIZER 2.0 (POLYPHONIC FM + PROCEDURAL BGM) ---
class RetroAudioEngine {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.initialized = false;
        this.bgmPlaying = false;
        this.bgmTimer = null;
        this.bgmTrack = 'room'; // 'room', 'arcade', 'fever'
        this.bgmStep = 0;
        this.pentatonicTapStep = 0;
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
                this.initialized = true;
                this.startBgmLoop();
            }
        } catch (e) {
            console.warn('AudioContext not available:', e);
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    play(type) {
        if (this.muted) return;
        if (!this.ctx) this.init();
        if (!this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;

        switch (type) {
            case 'click': {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(650, now);
                osc.frequency.exponentialRampToValueAtTime(320, now + 0.04);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.linearRampToValueAtTime(0.001, now + 0.045);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.045);
                break;
            }

            case 'bark': {
                const freqs = [380, 520, 280];
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(freqs[0], now);
                osc.frequency.exponentialRampToValueAtTime(freqs[1], now + 0.06);
                osc.frequency.exponentialRampToValueAtTime(freqs[2], now + 0.13);
                gain.gain.setValueAtTime(0.28, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.14);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.14);
                break;
            }

            case 'pet': {
                const scale = [523.25, 659.25, 783.99, 880.00, 1046.50, 1318.51];
                const note = scale[this.pentatonicTapStep % scale.length];
                this.pentatonicTapStep++;

                // FM chime
                const carrier = this.ctx.createOscillator();
                const mod = this.ctx.createOscillator();
                const modGain = this.ctx.createGain();
                const masterGain = this.ctx.createGain();

                carrier.type = 'sine';
                carrier.frequency.setValueAtTime(note, now);

                mod.type = 'sine';
                mod.frequency.setValueAtTime(note * 2.5, now);
                modGain.gain.setValueAtTime(note * 0.8, now);
                modGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

                masterGain.gain.setValueAtTime(0.25, now);
                masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

                mod.connect(carrier.frequency);
                carrier.connect(masterGain);
                masterGain.connect(this.ctx.destination);

                mod.start(now);
                carrier.start(now);
                mod.stop(now + 0.35);
                carrier.stop(now + 0.35);
                break;
            }

            case 'eat': {
                for (let i = 0; i < 3; i++) {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'square';
                    const t = now + i * 0.045;
                    osc.frequency.setValueAtTime(260 - i * 40, t);
                    osc.frequency.exponentialRampToValueAtTime(140, t + 0.04);
                    gain.gain.setValueAtTime(0.22, t);
                    gain.gain.linearRampToValueAtTime(0.01, t + 0.04);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(t);
                    osc.stop(t + 0.04);
                }
                break;
            }

            case 'coin': {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(987.77, now); // B5
                osc.frequency.setValueAtTime(1318.51, now + 0.07); // E6
                gain.gain.setValueAtTime(0.28, now);
                gain.gain.exponentialRampToValueAtTime(0.005, now + 0.32);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.32);
                break;
            }

            case 'jump': {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(160, now);
                osc.frequency.exponentialRampToValueAtTime(750, now + 0.16);
                gain.gain.setValueAtTime(0.25, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.17);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.17);
                break;
            }

            case 'near_miss': {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(450, now);
                osc.frequency.exponentialRampToValueAtTime(1600, now + 0.14);
                gain.gain.setValueAtTime(0.25, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.18);
                break;
            }

            case 'hit': {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(180, now);
                osc.frequency.exponentialRampToValueAtTime(35, now + 0.3);
                gain.gain.setValueAtTime(0.45, now);
                gain.gain.exponentialRampToValueAtTime(0.005, now + 0.32);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.32);
                break;
            }

            case 'fever': {
                const feverNotes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
                feverNotes.forEach((f, idx) => {
                    const o = this.ctx.createOscillator();
                    const g = this.ctx.createGain();
                    const t = now + idx * 0.05;
                    o.type = 'triangle';
                    o.frequency.setValueAtTime(f, t);
                    g.gain.setValueAtTime(0.25, t);
                    g.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
                    o.connect(g);
                    g.connect(this.ctx.destination);
                    o.start(t);
                    o.stop(t + 0.25);
                });
                break;
            }

            case 'powerup': {
                const o = this.ctx.createOscillator();
                const g = this.ctx.createGain();
                o.type = 'sine';
                o.frequency.setValueAtTime(350, now);
                o.frequency.exponentialRampToValueAtTime(1100, now + 0.22);
                g.gain.setValueAtTime(0.28, now);
                g.gain.linearRampToValueAtTime(0.01, now + 0.25);
                o.connect(g);
                g.connect(this.ctx.destination);
                o.start(now);
                o.stop(now + 0.25);
                break;
            }

            case 'shutter': {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.setValueAtTime(300, now + 0.03);
                gain.gain.setValueAtTime(0.35, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.08);
                break;
            }

            case 'fanfare': {
                const triad = [523.25, 659.25, 783.99, 1046.50];
                triad.forEach((freq, idx) => {
                    const o = this.ctx.createOscillator();
                    const g = this.ctx.createGain();
                    const t = now + idx * 0.09;
                    o.type = 'triangle';
                    o.frequency.setValueAtTime(freq, t);
                    g.gain.setValueAtTime(0.28, t);
                    g.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
                    o.connect(g);
                    g.connect(this.ctx.destination);
                    o.start(t);
                    o.stop(t + 0.35);
                });
                break;
            }

            case 'tamagotchi_chirp': {
                const freqs = [2048, 4096];
                freqs.forEach((freq, idx) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    const t = now + idx * 0.055;
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(freq, t);
                    gain.gain.setValueAtTime(0.18, t);
                    gain.gain.linearRampToValueAtTime(0.01, t + 0.045);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(t);
                    osc.stop(t + 0.045);
                });
                break;
            }

            case 'flush': {
                for (let i = 0; i < 4; i++) {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    const t = now + i * 0.04;
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(500 - i * 80, t);
                    gain.gain.setValueAtTime(0.25, t);
                    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(t);
                    osc.stop(t + 0.09);
                }
                break;
            }

            case 'cure': {
                const notes = [440, 554.37, 659.25, 880];
                notes.forEach((f, idx) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    const t = now + idx * 0.06;
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(f, t);
                    gain.gain.setValueAtTime(0.22, t);
                    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(t);
                    osc.stop(t + 0.18);
                });
                break;
            }

            case 'switch': {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.setValueAtTime(400, now + 0.02);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.linearRampToValueAtTime(0.001, now + 0.04);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.04);
                break;
            }
        }
    }

    startBgmLoop() {
        if (this.bgmPlaying) return;
        this.bgmPlaying = true;
        const stepDuration = 0.22;

        const roomChords = [
            [261.63, 329.63, 392.00, 493.88], // Cmaj7
            [220.00, 261.63, 329.63, 392.00], // Am7
            [174.61, 220.00, 261.63, 329.63], // Fmaj7
            [196.00, 246.94, 293.66, 349.23]  // G7
        ];

        const synthwaveBass = [
            110.00, 110.00, 130.81, 110.00, 146.83, 110.00, 164.81, 130.81
        ];

        const tick = () => {
            if (!this.muted && this.ctx && this.ctx.state === 'running') {
                const now = this.ctx.currentTime;

                if (this.bgmTrack === 'room') {
                    if (this.bgmStep % 8 === 0) {
                        const chordIdx = Math.floor(this.bgmStep / 8) % roomChords.length;
                        const notes = roomChords[chordIdx];
                        notes.forEach((freq) => {
                            const osc = this.ctx.createOscillator();
                            const gain = this.ctx.createGain();
                            osc.type = 'sine';
                            osc.frequency.setValueAtTime(freq, now);
                            gain.gain.setValueAtTime(0.035, now);
                            gain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 7.5);
                            osc.connect(gain);
                            gain.connect(this.ctx.destination);
                            osc.start(now);
                            osc.stop(now + stepDuration * 7.5);
                        });
                    }
                } else if (this.bgmTrack === 'arcade' || this.bgmTrack === 'fever') {
                    const isFever = (this.bgmTrack === 'fever');
                    const bassFreq = synthwaveBass[this.bgmStep % synthwaveBass.length] * (isFever ? 1.5 : 1.0);

                    const bassOsc = this.ctx.createOscillator();
                    const bassGain = this.ctx.createGain();
                    bassOsc.type = 'sawtooth';
                    bassOsc.frequency.setValueAtTime(bassFreq, now);
                    bassGain.gain.setValueAtTime(isFever ? 0.07 : 0.05, now);
                    bassGain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 0.9);
                    bassOsc.connect(bassGain);
                    bassGain.connect(this.ctx.destination);
                    bassOsc.start(now);
                    bassOsc.stop(now + stepDuration * 0.9);

                    if (this.bgmStep % 4 === 0) {
                        const kickOsc = this.ctx.createOscillator();
                        const kickGain = this.ctx.createGain();
                        kickOsc.type = 'sine';
                        kickOsc.frequency.setValueAtTime(140, now);
                        kickOsc.frequency.exponentialRampToValueAtTime(30, now + 0.12);
                        kickGain.gain.setValueAtTime(0.12, now);
                        kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
                        kickOsc.connect(kickGain);
                        kickGain.connect(this.ctx.destination);
                        kickOsc.start(now);
                        kickOsc.stop(now + 0.12);
                    }
                }

                this.bgmStep++;
            }
            const speed = (this.bgmTrack === 'fever') ? 140 : 210;
            this.bgmTimer = setTimeout(tick, speed);
        };

        this.bgmTimer = setTimeout(tick, 200);
    }

    setTrack(track) {
        this.bgmTrack = track;
    }
}

const audio = new RetroAudioEngine();

// --- 3. CONFIGURATION & CONSTANTS ---
const LOGICAL_WIDTH = 420;
const LOGICAL_HEIGHT = 740;

const SCREENS = {
    DASHBOARD: 'DASHBOARD',
    WARDROBE: 'WARDROBE',
    MINIGAMES: 'MINIGAMES',
    MG_DODGE: 'MG_DODGE',
    MG_CATCH: 'MG_CATCH',
    MG_JUMP: 'MG_JUMP',
    MG_LANE: 'MG_LANE',
    MG_GUESS: 'MG_GUESS',
    MG_BOUNCE: 'MG_BOUNCE',
    PHOTO_STUDIO: 'PHOTO_STUDIO',
    DIARY: 'DIARY',
    KITCHEN: 'KITCHEN'
};

// --- 3.1 INTERNATIONALIZATION (i18n) ENGINE ---
// Supported: Spanish (es), English (en), Japanese (ja), Portuguese (pt-BR)
const I18N = {
    es: {
        code: 'ES',
        flag: '🇪🇸',
        bones: 'Huesos',
        hunger: 'Hambre',
        happiness: 'Felicidad',
        energy: 'Energía',
        stress: 'Estrés',
        feed: 'ALIMENTAR',
        pet: 'ACARICIAR',
        rest: 'DESCANSAR',
        wardrobe: 'VESTIDOR',
        arcade: 'CENTRO ARCADE (6 JUEGOS)',
        back_home: '◀ VOLVER AL HOGAR',
        back: '◀ VOLVER',
        store_title: 'TIENDA & VESTIDOR 3D',
        tab_hats: '🧢 Gorros',
        tab_glasses: '👓 Gafas',
        tab_neck: '🧣 Cuello',
        tab_dogs: '🐕 Perros',
        equipped: 'EQUIPADO',
        equip: 'EQUIPAR',
        score: 'Puntos',
        record: 'Record',
        game_over: '¡FIN DEL JUEGO!',
        final_score: 'Puntaje Final',
        bones_won: 'HUESOS GANADOS! 🦴',
        retry: 'REINTENTAR ↺',
        exit_home: 'SALIR AL HOGAR 🏠',
        arcade_title: 'ARCADE DOGS 3D',
        arcade_subtitle: 'Minijuegos retro, Fever Mode y cero micropagos',
        play: 'JUGAR ▶',
        mg_dodge_title: '1. CYBER GRID (DODGE)',
        mg_dodge_desc: 'Near-miss bullet time, escudos y lluvia de bloques.',
        mg_catch_title: '2. GOURMET RUSH (CATCH)',
        mg_catch_desc: 'Filetes, cupcakes y huesos. ¡Cuidado con yunques!',
        mg_jump_title: '3. PAWS PLATFORMS (JUMP)',
        mg_jump_desc: 'Salta plataformas y resortes en la cima neon.',
        mg_lane_title: '4. SYNTH HIGHWAY (LANE)',
        mg_lane_desc: '3 carriles frenéticos de bólidos y velocidad pura.',
        mg_guess_title: '5. TAMAGOTCHI GUESS (LOOK)',
        mg_guess_desc: '¿Dónde mira el perrito? Acierta 3 de 5 rondas.',
        mg_bounce_title: '6. BONE JUGGLE (PONG PAW)',
        mg_bounce_desc: 'Rebota la pelota con la cabeza del perrito. ¡Sin caer!',
        guess_left: '◀ IZQUIERDA',
        guess_right: 'DERECHA ▶',
        guess_win: '¡ACERTASTE! 🎉',
        guess_miss: '¡FALLASTE! 😅',
        round: 'Ronda',
        studio_title: 'ESTUDIO FOTOGRÁFICO 3D 📸',
        take_photo: '📸 TOMAR FOTO',
        diary_title: 'DIARIO & LOGROS 📖',
        official_lore: 'Lore Oficial',
        speed: 'Velocidad',
        agility: 'Agilidad',
        cuddle: 'Cariño',
        achievements_title: 'Logros Desbloqueables:',
        fever_banner: '⚡ ¡MODO FEVER ACTIVO! ⚡',
        near_miss: '¡ROZANDO! +50',
        super_bounce: '¡SUPER REBOTE!',
        auuch: '-4 AUCH!',
        bone_plus: '+25 HUESO',
        need_bones: '¡NECESITAS MÁS HUESOS!',
        bark_sound: '¡GUAU! 💖',
        sleeping: 'ZZZ... DORMIDITO',
        no_bones: '¡HUESOS INSUFICIENTES!',
        new_record: '¡NUEVO RECORD!',
        photo_saved: 'FOTO GUARDADA',
        filter_color: 'Color',
        filter_warm: 'Cálido',
        filter_cyber: 'Cyber',
        filter_noir: 'Noir',
        pose_happy: '😊 Feliz',
        pose_wag: '🐾 Saludo',
        pose_nap: '💤 Siesta',
        pose_hero: '⚡ Hero',
        tamagotchi_lcd: '📟 LCD',
        tamagotchi_3d: '🎨 3D',
        hygiene: 'Higiene',
        health: 'Salud',
        clean: 'BAÑAR',
        medicine: 'MEDICINA',
        lights_on: 'LUZ ON',
        lights_off: 'DORMIR',
        praise: 'EDUCAR',
        kitchen_title: 'ALACENA & COCINA TAMAGOTCHI 🍖',
        no_microtransactions: '🆓 100% GRATIS — Sin micropagos. Huesos por jugar.',
        food_kibble: 'Croquetas Básicas',
        food_steak: 'Filete Gourmet',
        food_calcium: 'Hueso Calcio',
        food_cupcake: 'Puppy Cupcake',
        food_milk: 'Leche Tibia',
        weight: 'Peso',
        age: 'Edad',
        days: 'días',
        stage: 'Etapa',
        stage_puppy: '🐶 Cachorro',
        clean_done: '¡BAÑO FRESQUITO! 🫧',
        cured_done: '¡CURADO Y SANO! 💖',
        slept_well: '¡DURMIÓ RICO! ⚡',
        fed_done: '¡ÑAM ÑAM! 🥩'
    },
    en: {
        code: 'EN',
        flag: '🇺🇸',
        bones: 'Bones',
        hunger: 'Hunger',
        happiness: 'Happiness',
        energy: 'Energy',
        stress: 'Stress',
        feed: 'FEED',
        pet: 'PET DOG',
        rest: 'NAP TIME',
        wardrobe: 'WARDROBE',
        arcade: 'ARCADE HUB (6 GAMES)',
        back_home: '◀ BACK TO HOME',
        back: '◀ BACK',
        store_title: '3D WARDROBE & STORE',
        tab_hats: '🧢 Hats',
        tab_glasses: '👓 Glasses',
        tab_neck: '🧣 Neck',
        tab_dogs: '🐕 Breeds',
        equipped: 'EQUIPPED',
        equip: 'EQUIP',
        score: 'Score',
        record: 'Best',
        game_over: 'GAME OVER!',
        final_score: 'Final Score',
        bones_won: 'BONES EARNED! 🦴',
        retry: 'RETRY ↺',
        exit_home: 'EXIT TO HOME 🏠',
        arcade_title: 'ARCADE DOGS 3D',
        arcade_subtitle: 'Retro minigames, Fever Mode, and zero paywalls',
        play: 'PLAY ▶',
        mg_dodge_title: '1. CYBER GRID (DODGE)',
        mg_dodge_desc: 'Near-miss bullet time, shields, and falling blocks.',
        mg_catch_title: '2. GOURMET RUSH (CATCH)',
        mg_catch_desc: 'Steaks, cupcakes, and bones. Watch out for anvils!',
        mg_jump_title: '3. PAWS PLATFORMS (JUMP)',
        mg_jump_desc: 'Bounce on neon springboards and rising platforms.',
        mg_lane_title: '4. SYNTH HIGHWAY (LANE)',
        mg_lane_desc: '3 frantic neon lanes with lightning reflexes.',
        mg_guess_title: '5. TAMAGOTCHI GUESS (LOOK)',
        mg_guess_desc: 'Which way will puppy turn? Guess 3 of 5 rounds.',
        mg_bounce_title: '6. BONE JUGGLE (PONG PAW)',
        mg_bounce_desc: 'Bounce the ball with puppy head. Keep it up!',
        guess_left: '◀ LEFT',
        guess_right: 'RIGHT ▶',
        guess_win: 'CORRECT! 🎉',
        guess_miss: 'MISSED! 😅',
        round: 'Round',
        studio_title: '3D PHOTO STUDIO 📸',
        take_photo: '📸 SNAP PHOTO',
        diary_title: 'DOG DIARY & BADGES 📖',
        official_lore: 'Official Lore',
        speed: 'Speed',
        agility: 'Agility',
        cuddle: 'Cuddle',
        achievements_title: 'Unlockable Badges:',
        fever_banner: '⚡ FEVER MODE ACTIVE! ⚡',
        near_miss: 'CLOSE CALL! +50',
        super_bounce: 'SUPER BOUNCE!',
        auuch: '-4 OUCH!',
        bone_plus: '+25 BONE',
        need_bones: 'NEED MORE BONES!',
        bark_sound: 'WOOF! 💖',
        sleeping: 'ZZZ... SLEEPING',
        no_bones: 'NOT ENOUGH BONES!',
        new_record: 'NEW RECORD!',
        photo_saved: 'PHOTO SAVED',
        filter_color: 'Color',
        filter_warm: 'Warm',
        filter_cyber: 'Cyber',
        filter_noir: 'Noir',
        pose_happy: '😊 Happy',
        pose_wag: '🐾 Wag',
        pose_nap: '💤 Nap',
        pose_hero: '⚡ Hero',
        tamagotchi_lcd: '📟 LCD',
        tamagotchi_3d: '🎨 3D',
        hygiene: 'Hygiene',
        health: 'Health',
        clean: 'BATH',
        medicine: 'MEDICINE',
        lights_on: 'LIGHTS ON',
        lights_off: 'SLEEP',
        praise: 'PRAISE',
        kitchen_title: 'TAMAGOTCHI KITCHEN & PANTRY 🍖',
        no_microtransactions: '🆓 100% FREE — No paywalls. Earn bones by playing.',
        food_kibble: 'Classic Kibble',
        food_steak: 'Juicy Steak',
        food_calcium: 'Calcium Bone',
        food_cupcake: 'Puppy Cupcake',
        food_milk: 'Warm Milk',
        weight: 'Weight',
        age: 'Age',
        days: 'days',
        stage: 'Stage',
        stage_puppy: '🐶 Puppy',
        clean_done: 'SQUEAKY CLEAN! 🫧',
        cured_done: 'HEALED & HEALTHY! 💖',
        slept_well: 'WELL RESTED! ⚡',
        fed_done: 'YUM YUM! 🥩'
    },
    ja: {
        code: 'JA',
        flag: '🇯🇵',
        bones: 'ホネ',
        hunger: 'おなか',
        happiness: 'ごきげん',
        energy: 'たいりょく',
        stress: 'ストレス',
        feed: 'ごはん',
        pet: 'なでなで',
        rest: 'おひるね',
        wardrobe: 'きがえ',
        arcade: 'アーケード (6ゲーム)',
        back_home: '◀ ホームへ',
        back: '◀ もどる',
        store_title: '3D きがえ & ショップ',
        tab_hats: '🧢 ぼうし',
        tab_glasses: '👓 めがね',
        tab_neck: '🧣 くびわ',
        tab_dogs: '🐕 わんこ',
        equipped: 'そうび中',
        equip: 'そうび',
        score: 'スコア',
        record: 'ハイスコア',
        game_over: 'ゲームオーバー!',
        final_score: 'さいしゅうスコア',
        bones_won: 'ホネ獲得! 🦴',
        retry: 'もう一度 ↺',
        exit_home: 'ホームへ 🏠',
        arcade_title: 'アーケード・ドッグス 3D',
        arcade_subtitle: 'レトロミニゲーム・課金ゼロ・FEVER発動！',
        play: 'プレイ ▶',
        mg_dodge_title: '1. サイバーグリッド (よけ)',
        mg_dodge_desc: 'ギリギリ回避、シールド、落下ブロックを攻略。',
        mg_catch_title: '2. グルメ・ラッシュ (キャッチ)',
        mg_catch_desc: 'お肉やケーキをゲット！金床には要注意！',
        mg_jump_title: '3. パウ・プラットフォーム (ジャンプ)',
        mg_jump_desc: 'ネオンの足場とスプリングで上を目指そう。',
        mg_lane_title: '4. シンス・ハイウェイ (レーン)',
        mg_lane_desc: '3レーンを疾走するハイスピードレース。',
        mg_guess_title: '5. あっちむいてホイ',
        mg_guess_desc: 'わんこはどっちを向く？3回当てよう！',
        mg_bounce_title: '6. ポン・バウンス (リフティング)',
        mg_bounce_desc: '頭でボールをリフティング！落とさず続けよう！',
        guess_left: '◀ ひだり',
        guess_right: 'みぎ ▶',
        guess_win: 'あたり！🎉',
        guess_miss: 'はずれ！😅',
        round: 'ラウンド',
        studio_title: '3D フォトスタジオ 📸',
        take_photo: '📸 写真撮影',
        diary_title: 'わんこにっき & 実績 📖',
        official_lore: '公式ストーリー',
        speed: 'スピード',
        agility: 'すばやさ',
        cuddle: 'あいじょう',
        achievements_title: 'かいじょ可能な実績:',
        fever_banner: '⚡ フィーバーモード発動! ⚡',
        near_miss: 'ギリギリ回避! +50',
        super_bounce: 'スーパーバウンド!',
        auuch: '-4 いたい!',
        bone_plus: '+25 ホネ',
        need_bones: 'ホネがたりません!',
        bark_sound: 'ワンワン! 💖',
        sleeping: 'ZZZ... すやすや',
        no_bones: 'ホネがたりません!',
        new_record: '新記録達成!',
        photo_saved: '写真を保存しました',
        filter_color: 'カラー',
        filter_warm: 'ウォーム',
        filter_cyber: 'サイバー',
        filter_noir: 'ノワール',
        pose_happy: '😊 えがお',
        pose_wag: '🐾 あいさつ',
        pose_nap: '💤 おひるね',
        pose_hero: '⚡ ヒーロー',
        tamagotchi_lcd: '📟 LCD',
        tamagotchi_3d: '🎨 3D',
        hygiene: 'せいけつ',
        health: 'たいちょう',
        clean: 'おそうじ',
        medicine: 'おくすり',
        lights_on: 'でんきON',
        lights_off: 'おやすみ',
        praise: 'ほめる',
        kitchen_title: 'たまごっちキッチン & レストラン 🍖',
        no_microtransactions: '🆓 完全無料 — 課金ゼロ。ゲームでホネ獲得。',
        food_kibble: 'カリカリごはん',
        food_steak: 'じゅーしーお肉',
        food_calcium: 'カルシウムボーン',
        food_cupcake: 'わんこケーキ',
        food_milk: 'あったかミルク',
        weight: 'たいじゅう',
        age: 'ねんれい',
        days: 'にち',
        stage: '成長期',
        stage_puppy: '🐶 こいぬ',
        clean_done: 'ピカピカきれい！🫧',
        cured_done: '元気いっぱい！💖',
        slept_well: 'すっきり快眠！⚡',
        fed_done: 'おいしいワン！🥩'
    },
    pt: {
        code: 'PT',
        flag: '🇧🇷',
        bones: 'Ossos',
        hunger: 'Fome',
        happiness: 'Felicidade',
        energy: 'Energia',
        stress: 'Estresse',
        feed: 'ALIMENTAR',
        pet: 'ACARICIAR',
        rest: 'SONECA',
        wardrobe: 'GUARDA-ROUPA',
        arcade: 'CENTRO ARCADE (6 JOGOS)',
        back_home: '◀ VOLTAR AO INÍCIO',
        back: '◀ VOLTAR',
        store_title: 'LOJA & GUARDA-ROUPA 3D',
        tab_hats: '🧢 Chapéus',
        tab_glasses: '👓 Óculos',
        tab_neck: '🧣 Coleiras',
        tab_dogs: '🐕 Cães',
        equipped: 'EQUIPADO',
        equip: 'EQUIPAR',
        score: 'Pontos',
        record: 'Recorde',
        game_over: 'FIM DE JOGO!',
        final_score: 'Pontuação Final',
        bones_won: 'OSSOS GANHOS! 🦴',
        retry: 'REPETIR ↺',
        exit_home: 'IR AO INÍCIO 🏠',
        arcade_title: 'ARCADE DOGS 3D',
        arcade_subtitle: 'Minijogos retrô, Modo Fever e sem compras',
        play: 'JOGAR ▶',
        mg_dodge_title: '1. CYBER GRID (ESQUIVA)',
        mg_dodge_desc: 'Near-miss em câmera lenta, escudos e blocos.',
        mg_catch_title: '2. GOURMET RUSH (PEGAR)',
        mg_catch_desc: 'Bifes, cupcakes e ossos. Cuidado com as bigornas!',
        mg_jump_title: '3. PAWS PLATFORMS (SALTO)',
        mg_jump_desc: 'Pule em plataformas e molas neon.',
        mg_lane_title: '4. SYNTH HIGHWAY (PISTAS)',
        mg_lane_desc: '3 pistas frenéticas com reflexos rápidos.',
        mg_guess_title: '5. ADIVINHA TAMAGOTCHI',
        mg_guess_desc: 'Para onde o cão olha? Acerte 3 de 5 rodadas.',
        mg_bounce_title: '6. MALABARISMO (PONG PAW)',
        mg_bounce_desc: 'Rebata a bola na cabeça do cãozinho sem deixar cair!',
        guess_left: '◀ ESQUERDA',
        guess_right: 'DIREITA ▶',
        guess_win: 'ACERTOU! 🎉',
        guess_miss: 'ERROU! 😅',
        round: 'Rodada',
        studio_title: 'ESTÚDIO FOTOGRÁFICO 3D 📸',
        take_photo: '📸 TIRAR FOTO',
        diary_title: 'DIÁRIO & CONQUISTAS 📖',
        official_lore: 'História Oficial',
        speed: 'Velocidade',
        agility: 'Agilidade',
        cuddle: 'Carinho',
        achievements_title: 'Conquistas Desbloqueáveis:',
        fever_banner: '⚡ MODO FEVER ATIVO! ⚡',
        near_miss: 'POR UM TRIZ! +50',
        super_bounce: 'SUPER SALTO!',
        auuch: '-4 AI!',
        bone_plus: '+25 OSSO',
        need_bones: 'PRECISA DE MAIS OSSOS!',
        bark_sound: 'AU AU! 💖',
        sleeping: 'ZZZ... DORMINDO',
        no_bones: 'OSSOS INSUFICIENTES!',
        new_record: 'NOVO RECORDE!',
        photo_saved: 'FOTO SALVA',
        filter_color: 'Cor',
        filter_warm: 'Quente',
        filter_cyber: 'Cyber',
        filter_noir: 'Noir',
        pose_happy: '😊 Feliz',
        pose_wag: '🐾 Aceno',
        pose_nap: '💤 Soneca',
        pose_hero: '⚡ Herói',
        tamagotchi_lcd: '📟 LCD',
        tamagotchi_3d: '🎨 3D',
        hygiene: 'Higiene',
        health: 'Saúde',
        clean: 'BANHO',
        medicine: 'REMÉDIO',
        lights_on: 'LUZ ON',
        lights_off: 'DORMIR',
        praise: 'EDUCAR',
        kitchen_title: 'COZINHA & DESPENSA TAMAGOTCHI 🍖',
        no_microtransactions: '🆓 100% GRÁTIS — Sem compras. Ganhe ossos jogando.',
        food_kibble: 'Ração Básica',
        food_steak: 'Bife Suculento',
        food_calcium: 'Osso de Cálcio',
        food_cupcake: 'Cupcake Canino',
        food_milk: 'Leite Morninho',
        weight: 'Peso',
        age: 'Idade',
        days: 'dias',
        stage: 'Fase',
        stage_puppy: '🐶 Filhote',
        clean_done: 'BANHO TOMADO! 🫧',
        cured_done: 'CURADO E SAUDÁVEL! 💖',
        slept_well: 'BEM DESCANSADO! ⚡',
        fed_done: 'NHAM NHAM! 🥩'
    }
};

function t(key) {
    const lang = (state && state.lang) || 'es';
    if (I18N[lang] && I18N[lang][key] !== undefined) return I18N[lang][key];
    if (I18N['en'] && I18N['en'][key] !== undefined) return I18N['en'][key];
    return key;
}

function getDogName(dog) {
    const l = (state && state.lang) || 'es';
    return (dog.names && dog.names[l]) || dog.name;
}

function getDogShortName(dog) {
    const l = (state && state.lang) || 'es';
    return (dog.shortNames && dog.shortNames[l]) || dog.shortName;
}

function getDogDesc(dog) {
    const l = (state && state.lang) || 'es';
    return (dog.descs && dog.descs[l]) || dog.desc;
}

function getDogLore(dog) {
    const l = (state && state.lang) || 'es';
    return (dog.lores && dog.lores[l]) || dog.lore;
}

function getItemName(item) {
    const l = (state && state.lang) || 'es';
    return (item.names && item.names[l]) || item.name;
}

function getAchTitle(ach) {
    const l = (state && state.lang) || 'es';
    return (ach.titles && ach.titles[l]) || ach.title;
}

function getAchDesc(ach) {
    const l = (state && state.lang) || 'es';
    return (ach.descs && ach.descs[l]) || ach.desc;
}

// --- 4. DOG BREEDS & ACCESSORY SPECIFICATIONS ---
const DOG_BREEDS = [
    {
        id: 'dachshund',
        name: 'Salchi (Dachshund)',
        shortName: 'Salchi',
        names: {
            es: 'Salchi (Dachshund)',
            en: 'Salchi (Dachshund)',
            ja: 'サルチ (ダックスフント)',
            pt: 'Salchi (Teckel)'
        },
        shortNames: {
            es: 'Salchi',
            en: 'Salchi',
            ja: 'サルチ',
            pt: 'Salchi'
        },
        desc: 'Cuerpo largo, orejas caídas y gran corazón.',
        descs: {
            es: 'Cuerpo largo, orejas caídas y gran corazón.',
            en: 'Long sausage body, floppy ears, and a huge heart.',
            ja: 'ながい胴体、たれ耳、そして大きな愛情。',
            pt: 'Corpo longo, orelhas caídas e um coração gigante.'
        },
        lore: 'Especialista en excavar túneles en el sofá y robar calcetines con sigilo absoluto.',
        lores: {
            es: 'Especialista en excavar túneles en el sofá y robar calcetines con sigilo absoluto.',
            en: 'Master of digging couch tunnels and stealing socks with ninja stealth.',
            ja: 'ソファーのトンネル掘りと、靴下を音もなく盗み出すプロフェッショナル。',
            pt: 'Mestre em cavar túneis no sofá e roubar meias com furtividade ninja.'
        },
        stats: { speed: 3, agility: 4, cuddle: 5 },
        bodyColor: 0x9e4719,
        bellyColor: 0xc56c34,
        earColor: 0x6e2f0d,
        eyeColor: 0x221108,
        noseColor: 0x150804,
        scaleX: 1.35, scaleY: 0.85, scaleZ: 0.85,
        snoutLen: 0.65,
        earType: 'floppy',
        tailType: 'long',
        price: 0,
        unlocked: true
    },
    {
        id: 'jackrussell',
        name: 'Jacky (Jack Russell)',
        shortName: 'Jacky',
        names: {
            es: 'Jacky (Jack Russell)',
            en: 'Jacky (Jack Russell)',
            ja: 'ジャッキー (ジャックラッセル)',
            pt: 'Jacky (Jack Russell)'
        },
        shortNames: {
            es: 'Jacky',
            en: 'Jacky',
            ja: 'ジャッキー',
            pt: 'Jacky'
        },
        desc: 'Ágil, hiperactivo y lleno de energía.',
        descs: {
            es: 'Ágil, hiperactivo y lleno de energía.',
            en: 'Hyperactive dynamo capable of triple jumps.',
            ja: 'すばしっこく元気いっぱい、超ハイテンション。',
            pt: 'Ágil, hiperativo e cheio de energia inesgotável.'
        },
        lore: 'Motor a propulsión de 4 patas. Capaz de saltar 3 veces su propia altura por una pelota.',
        lores: {
            es: 'Motor a propulsión de 4 patas. Capaz de saltar 3 veces su propia altura por una pelota.',
            en: '4-legged rocket. Jumps 3x its own height whenever a tennis ball is spotted.',
            ja: '4足歩行のロケットエンジン。ボールのためなら身長の3倍跳べる。',
            pt: 'Foguete de 4 patas. Pula 3 vezes a própria altura por uma bola de tênis.'
        },
        stats: { speed: 5, agility: 5, cuddle: 3 },
        bodyColor: 0xf5f5f5,
        bellyColor: 0xffffff,
        patchColor: 0xa65b2d,
        earColor: 0x8a451e,
        eyeColor: 0x1a1a1a,
        noseColor: 0x111111,
        scaleX: 1.0, scaleY: 0.95, scaleZ: 0.88,
        snoutLen: 0.45,
        earType: 'folded',
        tailType: 'perky',
        price: 150,
        unlocked: false
    },
    {
        id: 'mora',
        name: 'Mora (Gran Danés)',
        shortName: 'Mora',
        names: {
            es: 'Mora (Gran Danés)',
            en: 'Little Blackberry (Great Dane)',
            ja: 'モーラ (グレート・デーン)',
            pt: 'Mora (Dogue Alemão)'
        },
        shortNames: {
            es: 'Mora',
            en: 'Little Blackberry',
            ja: 'モーラ',
            pt: 'Mora'
        },
        desc: 'Cachorrita esbelta de Gran Danés, patilarga y de elegante pelaje negro azabache.',
        descs: {
            es: 'Cachorrita esbelta de Gran Danés, patilarga y de elegante pelaje negro azabache.',
            en: 'Slender baby Great Dane: leggy, elegant, and shining in jet-black velvet.',
            ja: 'すらっと足長なグレート・デーンの赤ちゃん。艶やかな黒毛が上品。',
            pt: 'Filhote esbelta de Dogue Alemão, pernalonga e de elegante pelagem preta.'
        },
        lore: 'Aunque aún es una cachorra delgada de patas largas, su corazón es tan gigante como su futura estatura. Cree firmemente que todavía cabe en tu bolsillo.',
        lores: {
            es: 'Aunque aún es una cachorra delgada de patas largas, su corazón es tan gigante como su futura estatura. Cree firmemente que todavía cabe en tu bolsillo.',
            en: 'A slender, long-legged puppy whose heart is as vast as her future stature. She firmly believes she is still tiny enough to fit right in your pocket.',
            ja: '足長でスレンダーな子犬。心はおとな顔負けに優しく、今でも飼い主のポケットにすっぽり収まるサイズだと信じている。',
            pt: 'Uma filhotinha magrinha de pernas compridas cujo coração é do tamanho de sua futura estatura. Ela tem certeza absoluta de que ainda cabe no seu bolso.'
        },
        stats: { speed: 4, agility: 5, cuddle: 5 },
        bodyColor: 0x14151a,
        bellyColor: 0x1c1e26,
        earColor: 0x0f1014,
        eyeColor: 0x422a1d,
        noseColor: 0x090a0d,
        scaleX: 1.15,
        scaleY: 1.22,
        scaleZ: 0.82,
        legScaleY: 1.35,
        legThickness: 0.86,
        pawScale: 1.35,
        snoutLen: 0.58,
        chestStar: true,
        earType: 'dane',
        tailType: 'long',
        price: 220,
        unlocked: false
    },
    {
        id: 'pug',
        name: 'Puggy (Carlino Pug)',
        shortName: 'Puggy',
        names: {
            es: 'Puggy (Carlino Pug)',
            en: 'Puggy (Chubby Pug)',
            ja: 'パギー (まんまるパグ)',
            pt: 'Puggy (Pug Gordinho)'
        },
        shortNames: {
            es: 'Puggy',
            en: 'Puggy',
            ja: 'パギー',
            pt: 'Puggy'
        },
        desc: 'Chaparrito, arrugado y experto en siestas.',
        descs: {
            es: 'Chaparrito, arrugado y experto en siestas.',
            en: 'Wrinkly couch potato and honorary nap doctor.',
            ja: 'しわくちゃでまんまる、お昼寝の達人。',
            pt: 'Baixinho, enrugado e doutor em sonecas.'
        },
        lore: 'Catedrático del ronquido melódico. Su actividad deportiva favorita es suspirar profundamente.',
        lores: {
            es: 'Catedrático del ronquido melódico. Su actividad deportiva favorita es suspirar profundamente.',
            en: 'Professor of melodic snoring. His favorite extreme sport is deep sighing.',
            ja: 'メロディアスないびきの教授。一番好きなスポーツは大きなため息。',
            pt: 'Professor de ronco melódico. Seu esporte radical favorito é suspirar bem fundo.'
        },
        stats: { speed: 2, agility: 2, cuddle: 5 },
        bodyColor: 0xd6c098,
        bellyColor: 0xecd8b6,
        maskColor: 0x26201b,
        earColor: 0x221a16,
        eyeColor: 0x111111,
        noseColor: 0x0f0c0a,
        scaleX: 0.95, scaleY: 1.05, scaleZ: 1.05,
        snoutLen: 0.22,
        earType: 'button',
        tailType: 'curly',
        price: 300,
        unlocked: false
    },
    {
        id: 'shiba',
        name: 'Doge (Shiba Inu)',
        shortName: 'Doge',
        names: {
            es: 'Doge (Shiba Inu)',
            en: 'Doge (Shiba Inu)',
            ja: 'ドージ (柴犬)',
            pt: 'Doge (Shiba Inu)'
        },
        shortNames: {
            es: 'Doge',
            en: 'Doge',
            ja: 'ドージ',
            pt: 'Doge'
        },
        desc: 'Mítico, sonriente y emperador de los memes.',
        descs: {
            es: 'Mítico, sonriente y emperador de los memes.',
            en: 'Much wow. Such doge. Emperor of legendary internet memes.',
            ja: '世界中で大人気。いつも笑顔なネットの皇帝。',
            pt: 'Lendário, sorridente e imperador absoluto dos memes.'
        },
        lore: 'Much wow. So doge. Muy sabio pero extremadamente dramático cuando le toca baño.',
        lores: {
            es: 'Much wow. So doge. Muy sabio pero extremadamente dramático cuando le toca baño.',
            en: 'Much wow. So doge. Very wise, yet screams dramatically whenever bath time arrives.',
            ja: 'とても賢くマイペース。しかしお風呂の時間は壮絶に拒否する。',
            pt: 'Much wow. Muito sábio, mas faz drama digno de novela na hora do banho.'
        },
        stats: { speed: 4, agility: 4, cuddle: 4 },
        bodyColor: 0xdf822b,
        bellyColor: 0xfff5e6,
        earColor: 0xb45a10,
        eyeColor: 0x22150c,
        noseColor: 0x150c07,
        scaleX: 1.05, scaleY: 1.0, scaleZ: 0.95,
        snoutLen: 0.5,
        earType: 'pointed',
        tailType: 'plume',
        price: 500,
        unlocked: false
    },
    {
        id: 'corgi',
        name: 'Waffles (Corgi Real)',
        shortName: 'Waffles',
        names: {
            es: 'Waffles (Corgi Real)',
            en: 'Waffles (Royal Corgi)',
            ja: 'ワッフル (ロイヤルコーギー)',
            pt: 'Waffles (Corgi Real)'
        },
        shortNames: {
            es: 'Waffles',
            en: 'Waffles',
            ja: 'ワッフル',
            pt: 'Waffles'
        },
        desc: 'Patitas cortas, orejas gigantes y trasero feliz.',
        descs: {
            es: 'Patitas cortas, orejas gigantes y trasero feliz.',
            en: 'Short stubby legs, giant radar ears, and a peach-shaped booty.',
            ja: 'みじかい足、おおきな耳、そして愛されプリケツ。',
            pt: 'Perninhas curtas, orelhas gigantes e bumbum feliz.'
        },
        lore: 'Protegido de la realeza. Su trasero tiene forma de melocotón y una gravedad irresistible.',
        lores: {
            es: 'Protegido de la realeza. Su trasero tiene forma de melocotón y una gravedad irresistible.',
            en: 'Royal heritage. His fluffy peach rear has its own irresistible gravitational pull.',
            ja: '王室のアイドル。その桃のようなふわふわのお尻には誰も逆らえない。',
            pt: 'Protegido da realeza. Seu bumbum fofo tem um poder gravitacional irresistível.'
        },
        stats: { speed: 3, agility: 4, cuddle: 5 },
        bodyColor: 0xea8b39,
        bellyColor: 0xffffff,
        earColor: 0xea8b39,
        eyeColor: 0x1f140d,
        noseColor: 0x100a06,
        scaleX: 1.15, scaleY: 0.88, scaleZ: 0.95,
        snoutLen: 0.45,
        earType: 'radar',
        tailType: 'bobtail',
        price: 800,
        unlocked: false
    },
    {
        id: 'cyberdog',
        name: 'Volt-9 (Cyber Hound)',
        shortName: 'Volt-9',
        names: {
            es: 'Volt-9 (Cyber Hound)',
            en: 'Volt-9 (Cyber Hound)',
            ja: 'ボルト-9 (サイバーハウンド)',
            pt: 'Volt-9 (Cão Cibernético)'
        },
        shortNames: {
            es: 'Volt-9',
            en: 'Volt-9',
            ja: 'ボルト-9',
            pt: 'Volt-9'
        },
        desc: 'Chasis de titanio, circuitos de neón y visor HUD.',
        descs: {
            es: 'Chasis de titanio, circuitos de neón y visor HUD.',
            en: 'Titanium plating, glowing neon circuits, and futuristic HUD.',
            ja: 'チタン合金ボディ、ネオン回路、未来のHUDバイザー。',
            pt: 'Chassi de titânio, circuitos neon e visor futurista.'
        },
        lore: 'Creado en Neo-Tokio año 2099. Funciona con batería de fusión y caricias cuánticas.',
        lores: {
            es: 'Creado en Neo-Tokio año 2099. Funciona con batería de fusión y caricias cuánticas.',
            en: 'Forged in Neo-Tokyo 2099. Powered by nuclear fusion and quantum ear-scratches.',
            ja: '西暦2099年ネオ・トーキョー製。核融合バッテリーと頭なでなでで稼働。',
            pt: 'Criado em Neo-Tóquio 2099. Funciona com fusão nuclear e carinhos quânticos.'
        },
        stats: { speed: 5, agility: 5, cuddle: 3 },
        bodyColor: 0x242838,
        bellyColor: 0x1a1e2c,
        neonColor: 0x00f0ff,
        earColor: 0x161924,
        eyeColor: 0x00f0ff,
        noseColor: 0x00f0ff,
        scaleX: 1.1, scaleY: 1.0, scaleZ: 0.9,
        snoutLen: 0.52,
        earType: 'cyber',
        tailType: 'cyber_wire',
        price: 1200,
        unlocked: false
    }
];

const ACCESSORIES = {
    hats: [
        {
            id: 'none',
            name: 'Ninguno',
            names: { es: 'Ninguno', en: 'None', ja: 'なし', pt: 'Nenhum' },
            price: 0,
            unlocked: true
        },
        {
            id: 'party',
            name: 'Gorro Fiesta 🎉',
            names: { es: 'Gorro Fiesta 🎉', en: 'Party Hat 🎉', ja: 'パーティー帽子 🎉', pt: 'Chapéu Festa 🎉' },
            price: 60,
            unlocked: false,
            color: 0xff2a85
        },
        {
            id: 'detective',
            name: 'Detective 🕵️',
            names: { es: 'Detective 🕵️', en: 'Detective 🕵️', ja: '名探偵 🕵️', pt: 'Detetive 🕵️' },
            price: 140,
            unlocked: false,
            color: 0x654321
        },
        {
            id: 'crown',
            name: 'Corona Real 👑',
            names: { es: 'Corona Real 👑', en: 'Royal Crown 👑', ja: '王冠 👑', pt: 'Coroa Real 👑' },
            price: 350,
            unlocked: false,
            color: 0xffcc00
        },
        {
            id: 'beanie',
            name: 'Gorro Beanie 🧶',
            names: { es: 'Gorro Beanie 🧶', en: 'Street Beanie 🧶', ja: 'ニット帽 🧶', pt: 'Gorro Beanie 🧶' },
            price: 100,
            unlocked: false,
            color: 0x3182ce
        },
        {
            id: 'visor',
            name: 'Visor Cyber 🥽',
            names: { es: 'Visor Cyber 🥽', en: 'Cyber Visor 🥽', ja: 'サイバーバイザー 🥽', pt: 'Visor Cyber 🥽' },
            price: 250,
            unlocked: false,
            color: 0x00f0ff
        },
        {
            id: 'chef',
            name: 'Gorro Chef 👨‍🍳',
            names: { es: 'Gorro Chef 👨‍🍳', en: 'Chef Toque 👨‍🍳', ja: 'シェフ帽 👨‍🍳', pt: 'Chapéu de Chef 👨‍🍳' },
            price: 200,
            unlocked: false,
            color: 0xfafafa
        }
    ],
    glasses: [
        {
            id: 'none',
            name: 'Ninguno',
            names: { es: 'Ninguno', en: 'None', ja: 'なし', pt: 'Nenhum' },
            price: 0,
            unlocked: true
        },
        {
            id: 'shades',
            name: 'Gafas Thug 😎',
            names: { es: 'Gafas Thug 😎', en: 'Cool Shades 😎', ja: 'サングラス 😎', pt: 'Óculos Thug 😎' },
            price: 80,
            unlocked: false
        },
        {
            id: 'retro',
            name: 'Lentes Retro 👓',
            names: { es: 'Lentes Retro 👓', en: 'Retro Glasses 👓', ja: 'レトロめがね 👓', pt: 'Óculos Retrô 👓' },
            price: 120,
            unlocked: false
        },
        {
            id: 'monocle',
            name: 'Monóculo Chic 🧐',
            names: { es: 'Monóculo Chic 🧐', en: 'Fancy Monocle 🧐', ja: 'モノクル 🧐', pt: 'Monóculo Chic 🧐' },
            price: 190,
            unlocked: false
        },
        {
            id: 'anime',
            name: 'Ojos Estrella ✨',
            names: { es: 'Ojos Estrella ✨', en: 'Star Eyes ✨', ja: 'キラキラおめめ ✨', pt: 'Olhos Estrela ✨' },
            price: 220,
            unlocked: false
        }
    ],
    neck: [
        {
            id: 'none',
            name: 'Ninguno',
            names: { es: 'Ninguno', en: 'None', ja: 'なし', pt: 'Nenhum' },
            price: 0,
            unlocked: true
        },
        {
            id: 'red_bandana',
            name: 'Bandana Roja 🧣',
            names: { es: 'Bandana Roja 🧣', en: 'Red Bandana 🧣', ja: '赤いバンダナ 🧣', pt: 'Bandana Vermelha 🧣' },
            price: 50,
            unlocked: false,
            color: 0xe53e3e
        },
        {
            id: 'gold_bone',
            name: 'Collar Hueso Oro 🦴',
            names: { es: 'Collar Hueso Oro 🦴', en: 'Gold Bone Collar 🦴', ja: '金のホネ首輪 🦴', pt: 'Colar de Osso de Ouro 🦴' },
            price: 150,
            unlocked: false,
            color: 0xffd700
        },
        {
            id: 'spiked',
            name: 'Collar Púas 🎸',
            names: { es: 'Collar Púas 🎸', en: 'Spiked Collar 🎸', ja: 'スタッズ首輪 🎸', pt: 'Coleira de Cravos 🎸' },
            price: 200,
            unlocked: false,
            color: 0x2d3748
        },
        {
            id: 'bowtie',
            name: 'Pajarita Dapper 👔',
            names: { es: 'Pajarita Dapper 👔', en: 'Dapper Bowtie 👔', ja: '蝶ネクタイ 👔', pt: 'Gravata Borboleta 👔' },
            price: 120,
            unlocked: false,
            color: 0x805ad5
        }
    ]
};

const ACHIEVEMENTS = [
    {
        id: 'first_pet',
        title: 'Amor Canino',
        desc: 'Acaricia a tu cachorro 5 veces',
        titles: { es: 'Amor Canino', en: 'Puppy Love', ja: 'わんこラブ', pt: 'Amor Canino' },
        descs: { es: 'Acaricia a tu cachorro 5 veces', en: 'Pet your puppy 5 times', ja: 'こいぬを5回なでよう', pt: 'Acaricie seu filhote 5 vezes' },
        reward: 30, completed: false, current: 0, max: 5
    },
    {
        id: 'century_dodge',
        title: 'Centinela Ágil',
        desc: 'Alcanza 50 puntos en Lluvia de Bloques',
        titles: { es: 'Centinela Ágil', en: 'Agile Dodger', ja: 'アジャイルマスター', pt: 'Sentinela Ágil' },
        descs: { es: 'Alcanza 50 puntos en Lluvia de Bloques', en: 'Score 50 points in Block Dodge', ja: 'ブロックよけで50ポイント達成', pt: 'Faça 50 pontos na Chuva de Blocos' },
        reward: 100, completed: false, current: 0, max: 50
    },
    {
        id: 'near_miss_king',
        title: 'Al Límite',
        desc: 'Realiza 10 Near Misses',
        titles: { es: 'Al Límite', en: 'Daredevil', ja: 'スリルマスター', pt: 'No Limite' },
        descs: { es: 'Realiza 10 Near Misses', en: 'Perform 10 Near-Misses', ja: 'ギリギリ回避を10回キメる', pt: 'Faça 10 esquivas por um triz' },
        reward: 80, completed: false, current: 0, max: 10
    },
    {
        id: 'gourmet_hound',
        title: 'Banquete Real',
        desc: 'Atrapa 25 premios en Atrapa Premios',
        titles: { es: 'Banquete Real', en: 'Royal Feast', ja: 'ごちそうマスター', pt: 'Banquete Real' },
        descs: { es: 'Atrapa 25 premios en Atrapa Premios', en: 'Catch 25 treats in Gourmet Rush', ja: 'おやつキャッチで25個キャッチ', pt: 'Pegue 25 prêmios no Gourmet Rush' },
        reward: 60, completed: false, current: 0, max: 25
    },
    {
        id: 'sky_walker',
        title: 'A Las Alturas',
        desc: 'Alcanza 150m en Paws Platforms',
        titles: { es: 'A Las Alturas', en: 'Sky High', ja: 'スカイウォーカー', pt: 'Nas Alturas' },
        descs: { es: 'Alcanza 150m en Paws Platforms', en: 'Reach 150m in Paws Platforms', ja: 'パウジャンプで150m到達', pt: 'Alcance 150m em Paws Platforms' },
        reward: 120, completed: false, current: 0, max: 150
    },
    {
        id: 'fever_master',
        title: 'Fiebre Dorada',
        desc: 'Desata el MODO FEVER',
        titles: { es: 'Fiebre Dorada', en: 'Golden Fever', ja: 'フィーバーマスター', pt: 'Febre Dourada' },
        descs: { es: 'Desata el MODO FEVER', en: 'Unleash FEVER MODE', ja: 'フィーバーモードを発動しよう', pt: 'Ative o MODO FEVER' },
        reward: 150, completed: false, current: 0, max: 1
    },
    {
        id: 'fashion_icon',
        title: 'Estilo Puro',
        desc: 'Equipa gorro, gafas y collar al mismo tiempo',
        titles: { es: 'Estilo Puro', en: 'Fashion Icon', ja: 'おしゃれマスター', pt: 'Ícone Fashion' },
        descs: { es: 'Equipa gorro, gafas y collar al mismo tiempo', en: 'Equip hat, glasses, and collar simultaneously', ja: 'ぼうし・めがね・くびわを全部そうび', pt: 'Equipe chapéu, óculos e coleira juntos' },
        reward: 100, completed: false, current: 0, max: 1
    },
    {
        id: 'photo_star',
        title: 'Modelo de Portada',
        desc: 'Toma una foto en el Estudio Polaroid',
        titles: { es: 'Modelo de Portada', en: 'Cover Model', ja: 'トップモデル', pt: 'Capa de Revista' },
        descs: { es: 'Toma una foto en el Estudio Polaroid', en: 'Snap a photo in the 3D Studio', ja: 'フォトスタジオで写真を撮影', pt: 'Tire uma foto no Estúdio 3D' },
        reward: 50, completed: false, current: 0, max: 1
    },
    {
        id: 'clean_freak',
        title: 'Hogar Impecable',
        desc: 'Baña a tu cachorro y limpia sus necesidades',
        titles: { es: 'Hogar Impecable', en: 'Squeaky Clean', ja: 'ピカピカ名人', pt: 'Casa Impecável' },
        descs: { es: 'Baña a tu cachorro y limpia sus necesidades', en: 'Bathe your puppy and clean up after him', ja: 'こいぬをお風呂に入れておそうじしよう', pt: 'Dê banho no filhote e limpe suas necessidades' },
        reward: 60, completed: false, current: 0, max: 1
    },
    {
        id: 'gourmet_chef',
        title: 'Chef Estrella',
        desc: 'Alimenta a tu cachorro con comida gourmet',
        titles: { es: 'Chef Estrella', en: 'Master Chef', ja: '星つきシェフ', pt: 'Chef Estrela' },
        descs: { es: 'Alimenta a tu cachorro con comida gourmet', en: 'Feed your puppy a gourmet treat', ja: 'こいぬにごちそうを食べさせよう', pt: 'Alimente seu cãozinho com comida gourmet' },
        reward: 70, completed: false, current: 0, max: 1
    },
    {
        id: 'tamagotchi_master',
        title: 'Vínculo Legendario',
        desc: 'Gana una partida de Tamagotchi Guess',
        titles: { es: 'Vínculo Legendario', en: 'Mind Reader', ja: '以心伝心', pt: 'Elo Lendário' },
        descs: { es: 'Gana una partida de Tamagotchi Guess', en: 'Win a match in Tamagotchi Guess', ja: 'あっちむいてホイで勝利する', pt: 'Vença uma partida de Tamagotchi Guess' },
        reward: 80, completed: false, current: 0, max: 1
    },
    {
        id: 'juggle_champ',
        title: 'Malabarista Pro',
        desc: 'Rebota el hueso 15 veces en Bone Juggle',
        titles: { es: 'Malabarista Pro', en: 'Master Juggler', ja: 'リフティング名人', pt: 'Malabarista Pro' },
        descs: { es: 'Rebota el hueso 15 veces en Bone Juggle', en: 'Bounce the bone 15 times in Bone Juggle', ja: 'ボーンジャグリングで15回リフティング', pt: 'Rebata o osso 15 vezes no Bone Juggle' },
        reward: 90, completed: false, current: 0, max: 15
    }
];

// --- 4.1 TAMAGOTCHI FOOD MENU (ZERO MICROTRANSACTIONS) ---
const FOOD_MENU = [
    {
        id: 'kibble',
        name: 'food_kibble',
        icon: '🥣',
        price: 3,
        hungerBonus: 20,
        happinessBonus: 5,
        energyBonus: 5,
        healthBonus: 0,
        stressRelief: 0,
        weightGain: 0.05
    },
    {
        id: 'steak',
        name: 'food_steak',
        icon: '🥩',
        price: 8,
        hungerBonus: 45,
        happinessBonus: 15,
        energyBonus: 10,
        healthBonus: 5,
        stressRelief: 10,
        weightGain: 0.2
    },
    {
        id: 'calcium_bone',
        name: 'food_calcium',
        icon: '🦴',
        price: 12,
        hungerBonus: 25,
        happinessBonus: 35,
        energyBonus: 15,
        healthBonus: 15,
        stressRelief: 15,
        weightGain: 0.1
    },
    {
        id: 'cupcake',
        name: 'food_cupcake',
        icon: '🧁',
        price: 15,
        hungerBonus: 15,
        happinessBonus: 40,
        energyBonus: 5,
        healthBonus: 0,
        stressRelief: 25,
        weightGain: 0.35
    },
    {
        id: 'warm_milk',
        name: 'food_milk',
        icon: '🥛',
        price: 5,
        hungerBonus: 15,
        happinessBonus: 10,
        energyBonus: 25,
        healthBonus: 10,
        stressRelief: 15,
        weightGain: 0.05
    }
];

// --- 5. PERSISTENT STATE MANAGEMENT ---
const STORAGE_KEY = 'DODGE_BLOCK_DOGS_DELUXE_V4';

const defaultState = {
    lang: (typeof navigator !== 'undefined' && navigator.language && navigator.language.startsWith('ja')) ? 'ja' :
          (typeof navigator !== 'undefined' && navigator.language && navigator.language.startsWith('en')) ? 'en' :
          (typeof navigator !== 'undefined' && navigator.language && navigator.language.startsWith('pt')) ? 'pt' : 'es',
    bones: 160,
    activePetIndex: 0,
    unlockedPets: ['dachshund'],
    equipped: {
        hat: 'none',
        glasses: 'none',
        neck: 'none'
    },
    unlockedHats: ['none'],
    unlockedGlasses: ['none'],
    unlockedNeck: ['none'],
    vitals: {
        hunger: 85,
        happiness: 90,
        energy: 95,
        stress: 15,
        hygiene: 90,
        health: 100,
        discipline: 80,
        poops: 0,
        isSick: false,
        lightsOff: false,
        weightKg: 4.5,
        ageDays: 1,
        lcdMode: false,
        lastTick: Date.now()
    },
    highScores: {
        MG_DODGE: 0,
        MG_CATCH: 0,
        MG_JUMP: 0,
        MG_LANE: 0,
        MG_GUESS: 0,
        MG_BOUNCE: 0
    },
    stats: {
        totalPets: 0,
        nearMisses: 0,
        feverCount: 0,
        photosSnapped: 0,
        poopsCleaned: 0,
        mealsCooked: 0
    },
    achievements: {},
    soundEnabled: true
};

let state = loadSavedState();

function loadSavedState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            const merged = Object.assign({}, defaultState, parsed);
            merged.vitals = Object.assign({}, defaultState.vitals, parsed.vitals || {});
            merged.highScores = Object.assign({}, defaultState.highScores, parsed.highScores || {});
            merged.stats = Object.assign({}, defaultState.stats, parsed.stats || {});
            return merged;
        }
    } catch (e) {
        console.warn('Storage read error', e);
    }
    return JSON.parse(JSON.stringify(defaultState));
}

function saveState() {
    try {
        state.vitals.lastTick = Date.now();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SAVE_STATE', state }));
        }
    } catch (_e) {}
}

function syncUnlocks() {
    DOG_BREEDS.forEach(dog => {
        dog.unlocked = state.unlockedPets.includes(dog.id);
    });
    ACCESSORIES.hats.forEach(item => {
        item.unlocked = state.unlockedHats.includes(item.id);
    });
    ACCESSORIES.glasses.forEach(item => {
        item.unlocked = state.unlockedGlasses.includes(item.id);
    });
    ACCESSORIES.neck.forEach(item => {
        item.unlocked = state.unlockedNeck.includes(item.id);
    });
    ACHIEVEMENTS.forEach(ach => {
        if (state.achievements && state.achievements[ach.id]) {
            ach.completed = true;
        }
    });
}
syncUnlocks();

function checkAchievement(id, increment = 1) {
    const ach = ACHIEVEMENTS.find(a => a.id === id);
    if (!ach || ach.completed) return;
    ach.current = (ach.current || 0) + increment;
    if (ach.current >= ach.max) {
        ach.completed = true;
        state.achievements = state.achievements || {};
        state.achievements[id] = true;
        state.bones += ach.reward;
        audio.play('fanfare');
        triggerHaptic('success');
        vfx.addText('🏆 ' + getAchTitle(ach) + '! (+' + ach.reward + '🦴)', LOGICAL_WIDTH / 2 - 120, 160, '#ffcc00');
        saveState();
    }
}

// --- 6. PROCEDURAL 3D MESH CONSTRUCTOR (BEVELED VINYL TOYS) ---
class ProceduralDogBuilder {
    constructor() {
        this.materials = new Map();
    }

    getMaterial(colorHex, roughness = 0.35, metalness = 0.08, emissive = 0x000000) {
        const key = colorHex + '_' + roughness + '_' + metalness + '_' + emissive;
        if (!this.materials.has(key)) {
            this.materials.set(key, new THREE.MeshStandardMaterial({
                color: colorHex,
                roughness: roughness,
                metalness: metalness,
                emissive: emissive
            }));
        }
        return this.materials.get(key);
    }

    buildDog(breed, equipped = { hat: 'none', glasses: 'none', neck: 'none' }) {
        const rootGroup = new THREE.Group();
        rootGroup.name = 'dogRoot';

        const bodyMat = this.getMaterial(breed.bodyColor, 0.35, 0.08);
        const bellyMat = this.getMaterial(breed.bellyColor || breed.bodyColor, 0.4, 0.05);
        const earMat = this.getMaterial(breed.earColor || breed.bodyColor, 0.35, 0.08);
        const darkMat = this.getMaterial(0x141416, 0.15, 0.2);
        const pinkTongueMat = this.getMaterial(0xff6b8b, 0.2, 0.0);
        const whiteCatchlightMat = this.getMaterial(0xffffff, 0.1, 0.0);

        // Ground Contact Shadow Disc
        const shadowGeo = new THREE.PlaneGeometry(2.4 * breed.scaleX, 1.8 * breed.scaleZ);
        const shadowMat = new THREE.MeshBasicMaterial({
            color: 0x050711,
            transparent: true,
            opacity: 0.45
        });
        const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
        shadowMesh.rotation.x = -Math.PI / 2;
        shadowMesh.position.y = 0.02;
        rootGroup.add(shadowMesh);

        // Main Spine Group (Squash & Stretch)
        const spineGroup = new THREE.Group();
        spineGroup.name = 'spineGroup';
        rootGroup.add(spineGroup);

        // 1. TORSO / BODY
        const legH = 0.45 * (breed.legScaleY || 1.0);
        const bodyWidth = 1.4 * breed.scaleX;
        const bodyHeight = 0.95 * breed.scaleY;
        const bodyDepth = 0.95 * breed.scaleZ;
        const bodyGeo = new THREE.BoxGeometry(bodyWidth, bodyHeight, bodyDepth);
        const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
        bodyMesh.position.y = bodyHeight * 0.5 + legH;
        bodyMesh.castShadow = true;
        bodyMesh.receiveShadow = true;
        spineGroup.add(bodyMesh);

        // Belly accent
        const bellyGeo = new THREE.BoxGeometry(bodyWidth * 0.8, bodyHeight * 0.45, bodyDepth * 0.85);
        const bellyMesh = new THREE.Mesh(bellyGeo, bellyMat);
        bellyMesh.position.set(0, -bodyHeight * 0.25, 0.06);
        bodyMesh.add(bellyMesh);

        // Chest white star / puppy diamond patch
        if (breed.chestStar) {
            const starMat = this.getMaterial(0xf5f5f5, 0.3, 0.05);
            const starGeo = new THREE.BoxGeometry(bodyWidth * 0.22, bodyHeight * 0.28, bodyDepth * 0.9);
            const starMesh = new THREE.Mesh(starGeo, starMat);
            starMesh.position.set(bodyWidth * 0.38, -bodyHeight * 0.08, 0.02);
            bodyMesh.add(starMesh);
        }

        // Breed-specific patch markings
        if (breed.patchColor) {
            const patchMat = this.getMaterial(breed.patchColor, 0.35, 0.08);
            const patchGeo = new THREE.BoxGeometry(bodyWidth * 0.4, bodyHeight * 0.5, bodyDepth * 0.95);
            const patchMesh = new THREE.Mesh(patchGeo, patchMat);
            patchMesh.position.set(-bodyWidth * 0.15, bodyHeight * 0.15, 0.05);
            bodyMesh.add(patchMesh);
        }

        // Cyberdog neon circuitry
        if (breed.neonColor) {
            const neonMat = new THREE.MeshStandardMaterial({
                color: breed.neonColor,
                emissive: breed.neonColor,
                emissiveIntensity: 0.9
            });
            const stripeGeo = new THREE.BoxGeometry(bodyWidth * 1.02, 0.1, bodyDepth * 1.02);
            const stripeMesh = new THREE.Mesh(stripeGeo, neonMat);
            bodyMesh.add(stripeMesh);
        }

        // 2. HEAD & SNOUT
        const headGroup = new THREE.Group();
        headGroup.name = 'headGroup';
        headGroup.position.set(bodyWidth * 0.42, bodyHeight + 0.4, 0);
        spineGroup.add(headGroup);

        const headSize = 0.85;
        const headGeo = new THREE.BoxGeometry(headSize, headSize, headSize * 0.95);
        const headMesh = new THREE.Mesh(headGeo, bodyMat);
        headMesh.castShadow = true;
        headGroup.add(headMesh);

        // Muzzle / Snout
        const snoutLen = breed.snoutLen || 0.45;
        const snoutH = 0.38;
        const snoutW = 0.46;
        const snoutGeo = new THREE.BoxGeometry(snoutLen, snoutH, snoutW);
        const snoutMat = breed.maskColor ? this.getMaterial(breed.maskColor, 0.4, 0.05) :
                         breed.bellyColor ? bellyMat : bodyMat;
        const snoutMesh = new THREE.Mesh(snoutGeo, snoutMat);
        snoutMesh.position.set(headSize * 0.45 + snoutLen * 0.45, -0.15, 0);
        headGroup.add(snoutMesh);

        // Nose
        const noseMat = breed.noseColor ? this.getMaterial(breed.noseColor, 0.2, 0.3) : darkMat;
        const noseGeo = new THREE.BoxGeometry(0.14, 0.12, 0.16);
        const noseMesh = new THREE.Mesh(noseGeo, noseMat);
        noseMesh.position.set(snoutLen * 0.5 + 0.04, 0.08, 0);
        snoutMesh.add(noseMesh);

        // Cute Tongue
        const tongueGeo = new THREE.BoxGeometry(0.18, 0.06, 0.14);
        const tongueMesh = new THREE.Mesh(tongueGeo, pinkTongueMat);
        tongueMesh.name = 'tongue';
        tongueMesh.position.set(snoutLen * 0.45, -snoutH * 0.4, 0);
        snoutMesh.add(tongueMesh);

        // Shiny Eyes with Specular Catchlights
        const eyeGeo = new THREE.SphereGeometry(0.11, 14, 14);
        const catchlightGeo = new THREE.SphereGeometry(0.04, 8, 8);
        const eyeMat = breed.eyeColor ? this.getMaterial(breed.eyeColor, 0.15, 0.1) : darkMat;

        const eyeLeft = new THREE.Mesh(eyeGeo, eyeMat);
        eyeLeft.position.set(headSize * 0.46, 0.08, 0.28);
        const catchL = new THREE.Mesh(catchlightGeo, whiteCatchlightMat);
        catchL.position.set(0.06, 0.04, 0.04);
        eyeLeft.add(catchL);
        headGroup.add(eyeLeft);

        const eyeRight = new THREE.Mesh(eyeGeo, eyeMat);
        eyeRight.position.set(headSize * 0.46, 0.08, -0.28);
        const catchR = new THREE.Mesh(catchlightGeo, whiteCatchlightMat);
        catchR.position.set(0.06, 0.04, -0.04);
        eyeRight.add(catchR);
        headGroup.add(eyeRight);

        // 3. EARS
        const earLGroup = new THREE.Group();
        const earRGroup = new THREE.Group();
        earLGroup.name = 'earL';
        earRGroup.name = 'earR';

        if (breed.earType === 'dane') {
            const earGeo = new THREE.BoxGeometry(0.18, 0.62, 0.11);
            const earMeshL = new THREE.Mesh(earGeo, earMat);
            earMeshL.position.set(0.02, -0.26, 0);
            earMeshL.rotation.x = 0.22;
            earLGroup.add(earMeshL);
            earLGroup.position.set(0.04, headSize * 0.46, headSize * 0.46);
            earLGroup.rotation.z = -0.22;
            earLGroup.rotation.y = 0.15;

            const earMeshR = new THREE.Mesh(earGeo, earMat);
            earMeshR.position.set(0.02, -0.26, 0);
            earMeshR.rotation.x = -0.22;
            earRGroup.add(earMeshR);
            earRGroup.position.set(0.04, headSize * 0.46, -headSize * 0.46);
            earRGroup.rotation.z = -0.22;
            earRGroup.rotation.y = -0.15;
        } else if (breed.earType === 'floppy') {
            const earGeo = new THREE.BoxGeometry(0.24, 0.75, 0.14);
            const earMeshL = new THREE.Mesh(earGeo, earMat);
            earMeshL.position.set(0, -0.32, 0);
            earLGroup.add(earMeshL);
            earLGroup.position.set(0.05, 0.28, headSize * 0.48);
            earLGroup.rotation.z = -0.15;

            const earMeshR = new THREE.Mesh(earGeo, earMat);
            earMeshR.position.set(0, -0.32, 0);
            earRGroup.add(earMeshR);
            earRGroup.position.set(0.05, 0.28, -headSize * 0.48);
            earRGroup.rotation.z = -0.15;
        } else if (breed.earType === 'pointed' || breed.earType === 'radar') {
            const earH = breed.earType === 'radar' ? 0.65 : 0.48;
            const earW = breed.earType === 'radar' ? 0.45 : 0.35;
            const earGeo = new THREE.ConeGeometry(earW * 0.5, earH, 4);
            const earMeshL = new THREE.Mesh(earGeo, earMat);
            earMeshL.rotation.y = Math.PI / 4;
            earLGroup.add(earMeshL);
            earLGroup.position.set(0.05, headSize * 0.5 + earH * 0.45, 0.28);
            earLGroup.rotation.z = -0.2;
            earLGroup.rotation.x = 0.25;

            const earMeshR = new THREE.Mesh(earGeo, earMat);
            earMeshR.rotation.y = Math.PI / 4;
            earRGroup.add(earMeshR);
            earRGroup.position.set(0.05, headSize * 0.5 + earH * 0.45, -0.28);
            earRGroup.rotation.z = -0.2;
            earRGroup.rotation.x = -0.25;
        } else if (breed.earType === 'folded') {
            const earGeo = new THREE.BoxGeometry(0.22, 0.36, 0.12);
            const earMeshL = new THREE.Mesh(earGeo, earMat);
            earLGroup.add(earMeshL);
            earLGroup.position.set(0.08, headSize * 0.45, 0.35);
            earLGroup.rotation.x = 0.6;
            earLGroup.rotation.z = -0.2;

            const earMeshR = new THREE.Mesh(earGeo, earMat);
            earRGroup.add(earMeshR);
            earRGroup.position.set(0.08, headSize * 0.45, -0.35);
            earRGroup.rotation.x = -0.6;
            earRGroup.rotation.z = -0.2;
        } else if (breed.earType === 'cyber') {
            const antGeo = new THREE.CylinderGeometry(0.04, 0.08, 0.6, 6);
            const antMat = this.getMaterial(0x111625, 0.2, 0.8);
            const earMeshL = new THREE.Mesh(antGeo, antMat);
            earLGroup.add(earMeshL);
            earLGroup.position.set(0, headSize * 0.55, 0.3);
            earLGroup.rotation.z = -0.4;
            earLGroup.rotation.x = 0.3;

            const earMeshR = new THREE.Mesh(antGeo, antMat);
            earRGroup.add(earMeshR);
            earRGroup.position.set(0, headSize * 0.55, -0.3);
            earRGroup.rotation.z = -0.4;
            earRGroup.rotation.x = -0.3;
        } else {
            // Button ears (Pug)
            const earGeo = new THREE.BoxGeometry(0.18, 0.24, 0.1);
            const earMeshL = new THREE.Mesh(earGeo, earMat);
            earLGroup.add(earMeshL);
            earLGroup.position.set(0, headSize * 0.42, 0.38);
            earLGroup.rotation.x = 0.4;

            const earMeshR = new THREE.Mesh(earGeo, earMat);
            earRGroup.add(earMeshR);
            earRGroup.position.set(0, headSize * 0.42, -0.38);
            earRGroup.rotation.x = -0.4;
        }
        headGroup.add(earLGroup);
        headGroup.add(earRGroup);

        // 4. TAIL
        const tailGroup = new THREE.Group();
        tailGroup.name = 'tailGroup';
        tailGroup.position.set(-bodyWidth * 0.5, bodyHeight * 0.6 + 0.35, 0);
        spineGroup.add(tailGroup);

        if (breed.tailType === 'long') {
            const tailGeo = new THREE.CylinderGeometry(0.05, 0.1, 0.7, 6);
            const tailMesh = new THREE.Mesh(tailGeo, bodyMat);
            tailMesh.position.set(-0.25, 0.22, 0);
            tailMesh.rotation.z = Math.PI / 3;
            tailGroup.add(tailMesh);
        } else if (breed.tailType === 'curly') {
            const tailGeo = new THREE.TorusGeometry(0.16, 0.08, 6, 12, Math.PI * 1.5);
            const tailMesh = new THREE.Mesh(tailGeo, bodyMat);
            tailMesh.position.set(-0.1, 0.18, 0);
            tailMesh.rotation.y = Math.PI / 2;
            tailGroup.add(tailMesh);
        } else if (breed.tailType === 'plume') {
            const tailGeo = new THREE.SphereGeometry(0.25, 8, 8);
            const tailMesh = new THREE.Mesh(tailGeo, bodyMat);
            tailMesh.scale.set(1.2, 1.4, 0.8);
            tailMesh.position.set(-0.15, 0.25, 0);
            tailGroup.add(tailMesh);
        } else if (breed.tailType === 'cyber_wire') {
            const tailGeo = new THREE.CylinderGeometry(0.03, 0.05, 0.65, 6);
            const neonTipGeo = new THREE.SphereGeometry(0.08, 8, 8);
            const neonMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 1 });
            const tailMesh = new THREE.Mesh(tailGeo, bodyMat);
            tailMesh.position.set(-0.22, 0.2, 0);
            tailMesh.rotation.z = Math.PI / 3;
            const tipMesh = new THREE.Mesh(neonTipGeo, neonMat);
            tipMesh.position.set(0, 0.35, 0);
            tailMesh.add(tipMesh);
            tailGroup.add(tailMesh);
        } else {
            // Bobtail
            const tailGeo = new THREE.BoxGeometry(0.18, 0.18, 0.18);
            const tailMesh = new THREE.Mesh(tailGeo, bodyMat);
            tailMesh.position.set(-0.08, 0.08, 0);
            tailGroup.add(tailMesh);
        }

        // 5. FOUR LEGS
        const legThickness = breed.legThickness || 1.0;
        const legW = 0.22 * legThickness;
        const legD = 0.22 * legThickness;
        const pawScale = breed.pawScale || 1.0;
        const legGeo = new THREE.BoxGeometry(legW, legH, legD);
        const pawGeo = new THREE.BoxGeometry(legW * (1.05 * pawScale), 0.12, legD * (1.25 * pawScale));
        const pawMat = breed.bellyColor ? bellyMat : bodyMat;

        const createLeg = (name, x, z) => {
            const legGroup = new THREE.Group();
            legGroup.name = name;
            legGroup.position.set(x, legH * 0.5, z);

            const legMesh = new THREE.Mesh(legGeo, bodyMat);
            legMesh.castShadow = true;
            legGroup.add(legMesh);

            const pawMesh = new THREE.Mesh(pawGeo, pawMat);
            pawMesh.position.set(0.02, -legH * 0.42, 0.02);
            legGroup.add(pawMesh);

            return legGroup;
        };

        const lxFront = bodyWidth * 0.32;
        const lxBack = -bodyWidth * 0.32;
        const lzSide = bodyDepth * 0.36;

        const legFL = createLeg('legFL', lxFront, lzSide);
        const legFR = createLeg('legFR', lxFront, -lzSide);
        const legBL = createLeg('legBL', lxBack, lzSide);
        const legBR = createLeg('legBR', lxBack, -lzSide);

        spineGroup.add(legFL);
        spineGroup.add(legFR);
        spineGroup.add(legBL);
        spineGroup.add(legBR);

        // 6. ACCESSORY ANCHORS
        const attachPoints = {
            hat: new THREE.Group(),
            glasses: new THREE.Group(),
            neck: new THREE.Group()
        };

        attachPoints.hat.position.set(0, headSize * 0.5 + 0.02, 0);
        headMesh.add(attachPoints.hat);

        attachPoints.glasses.position.set(headSize * 0.48, 0.08, 0);
        headMesh.add(attachPoints.glasses);

        attachPoints.neck.position.set(-headSize * 0.25, -headSize * 0.42, 0);
        headMesh.add(attachPoints.neck);

        this.applyAccessories(attachPoints, equipped);

        rootGroup.userData = {
            breed,
            spineGroup,
            headGroup,
            tailGroup,
            tongueMesh,
            earLGroup,
            earRGroup,
            legFL, legFR, legBL, legBR,
            attachPoints,
            wobblePos: 0,
            wobbleVel: 0,
            emotion: 'normal'
        };

        return rootGroup;
    }

    applyAccessories(attachPoints, equipped) {
        while (attachPoints.hat.children.length > 0) attachPoints.hat.remove(attachPoints.hat.children[0]);
        while (attachPoints.glasses.children.length > 0) attachPoints.glasses.remove(attachPoints.glasses.children[0]);
        while (attachPoints.neck.children.length > 0) attachPoints.neck.remove(attachPoints.neck.children[0]);

        if (equipped.hat === 'party') {
            const coneGeo = new THREE.ConeGeometry(0.3, 0.65, 8);
            const coneMat = this.getMaterial(0xff2a85, 0.3, 0.1);
            const cone = new THREE.Mesh(coneGeo, coneMat);
            cone.position.set(0, 0.32, 0);
            const pomGeo = new THREE.SphereGeometry(0.1, 8, 8);
            const pomMat = this.getMaterial(0xffcc00, 0.2, 0.2);
            const pom = new THREE.Mesh(pomGeo, pomMat);
            pom.position.set(0, 0.32, 0);
            cone.add(pom);
            attachPoints.hat.add(cone);
        } else if (equipped.hat === 'crown') {
            const crownGeo = new THREE.CylinderGeometry(0.38, 0.32, 0.25, 7, 1, true);
            const crownMat = this.getMaterial(0xffcc00, 0.2, 0.7);
            const crown = new THREE.Mesh(crownGeo, crownMat);
            crown.position.set(0, 0.14, 0);
            const gemGeo = new THREE.SphereGeometry(0.06, 6, 6);
            const gemMat = this.getMaterial(0xff0044, 0.1, 0.3);
            const gem = new THREE.Mesh(gemGeo, gemMat);
            gem.position.set(0.34, 0.05, 0);
            crown.add(gem);
            attachPoints.hat.add(crown);
        } else if (equipped.hat === 'detective') {
            const brimGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.05, 12);
            const topGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.35, 12);
            const hatMat = this.getMaterial(0x5a3d28, 0.5, 0.0);
            const brim = new THREE.Mesh(brimGeo, hatMat);
            brim.position.set(0, 0.03, 0);
            const top = new THREE.Mesh(topGeo, hatMat);
            top.position.set(0, 0.18, 0);
            brim.add(top);
            attachPoints.hat.add(brim);
        } else if (equipped.hat === 'beanie') {
            const domeGeo = new THREE.SphereGeometry(0.42, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.5);
            const beanieMat = this.getMaterial(0x2b6cb0, 0.6, 0.0);
            const dome = new THREE.Mesh(domeGeo, beanieMat);
            dome.position.set(0, 0.05, 0);
            const pomGeo = new THREE.SphereGeometry(0.12, 8, 8);
            const pomMat = this.getMaterial(0xffffff, 0.8, 0.0);
            const pom = new THREE.Mesh(pomGeo, pomMat);
            pom.position.set(0, 0.42, 0);
            dome.add(pom);
            attachPoints.hat.add(dome);
        } else if (equipped.hat === 'visor') {
            const visorGeo = new THREE.BoxGeometry(0.85, 0.22, 0.35);
            const visorMat = new THREE.MeshStandardMaterial({
                color: 0x00f0ff,
                emissive: 0x00f0ff,
                emissiveIntensity: 0.8,
                transparent: true,
                opacity: 0.85
            });
            const visor = new THREE.Mesh(visorGeo, visorMat);
            visor.position.set(0.1, 0.1, 0);
            attachPoints.hat.add(visor);
        } else if (equipped.hat === 'chef') {
            const chefBaseGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.2, 10);
            const chefPuffGeo = new THREE.SphereGeometry(0.48, 10, 8);
            const chefMat = this.getMaterial(0xffffff, 0.4, 0.0);
            const chefBase = new THREE.Mesh(chefBaseGeo, chefMat);
            chefBase.position.set(0, 0.1, 0);
            const chefPuff = new THREE.Mesh(chefPuffGeo, chefMat);
            chefPuff.position.set(0, 0.28, 0);
            chefBase.add(chefPuff);
            attachPoints.hat.add(chefBase);
        }

        if (equipped.glasses === 'shades') {
            const shadeGeo = new THREE.BoxGeometry(0.12, 0.24, 0.82);
            const shadeMat = this.getMaterial(0x111115, 0.1, 0.5);
            const shades = new THREE.Mesh(shadeGeo, shadeMat);
            shades.position.set(0.04, 0, 0);
            attachPoints.glasses.add(shades);
        } else if (equipped.glasses === 'retro') {
            const frameMat = this.getMaterial(0xd69e2e, 0.2, 0.8);
            const rimGeo = new THREE.TorusGeometry(0.14, 0.03, 6, 12);
            const rimL = new THREE.Mesh(rimGeo, frameMat);
            rimL.position.set(0.04, 0, 0.26);
            rimL.rotation.y = Math.PI / 2;
            const rimR = new THREE.Mesh(rimGeo, frameMat);
            rimR.position.set(0.04, 0, -0.26);
            rimR.rotation.y = Math.PI / 2;
            attachPoints.glasses.add(rimL);
            attachPoints.glasses.add(rimR);
        } else if (equipped.glasses === 'monocle') {
            const frameMat = this.getMaterial(0xffd700, 0.2, 0.8);
            const rimGeo = new THREE.TorusGeometry(0.16, 0.03, 6, 14);
            const monocle = new THREE.Mesh(rimGeo, frameMat);
            monocle.position.set(0.05, 0, 0.26);
            monocle.rotation.y = Math.PI / 2;
            attachPoints.glasses.add(monocle);
        } else if (equipped.glasses === 'anime') {
            const starMat = this.getMaterial(0xffe600, 0.1, 0.2);
            const starGeo = new THREE.BoxGeometry(0.04, 0.22, 0.22);
            const starL = new THREE.Mesh(starGeo, starMat);
            starL.position.set(0.06, 0, 0.26);
            starL.rotation.x = Math.PI / 4;
            const starR = new THREE.Mesh(starGeo, starMat);
            starR.position.set(0.06, 0, -0.26);
            starR.rotation.x = Math.PI / 4;
            attachPoints.glasses.add(starL);
            attachPoints.glasses.add(starR);
        }

        if (equipped.neck === 'red_bandana') {
            const bandMat = this.getMaterial(0xe53e3e, 0.4, 0.0);
            const bandGeo = new THREE.ConeGeometry(0.38, 0.42, 4);
            const bandana = new THREE.Mesh(bandGeo, bandMat);
            bandana.position.set(0.18, -0.15, 0);
            bandana.rotation.x = Math.PI;
            bandana.rotation.z = -0.3;
            attachPoints.neck.add(bandana);
        } else if (equipped.neck === 'gold_bone') {
            const chainMat = this.getMaterial(0xffd700, 0.2, 0.8);
            const boneMat = this.getMaterial(0xffffff, 0.3, 0.1);
            const collarGeo = new THREE.TorusGeometry(0.44, 0.06, 6, 14);
            const collar = new THREE.Mesh(collarGeo, chainMat);
            collar.rotation.x = Math.PI / 2;
            const miniBoneGeo = new THREE.BoxGeometry(0.24, 0.08, 0.08);
            const miniBone = new THREE.Mesh(miniBoneGeo, boneMat);
            miniBone.position.set(0.44, 0, 0);
            collar.add(miniBone);
            attachPoints.neck.add(collar);
        } else if (equipped.neck === 'spiked') {
            const collarMat = this.getMaterial(0x1a202c, 0.4, 0.1);
            const spikeMat = this.getMaterial(0xe2e8f0, 0.2, 0.9);
            const collarGeo = new THREE.TorusGeometry(0.44, 0.07, 6, 14);
            const collar = new THREE.Mesh(collarGeo, collarMat);
            collar.rotation.x = Math.PI / 2;
            for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
                const spikeGeo = new THREE.ConeGeometry(0.06, 0.14, 4);
                const spike = new THREE.Mesh(spikeGeo, spikeMat);
                spike.position.set(Math.cos(a) * 0.48, Math.sin(a) * 0.48, 0);
                spike.rotation.z = a - Math.PI / 2;
                collar.add(spike);
            }
            attachPoints.neck.add(collar);
        } else if (equipped.neck === 'bowtie') {
            const bowMat = this.getMaterial(0x9b2c2c, 0.3, 0.1);
            const bowGeo = new THREE.BoxGeometry(0.14, 0.2, 0.38);
            const bow = new THREE.Mesh(bowGeo, bowMat);
            bow.position.set(0.38, -0.05, 0);
            attachPoints.neck.add(bow);
        }
    }

    updateDogAnimation(dogGroup, dt, timeSec, speed = 0, isRunning = false, emotion = 'normal') {
        const data = dogGroup.userData;
        if (!data) return;

        // 1. Squash & Stretch Wobble Spring Physics
        const springK = 65;
        const damping = 8;
        data.wobblePos += data.wobbleVel * dt;
        data.wobbleVel += (-springK * data.wobblePos - damping * data.wobbleVel) * dt;
        const scaleY = 1.0 + data.wobblePos;
        const scaleXZ = 1.0 - data.wobblePos * 0.5;
        data.spineGroup.scale.set(scaleXZ, scaleY, scaleXZ);

        // 2. Idle Natural Breathing
        const breathe = Math.sin(timeSec * 3.2) * 0.035;
        data.spineGroup.position.y = breathe;

        // 3. Tail Wag Controller
        let wagFreq = 6;
        let wagAmp = 0.28;
        if (emotion === 'happy') {
            wagFreq = 16;
            wagAmp = 0.65;
        } else if (emotion === 'sleepy') {
            wagFreq = 1.8;
            wagAmp = 0.1;
        }
        data.tailGroup.rotation.y = Math.sin(timeSec * wagFreq) * wagAmp;

        // 4. Head Curvature & Tongue
        if (emotion === 'happy') {
            data.headGroup.rotation.z = Math.sin(timeSec * 4) * 0.12;
            data.headGroup.rotation.y = Math.sin(timeSec * 2) * 0.15;
            if (data.tongueMesh) data.tongueMesh.visible = true;
        } else if (emotion === 'sleepy') {
            data.headGroup.rotation.z = -0.22;
            data.headGroup.rotation.y = 0;
            if (data.tongueMesh) data.tongueMesh.visible = false;
        } else {
            data.headGroup.rotation.z = Math.sin(timeSec * 1.5) * 0.06;
            data.headGroup.rotation.y = Math.sin(timeSec * 0.8) * 0.08;
            if (data.tongueMesh) data.tongueMesh.visible = false;
        }

        // 5. Ear Bounce
        data.earLGroup.rotation.z = -0.15 + Math.sin(timeSec * wagFreq * 0.5) * 0.08;
        data.earRGroup.rotation.z = -0.15 - Math.sin(timeSec * wagFreq * 0.5) * 0.08;

        // 6. Quadruped Walk / Run Gait
        if (isRunning) {
            const runCycle = timeSec * Math.max(8, speed * 0.04);
            const legSwing = 0.6;
            data.legFL.rotation.z = Math.sin(runCycle) * legSwing;
            data.legBR.rotation.z = Math.sin(runCycle) * legSwing;
            data.legFR.rotation.z = -Math.sin(runCycle) * legSwing;
            data.legBL.rotation.z = -Math.sin(runCycle) * legSwing;
            data.spineGroup.position.y += Math.abs(Math.sin(runCycle * 2)) * 0.15;
        } else {
            data.legFL.rotation.z *= 0.85;
            data.legFR.rotation.z *= 0.85;
            data.legBL.rotation.z *= 0.85;
            data.legBR.rotation.z *= 0.85;
        }
    }

    triggerWobble(dogGroup, force = 0.45) {
        if (dogGroup && dogGroup.userData) {
            dogGroup.userData.wobbleVel = force;
        }
    }
}

const dogBuilder = new ProceduralDogBuilder();

// --- 7. THREE.JS 3D SCENE & STAGE MANAGER ---
class StageManager {
    constructor() {
        this.canvas = document.getElementById('threeCanvas');
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.renderer.setSize(LOGICAL_WIDTH, LOGICAL_HEIGHT, false);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(38, LOGICAL_WIDTH / LOGICAL_HEIGHT, 0.1, 150);
        this.camera.position.set(0, 14, 22);
        this.camera.lookAt(0, 1.8, 0);

        this.setupLighting();

        this.roomGroup = new THREE.Group();
        this.minigame3DGroup = new THREE.Group();
        this.studioGroup = new THREE.Group();
        this.scene.add(this.roomGroup);
        this.scene.add(this.minigame3DGroup);
        this.scene.add(this.studioGroup);

        this.currentDog = null;

        this.ballMesh = null;
        this.ballVelocity = new THREE.Vector3(0, 0, 0);
        this.foodBowl = null;
        this.kibblesGroup = null;

        this.buildLivingRoom();
        this.buildStudioStage();
    }

    setupLighting() {
        this.ambientLight = new THREE.AmbientLight(0xd6e4ff, 0.65);
        this.scene.add(this.ambientLight);

        this.sunLight = new THREE.DirectionalLight(0xfffaed, 1.15);
        this.sunLight.position.set(12, 28, 16);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 1024;
        this.sunLight.shadow.mapSize.height = 1024;
        this.sunLight.shadow.camera.near = 5;
        this.sunLight.shadow.camera.far = 60;
        this.sunLight.shadow.camera.left = -15;
        this.sunLight.shadow.camera.right = 15;
        this.sunLight.shadow.camera.top = 15;
        this.sunLight.shadow.camera.bottom = -15;
        this.scene.add(this.sunLight);

        this.rimLight = new THREE.DirectionalLight(0x00f0ff, 0.55);
        this.rimLight.position.set(-16, 12, -14);
        this.scene.add(this.rimLight);
    }

    buildLivingRoom() {
        const floorMat = dogBuilder.getMaterial(0x8a532d, 0.45, 0.05);
        const floorGeo = new THREE.BoxGeometry(24, 0.6, 24);
        const floorMesh = new THREE.Mesh(floorGeo, floorMat);
        floorMesh.position.y = -0.3;
        floorMesh.receiveShadow = true;
        this.roomGroup.add(floorMesh);

        const rugGeo = new THREE.CylinderGeometry(4.2, 4.4, 0.08, 32);
        const rugMat = dogBuilder.getMaterial(0x4c51bf, 0.7, 0.0);
        const rugMesh = new THREE.Mesh(rugGeo, rugMat);
        rugMesh.scale.set(1.4, 1.0, 0.95);
        rugMesh.position.set(0, 0.04, 0.5);
        rugMesh.receiveShadow = true;
        this.roomGroup.add(rugMesh);

        const wallMat = dogBuilder.getMaterial(0x1a2138, 0.6, 0.05);
        const backWallGeo = new THREE.BoxGeometry(24, 16, 0.6);
        const backWall = new THREE.Mesh(backWallGeo, wallMat);
        backWall.position.set(0, 8, -10);
        backWall.receiveShadow = true;
        this.roomGroup.add(backWall);

        const windowFrameGeo = new THREE.BoxGeometry(5.2, 5.2, 0.3);
        const frameMat = dogBuilder.getMaterial(0x2d3748, 0.4, 0.1);
        const windowFrame = new THREE.Mesh(windowFrameGeo, frameMat);
        windowFrame.position.set(4.5, 9.2, -9.6);
        this.roomGroup.add(windowFrame);

        const skyGeo = new THREE.PlaneGeometry(4.6, 4.6);
        const skyMat = new THREE.MeshBasicMaterial({ color: 0x3182ce });
        const skyMesh = new THREE.Mesh(skyGeo, skyMat);
        skyMesh.position.set(4.5, 9.2, -9.45);
        this.roomGroup.add(skyMesh);

        const bowlGeo = new THREE.CylinderGeometry(0.75, 0.55, 0.35, 16);
        const bowlMat = dogBuilder.getMaterial(0xe53e3e, 0.3, 0.2);
        this.foodBowl = new THREE.Mesh(bowlGeo, bowlMat);
        this.foodBowl.position.set(-3.2, 0.18, 2.2);
        this.foodBowl.castShadow = true;
        this.roomGroup.add(this.foodBowl);

        this.kibblesGroup = new THREE.Group();
        for (let i = 0; i < 9; i++) {
            const kGeo = new THREE.SphereGeometry(0.08, 6, 6);
            const kMat = dogBuilder.getMaterial(0x5c3317, 0.6, 0.0);
            const kibble = new THREE.Mesh(kGeo, kMat);
            kibble.position.set(
                (Math.random() - 0.5) * 0.6,
                0.12 + Math.random() * 0.08,
                (Math.random() - 0.5) * 0.6
            );
            this.kibblesGroup.add(kibble);
        }
        this.foodBowl.add(this.kibblesGroup);

        const ballGeo = new THREE.SphereGeometry(0.42, 16, 16);
        const ballMat = dogBuilder.getMaterial(0xffcc00, 0.2, 0.1);
        this.ballMesh = new THREE.Mesh(ballGeo, ballMat);
        this.ballMesh.position.set(3.4, 0.42, 2.5);
        this.ballMesh.castShadow = true;
        this.roomGroup.add(this.ballMesh);

        const potGeo = new THREE.CylinderGeometry(0.6, 0.45, 0.9, 12);
        const potMat = dogBuilder.getMaterial(0xdd6b20, 0.5, 0.0);
        const potMesh = new THREE.Mesh(potGeo, potMat);
        potMesh.position.set(-6.5, 0.45, -6.5);
        potMesh.castShadow = true;
        this.roomGroup.add(potMesh);

        const plantGeo = new THREE.DodecahedronGeometry(0.95);
        const plantMat = dogBuilder.getMaterial(0x38a169, 0.4, 0.0);
        const plantMesh = new THREE.Mesh(plantGeo, plantMat);
        plantMesh.position.set(-6.5, 1.45, -6.5);
        plantMesh.castShadow = true;
        this.roomGroup.add(plantMesh);
    }

    buildStudioStage() {
        this.studioGroup.visible = false;
        const stageGeo = new THREE.CylinderGeometry(4.5, 4.8, 0.6, 36);
        const stageMat = dogBuilder.getMaterial(0x1a202c, 0.2, 0.6);
        const stageMesh = new THREE.Mesh(stageGeo, stageMat);
        stageMesh.position.y = -0.3;
        stageMesh.receiveShadow = true;
        this.studioGroup.add(stageMesh);

        const cycGeo = new THREE.CylinderGeometry(12, 12, 18, 32, 1, true, -Math.PI * 0.6, Math.PI * 1.2);
        const cycMat = dogBuilder.getMaterial(0x2d3748, 0.7, 0.0);
        const cycMesh = new THREE.Mesh(cycGeo, cycMat);
        cycMesh.position.set(0, 7, -2);
        cycMesh.rotation.y = Math.PI;
        this.studioGroup.add(cycMesh);
    }

    setScreen(screen) {
        this.roomGroup.visible = (screen === SCREENS.DASHBOARD || screen === SCREENS.WARDROBE || screen === SCREENS.DIARY);
        this.studioGroup.visible = (screen === SCREENS.PHOTO_STUDIO);
        this.minigame3DGroup.visible = (screen.startsWith('MG_'));

        if (screen === SCREENS.PHOTO_STUDIO) {
            this.camera.position.set(0, 3.8, 11);
            this.camera.lookAt(0, 1.4, 0);
        } else if (screen.startsWith('MG_')) {
            this.camera.position.set(0, 12, 18);
            this.camera.lookAt(0, 1.0, -3);
        } else {
            this.camera.position.set(0, 14, 22);
            this.camera.lookAt(0, 1.8, 0);
        }
    }

    updateBallPhysics(dt) {
        if (!this.ballMesh) return;
        this.ballVelocity.y -= 18 * dt;
        this.ballMesh.position.addScaledVector(this.ballVelocity, dt);

        if (this.ballMesh.position.y <= 0.42) {
            this.ballMesh.position.y = 0.42;
            if (Math.abs(this.ballVelocity.y) > 0.5) {
                this.ballVelocity.y = -this.ballVelocity.y * 0.72;
            } else {
                this.ballVelocity.y = 0;
            }
        }
        this.ballVelocity.x *= 0.96;
        this.ballVelocity.z *= 0.96;
    }

    spawnDog(breed, equipped) {
        if (this.currentDog) {
            this.scene.remove(this.currentDog);
        }
        this.currentDog = dogBuilder.buildDog(breed, equipped);
        this.currentDog.position.set(0, 0, 0);
        this.currentDog.rotation.y = -Math.PI / 6;
        this.scene.add(this.currentDog);
        return this.currentDog;
    }
}

const stage = new StageManager();
stage.spawnDog(DOG_BREEDS[state.activePetIndex], state.equipped);

// --- 8. FLOATING PARTICLES & VFX ENGINE ---
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.floatTexts = [];
    }

    emit(x, y, count = 10, type = 'star') {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 50 + Math.random() * 160;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - (type === 'heart' ? 60 : 20),
                size: 4 + Math.random() * 6,
                color: type === 'heart' ? '#ff2a85' :
                       type === 'gold' ? '#ffcc00' :
                       type === 'spark' ? '#00f0ff' :
                       type === 'confetti' ? ['#00f0ff', '#ff2a85', '#ffcc00', '#05ffa1'][Math.floor(Math.random() * 4)] : '#ffffff',
                life: 1.0,
                decay: 1.0 + Math.random() * 1.4,
                type,
                rot: Math.random() * Math.PI,
                vrot: (Math.random() - 0.5) * 8
            });
        }
    }

    addText(text, x, y, color = '#00f0ff') {
        this.floatTexts.push({
            text, x, y,
            vy: -55,
            color,
            life: 1.0,
            decay: 0.9
        });
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += (p.type === 'heart' ? -20 : 90) * dt;
            p.rot += p.vrot * dt;
            p.life -= p.decay * dt;
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        for (let i = this.floatTexts.length - 1; i >= 0; i--) {
            const t = this.floatTexts[i];
            t.y += t.vy * dt;
            t.life -= t.decay * dt;
            if (t.life <= 0) this.floatTexts.splice(i, 1);
        }
    }

    draw(ctx) {
        for (const p of this.particles) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.fillStyle = p.color;

            if (p.type === 'heart') {
                const s = p.size;
                ctx.beginPath();
                ctx.arc(-s / 2, -s / 2, s / 2, Math.PI, 0, false);
                ctx.arc(s / 2, -s / 2, s / 2, Math.PI, 0, false);
                ctx.lineTo(0, s * 0.9);
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            }
            ctx.restore();
        }

        for (const t of this.floatTexts) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, t.life);
            ctx.font = 'bold 18px "Courier New", monospace';
            ctx.fillStyle = '#000000';
            ctx.fillText(t.text, t.x + 2, t.y + 2);
            ctx.fillStyle = t.color;
            ctx.fillText(t.text, t.x, t.y);
            ctx.restore();
        }
    }
}

const vfx = new ParticleSystem();

// --- 9. ROGUELITE ARCADE MINIGAMES ENGINE ---
const minigameState = {
    type: null,
    active: false,
    score: 0,
    highScore: 0,
    lives: 3,
    timer: 35,
    speed: 240,
    gameOver: false,
    earnedBones: 0,
    screenShake: 0,
    nearMissCooldown: 0,

    comboGauge: 0,
    multiplier: 1,
    isFever: false,
    feverTimer: 0,

    shieldActive: false,
    magnetActive: false,
    magnetTimer: 0,
    slowMoActive: false,
    slowMoTimer: 0,

    playerX: LOGICAL_WIDTH / 2,
    playerY: LOGICAL_HEIGHT - 130,
    playerVx: 0,
    playerVy: 0,
    entities: [],
    laneIndex: 1,

    // Retro Tamagotchi Guess minigame
    guessRound: 1,
    guessWins: 0,
    guessPetChoice: null,
    guessUserChoice: null,
    guessPhase: 'waiting',
    guessTimer: 0,

    // Retro Bone Juggle minigame
    ballX: LOGICAL_WIDTH / 2,
    ballY: 150,
    ballVx: 170,
    ballVy: 220,
    ballRadius: 14,
    bounces: 0
};

function startMinigame(type) {
    audio.play('bark');
    audio.setTrack('arcade');
    triggerHaptic('medium');

    minigameState.type = type;
    minigameState.active = true;
    minigameState.score = 0;
    minigameState.lives = 3;
    minigameState.timer = 35;
    minigameState.gameOver = false;
    minigameState.earnedBones = 0;
    minigameState.entities = [];
    minigameState.screenShake = 0;
    minigameState.highScore = state.highScores[type] || 0;

    minigameState.comboGauge = 0;
    minigameState.multiplier = 1;
    minigameState.isFever = false;
    minigameState.feverTimer = 0;
    minigameState.shieldActive = false;
    minigameState.magnetActive = false;
    minigameState.slowMoActive = false;

    minigameState.playerX = LOGICAL_WIDTH / 2;
    minigameState.playerY = LOGICAL_HEIGHT - 140;
    minigameState.playerVx = 0;
    minigameState.playerVy = 0;

    if (type === SCREENS.MG_DODGE) {
        minigameState.speed = 220;
    } else if (type === SCREENS.MG_CATCH) {
        minigameState.speed = 210;
    } else if (type === SCREENS.MG_JUMP) {
        minigameState.playerY = LOGICAL_HEIGHT - 120;
        minigameState.playerVy = -540;
        minigameState.entities.push({ x: 0, y: LOGICAL_HEIGHT - 50, w: LOGICAL_WIDTH, h: 22, type: 'ground' });
        for (let i = 0; i < 6; i++) {
            minigameState.entities.push({
                x: 25 + Math.random() * (LOGICAL_WIDTH - 130),
                y: LOGICAL_HEIGHT - 150 - (i * 115),
                w: 85,
                h: 18,
                type: Math.random() > 0.28 ? 'normal' : 'spring',
                vx: Math.random() > 0.6 ? 55 : 0
            });
        }
    } else if (type === SCREENS.MG_LANE) {
        minigameState.laneIndex = 1;
        minigameState.speed = 280;
    } else if (type === SCREENS.MG_GUESS) {
        minigameState.guessRound = 1;
        minigameState.guessWins = 0;
        minigameState.guessPetChoice = null;
        minigameState.guessUserChoice = null;
        minigameState.guessPhase = 'waiting';
        minigameState.guessTimer = 0;
        audio.play('tamagotchi_chirp');
    } else if (type === SCREENS.MG_BOUNCE) {
        minigameState.ballX = LOGICAL_WIDTH / 2;
        minigameState.ballY = 160;
        minigameState.ballVx = (Math.random() > 0.5 ? 1 : -1) * (150 + Math.random() * 40);
        minigameState.ballVy = 220;
        minigameState.ballRadius = 14;
        minigameState.bounces = 0;
        minigameState.lives = 3;
        minigameState.playerX = LOGICAL_WIDTH / 2;
        minigameState.playerY = LOGICAL_HEIGHT - 130;
    }

    currentScreen = type;
    stage.setScreen(type);
}

function triggerFeverMode() {
    if (minigameState.isFever) return;
    minigameState.isFever = true;
    minigameState.feverTimer = 6.0;
    minigameState.multiplier = 8;
    audio.play('fever');
    audio.setTrack('fever');
    triggerHaptic('success');
    vfx.addText(t('fever_banner'), LOGICAL_WIDTH / 2 - 120, LOGICAL_HEIGHT / 2 - 50, '#ffcc00');
    vfx.emit(LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2, 28, 'confetti');

    for (const e of minigameState.entities) {
        if (e.type === 'hazard' || e.type === 'heavy' || e.type === 'anvil') {
            e.type = 'gold_bone';
            e.color = '#ffd700';
        }
    }

    checkAchievement('fever_master');
    state.stats.feverCount = (state.stats.feverCount || 0) + 1;
    saveState();
}

function addCombo(amount = 18) {
    if (minigameState.isFever) return;
    minigameState.comboGauge = Math.min(100, minigameState.comboGauge + amount);
    if (minigameState.comboGauge >= 100) {
        triggerFeverMode();
    } else if (minigameState.comboGauge >= 75) {
        minigameState.multiplier = 4;
    } else if (minigameState.comboGauge >= 40) {
        minigameState.multiplier = 2;
    } else {
        minigameState.multiplier = 1;
    }
}

function endMinigame() {
    if (minigameState.gameOver) return;
    minigameState.gameOver = true;
    audio.play('hit');
    triggerHaptic('heavy');
    audio.setTrack('room');

    const vignette = document.getElementById('vignetteOverlay');
    if (vignette) {
        vignette.classList.add('hit');
        setTimeout(() => vignette.classList.remove('hit'), 350);
    }

    let bonesWon = Math.floor(minigameState.score * 1.6);
    if (minigameState.score > minigameState.highScore) {
        minigameState.highScore = minigameState.score;
        state.highScores[minigameState.type] = minigameState.score;
        bonesWon += 35;
        vfx.addText(t('new_record'), LOGICAL_WIDTH / 2 - 60, LOGICAL_HEIGHT / 2 - 40, '#ffcc00');
        audio.play('fanfare');
        triggerHaptic('success');
    }
    minigameState.earnedBones = bonesWon;
    state.bones += bonesWon;

    state.vitals.happiness = Math.min(100, state.vitals.happiness + 20);
    state.vitals.energy = Math.max(0, state.vitals.energy - 12);
    state.vitals.weightKg = Math.max(2.0, Math.round(((state.vitals.weightKg || 4.5) - 0.15) * 10) / 10);
    saveState();

    if (minigameState.type === SCREENS.MG_DODGE && minigameState.score >= 50) {
        checkAchievement('century_dodge');
    }
    if (minigameState.type === SCREENS.MG_GUESS && minigameState.guessWins >= 3) {
        checkAchievement('tamagotchi_master');
    }
    if (minigameState.type === SCREENS.MG_BOUNCE && minigameState.bounces >= 15) {
        checkAchievement('juggle_champ');
    }
}

// --- 10. MINIGAME LOGIC UPDATES ---
function updateMinigameDodge(dt) {
    if (minigameState.gameOver) return;

    let effectiveDt = dt;
    if (minigameState.slowMoActive) {
        effectiveDt *= 0.45;
        minigameState.slowMoTimer -= dt;
        if (minigameState.slowMoTimer <= 0) minigameState.slowMoActive = false;
    }

    if (minigameState.isFever) {
        minigameState.feverTimer -= dt;
        if (minigameState.feverTimer <= 0) {
            minigameState.isFever = false;
            minigameState.comboGauge = 0;
            minigameState.multiplier = 1;
            audio.setTrack('arcade');
        }
    }

    minigameState.speed += 9 * effectiveDt;

    if (Math.random() < 0.05 + (minigameState.speed * 0.00018)) {
        const roll = Math.random();
        let isPowerup = false;
        let pType = 'hazard';
        let color = '#ff0055';

        if (roll < 0.03 && !minigameState.shieldActive) {
            isPowerup = true; pType = 'shield'; color = '#00f0ff';
        } else if (roll < 0.06 && !minigameState.magnetActive) {
            isPowerup = true; pType = 'magnet'; color = '#ffcc00';
        } else if (roll < 0.09 && !minigameState.slowMoActive) {
            isPowerup = true; pType = 'slowmo'; color = '#9d4edd';
        } else {
            const isHeavy = Math.random() > 0.8;
            pType = isHeavy ? 'heavy' : 'hazard';
            color = isHeavy ? '#ff0055' : '#ff2a85';
        }

        minigameState.entities.push({
            x: 15 + Math.random() * (LOGICAL_WIDTH - 70),
            y: -60,
            w: pType === 'heavy' ? 62 : 40,
            h: pType === 'heavy' ? 62 : 40,
            color,
            speedMultiplier: pType === 'heavy' ? 0.85 : 1.15,
            type: pType,
            isPowerup,
            scored: false,
            rot: 0,
            rotSpeed: (Math.random() - 0.5) * 4
        });
    }

    const dogHitbox = {
        x: minigameState.playerX - 25,
        y: minigameState.playerY - 22,
        w: 50,
        h: 44
    };

    for (let i = minigameState.entities.length - 1; i >= 0; i--) {
        const e = minigameState.entities[i];
        e.y += minigameState.speed * e.speedMultiplier * effectiveDt;
        e.rot += e.rotSpeed * effectiveDt;

        const dist = Math.hypot((e.x + e.w / 2) - (dogHitbox.x + dogHitbox.w / 2), (e.y + e.h / 2) - (dogHitbox.y + dogHitbox.h / 2));
        if (dist < 60 && !e.nearMissed && !e.isPowerup && !minigameState.isFever) {
            e.nearMissed = true;
            minigameState.score += 5 * minigameState.multiplier;
            addCombo(24);
            audio.play('near_miss');
            triggerHaptic('light');

            const vig = document.getElementById('vignetteOverlay');
            if (vig) {
                vig.classList.add('near-miss');
                setTimeout(() => vig.classList.remove('near-miss'), 200);
            }
            vfx.addText('+5 NEAR MISS! x' + minigameState.multiplier, minigameState.playerX - 40, minigameState.playerY - 50, '#00f0ff');
            checkAchievement('near_miss_king');
        }

        if (e.x < dogHitbox.x + dogHitbox.w &&
            e.x + e.w > dogHitbox.x &&
            e.y < dogHitbox.y + dogHitbox.h &&
            e.y + e.h > dogHitbox.y) {

            if (e.isPowerup) {
                audio.play('powerup');
                triggerHaptic('medium');
                if (e.type === 'shield') {
                    minigameState.shieldActive = true;
                    vfx.addText('¡ESCUDO ACTIVADO! 🛡️', e.x - 20, e.y, '#00f0ff');
                } else if (e.type === 'magnet') {
                    minigameState.magnetActive = true;
                    minigameState.magnetTimer = 8.0;
                    vfx.addText('¡IMÁN DE PREMIOS! 🧲', e.x - 20, e.y, '#ffd700');
                } else if (e.type === 'slowmo') {
                    minigameState.slowMoActive = true;
                    minigameState.slowMoTimer = 6.0;
                    vfx.addText('¡CAMPO SLOW-MO! ⏱️', e.x - 20, e.y, '#9d4edd');
                }
                vfx.emit(e.x + e.w / 2, e.y + e.h / 2, 12, 'spark');
                minigameState.entities.splice(i, 1);
                continue;
            }

            if (minigameState.isFever) {
                audio.play('coin');
                minigameState.score += 10 * minigameState.multiplier;
                vfx.emit(e.x + e.w / 2, e.y + e.h / 2, 12, 'gold');
                minigameState.entities.splice(i, 1);
                continue;
            }

            if (minigameState.shieldActive) {
                minigameState.shieldActive = false;
                audio.play('hit');
                triggerHaptic('heavy');
                minigameState.screenShake = 10;
                vfx.emit(dogHitbox.x + 25, dogHitbox.y + 20, 16, 'spark');
                vfx.addText('¡ESCUDO ROTO! 🛡️💥', dogHitbox.x - 20, dogHitbox.y - 20, '#00f0ff');
                minigameState.entities.splice(i, 1);
                continue;
            }

            minigameState.screenShake = 16;
            vfx.emit(e.x + e.w / 2, e.y + e.h / 2, 20, 'spark');
            endMinigame();
            return;
        }

        if (e.y > LOGICAL_HEIGHT + 30) {
            if (!e.scored && !e.isPowerup) {
                minigameState.score += 1 * minigameState.multiplier;
                addCombo(6);
                e.scored = true;
            }
            minigameState.entities.splice(i, 1);
        }
    }
}

function updateMinigameCatch(dt) {
    if (minigameState.gameOver) return;

    minigameState.timer -= dt;
    if (minigameState.timer <= 0) {
        endMinigame();
        return;
    }

    if (minigameState.isFever) {
        minigameState.feverTimer -= dt;
        if (minigameState.feverTimer <= 0) {
            minigameState.isFever = false;
            minigameState.multiplier = 1;
            audio.setTrack('arcade');
        }
    }

    if (Math.random() < 0.055 + dt * 1.2) {
        const roll = Math.random();
        let itemType = 'bone';
        let color = '#ffffff';
        let pts = 1;

        if (roll < 0.45) {
            itemType = 'bone'; color = '#ffffff'; pts = 1;
        } else if (roll < 0.7) {
            itemType = 'steak'; color = '#ff4d6d'; pts = 3;
        } else if (roll < 0.82) {
            itemType = 'cupcake'; color = '#ff2a85'; pts = 5;
        } else if (roll < 0.9) {
            itemType = 'gold_bone'; color = '#ffd700'; pts = 8;
        } else {
            itemType = minigameState.isFever ? 'gold_bone' : 'anvil';
            color = minigameState.isFever ? '#ffd700' : '#4a5568';
            pts = minigameState.isFever ? 8 : -4;
        }

        minigameState.entities.push({
            x: 20 + Math.random() * (LOGICAL_WIDTH - 65),
            y: -45,
            w: 36,
            h: 36,
            type: itemType,
            color,
            pts,
            speed: 190 + Math.random() * 95,
            rot: 0
        });
    }

    const dogHitbox = {
        x: minigameState.playerX - 28,
        y: minigameState.playerY - 22,
        w: 56,
        h: 44
    };

    for (let i = minigameState.entities.length - 1; i >= 0; i--) {
        const e = minigameState.entities[i];
        e.y += e.speed * dt;
        e.rot += 2.5 * dt;

        if (minigameState.magnetActive && e.type !== 'anvil') {
            const dx = minigameState.playerX - (e.x + 18);
            e.x += dx * 6 * dt;
        }

        if (e.x < dogHitbox.x + dogHitbox.w &&
            e.x + e.w > dogHitbox.x &&
            e.y < dogHitbox.y + dogHitbox.h &&
            e.y + e.h > dogHitbox.y) {

            if (e.type === 'anvil') {
                audio.play('hit');
                triggerHaptic('heavy');
                minigameState.screenShake = 12;
                minigameState.score = Math.max(0, minigameState.score - 4);
                minigameState.comboGauge = 0;
                minigameState.multiplier = 1;
                vfx.addText('-4 AUCH! 🔨', e.x, e.y, '#ff3366');
            } else {
                audio.play('coin');
                triggerHaptic('light');
                const pointsGained = e.pts * minigameState.multiplier;
                minigameState.score += pointsGained;
                addCombo(16);
                vfx.emit(e.x + 18, e.y + 18, 10, 'gold');
                vfx.addText('+' + pointsGained, e.x, e.y, e.color);
                checkAchievement('gourmet_hound');
            }
            minigameState.entities.splice(i, 1);
            continue;
        }

        if (e.y > LOGICAL_HEIGHT + 20) {
            minigameState.entities.splice(i, 1);
        }
    }
}

function updateMinigameJump(dt) {
    if (minigameState.gameOver) return;

    minigameState.playerVy += 1350 * dt;
    minigameState.playerY += minigameState.playerVy * dt;

    if (minigameState.playerX < 0) minigameState.playerX = LOGICAL_WIDTH;
    if (minigameState.playerX > LOGICAL_WIDTH) minigameState.playerX = 0;

    if (minigameState.playerY < LOGICAL_HEIGHT * 0.45) {
        const deltaY = (LOGICAL_HEIGHT * 0.45) - minigameState.playerY;
        minigameState.playerY = LOGICAL_HEIGHT * 0.45;

        for (const p of minigameState.entities) {
            p.y += deltaY;
        }
        minigameState.score += Math.floor(deltaY / 3);
        checkAchievement('sky_walker', Math.floor(deltaY / 3));
    }

    if (minigameState.playerVy > 0) {
        const feetY = minigameState.playerY + 22;
        for (const p of minigameState.entities) {
            if (feetY >= p.y && feetY <= p.y + p.h + 18 &&
                minigameState.playerX + 20 > p.x &&
                minigameState.playerX - 20 < p.x + p.w) {

                if (p.type === 'spring') {
                    minigameState.playerVy = -880;
                    audio.play('jump');
                    triggerHaptic('medium');
                    vfx.emit(minigameState.playerX, feetY, 12, 'spark');
                    vfx.addText(t('super_bounce'), minigameState.playerX - 50, feetY - 20, '#00f0ff');
                } else {
                    minigameState.playerVy = -590;
                    audio.play('jump');
                    triggerHaptic('light');
                    vfx.emit(minigameState.playerX, feetY, 6, 'star');
                }
                addCombo(12);
                break;
            }
        }
    }

    for (let i = minigameState.entities.length - 1; i >= 0; i--) {
        const p = minigameState.entities[i];
        if (p.vx) {
            p.x += p.vx * dt;
            if (p.x < 15 || p.x + p.w > LOGICAL_WIDTH - 15) p.vx *= -1;
        }

        if (p.y > LOGICAL_HEIGHT + 20) {
            minigameState.entities.splice(i, 1);
            minigameState.entities.push({
                x: 20 + Math.random() * (LOGICAL_WIDTH - 130),
                y: -30,
                w: 85,
                h: 18,
                type: Math.random() > 0.25 ? 'normal' : 'spring',
                vx: Math.random() > 0.55 ? (Math.random() > 0.5 ? 60 : -60) : 0
            });
        }
    }

    if (minigameState.playerY > LOGICAL_HEIGHT + 50) {
        endMinigame();
    }
}

function updateMinigameLane(dt) {
    if (minigameState.gameOver) return;

    minigameState.speed += 14 * dt;
    const laneXs = [LOGICAL_WIDTH * 0.22, LOGICAL_WIDTH * 0.5, LOGICAL_WIDTH * 0.78];
    const targetX = laneXs[minigameState.laneIndex];

    minigameState.playerX += (targetX - minigameState.playerX) * 16 * dt;
    minigameState.score += Math.floor(12 * dt);

    if (Math.random() < 0.045 + dt * 1.1) {
        const lane = Math.floor(Math.random() * 3);
        const isBone = Math.random() > 0.65;
        minigameState.entities.push({
            lane,
            x: laneXs[lane] - 24,
            y: -60,
            w: 48,
            h: 48,
            isBone,
            color: isBone ? '#ffd700' : '#ff0055'
        });
    }

    for (let i = minigameState.entities.length - 1; i >= 0; i--) {
        const e = minigameState.entities[i];
        e.y += minigameState.speed * dt;

        if (Math.abs(e.y - minigameState.playerY) < 36 && e.lane === minigameState.laneIndex) {
            if (e.isBone) {
                audio.play('coin');
                triggerHaptic('light');
                minigameState.score += 25 * minigameState.multiplier;
                addCombo(18);
                vfx.emit(e.x + 24, e.y + 24, 12, 'gold');
                vfx.addText('+' + (25 * minigameState.multiplier) + ' ' + t('bones').toUpperCase(), e.x, e.y - 10, '#ffd700');
                minigameState.entities.splice(i, 1);
            } else {
                if (minigameState.isFever) {
                    audio.play('coin');
                    minigameState.score += 50;
                    vfx.emit(e.x + 24, e.y + 24, 14, 'gold');
                    minigameState.entities.splice(i, 1);
                    continue;
                }
                minigameState.screenShake = 16;
                vfx.emit(e.x + 24, e.y + 24, 20, 'spark');
                endMinigame();
                return;
            }
            continue;
        }

        if (e.y > LOGICAL_HEIGHT + 60) {
            minigameState.entities.splice(i, 1);
        }
    }
}

function updateMinigameGuess(dt) {
    if (minigameState.gameOver) return;

    if (minigameState.guessPhase === 'revealed') {
        minigameState.guessTimer -= dt;
        if (minigameState.guessTimer <= 0) {
            if (minigameState.guessRound >= 5) {
                if (minigameState.guessWins >= 3) {
                    audio.play('fanfare');
                    checkAchievement('tamagotchi_master');
                    state.vitals.happiness = Math.min(100, state.vitals.happiness + 25);
                    state.vitals.stress = Math.max(0, state.vitals.stress - 20);
                }
                endMinigame();
            } else {
                minigameState.guessRound++;
                minigameState.guessPhase = 'waiting';
                minigameState.guessPetChoice = null;
                minigameState.guessUserChoice = null;
            }
        }
    }
}

function updateMinigameBounce(dt) {
    if (minigameState.gameOver) return;

    let effectiveDt = dt;
    if (minigameState.slowMoActive) {
        effectiveDt *= 0.45;
        minigameState.slowMoTimer -= dt;
        if (minigameState.slowMoTimer <= 0) minigameState.slowMoActive = false;
    }

    if (minigameState.isFever) {
        minigameState.feverTimer -= dt;
        if (minigameState.feverTimer <= 0) {
            minigameState.isFever = false;
            minigameState.comboGauge = 0;
            minigameState.multiplier = 1;
            audio.setTrack('arcade');
        }
    }

    // Ball physics
    minigameState.ballX += minigameState.ballVx * effectiveDt;
    minigameState.ballY += minigameState.ballVy * effectiveDt;
    minigameState.ballVy += 320 * effectiveDt; // Gravity

    // Screen border bouncing
    if (minigameState.ballX <= 25) {
        minigameState.ballX = 25;
        minigameState.ballVx = Math.abs(minigameState.ballVx);
        audio.play('near_miss');
    } else if (minigameState.ballX >= LOGICAL_WIDTH - 25) {
        minigameState.ballX = LOGICAL_WIDTH - 25;
        minigameState.ballVx = -Math.abs(minigameState.ballVx);
        audio.play('near_miss');
    }

    // Ceiling
    if (minigameState.ballY <= 65) {
        minigameState.ballY = 65;
        minigameState.ballVy = Math.abs(minigameState.ballVy);
        audio.play('near_miss');
    }

    // Paddle collision (Dog head)
    const paddleW = 90;
    const paddleH = 26;
    const paddleX = minigameState.playerX - paddleW / 2;
    const paddleY = minigameState.playerY - 14;

    if (minigameState.ballY + minigameState.ballRadius >= paddleY &&
        minigameState.ballY - minigameState.ballRadius <= paddleY + paddleH &&
        minigameState.ballX >= paddleX - 10 &&
        minigameState.ballX <= paddleX + paddleW + 10 &&
        minigameState.ballVy > 0) {

        // Head bounce!
        const hitOffset = (minigameState.ballX - minigameState.playerX) / (paddleW / 2);
        minigameState.ballVy = -(380 + Math.min(200, minigameState.bounces * 8));
        minigameState.ballVx = hitOffset * 240;

        minigameState.bounces = (minigameState.bounces || 0) + 1;
        const pts = 25 * minigameState.multiplier;
        minigameState.score += pts;
        addCombo(16);
        audio.play('jump');
        triggerHaptic('medium');
        vfx.emit(minigameState.ballX, minigameState.ballY, 14, 'gold');
        vfx.addText('+' + pts, minigameState.ballX - 15, minigameState.ballY - 24, '#05ffa1');

        if (minigameState.bounces >= 15) {
            checkAchievement('juggle_champ');
        }

        // Drop bonus treat occasionally
        if (Math.random() < 0.35) {
            minigameState.entities.push({
                x: 30 + Math.random() * (LOGICAL_WIDTH - 60),
                y: 70,
                w: 28,
                h: 28,
                isBone: true,
                color: '#ffd700'
            });
        }
    }

    // Falling bonus treats
    for (let i = minigameState.entities.length - 1; i >= 0; i--) {
        const e = minigameState.entities[i];
        e.y += 180 * effectiveDt;
        if (Math.abs(e.x - minigameState.playerX) < 45 && Math.abs(e.y - minigameState.playerY) < 35) {
            audio.play('coin');
            minigameState.score += 50 * minigameState.multiplier;
            vfx.emit(e.x, e.y, 10, 'gold');
            vfx.addText('+50 🦴', e.x, e.y - 15, '#ffd700');
            minigameState.entities.splice(i, 1);
            continue;
        }
        if (e.y > LOGICAL_HEIGHT + 30) {
            minigameState.entities.splice(i, 1);
        }
    }

    // Ball fell past bottom
    if (minigameState.ballY > LOGICAL_HEIGHT + 20) {
        minigameState.lives--;
        audio.play('hit');
        triggerHaptic('heavy');
        minigameState.screenShake = 14;

        if (minigameState.lives <= 0) {
            endMinigame();
        } else {
            minigameState.ballX = LOGICAL_WIDTH / 2;
            minigameState.ballY = 140;
            minigameState.ballVx = (Math.random() > 0.5 ? 1 : -1) * (150 + Math.random() * 40);
            minigameState.ballVy = 200;
        }
    }
}

// --- 11. 2D HUD / CANVAS OVERLAY RENDERER ---
const uiCanvas = document.getElementById('uiCanvas');
const uictx = uiCanvas.getContext('2d');
let currentScreen = SCREENS.DASHBOARD;
let uiHitboxes = [];
let wardrobeTab = 'hats';
let photoPose = 'smile';
let photoFilter = 'normal';

function registerHitbox(id, x, y, w, h, data = {}) {
    uiHitboxes.push({ id, x, y, w, h, data });
}

function drawPixelButton(x, y, w, h, text, color = '#2c3e50', active = false) {
    uictx.save();
    uictx.fillStyle = 'rgba(8, 10, 20, 0.7)';
    uictx.fillRect(x + 2, y + 4, w, h);

    uictx.fillStyle = active ? '#00f0ff' : color;
    uictx.fillRect(x, y, w, h);

    uictx.strokeStyle = active ? '#ffffff' : 'rgba(255,255,255,0.28)';
    uictx.lineWidth = 2;
    uictx.strokeRect(x, y, w, h);

    uictx.fillStyle = 'rgba(255,255,255,0.2)';
    uictx.fillRect(x, y, w, 3);

    uictx.fillStyle = active ? '#000000' : '#ffffff';
    uictx.font = 'bold 15px "Courier New", monospace';
    uictx.textAlign = 'center';
    uictx.textBaseline = 'middle';
    uictx.fillText(text, x + w / 2, y + h / 2);
    uictx.restore();
}

function drawVitalsBar(x, y, w, h, label, value, maxVal, color, icon) {
    uictx.save();
    uictx.font = 'bold 12px "Courier New", monospace';
    uictx.fillStyle = '#ffffff';
    uictx.textAlign = 'left';
    uictx.fillText(icon + ' ' + label, x, y - 4);

    uictx.textAlign = 'right';
    uictx.fillStyle = color;
    uictx.fillText(Math.round(value) + '%', x + w, y - 4);

    uictx.fillStyle = 'rgba(12, 16, 28, 0.85)';
    uictx.fillRect(x, y, w, h);
    uictx.strokeStyle = '#2d3748';
    uictx.lineWidth = 1.5;
    uictx.strokeRect(x, y, w, h);

    const fillW = Math.max(0, Math.min(w, (value / maxVal) * w));
    uictx.fillStyle = color;
    uictx.fillRect(x + 1, y + 1, fillW - 2, h - 2);

    uictx.fillStyle = 'rgba(0,0,0,0.25)';
    for (let i = 1; i < 5; i++) {
        uictx.fillRect(x + (w * i) / 5, y + 1, 1, h - 2);
    }
    uictx.restore();
}

// --- SCREEN: DASHBOARD ---
function drawDashboardHUD(timeSec) {
    const pet = DOG_BREEDS[state.activePetIndex];

    uictx.fillStyle = 'rgba(15, 17, 30, 0.9)';
    uictx.fillRect(0, 0, LOGICAL_WIDTH, 54);
    uictx.strokeStyle = '#232946';
    uictx.lineWidth = 2;
    uictx.strokeRect(0, 0, LOGICAL_WIDTH, 54);

    uictx.fillStyle = '#ffd700';
    uictx.font = 'bold 15px "Courier New", monospace';
    uictx.textAlign = 'left';
    uictx.fillText('🦴 ' + state.bones, 8, 33);

    drawPixelButton(72, 10, 24, 34, '◀', '#1f2438');
    registerHitbox('prev_pet', 72, 10, 24, 34);

    uictx.fillStyle = '#ffffff';
    uictx.font = 'bold 12px "Courier New", monospace';
    uictx.textAlign = 'center';
    uictx.fillText(getDogShortName(pet), 120, 33);

    drawPixelButton(146, 10, 24, 34, '▶', '#1f2438');
    registerHitbox('next_pet', 146, 10, 24, 34);

    const langObj = I18N[state.lang || 'es'] || I18N.es;
    drawPixelButton(174, 10, 48, 34, '🌐 ' + langObj.code, '#1f2438');
    registerHitbox('toggle_lang', 174, 10, 48, 34);

    const lcdLabel = state.vitals.lcdMode ? t('tamagotchi_3d') : t('tamagotchi_lcd');
    drawPixelButton(226, 10, 54, 34, lcdLabel, state.vitals.lcdMode ? '#48bb78' : '#1f2438', state.vitals.lcdMode);
    registerHitbox('toggle_lcd', 226, 10, 54, 34);

    drawPixelButton(284, 10, 32, 34, '📖', '#d69e2e');
    registerHitbox('goto_diary', 284, 10, 32, 34);

    drawPixelButton(320, 10, 32, 34, '📸', '#805ad5');
    registerHitbox('goto_studio', 320, 10, 32, 34);

    const soundText = audio.muted ? '🔇' : '🔊';
    drawPixelButton(LOGICAL_WIDTH - 54, 10, 44, 34, soundText, '#1f2438');
    registerHitbox('toggle_sound', LOGICAL_WIDTH - 54, 10, 44, 34);

    // Left Column: Vitals Bars
    const vx = 14;
    const vy = 64;
    const vw = 186;
    drawVitalsBar(vx, vy, vw, 8, t('hunger'), state.vitals.hunger, 100, '#e53e3e', '🥩');
    drawVitalsBar(vx, vy + 24, vw, 8, t('happiness'), state.vitals.happiness, 100, '#ecc94b', '💖');
    drawVitalsBar(vx, vy + 48, vw, 8, t('energy'), state.vitals.energy, 100, '#38b2ac', '⚡');
    drawVitalsBar(vx, vy + 72, vw, 8, t('hygiene'), state.vitals.hygiene || 100, 100, '#00f0ff', '🫧');

    // Right Column: Tamagotchi Bio Card
    const cx = 210;
    const cy = 60;
    const cw = 196;
    const ch = 92;
    uictx.fillStyle = 'rgba(18, 22, 38, 0.85)';
    uictx.fillRect(cx, cy, cw, ch);
    uictx.strokeStyle = state.vitals.isSick ? '#ff0055' : '#2d3748';
    uictx.lineWidth = state.vitals.isSick ? 2 : 1.5;
    uictx.strokeRect(cx, cy, cw, ch);

    uictx.textAlign = 'left';
    uictx.font = 'bold 11px "Courier New", monospace';
    uictx.fillStyle = '#ffd700';
    uictx.fillText('⚖️ ' + t('weight') + ': ' + (state.vitals.weightKg || 4.5).toFixed(1) + ' kg', cx + 10, cy + 20);

    uictx.fillStyle = '#cbd5e0';
    uictx.fillText('🎂 ' + t('age') + ': ' + (state.vitals.ageDays || 1) + ' ' + t('days'), cx + 10, cy + 40);

    uictx.fillStyle = '#a0aec0';
    uictx.fillText(t('stage') + ': ' + t('stage_puppy'), cx + 10, cy + 60);

    if (state.vitals.isSick) {
        const pulse = 0.6 + 0.4 * Math.sin(timeSec * 7);
        uictx.fillStyle = `rgba(255, 0, 85, ${pulse})`;
        uictx.font = 'bold 12px "Courier New", monospace';
        uictx.fillText('💀 ¡ENFERMO!', cx + 10, cy + 80);
    } else {
        uictx.fillStyle = '#48bb78';
        uictx.fillText('❤️ ' + t('health') + ': ' + Math.round(state.vitals.health || 100) + '%', cx + 10, cy + 80);
    }

    // Floor Poops & Buzzing Flies
    const poopsCount = state.vitals.poops || 0;
    const poopPositions = [
        { x: LOGICAL_WIDTH * 0.22, y: LOGICAL_HEIGHT * 0.58 },
        { x: LOGICAL_WIDTH * 0.74, y: LOGICAL_HEIGHT * 0.56 },
        { x: LOGICAL_WIDTH * 0.32, y: LOGICAL_HEIGHT * 0.64 }
    ];

    for (let i = 0; i < Math.min(poopsCount, 3); i++) {
        const pos = poopPositions[i];
        uictx.font = '28px sans-serif';
        uictx.textAlign = 'center';
        uictx.fillText('💩', pos.x, pos.y);

        // Buzzing flies around poop
        for (let f = 0; f < 2; f++) {
            const flyAngle = timeSec * 8 + i * 2 + f * Math.PI;
            const flyDist = 14 + f * 5;
            const fx = pos.x + Math.cos(flyAngle) * flyDist;
            const fy = pos.y - 12 + Math.sin(flyAngle) * (flyDist * 0.6);
            uictx.fillStyle = '#1a202c';
            uictx.beginPath();
            uictx.arc(fx, fy, 2.5, 0, Math.PI * 2);
            uictx.fill();
        }

        registerHitbox('clean_poop_' + i, pos.x - 20, pos.y - 28, 40, 36);
    }

    // Sickness skull alert above dog
    if (state.vitals.isSick) {
        const skullY = LOGICAL_HEIGHT * 0.34 + Math.sin(timeSec * 4) * 6;
        uictx.font = '36px sans-serif';
        uictx.textAlign = 'center';
        uictx.fillText('💀', LOGICAL_WIDTH / 2, skullY);
    }

    // Nighttime Lights Off Overlay
    if (state.vitals.lightsOff) {
        uictx.fillStyle = 'rgba(6, 8, 22, 0.78)';
        uictx.fillRect(0, 54, LOGICAL_WIDTH, LOGICAL_HEIGHT - 54);

        // Glowing Moon
        uictx.font = '38px sans-serif';
        uictx.textAlign = 'center';
        uictx.fillText('🌙', LOGICAL_WIDTH - 60, 110);

        // Floating Zzz
        const zOff = (timeSec * 35) % 80;
        uictx.fillStyle = 'rgba(0, 240, 255, 0.85)';
        uictx.font = 'bold 22px "Courier New", monospace';
        uictx.fillText('Zzz...', LOGICAL_WIDTH / 2 + 45, LOGICAL_HEIGHT * 0.44 - zOff);
    }

    // Interactive Pet hitbox on dog body
    registerHitbox('pet_dog', LOGICAL_WIDTH / 2 - 75, LOGICAL_HEIGHT * 0.38, 150, 150);

    // Dog Nameplate
    uictx.fillStyle = 'rgba(10, 14, 26, 0.78)';
    uictx.fillRect(LOGICAL_WIDTH / 2 - 110, LOGICAL_HEIGHT * 0.62, 220, 26);
    uictx.strokeStyle = '#2d3748';
    uictx.lineWidth = 1;
    uictx.strokeRect(LOGICAL_WIDTH / 2 - 110, LOGICAL_HEIGHT * 0.62, 220, 26);
    uictx.fillStyle = '#00f0ff';
    uictx.font = 'bold 14px "Courier New", monospace';
    uictx.textAlign = 'center';
    uictx.fillText('★ ' + getDogName(pet) + ' ★', LOGICAL_WIDTH / 2, LOGICAL_HEIGHT * 0.62 + 18);

    // Row 1: Care Action Buttons (Kitchen, Clean, Lights, Medicine)
    const btnY1 = LOGICAL_HEIGHT - 172;
    const btnH = 40;

    drawPixelButton(14, btnY1, 94, btnH, '🍖 ' + t('feed'), '#c53030');
    registerHitbox('goto_kitchen', 14, btnY1, 94, btnH);

    drawPixelButton(112, btnY1, 94, btnH, '🫧 ' + t('clean'), '#319795');
    registerHitbox('action_clean', 112, btnY1, 94, btnH);

    const lightLabel = state.vitals.lightsOff ? '☀️ ' + t('lights_on') : '💡 ' + t('lights_off');
    drawPixelButton(210, btnY1, 94, btnH, lightLabel, state.vitals.lightsOff ? '#d69e2e' : '#2b6cb0');
    registerHitbox('toggle_lights', 210, btnY1, 94, btnH);

    drawPixelButton(308, btnY1, 98, btnH, '💊 ' + t('medicine'), state.vitals.isSick ? '#e53e3e' : '#805ad5', state.vitals.isSick);
    registerHitbox('action_medicine', 308, btnY1, 98, btnH);

    // Row 2: Secondary Care Buttons (Pet, Praise, Wardrobe)
    const btnY2 = LOGICAL_HEIGHT - 124;
    drawPixelButton(14, btnY2, 124, btnH, '💖 ' + t('pet'), '#d53f8c');
    registerHitbox('action_pet', 14, btnY2, 124, btnH);

    drawPixelButton(144, btnY2, 124, btnH, '🎓 ' + t('praise'), '#4a5568');
    registerHitbox('action_praise', 144, btnY2, 124, btnH);

    drawPixelButton(274, btnY2, 132, btnH, '🧢 ' + t('wardrobe'), '#6b46c1');
    registerHitbox('action_wardrobe', 274, btnY2, 132, btnH);

    // Row 3: Master Arcade Button
    const arcadeY = LOGICAL_HEIGHT - 74;
    drawPixelButton(14, arcadeY, LOGICAL_WIDTH - 28, 54, '🕹️ ' + t('arcade') + ' ▶', '#05ffa1', true);
    registerHitbox('goto_minigames', 14, arcadeY, LOGICAL_WIDTH - 28, 54);
}

// --- SCREEN: TAMAGOTCHI KITCHEN & PANTRY (ZERO MICROTRANSACTIONS) ---
function drawKitchenHUD() {
    uictx.fillStyle = 'rgba(12, 15, 26, 0.94)';
    uictx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    // Header
    uictx.fillStyle = '#00f0ff';
    uictx.font = 'bold 20px "Courier New", monospace';
    uictx.textAlign = 'center';
    uictx.fillText(t('kitchen_title'), LOGICAL_WIDTH / 2, 34);

    // ZERO MICROTRANSACTIONS BANNER (Free-to-Play Guarantee)
    uictx.fillStyle = 'rgba(5, 255, 161, 0.12)';
    uictx.fillRect(16, 44, LOGICAL_WIDTH - 32, 28);
    uictx.strokeStyle = '#05ffa1';
    uictx.lineWidth = 1.5;
    uictx.strokeRect(16, 44, LOGICAL_WIDTH - 32, 28);
    uictx.fillStyle = '#05ffa1';
    uictx.font = 'bold 11px "Courier New", monospace';
    uictx.fillText(t('no_microtransactions'), LOGICAL_WIDTH / 2, 62);

    // Status bar (Bones, Hunger, Weight)
    uictx.fillStyle = '#ffd700';
    uictx.font = 'bold 13px "Courier New", monospace';
    uictx.textAlign = 'left';
    uictx.fillText('🦴 ' + t('bones') + ': ' + state.bones, 20, 94);

    uictx.textAlign = 'center';
    uictx.fillStyle = '#e53e3e';
    uictx.fillText('🥩 ' + t('hunger') + ': ' + Math.round(state.vitals.hunger) + '%', LOGICAL_WIDTH / 2, 94);

    uictx.textAlign = 'right';
    uictx.fillStyle = '#ecc94b';
    uictx.fillText('⚖️ ' + t('weight') + ': ' + (state.vitals.weightKg || 4.5).toFixed(1) + ' kg', LOGICAL_WIDTH - 20, 94);

    // Foods List
    FOOD_MENU.forEach((food, idx) => {
        const fy = 106 + idx * 88;
        if (fy + 82 > LOGICAL_HEIGHT - 65) return;

        const canAfford = state.bones >= food.price;
        uictx.fillStyle = '#14182a';
        uictx.fillRect(16, fy, LOGICAL_WIDTH - 32, 80);
        uictx.strokeStyle = canAfford ? '#2d3748' : '#742a2a';
        uictx.lineWidth = 1.5;
        uictx.strokeRect(16, fy, LOGICAL_WIDTH - 32, 80);

        // Icon
        uictx.font = '32px sans-serif';
        uictx.textAlign = 'center';
        uictx.fillText(food.icon, 45, fy + 52);

        // Name
        uictx.fillStyle = '#ffffff';
        uictx.font = 'bold 14px "Courier New", monospace';
        uictx.textAlign = 'left';
        uictx.fillText(t(food.name), 76, fy + 24);

        // Nutrition effects
        uictx.fillStyle = '#a0aec0';
        uictx.font = '11px "Courier New", monospace';
        const effects = `+${food.hungerBonus}% ${t('hunger')} | +${food.happinessBonus}% ${t('happiness')} | +${food.weightGain}kg`;
        uictx.fillText(effects, 76, fy + 44);

        const healthEff = food.healthBonus > 0 ? `+${food.healthBonus}% ${t('health')}` : '';
        const energyEff = food.energyBonus > 0 ? `+${food.energyBonus}% ${t('energy')}` : '';
        const extra = [healthEff, energyEff].filter(Boolean).join(' • ');
        if (extra) {
            uictx.fillStyle = '#38b2ac';
            uictx.fillText(extra, 76, fy + 62);
        }

        // Buy & Feed Button
        const btnW = 95;
        const btnH = 48;
        const btnX = LOGICAL_WIDTH - 122;
        const btnY = fy + 16;
        const btnColor = canAfford ? '#38a169' : '#4a5568';
        drawPixelButton(btnX, btnY, btnW, btnH, '🦴 ' + food.price, btnColor);
        registerHitbox('feed_' + food.id, btnX, btnY, btnW, btnH, { food });
    });

    // Back button
    drawPixelButton(16, LOGICAL_HEIGHT - 60, LOGICAL_WIDTH - 32, 46, t('back_home'), '#e53e3e');
    registerHitbox('goto_dashboard', 16, LOGICAL_HEIGHT - 60, LOGICAL_WIDTH - 32, 46);
}

// --- SCREEN: WARDROBE & STORE ---
function drawWardrobeHUD() {
    uictx.fillStyle = 'rgba(13, 16, 28, 0.9)';
    uictx.fillRect(0, 0, LOGICAL_WIDTH, 70);

    uictx.fillStyle = '#00f0ff';
    uictx.font = 'bold 22px "Courier New", monospace';
    uictx.textAlign = 'center';
    uictx.fillText(t('store_title'), LOGICAL_WIDTH / 2, 38);

    uictx.fillStyle = '#ffd700';
    uictx.font = 'bold 15px "Courier New", monospace';
    uictx.fillText('🦴 ' + t('bones') + ': ' + state.bones, LOGICAL_WIDTH / 2, 60);

    const tabY = 195;
    const tabW = (LOGICAL_WIDTH - 40) / 4;
    const tabs = [
        { id: 'hats', label: t('tab_hats') },
        { id: 'glasses', label: t('tab_glasses') },
        { id: 'neck', label: t('tab_neck') },
        { id: 'pets', label: t('tab_dogs') }
    ];

    tabs.forEach((tb, i) => {
        const tx = 20 + i * tabW;
        const isActive = (wardrobeTab === tb.id);
        drawPixelButton(tx, tabY, tabW - 4, 34, tb.label, isActive ? '#4a5568' : '#1e2438', isActive);
        registerHitbox('tab_' + tb.id, tx, tabY, tabW - 4, 34);
    });

    const listY = 245;
    let items = [];
    if (wardrobeTab === 'hats') items = ACCESSORIES.hats;
    else if (wardrobeTab === 'glasses') items = ACCESSORIES.glasses;
    else if (wardrobeTab === 'neck') items = ACCESSORIES.neck;
    else if (wardrobeTab === 'pets') items = DOG_BREEDS;

    items.forEach((item, idx) => {
        const iy = listY + idx * 56;
        if (iy + 50 > LOGICAL_HEIGHT - 70) return;

        let isEquipped = false;
        let isUnlocked = item.unlocked;

        if (wardrobeTab === 'pets') {
            isEquipped = (state.activePetIndex === idx);
        } else {
            const catKey = (wardrobeTab === 'hats' ? 'hat' : wardrobeTab === 'glasses' ? 'glasses' : 'neck');
            isEquipped = (state.equipped[catKey] === item.id);
        }

        uictx.fillStyle = isEquipped ? '#14382c' : '#14182a';
        uictx.fillRect(20, iy, LOGICAL_WIDTH - 40, 50);
        uictx.strokeStyle = isEquipped ? '#05ffa1' : '#2d3748';
        uictx.lineWidth = 1.5;
        uictx.strokeRect(20, iy, LOGICAL_WIDTH - 40, 50);

        uictx.fillStyle = '#ffffff';
        uictx.font = 'bold 14px "Courier New", monospace';
        uictx.textAlign = 'left';
        const displayName = (wardrobeTab === 'pets' ? getDogName(item) : getItemName(item));
        if (wardrobeTab === 'pets') {
            uictx.fillText(displayName, 35, iy + 22);
            uictx.fillStyle = '#a0aec0';
            uictx.font = '11px "Courier New", monospace';
            uictx.fillText(getDogDesc(item), 35, iy + 38);
        } else {
            uictx.fillText(displayName, 35, iy + 30);
        }

        const btnW = 110;
        const btnX = LOGICAL_WIDTH - 140;

        if (isEquipped) {
            drawPixelButton(btnX, iy + 8, btnW, 34, t('equipped'), '#05ffa1', true);
        } else if (isUnlocked) {
            drawPixelButton(btnX, iy + 8, btnW, 34, t('equip'), '#3182ce');
            registerHitbox('equip_' + wardrobeTab + '_' + (item.id || idx), btnX, iy + 8, btnW, 34, { item, idx });
        } else {
            drawPixelButton(btnX, iy + 8, btnW, 34, '🦴 ' + item.price, '#d69e2e');
            registerHitbox('buy_' + wardrobeTab + '_' + (item.id || idx), btnX, iy + 8, btnW, 34, { item, idx });
        }
    });

    drawPixelButton(20, LOGICAL_HEIGHT - 60, LOGICAL_WIDTH - 40, 46, t('back_home'), '#e53e3e');
    registerHitbox('goto_dashboard', 20, LOGICAL_HEIGHT - 60, LOGICAL_WIDTH - 40, 46);
}

// --- SCREEN: ARCADE MINIGAME MENU ---
function drawMinigamesMenuHUD() {
    uictx.fillStyle = '#0a0d18';
    uictx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    uictx.fillStyle = '#00f0ff';
    uictx.font = 'bold 24px "Courier New", monospace';
    uictx.textAlign = 'center';
    uictx.fillText(t('arcade_title'), LOGICAL_WIDTH / 2, 40);

    uictx.fillStyle = '#a0aec0';
    uictx.font = 'bold 11px "Courier New", monospace';
    uictx.fillText(t('arcade_subtitle'), LOGICAL_WIDTH / 2, 60);

    const games = [
        {
            type: SCREENS.MG_DODGE,
            title: t('mg_dodge_title'),
            desc: t('mg_dodge_desc'),
            color: '#ff2a85',
            highScore: state.highScores.MG_DODGE || 0
        },
        {
            type: SCREENS.MG_CATCH,
            title: t('mg_catch_title'),
            desc: t('mg_catch_desc'),
            color: '#805ad5',
            highScore: state.highScores.MG_CATCH || 0
        },
        {
            type: SCREENS.MG_JUMP,
            title: t('mg_jump_title'),
            desc: t('mg_jump_desc'),
            color: '#d69e2e',
            highScore: state.highScores.MG_JUMP || 0
        },
        {
            type: SCREENS.MG_LANE,
            title: t('mg_lane_title'),
            desc: t('mg_lane_desc'),
            color: '#05ffa1',
            highScore: state.highScores.MG_LANE || 0
        },
        {
            type: SCREENS.MG_GUESS,
            title: t('mg_guess_title'),
            desc: t('mg_guess_desc'),
            color: '#38b2ac',
            highScore: state.highScores.MG_GUESS || 0
        },
        {
            type: SCREENS.MG_BOUNCE,
            title: t('mg_bounce_title'),
            desc: t('mg_bounce_desc'),
            color: '#e53e3e',
            highScore: state.highScores.MG_BOUNCE || 0
        }
    ];

    games.forEach((g, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const gx = 16 + col * 198;
        const gy = 76 + row * 190;
        const gw = 190;
        const gh = 180;

        uictx.fillStyle = '#14182c';
        uictx.fillRect(gx, gy, gw, gh);
        uictx.strokeStyle = g.color;
        uictx.lineWidth = 1.5;
        uictx.strokeRect(gx, gy, gw, gh);

        // Header accent
        uictx.fillStyle = g.color;
        uictx.fillRect(gx, gy, gw, 4);

        uictx.fillStyle = g.color;
        uictx.font = 'bold 11px "Courier New", monospace';
        uictx.textAlign = 'left';
        uictx.fillText(g.title, gx + 8, gy + 22);

        uictx.fillStyle = '#cbd5e0';
        uictx.font = '10px "Courier New", monospace';
        const words = g.desc.split(' ');
        let line1 = '', line2 = '';
        for (const w of words) {
            if ((line1 + w).length < 24) line1 += w + ' ';
            else line2 += w + ' ';
        }
        uictx.fillText(line1, gx + 8, gy + 42);
        uictx.fillText(line2, gx + 8, gy + 56);

        uictx.fillStyle = '#ffd700';
        uictx.font = 'bold 11px "Courier New", monospace';
        uictx.fillText('🏆 ' + t('record') + ': ' + g.highScore, gx + 8, gy + 120);

        drawPixelButton(gx + 10, gy + 134, gw - 20, 36, t('play'), g.color);
        registerHitbox('start_' + g.type, gx, gy, gw, gh, { type: g.type });
    });

    drawPixelButton(16, LOGICAL_HEIGHT - 60, LOGICAL_WIDTH - 32, 46, t('back_home'), '#e53e3e');
    registerHitbox('goto_dashboard', 16, LOGICAL_HEIGHT - 60, LOGICAL_WIDTH - 32, 46);
}

// --- SCREEN: ACTIVE MINIGAME HUD ---
function drawActiveMinigameHUD(timeSec) {
    if (minigameState.type === SCREENS.MG_GUESS) {
        drawMinigameGuessHUD(timeSec);
        return;
    }

    let shakeX = 0, shakeY = 0;
    if (minigameState.screenShake > 0) {
        shakeX = (Math.random() - 0.5) * minigameState.screenShake;
        shakeY = (Math.random() - 0.5) * minigameState.screenShake;
        minigameState.screenShake = Math.max(0, minigameState.screenShake - 28 * (1/60));
    }

    uictx.save();
    uictx.translate(shakeX, shakeY);

    if (minigameState.type === SCREENS.MG_LANE) {
        uictx.strokeStyle = '#2d3748';
        uictx.lineWidth = 2;
        uictx.beginPath();
        uictx.moveTo(LOGICAL_WIDTH * 0.36, 0); uictx.lineTo(LOGICAL_WIDTH * 0.36, LOGICAL_HEIGHT);
        uictx.moveTo(LOGICAL_WIDTH * 0.64, 0); uictx.lineTo(LOGICAL_WIDTH * 0.64, LOGICAL_HEIGHT);
        uictx.stroke();

        uictx.fillStyle = 'rgba(255,255,255,0.08)';
        for (let y = (timeSec * 350) % 60; y < LOGICAL_HEIGHT; y += 60) {
            uictx.fillRect(LOGICAL_WIDTH * 0.36 - 2, y, 4, 30);
            uictx.fillRect(LOGICAL_WIDTH * 0.64 - 2, y, 4, 30);
        }
    }

    for (const e of minigameState.entities) {
        uictx.save();
        uictx.translate(e.x + e.w / 2, e.y + e.h / 2);
        if (e.rot) uictx.rotate(e.rot);

        if (e.isPowerup) {
            uictx.fillStyle = e.color;
            uictx.beginPath();
            uictx.arc(0, 0, e.w / 2, 0, Math.PI * 2);
            uictx.fill();
            uictx.strokeStyle = '#ffffff';
            uictx.lineWidth = 2;
            uictx.stroke();
            uictx.fillStyle = '#000000';
            uictx.font = 'bold 16px sans-serif';
            uictx.textAlign = 'center';
            uictx.textBaseline = 'middle';
            const icon = (e.type === 'shield' ? '🛡️' : e.type === 'magnet' ? '🧲' : '⏱️');
            uictx.fillText(icon, 0, 0);
        } else if (minigameState.type === SCREENS.MG_DODGE) {
            uictx.fillStyle = e.color;
            uictx.fillRect(-e.w / 2, -e.h / 2, e.w, e.h);
            uictx.strokeStyle = '#ffffff';
            uictx.lineWidth = 2;
            uictx.strokeRect(-e.w / 2, -e.h / 2, e.w, e.h);
            uictx.fillStyle = '#000000';
            uictx.font = 'bold 18px sans-serif';
            uictx.textAlign = 'center';
            uictx.textBaseline = 'middle';
            uictx.fillText('!', 0, 0);
        } else if (minigameState.type === SCREENS.MG_CATCH) {
            uictx.fillStyle = e.color;
            if (e.type === 'anvil') {
                uictx.fillRect(-e.w / 2, -e.h / 2 + 8, e.w, e.h - 8);
                uictx.fillRect(-e.w / 4, -e.h / 2, e.w / 2, 8);
            } else if (e.type === 'cupcake') {
                uictx.beginPath();
                uictx.arc(0, 0, e.w / 2, 0, Math.PI * 2);
                uictx.fill();
                uictx.fillStyle = '#ffd700';
                uictx.fillRect(-4, -e.h / 2 - 4, 8, 8);
            } else if (e.type === 'steak') {
                uictx.beginPath();
                uictx.ellipse(0, 0, 16, 12, 0.2, 0, Math.PI * 2);
                uictx.fill();
            } else {
                uictx.fillRect(-e.w / 2 + 4, -4, e.w - 8, 8);
                uictx.beginPath();
                uictx.arc(-e.w / 2 + 4, -4, 5, 0, Math.PI * 2);
                uictx.arc(-e.w / 2 + 4, 4, 5, 0, Math.PI * 2);
                uictx.arc(e.w / 2 - 4, -4, 5, 0, Math.PI * 2);
                uictx.arc(e.w / 2 - 4, 4, 5, 0, Math.PI * 2);
                uictx.fill();
            }
        } else if (minigameState.type === SCREENS.MG_JUMP) {
            uictx.fillStyle = (e.type === 'spring' ? '#00f0ff' : '#48bb78');
            uictx.fillRect(-e.w / 2, -e.h / 2, e.w, e.h);
            uictx.strokeStyle = '#ffffff';
            uictx.lineWidth = 1.5;
            uictx.strokeRect(-e.w / 2, -e.h / 2, e.w, e.h);
            if (e.type === 'spring') {
                uictx.fillStyle = '#ffd700';
                uictx.fillRect(-8, -e.h / 2 - 6, 16, 6);
            }
        } else if (minigameState.type === SCREENS.MG_LANE) {
            uictx.fillStyle = e.color;
            uictx.fillRect(-e.w / 2, -e.h / 2, e.w, e.h);
            uictx.strokeStyle = '#ffffff';
            uictx.lineWidth = 2;
            uictx.strokeRect(-e.w / 2, -e.h / 2, e.w, e.h);
        } else if (minigameState.type === SCREENS.MG_BOUNCE) {
            uictx.fillStyle = e.color;
            uictx.fillRect(-e.w / 2, -e.h / 2, e.w, e.h);
            uictx.strokeStyle = '#ffffff';
            uictx.lineWidth = 1.5;
            uictx.strokeRect(-e.w / 2, -e.h / 2, e.w, e.h);
            uictx.fillStyle = '#ffd700';
            uictx.font = '16px sans-serif';
            uictx.textAlign = 'center';
            uictx.textBaseline = 'middle';
            uictx.fillText('🦴', 0, 0);
        }
        uictx.restore();
    }

    if (minigameState.type === SCREENS.MG_BOUNCE) {
        // Draw bouncing golden bone / ball
        uictx.save();
        uictx.translate(minigameState.ballX, minigameState.ballY);
        uictx.rotate(timeSec * 6);
        uictx.fillStyle = '#ffd700';
        uictx.beginPath();
        uictx.arc(0, 0, minigameState.ballRadius, 0, Math.PI * 2);
        uictx.fill();
        uictx.strokeStyle = '#ffffff';
        uictx.lineWidth = 2;
        uictx.stroke();
        uictx.fillStyle = '#1a202c';
        uictx.font = '12px sans-serif';
        uictx.textAlign = 'center';
        uictx.textBaseline = 'middle';
        uictx.fillText('🦴', 0, 0);
        uictx.restore();
    }

    // 3D Dog synchronization with minigame position
    if (stage.currentDog) {
        const worldX = ((minigameState.playerX / LOGICAL_WIDTH) - 0.5) * 12;
        const worldY = 0.5;
        const worldZ = ((minigameState.playerY / LOGICAL_HEIGHT) - 0.5) * 10;
        stage.currentDog.position.set(worldX, worldY, worldZ);
        dogBuilder.updateDogAnimation(stage.currentDog, 1/60, timeSec, minigameState.speed, true, minigameState.gameOver ? 'sleepy' : 'happy');
    }

    uictx.fillStyle = 'rgba(12, 14, 24, 0.9)';
    uictx.fillRect(0, 0, LOGICAL_WIDTH, 56);

    uictx.fillStyle = '#00f0ff';
    uictx.font = 'bold 20px "Courier New", monospace';
    uictx.textAlign = 'left';
    uictx.fillText(t('score') + ': ' + minigameState.score, 16, 36);

    // Multiplier & Combo Gauge
    const comboW = 120;
    const comboH = 8;
    const comboX = 160;
    const comboY = 22;
    uictx.fillStyle = '#1a202c';
    uictx.fillRect(comboX, comboY, comboW, comboH);
    uictx.fillStyle = minigameState.isFever ? '#ffcc00' : '#ff2a85';
    uictx.fillRect(comboX, comboY, (minigameState.comboGauge / 100) * comboW, comboH);
    uictx.strokeStyle = '#2d3748';
    uictx.strokeRect(comboX, comboY, comboW, comboH);

    uictx.fillStyle = minigameState.isFever ? '#ffcc00' : '#05ffa1';
    uictx.font = 'bold 12px "Courier New", monospace';
    uictx.fillText(minigameState.multiplier + 'x ' + (minigameState.isFever ? 'FEVER!' : 'COMBO'), comboX + comboW + 8, comboY + 8);

    if (minigameState.type === SCREENS.MG_CATCH) {
        uictx.fillStyle = '#ffd700';
        uictx.textAlign = 'right';
        uictx.font = 'bold 18px "Courier New", monospace';
        uictx.fillText('⏱ ' + Math.ceil(minigameState.timer) + 's', LOGICAL_WIDTH - 16, 36);
    } else if (minigameState.type === SCREENS.MG_BOUNCE) {
        uictx.font = '16px sans-serif';
        uictx.textAlign = 'right';
        const hearts = '❤️'.repeat(Math.max(0, minigameState.lives));
        uictx.fillText(hearts, LOGICAL_WIDTH - 16, 36);
    } else {
        uictx.fillStyle = '#a0aec0';
        uictx.textAlign = 'right';
        uictx.font = 'bold 14px "Courier New", monospace';
        uictx.fillText(t('record') + ': ' + minigameState.highScore, LOGICAL_WIDTH - 16, 36);
    }

    let buffX = 16;
    const buffY = 70;
    if (minigameState.shieldActive) {
        uictx.fillStyle = '#00f0ff';
        uictx.font = '14px sans-serif';
        uictx.fillText('🛡️ ESCUDO', buffX, buffY);
        buffX += 90;
    }
    if (minigameState.magnetActive) {
        uictx.fillStyle = '#ffd700';
        uictx.font = '14px sans-serif';
        uictx.fillText('🧲 IMÁN', buffX, buffY);
        buffX += 80;
    }
    if (minigameState.slowMoActive) {
        uictx.fillStyle = '#9d4edd';
        uictx.font = '14px sans-serif';
        uictx.fillText('⏱️ SLOW', buffX, buffY);
    }

    if (minigameState.type === SCREENS.MG_LANE) {
        drawPixelButton(20, LOGICAL_HEIGHT - 80, 110, 50, '◀ IZQ', '#1a202c');
        registerHitbox('lane_left', 20, LOGICAL_HEIGHT - 80, 110, 50);

        drawPixelButton(LOGICAL_WIDTH - 130, LOGICAL_HEIGHT - 80, 110, 50, 'DER ▶', '#1a202c');
        registerHitbox('lane_right', LOGICAL_WIDTH - 130, LOGICAL_HEIGHT - 80, 110, 50);
    } else if (minigameState.type !== SCREENS.MG_JUMP) {
        drawPixelButton(20, LOGICAL_HEIGHT - 80, 100, 50, '◀◀', '#1a202c');
        registerHitbox('steer_left', 20, LOGICAL_HEIGHT - 80, 100, 50);

        drawPixelButton(LOGICAL_WIDTH - 120, LOGICAL_HEIGHT - 80, 100, 50, '▶▶', '#1a202c');
        registerHitbox('steer_right', LOGICAL_WIDTH - 120, LOGICAL_HEIGHT - 80, 100, 50);
    }

    if (minigameState.gameOver) {
        uictx.fillStyle = 'rgba(8, 10, 20, 0.88)';
        uictx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

        const modalY = LOGICAL_HEIGHT / 2 - 145;
        uictx.fillStyle = '#14182c';
        uictx.fillRect(30, modalY, LOGICAL_WIDTH - 60, 290);
        uictx.strokeStyle = '#ff0055';
        uictx.lineWidth = 3;
        uictx.strokeRect(30, modalY, LOGICAL_WIDTH - 60, 290);

        uictx.fillStyle = '#ff0055';
        uictx.font = 'bold 28px "Courier New", monospace';
        uictx.textAlign = 'center';
        uictx.fillText(t('game_over'), LOGICAL_WIDTH / 2, modalY + 45);

        uictx.fillStyle = '#ffffff';
        uictx.font = 'bold 18px "Courier New", monospace';
        uictx.fillText(t('final_score') + ': ' + minigameState.score, LOGICAL_WIDTH / 2, modalY + 90);

        uictx.fillStyle = '#ffd700';
        uictx.font = 'bold 18px "Courier New", monospace';
        uictx.fillText('+' + minigameState.earnedBones + ' ' + t('bones_won'), LOGICAL_WIDTH / 2, modalY + 128);

        drawPixelButton(50, modalY + 165, LOGICAL_WIDTH - 100, 44, t('retry'), '#05ffa1', true);
        registerHitbox('minigame_retry', 50, modalY + 165, LOGICAL_WIDTH - 100, 44);

        drawPixelButton(50, modalY + 220, LOGICAL_WIDTH - 100, 44, t('exit_home'), '#3182ce');
        registerHitbox('minigame_exit', 50, modalY + 220, LOGICAL_WIDTH - 100, 44);
    }

    uictx.restore();
}

// --- SCREEN: RETRO 1996 TAMAGOTCHI GUESS MINIGAME ---
function drawMinigameGuessHUD(timeSec) {
    uictx.fillStyle = '#0a0d18';
    uictx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    // Top Bar
    uictx.fillStyle = 'rgba(15, 17, 30, 0.9)';
    uictx.fillRect(0, 0, LOGICAL_WIDTH, 56);
    uictx.strokeStyle = '#38b2ac';
    uictx.lineWidth = 2;
    uictx.strokeRect(0, 0, LOGICAL_WIDTH, 56);

    uictx.fillStyle = '#00f0ff';
    uictx.font = 'bold 18px "Courier New", monospace';
    uictx.textAlign = 'left';
    uictx.fillText(t('score') + ': ' + minigameState.score, 16, 36);

    uictx.fillStyle = '#ffd700';
    uictx.font = 'bold 16px "Courier New", monospace';
    uictx.textAlign = 'right';
    uictx.fillText(t('round') + ' ' + minigameState.guessRound + ' / 5', LOGICAL_WIDTH - 16, 36);

    // Retro 1996 Tamagotchi Egg Bezel Housing
    const bezelY = 75;
    const bezelW = LOGICAL_WIDTH - 70;
    const bezelH = 380;

    uictx.fillStyle = '#fce4ec';
    uictx.beginPath();
    uictx.ellipse(LOGICAL_WIDTH / 2, bezelY + bezelH / 2, bezelW / 2, bezelH / 2, 0, 0, Math.PI * 2);
    uictx.fill();
    uictx.strokeStyle = '#f48fb1';
    uictx.lineWidth = 8;
    uictx.stroke();

    // Inner Green LCD Screen (authentic 1996 dot-matrix)
    const lcdX = 75;
    const lcdY = bezelY + 60;
    const lcdW = LOGICAL_WIDTH - 150;
    const lcdH = 240;

    uictx.fillStyle = '#9fb388';
    uictx.fillRect(lcdX, lcdY, lcdW, lcdH);
    uictx.strokeStyle = '#2b331f';
    uictx.lineWidth = 4;
    uictx.strokeRect(lcdX, lcdY, lcdW, lcdH);

    // LCD dot grid scanlines
    uictx.fillStyle = 'rgba(43, 51, 31, 0.08)';
    for (let y = lcdY; y < lcdY + lcdH; y += 4) {
        uictx.fillRect(lcdX, y, lcdW, 1.5);
    }

    // Top Tamagotchi LCD Icon bar
    const lcdIcons = ['🥣', '💡', '🎮', '💊', '🫧', '⚖️', '📢', '🚨'];
    uictx.font = '14px sans-serif';
    uictx.textAlign = 'center';
    lcdIcons.forEach((icon, i) => {
        const ix = lcdX + 16 + i * ((lcdW - 32) / 7);
        uictx.fillText(icon, ix, lcdY + 20);
    });

    // Pet in center of LCD
    const petCenterX = LOGICAL_WIDTH / 2;
    const petCenterY = lcdY + 130;

    uictx.fillStyle = '#222b17';
    if (minigameState.guessPhase === 'waiting') {
        const bob = Math.sin(timeSec * 6) * 3;
        uictx.font = '54px sans-serif';
        uictx.textAlign = 'center';
        uictx.fillText('🐶', petCenterX, petCenterY + bob);

        uictx.font = 'bold 13px "Courier New", monospace';
        uictx.fillText('¿ ?', petCenterX, petCenterY - 45);
    } else if (minigameState.guessPhase === 'revealed') {
        const isMatch = (minigameState.guessUserChoice === minigameState.guessPetChoice);
        const lookLeft = (minigameState.guessPetChoice === 'left');

        uictx.save();
        uictx.translate(petCenterX, petCenterY);
        if (!lookLeft) uictx.scale(-1, 1);
        uictx.font = '54px sans-serif';
        uictx.textAlign = 'center';
        uictx.fillText('🐕', 0, 0);
        uictx.restore();

        // Round outcome message
        uictx.font = 'bold 16px "Courier New", monospace';
        uictx.fillStyle = isMatch ? '#1a472a' : '#5c1d1d';
        uictx.textAlign = 'center';
        uictx.fillText(isMatch ? t('guess_win') : t('guess_miss'), petCenterX, lcdY + lcdH - 24);
    }

    // Bottom wins indicator stars
    uictx.fillStyle = '#14182c';
    uictx.fillRect(30, bezelY + bezelH + 16, LOGICAL_WIDTH - 60, 40);
    uictx.strokeStyle = '#38b2ac';
    uictx.lineWidth = 1.5;
    uictx.strokeRect(30, bezelY + bezelH + 16, LOGICAL_WIDTH - 60, 40);

    uictx.fillStyle = '#ffd700';
    uictx.font = 'bold 15px "Courier New", monospace';
    uictx.textAlign = 'center';
    let stars = '';
    for (let s = 0; s < 5; s++) {
        stars += (s < minigameState.guessWins ? '★ ' : '☆ ');
    }
    uictx.fillText('VICTORIAS: ' + stars, LOGICAL_WIDTH / 2, bezelY + bezelH + 42);

    // Prompt instructions or choice buttons
    if (minigameState.guessPhase === 'waiting') {
        const btnY = LOGICAL_HEIGHT - 135;
        const btnW = (LOGICAL_WIDTH - 60) / 2;
        const btnH = 50;

        drawPixelButton(24, btnY, btnW, btnH, t('guess_left'), '#2b6cb0', true);
        registerHitbox('guess_choice_left', 24, btnY, btnW, btnH);

        drawPixelButton(LOGICAL_WIDTH - 24 - btnW, btnY, btnW, btnH, t('guess_right'), '#2b6cb0', true);
        registerHitbox('guess_choice_right', LOGICAL_WIDTH - 24 - btnW, btnY, btnW, btnH);
    } else {
        uictx.fillStyle = '#a0aec0';
        uictx.font = 'bold 13px "Courier New", monospace';
        uictx.textAlign = 'center';
        uictx.fillText('...', LOGICAL_WIDTH / 2, LOGICAL_HEIGHT - 110);
    }

    // Exit Button
    drawPixelButton(24, LOGICAL_HEIGHT - 65, LOGICAL_WIDTH - 48, 44, t('exit_home'), '#e53e3e');
    registerHitbox('minigame_exit', 24, LOGICAL_HEIGHT - 65, LOGICAL_WIDTH - 48, 44);

    if (minigameState.gameOver) {
        const modalY = LOGICAL_HEIGHT / 2 - 140;
        uictx.fillStyle = 'rgba(8, 10, 20, 0.92)';
        uictx.fillRect(24, modalY, LOGICAL_WIDTH - 48, 280);
        uictx.strokeStyle = minigameState.guessWins >= 3 ? '#05ffa1' : '#ff0055';
        uictx.lineWidth = 3;
        uictx.strokeRect(24, modalY, LOGICAL_WIDTH - 48, 280);

        uictx.fillStyle = minigameState.guessWins >= 3 ? '#05ffa1' : '#ff0055';
        uictx.font = 'bold 24px "Courier New", monospace';
        uictx.textAlign = 'center';
        const winTitle = minigameState.guessWins >= 3 ? '¡VICTORIA TOTAL! 🎉' : t('game_over');
        uictx.fillText(winTitle, LOGICAL_WIDTH / 2, modalY + 45);

        uictx.fillStyle = '#ffffff';
        uictx.font = 'bold 16px "Courier New", monospace';
        uictx.fillText('Aciertos: ' + minigameState.guessWins + ' / 5', LOGICAL_WIDTH / 2, modalY + 85);

        uictx.fillStyle = '#ffd700';
        uictx.fillText('+' + minigameState.earnedBones + ' ' + t('bones_won'), LOGICAL_WIDTH / 2, modalY + 120);

        drawPixelButton(44, modalY + 155, LOGICAL_WIDTH - 88, 44, t('retry'), '#05ffa1', true);
        registerHitbox('minigame_retry', 44, modalY + 155, LOGICAL_WIDTH - 88, 44);

        drawPixelButton(44, modalY + 210, LOGICAL_WIDTH - 88, 44, t('exit_home'), '#3182ce');
        registerHitbox('minigame_exit', 44, modalY + 210, LOGICAL_WIDTH - 88, 44);
    }
}

// --- SCREEN: POLAROID PHOTO STUDIO ---
function drawStudioHUD() {
    uictx.fillStyle = 'rgba(12, 14, 24, 0.85)';
    uictx.fillRect(0, 0, LOGICAL_WIDTH, 56);

    uictx.fillStyle = '#00f0ff';
    uictx.font = 'bold 20px "Courier New", monospace';
    uictx.textAlign = 'center';
    uictx.fillText(t('studio_title'), LOGICAL_WIDTH / 2, 36);

    // Filter overlay
    if (photoFilter === 'warm') {
        uictx.fillStyle = 'rgba(255, 140, 0, 0.12)';
        uictx.fillRect(0, 56, LOGICAL_WIDTH, LOGICAL_HEIGHT - 56);
    } else if (photoFilter === 'cyber') {
        uictx.fillStyle = 'rgba(0, 240, 255, 0.12)';
        uictx.fillRect(0, 56, LOGICAL_WIDTH, LOGICAL_HEIGHT - 56);
    } else if (photoFilter === 'noir') {
        uictx.fillStyle = 'rgba(20, 20, 25, 0.25)';
        uictx.fillRect(0, 56, LOGICAL_WIDTH, LOGICAL_HEIGHT - 56);
    }

    // Filter selector buttons
    const fy = 66;
    const filters = [
        { id: 'normal', label: t('filter_color') },
        { id: 'warm', label: t('filter_warm') },
        { id: 'cyber', label: t('filter_cyber') },
        { id: 'noir', label: t('filter_noir') }
    ];
    const fw = (LOGICAL_WIDTH - 40) / 4;
    filters.forEach((f, idx) => {
        const fx = 20 + idx * fw;
        const isActive = (photoFilter === f.id);
        drawPixelButton(fx, fy, fw - 4, 30, f.label, isActive ? '#05ffa1' : '#1e2438', isActive);
        registerHitbox('filter_' + f.id, fx, fy, fw - 4, 30);
    });

    const py = LOGICAL_HEIGHT - 130;
    const poses = [
        { id: 'smile', label: t('pose_happy') },
        { id: 'wag', label: t('pose_wag') },
        { id: 'nap', label: t('pose_nap') },
        { id: 'hero', label: t('pose_hero') }
    ];
    const pw = (LOGICAL_WIDTH - 40) / 4;
    poses.forEach((p, idx) => {
        const px = 20 + idx * pw;
        const isActive = (photoPose === p.id);
        drawPixelButton(px, py, pw - 4, 36, p.label, isActive ? '#805ad5' : '#1e2438', isActive);
        registerHitbox('pose_' + p.id, px, py, pw - 4, 36);
    });

    drawPixelButton(20, LOGICAL_HEIGHT - 80, LOGICAL_WIDTH / 2 - 25, 46, t('take_photo'), '#05ffa1', true);
    registerHitbox('snap_photo', 20, LOGICAL_HEIGHT - 80, LOGICAL_WIDTH / 2 - 25, 46);

    drawPixelButton(LOGICAL_WIDTH / 2 + 5, LOGICAL_HEIGHT - 80, LOGICAL_WIDTH / 2 - 25, 46, t('back'), '#e53e3e');
    registerHitbox('goto_dashboard', LOGICAL_WIDTH / 2 + 5, LOGICAL_HEIGHT - 80, LOGICAL_WIDTH / 2 - 25, 46);
}

// --- SCREEN: DOG DIARY & ACHIEVEMENTS ---
function drawDiaryHUD() {
    uictx.fillStyle = '#0c0f1d';
    uictx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    uictx.fillStyle = '#ffd700';
    uictx.font = 'bold 24px "Courier New", monospace';
    uictx.textAlign = 'center';
    uictx.fillText(t('diary_title'), LOGICAL_WIDTH / 2, 45);

    const pet = DOG_BREEDS[state.activePetIndex];

    uictx.fillStyle = '#171c32';
    uictx.fillRect(20, 65, LOGICAL_WIDTH - 40, 95);
    uictx.strokeStyle = '#ffd700';
    uictx.lineWidth = 1.5;
    uictx.strokeRect(20, 65, LOGICAL_WIDTH - 40, 95);

    uictx.fillStyle = '#ffffff';
    uictx.font = 'bold 15px "Courier New", monospace';
    uictx.textAlign = 'left';
    uictx.fillText(getDogName(pet) + ' — ' + t('official_lore'), 35, 90);

    uictx.fillStyle = '#a0aec0';
    uictx.font = '12px "Courier New", monospace';
    uictx.fillText(getDogLore(pet), 35, 112, LOGICAL_WIDTH - 70);

    uictx.fillStyle = '#00f0ff';
    uictx.font = '12px "Courier New", monospace';
    uictx.fillText(t('speed') + ': ' + '★'.repeat(pet.stats.speed) + '  ' + t('agility') + ': ' + '★'.repeat(pet.stats.agility) + '  ' + t('cuddle') + ': ' + '★'.repeat(pet.stats.cuddle), 35, 142);

    uictx.fillStyle = '#00f0ff';
    uictx.font = 'bold 17px "Courier New", monospace';
    uictx.fillText(t('achievements_title'), 25, 185);

    ACHIEVEMENTS.forEach((ach, idx) => {
        const ay = 200 + idx * 56;
        if (ay + 50 > LOGICAL_HEIGHT - 70) return;

        uictx.fillStyle = ach.completed ? '#143828' : '#14182a';
        uictx.fillRect(20, ay, LOGICAL_WIDTH - 40, 50);
        uictx.strokeStyle = ach.completed ? '#05ffa1' : '#2d3748';
        uictx.strokeRect(20, ay, LOGICAL_WIDTH - 40, 50);

        uictx.fillStyle = ach.completed ? '#05ffa1' : '#ffffff';
        uictx.font = 'bold 14px "Courier New", monospace';
        uictx.textAlign = 'left';
        uictx.fillText((ach.completed ? '✅ ' : '🔒 ') + getAchTitle(ach), 35, ay + 24);

        uictx.fillStyle = '#a0aec0';
        uictx.font = '11px "Courier New", monospace';
        uictx.fillText(getAchDesc(ach), 35, ay + 40);

        uictx.fillStyle = '#ffd700';
        uictx.font = 'bold 13px "Courier New", monospace';
        uictx.textAlign = 'right';
        uictx.fillText('+' + ach.reward + ' 🦴', LOGICAL_WIDTH - 35, ay + 30);
    });

    drawPixelButton(20, LOGICAL_HEIGHT - 60, LOGICAL_WIDTH - 40, 46, t('back_home'), '#e53e3e');
    registerHitbox('goto_dashboard', 20, LOGICAL_HEIGHT - 60, LOGICAL_WIDTH - 40, 46);
}

// --- 12. INPUT & INTERACTION ---
function getCanvasCoordinates(e) {
    const rect = uiCanvas.getBoundingClientRect();
    const scaleX = LOGICAL_WIDTH / rect.width;
    const scaleY = LOGICAL_HEIGHT / rect.height;
    let clientX = e.clientX;
    let clientY = e.clientY;
    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    }
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
        screenX: clientX,
        screenY: clientY
    };
}

const touchFeedback = document.getElementById('touchFeedback');
function showTouchGlow(clientX, clientY) {
    if (!touchFeedback) return;
    touchFeedback.style.left = clientX + 'px';
    touchFeedback.style.top = clientY + 'px';
    touchFeedback.classList.remove('active');
    void touchFeedback.offsetWidth;
    touchFeedback.classList.add('active');
}

let isDragging = false;
let lastDragX = 0;

function handleInteraction(pos) {
    audio.init();

    for (const hit of uiHitboxes) {
        if (pos.x >= hit.x && pos.x <= hit.x + hit.w &&
            pos.y >= hit.y && pos.y <= hit.y + hit.h) {

            audio.play('click');
            triggerHaptic('light');

            if (hit.id === 'toggle_lang') {
                const langs = ['es', 'en', 'ja', 'pt'];
                const idx = langs.indexOf(state.lang || 'es');
                state.lang = langs[(idx + 1) % langs.length];
                triggerHaptic('light');
                audio.play('click');
                saveState();
                return;
            }
            if (hit.id === 'toggle_sound') {
                audio.muted = !audio.muted;
                state.soundEnabled = !audio.muted;
                saveState();
                return;
            }
            if (hit.id === 'toggle_lcd') {
                state.vitals.lcdMode = !state.vitals.lcdMode;
                audio.play('switch');
                triggerHaptic('light');
                saveState();
                return;
            }
            if (hit.id === 'prev_pet') {
                state.activePetIndex = (state.activePetIndex - 1 + DOG_BREEDS.length) % DOG_BREEDS.length;
                stage.spawnDog(DOG_BREEDS[state.activePetIndex], state.equipped);
                saveState();
                return;
            }
            if (hit.id === 'next_pet') {
                state.activePetIndex = (state.activePetIndex + 1) % DOG_BREEDS.length;
                stage.spawnDog(DOG_BREEDS[state.activePetIndex], state.equipped);
                saveState();
                return;
            }
            if (hit.id === 'goto_studio') {
                currentScreen = SCREENS.PHOTO_STUDIO;
                stage.setScreen(currentScreen);
                return;
            }
            if (hit.id === 'goto_diary') {
                currentScreen = SCREENS.DIARY;
                stage.setScreen(currentScreen);
                return;
            }
            if (hit.id === 'goto_kitchen') {
                currentScreen = SCREENS.KITCHEN;
                stage.setScreen(currentScreen);
                return;
            }
            if (hit.id === 'goto_wardrobe' || hit.id === 'action_wardrobe') {
                currentScreen = SCREENS.WARDROBE;
                stage.setScreen(currentScreen);
                return;
            }
            if (hit.id === 'goto_minigames') {
                currentScreen = SCREENS.MINIGAMES;
                stage.setScreen(currentScreen);
                return;
            }
            if (hit.id === 'goto_dashboard') {
                currentScreen = SCREENS.DASHBOARD;
                stage.setScreen(currentScreen);
                stage.spawnDog(DOG_BREEDS[state.activePetIndex], state.equipped);
                return;
            }

            if (hit.id === 'action_pet' || hit.id === 'pet_dog') {
                state.vitals.happiness = Math.min(100, state.vitals.happiness + 15);
                state.vitals.stress = Math.max(0, state.vitals.stress - 15);
                state.stats.totalPets = (state.stats.totalPets || 0) + 1;
                audio.play('pet');
                triggerHaptic('medium');
                dogBuilder.triggerWobble(stage.currentDog, 0.65);
                vfx.emit(LOGICAL_WIDTH / 2, LOGICAL_HEIGHT * 0.45, 14, 'heart');
                vfx.addText(t('bark_sound'), LOGICAL_WIDTH / 2 - 35, LOGICAL_HEIGHT * 0.45 - 20, '#ff2a85');
                checkAchievement('first_pet');
                saveState();
                return;
            }

            if (hit.id === 'action_praise') {
                state.vitals.discipline = Math.min(100, (state.vitals.discipline || 80) + 10);
                state.vitals.happiness = Math.min(100, state.vitals.happiness + 8);
                audio.play('tamagotchi_chirp');
                triggerHaptic('medium');
                dogBuilder.triggerWobble(stage.currentDog, 0.4);
                vfx.emit(LOGICAL_WIDTH / 2, LOGICAL_HEIGHT * 0.45, 12, 'heart');
                vfx.addText('🎓 ' + t('praise'), LOGICAL_WIDTH / 2 - 40, LOGICAL_HEIGHT * 0.45, '#ffd700');
                saveState();
                return;
            }

            if (hit.id === 'action_clean' || hit.id.startsWith('clean_poop_')) {
                state.vitals.poops = 0;
                state.vitals.hygiene = 100;
                state.vitals.happiness = Math.min(100, state.vitals.happiness + 10);
                audio.play('flush');
                triggerHaptic('medium');
                vfx.emit(LOGICAL_WIDTH / 2, LOGICAL_HEIGHT * 0.5, 20, 'confetti');
                vfx.addText(t('clean_done'), LOGICAL_WIDTH / 2 - 70, LOGICAL_HEIGHT * 0.45, '#00f0ff');
                checkAchievement('clean_freak');
                saveState();
                return;
            }

            if (hit.id === 'toggle_lights') {
                state.vitals.lightsOff = !state.vitals.lightsOff;
                audio.play('switch');
                triggerHaptic('light');
                saveState();
                return;
            }

            if (hit.id === 'action_medicine') {
                if (state.vitals.isSick) {
                    state.vitals.isSick = false;
                    state.vitals.health = 100;
                    state.vitals.happiness = Math.min(100, state.vitals.happiness + 20);
                    audio.play('cure');
                    triggerHaptic('success');
                    vfx.emit(LOGICAL_WIDTH / 2, LOGICAL_HEIGHT * 0.45, 16, 'spark');
                    vfx.addText(t('cured_done'), LOGICAL_WIDTH / 2 - 70, LOGICAL_HEIGHT * 0.45, '#48bb78');
                    saveState();
                } else {
                    audio.play('pet');
                    vfx.addText('❤️ ' + t('health') + ' 100%', LOGICAL_WIDTH / 2 - 60, LOGICAL_HEIGHT * 0.45, '#48bb78');
                }
                return;
            }

            if (hit.id.startsWith('feed_')) {
                const food = hit.data.food;
                if (state.bones >= food.price) {
                    state.bones -= food.price;
                    state.vitals.hunger = Math.min(100, state.vitals.hunger + food.hungerBonus);
                    state.vitals.happiness = Math.min(100, state.vitals.happiness + food.happinessBonus);
                    state.vitals.energy = Math.min(100, state.vitals.energy + food.energyBonus);
                    state.vitals.health = Math.min(100, (state.vitals.health || 100) + food.healthBonus);
                    state.vitals.stress = Math.max(0, state.vitals.stress - food.stressRelief);
                    state.vitals.weightKg = Math.round(((state.vitals.weightKg || 4.5) + food.weightGain) * 10) / 10;
                    audio.play('eat');
                    triggerHaptic('medium');
                    dogBuilder.triggerWobble(stage.currentDog, 0.45);
                    vfx.emit(LOGICAL_WIDTH / 2, LOGICAL_HEIGHT * 0.45, 14, 'spark');
                    vfx.addText(t('fed_done'), LOGICAL_WIDTH / 2 - 50, LOGICAL_HEIGHT * 0.45 - 20, '#48bb78');
                    checkAchievement('gourmet_chef');
                    saveState();
                } else {
                    audio.play('hit');
                    vfx.addText(t('need_bones'), LOGICAL_WIDTH / 2 - 80, LOGICAL_HEIGHT * 0.45, '#e53e3e');
                }
                return;
            }

            if (hit.id === 'guess_choice_left' || hit.id === 'guess_choice_right') {
                if (minigameState.type === SCREENS.MG_GUESS && minigameState.guessPhase === 'waiting') {
                    const userChoice = (hit.id === 'guess_choice_left' ? 'left' : 'right');
                    const petChoice = (Math.random() < 0.5 ? 'left' : 'right');
                    minigameState.guessUserChoice = userChoice;
                    minigameState.guessPetChoice = petChoice;
                    minigameState.guessPhase = 'revealed';
                    minigameState.guessTimer = 1.35;
                    audio.play('tamagotchi_chirp');

                    if (userChoice === petChoice) {
                        minigameState.guessWins = (minigameState.guessWins || 0) + 1;
                        minigameState.score += 100;
                        audio.play('coin');
                        triggerHaptic('success');
                        vfx.emit(LOGICAL_WIDTH / 2, LOGICAL_HEIGHT * 0.45, 16, 'heart');
                    } else {
                        audio.play('hit');
                        triggerHaptic('light');
                    }
                }
                return;
            }

            if (hit.id === 'action_feed') {
                currentScreen = SCREENS.KITCHEN;
                stage.setScreen(currentScreen);
                return;
            }

            if (hit.id === 'action_rest') {
                state.vitals.lightsOff = true;
                state.vitals.energy = Math.min(100, state.vitals.energy + 25);
                state.vitals.stress = Math.max(0, state.vitals.stress - 20);
                audio.play('switch');
                triggerHaptic('light');
                vfx.addText(t('sleeping'), LOGICAL_WIDTH / 2 - 60, LOGICAL_HEIGHT * 0.45, '#00f0ff');
                saveState();
                return;
            }

            if (hit.id.startsWith('tab_')) {
                wardrobeTab = hit.id.replace('tab_', '');
                return;
            }

            if (hit.id.startsWith('equip_')) {
                const cat = hit.id.split('_')[1];
                if (cat === 'pets') {
                    state.activePetIndex = hit.data.idx;
                } else {
                    const catKey = (cat === 'hats' ? 'hat' : cat === 'glasses' ? 'glasses' : 'neck');
                    state.equipped[catKey] = hit.data.item.id;
                }
                audio.play('coin');
                triggerHaptic('medium');
                stage.spawnDog(DOG_BREEDS[state.activePetIndex], state.equipped);
                if (state.equipped.hat !== 'none' && state.equipped.glasses !== 'none' && state.equipped.neck !== 'none') {
                    checkAchievement('fashion_icon');
                }
                saveState();
                return;
            }

            if (hit.id.startsWith('buy_')) {
                const item = hit.data.item;
                const cat = hit.id.split('_')[1];
                if (state.bones >= item.price) {
                    state.bones -= item.price;
                    item.unlocked = true;
                    if (cat === 'pets') {
                        state.unlockedPets.push(item.id);
                        state.activePetIndex = hit.data.idx;
                    } else if (cat === 'hats') {
                        state.unlockedHats.push(item.id);
                        state.equipped.hat = item.id;
                    } else if (cat === 'glasses') {
                        state.unlockedGlasses.push(item.id);
                        state.equipped.glasses = item.id;
                    } else if (cat === 'neck') {
                        state.unlockedNeck.push(item.id);
                        state.equipped.neck = item.id;
                    }
                    audio.play('fanfare');
                    triggerHaptic('success');
                    vfx.emit(pos.x, pos.y, 16, 'gold');
                    stage.spawnDog(DOG_BREEDS[state.activePetIndex], state.equipped);
                    saveState();
                } else {
                    vfx.addText(t('no_bones'), pos.x - 70, pos.y - 20, '#e53e3e');
                }
                return;
            }

            if (hit.id.startsWith('start_')) {
                startMinigame(hit.data.type);
                return;
            }
            if (hit.id === 'minigame_retry') {
                startMinigame(minigameState.type);
                return;
            }
            if (hit.id === 'minigame_exit') {
                currentScreen = SCREENS.DASHBOARD;
                stage.setScreen(currentScreen);
                stage.spawnDog(DOG_BREEDS[state.activePetIndex], state.equipped);
                return;
            }

            if (hit.id === 'steer_left') {
                minigameState.playerX = Math.max(35, minigameState.playerX - 65);
                return;
            }
            if (hit.id === 'steer_right') {
                minigameState.playerX = Math.min(LOGICAL_WIDTH - 35, minigameState.playerX + 65);
                return;
            }
            if (hit.id === 'lane_left') {
                minigameState.laneIndex = Math.max(0, minigameState.laneIndex - 1);
                return;
            }
            if (hit.id === 'lane_right') {
                minigameState.laneIndex = Math.min(2, minigameState.laneIndex + 1);
                return;
            }

            if (hit.id.startsWith('filter_')) {
                photoFilter = hit.id.replace('filter_', '');
                return;
            }
            if (hit.id.startsWith('pose_')) {
                photoPose = hit.id.replace('pose_', '');
                return;
            }
            if (hit.id === 'snap_photo') {
                audio.play('shutter');
                triggerHaptic('success');
                state.stats.photosSnapped = (state.stats.photosSnapped || 0) + 1;
                checkAchievement('photo_star');
                vfx.addText('📸 ' + t('photo_saved'), LOGICAL_WIDTH / 2 - 80, LOGICAL_HEIGHT / 2, '#00f0ff');
                saveState();
                return;
            }
        }
    }

    if (minigameState.active && !minigameState.gameOver) {
        if (minigameState.type === SCREENS.MG_LANE) {
            if (pos.x < LOGICAL_WIDTH / 2) {
                minigameState.laneIndex = Math.max(0, minigameState.laneIndex - 1);
            } else {
                minigameState.laneIndex = Math.min(2, minigameState.laneIndex + 1);
            }
        } else if (minigameState.type === SCREENS.MG_JUMP) {
            minigameState.playerX = pos.x;
        } else {
            if (pos.x < minigameState.playerX) {
                minigameState.playerX = Math.max(35, minigameState.playerX - 55);
            } else {
                minigameState.playerX = Math.min(LOGICAL_WIDTH - 35, minigameState.playerX + 55);
            }
        }
    }
}

uiCanvas.addEventListener('pointerdown', (e) => {
    const coords = getCanvasCoordinates(e);
    showTouchGlow(coords.screenX, coords.screenY);
    isDragging = true;
    lastDragX = coords.screenX;
    handleInteraction(coords);
}, { passive: false });

window.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastDragX;
    lastDragX = e.clientX;

    if (currentScreen === SCREENS.PHOTO_STUDIO || currentScreen === SCREENS.WARDROBE) {
        if (stage.currentDog) {
            stage.currentDog.rotation.y += deltaX * 0.015;
        }
    }
});

window.addEventListener('pointerup', () => { isDragging = false; });

window.addEventListener('keydown', (e) => {
    // If playing an active minigame
    if (minigameState.active) {
        if (minigameState.gameOver) {
            if (e.key === ' ' || e.key === 'Enter' || e.key === 'r' || e.key === 'R') {
                startMinigame(minigameState.type);
                return;
            }
            if (e.key === 'Escape') {
                currentScreen = SCREENS.DASHBOARD;
                stage.setScreen(currentScreen);
                stage.spawnDog(DOG_BREEDS[state.activePetIndex], state.equipped);
                return;
            }
        }

        if (minigameState.type === SCREENS.MG_GUESS) {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                handleInteraction({ x: 50, y: LOGICAL_HEIGHT - 110 });
                return;
            }
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                handleInteraction({ x: LOGICAL_WIDTH - 50, y: LOGICAL_HEIGHT - 110 });
                return;
            }
        }

        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            if (minigameState.type === SCREENS.MG_LANE) {
                minigameState.laneIndex = Math.max(0, minigameState.laneIndex - 1);
            } else {
                minigameState.playerX = Math.max(35, minigameState.playerX - 50);
            }
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            if (minigameState.type === SCREENS.MG_LANE) {
                minigameState.laneIndex = Math.min(2, minigameState.laneIndex + 1);
            } else {
                minigameState.playerX = Math.min(LOGICAL_WIDTH - 35, minigameState.playerX + 50);
            }
        } else if (e.key === 'Escape') {
            currentScreen = SCREENS.DASHBOARD;
            stage.setScreen(currentScreen);
            stage.spawnDog(DOG_BREEDS[state.activePetIndex], state.equipped);
        }
        return;
    }

    // Dashboard keyboard shortcuts
    if (currentScreen === SCREENS.DASHBOARD) {
        if (e.key === '1' || e.key === 'f' || e.key === 'F') {
            currentScreen = SCREENS.KITCHEN;
            stage.setScreen(currentScreen);
        } else if (e.key === '2' || e.key === 'c' || e.key === 'C') {
            handleInteraction({ x: 140, y: LOGICAL_HEIGHT - 150 });
        } else if (e.key === '3' || e.key === 'l' || e.key === 'L') {
            handleInteraction({ x: 240, y: LOGICAL_HEIGHT - 150 });
        } else if (e.key === '4' || e.key === 'm' || e.key === 'M') {
            handleInteraction({ x: 330, y: LOGICAL_HEIGHT - 150 });
        } else if (e.key === '5' || e.key === 'p' || e.key === 'P') {
            handleInteraction({ x: 60, y: LOGICAL_HEIGHT - 100 });
        } else if (e.key === ' ' || e.key === 'Enter') {
            currentScreen = SCREENS.MINIGAMES;
            stage.setScreen(currentScreen);
        } else if (e.key === 'Tab') {
            e.preventDefault();
            state.activePetIndex = (state.activePetIndex + 1) % DOG_BREEDS.length;
            stage.spawnDog(DOG_BREEDS[state.activePetIndex], state.equipped);
            saveState();
        }
    } else if (e.key === 'Escape') {
        currentScreen = SCREENS.DASHBOARD;
        stage.setScreen(currentScreen);
        stage.spawnDog(DOG_BREEDS[state.activePetIndex], state.equipped);
    }
});

function handleResize() {
    const availW = window.innerWidth;
    const availH = window.innerHeight;
    const scale = Math.min(availW / LOGICAL_WIDTH, availH / LOGICAL_HEIGHT);

    uiCanvas.width = LOGICAL_WIDTH;
    uiCanvas.height = LOGICAL_HEIGHT;
    uiCanvas.style.width = Math.floor(LOGICAL_WIDTH * scale) + 'px';
    uiCanvas.style.height = Math.floor(LOGICAL_HEIGHT * scale) + 'px';

    stage.canvas.style.width = Math.floor(LOGICAL_WIDTH * scale) + 'px';
    stage.canvas.style.height = Math.floor(LOGICAL_HEIGHT * scale) + 'px';
}
window.addEventListener('resize', handleResize);
handleResize();

function updateVitals(dt) {
    if (currentScreen === SCREENS.DASHBOARD) {
        const decay = state.vitals.lightsOff ? 0.35 : 1.0;
        state.vitals.hunger = Math.max(0, state.vitals.hunger - 0.35 * dt * decay);
        state.vitals.happiness = Math.max(0, state.vitals.happiness - 0.25 * dt * decay);

        if (state.vitals.lightsOff) {
            state.vitals.energy = Math.min(100, state.vitals.energy + 1.5 * dt);
            state.vitals.stress = Math.max(0, state.vitals.stress - 0.8 * dt);
        } else {
            state.vitals.energy = Math.max(0, state.vitals.energy - 0.18 * dt);
            state.vitals.stress = Math.min(100, state.vitals.stress + 0.18 * dt);
        }

        // Random pooping when dog is fed and lights are on
        if (state.vitals.hunger < 80 && !state.vitals.lightsOff && Math.random() < 0.003 * dt * 60 && (state.vitals.poops || 0) < 3) {
            state.vitals.poops = (state.vitals.poops || 0) + 1;
            audio.play('bark');
        }

        // Hygiene decay based on poops
        const poops = state.vitals.poops || 0;
        if (poops > 0) {
            state.vitals.hygiene = Math.max(0, (state.vitals.hygiene || 100) - 0.6 * dt * poops);
            if (state.vitals.hygiene < 15 && Math.random() < 0.005) {
                state.vitals.isSick = true;
            }
        } else {
            state.vitals.hygiene = Math.max(0, (state.vitals.hygiene || 100) - 0.08 * dt);
        }

        // Sickness decay & recovery
        if (state.vitals.isSick) {
            state.vitals.health = Math.max(0, (state.vitals.health || 100) - 0.45 * dt);
            state.vitals.happiness = Math.max(0, state.vitals.happiness - 0.5 * dt);
        } else {
            state.vitals.health = Math.min(100, (state.vitals.health || 100) + 0.1 * dt);
        }
    }
}

// --- 13. MASTER 60 FPS DELTA-TIME LOOP ---
let lastTimestamp = performance.now();

function mainGameLoop(timestamp) {
    const dt = Math.min(0.1, (timestamp - lastTimestamp) / 1000);
    lastTimestamp = timestamp;
    const timeSec = timestamp / 1000;

    uiHitboxes = [];

    updateVitals(dt);
    vfx.update(dt);
    stage.updateBallPhysics(dt);

    if (currentScreen === SCREENS.MG_DODGE) updateMinigameDodge(dt);
    else if (currentScreen === SCREENS.MG_CATCH) updateMinigameCatch(dt);
    else if (currentScreen === SCREENS.MG_JUMP) updateMinigameJump(dt);
    else if (currentScreen === SCREENS.MG_LANE) updateMinigameLane(dt);
    else if (currentScreen === SCREENS.MG_GUESS) updateMinigameGuess(dt);
    else if (currentScreen === SCREENS.MG_BOUNCE) updateMinigameBounce(dt);

    if (stage.currentDog && !currentScreen.startsWith('MG_')) {
        let emotion = 'normal';
        if (state.vitals.lightsOff || state.vitals.energy < 25) emotion = 'sleepy';
        else if (state.vitals.happiness > 65) emotion = 'happy';
        dogBuilder.updateDogAnimation(stage.currentDog, dt, timeSec, 0, false, emotion);
    }

    stage.renderer.render(stage.scene, stage.camera);

    uictx.clearRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    switch (currentScreen) {
        case SCREENS.DASHBOARD:
            drawDashboardHUD(timeSec);
            break;
        case SCREENS.WARDROBE:
            drawWardrobeHUD();
            break;
        case SCREENS.KITCHEN:
            drawKitchenHUD();
            break;
        case SCREENS.MINIGAMES:
            drawMinigamesMenuHUD();
            break;
        case SCREENS.MG_DODGE:
        case SCREENS.MG_CATCH:
        case SCREENS.MG_JUMP:
        case SCREENS.MG_LANE:
        case SCREENS.MG_GUESS:
        case SCREENS.MG_BOUNCE:
            drawActiveMinigameHUD(timeSec);
            break;
        case SCREENS.PHOTO_STUDIO:
            drawStudioHUD();
            break;
        case SCREENS.DIARY:
            drawDiaryHUD();
            break;
    }

    vfx.draw(uictx);

    // Retro 1996 LCD Dot-Matrix Filter Overlay
    if (state.vitals.lcdMode) {
        uictx.save();
        uictx.fillStyle = 'rgba(159, 179, 136, 0.38)';
        uictx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

        uictx.fillStyle = 'rgba(30, 42, 20, 0.12)';
        for (let y = 0; y < LOGICAL_HEIGHT; y += 3) {
            uictx.fillRect(0, y, LOGICAL_WIDTH, 1);
        }

        uictx.strokeStyle = '#2b331f';
        uictx.lineWidth = 8;
        uictx.strokeRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

        uictx.fillStyle = 'rgba(43, 51, 31, 0.85)';
        uictx.fillRect(0, 0, LOGICAL_WIDTH, 18);
        uictx.font = '11px sans-serif';
        uictx.textAlign = 'center';
        const retroIcons = ['🥣', '💡', '🎮', '💊', '🫧', '⚖️', '📢', '🚨'];
        retroIcons.forEach((ico, idx) => {
            uictx.fillText(ico, 26 + idx * ((LOGICAL_WIDTH - 52) / 7), 14);
        });

        uictx.restore();
    }

    requestAnimationFrame(mainGameLoop);
}

requestAnimationFrame(mainGameLoop);
