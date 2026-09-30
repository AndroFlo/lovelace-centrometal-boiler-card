import {
    html,
    svg,
} from "https://unpkg.com/lit-element@2.0.1/lit-element.js?module";

// Modern layouts of the BioTec Plus card: "synoptic" (default), "dashboard", "compact" and "tile".
// Everything is drawn in SVG/CSS from BioTecPlusDisplay.values; clicking a value opens the HA more-info dialog.

const COLD = [47, 120, 184]
const HOT = [233, 128, 58]
const GREY = "#3a474d"
const PHASES = ["Arrêt", "Allumage", "Stabilisation", "Fonctionnement", "Extinction"]
const TAKE_LABELS = ["Inactive", "Granulés ON", "Granulés OFF"]
const FONTS_URL = "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap"

// Blue (25 °C) -> orange (70 °C)
function tempColor(t) {
    if (t === null) {
        return GREY
    }
    const k = Math.max(0, Math.min(1, (t - 25) / 45))
    return "#" + COLD.map((c, i) => Math.round(c + (HOT[i] - c) * k).toString(16).padStart(2, "0")).join("")
}

function show(value, suffix = "") {
    return (value === null || value === undefined) ? "--" : value + suffix
}

// 2150 -> "2 150" (narrow no-break space)
function thousands(value) {
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, " ")
}

// @font-face is ignored inside a shadow root: the fonts are loaded once in the document
function ensureFonts() {
    if (document.getElementById("centrometal-boiler-card-fonts")) {
        return
    }
    const link = document.createElement("link")
    link.id = "centrometal-boiler-card-fonts"
    link.rel = "stylesheet"
    link.href = FONTS_URL
    document.head.appendChild(link)
}

const FLAME = svg`
    <path d="M0 -80 C 15 -60, 24 -44, 18 -22 C 14 -8, 6 0, 0 0 C -6 0, -16 -8, -18 -22 C -22 -40, -12 -56, 0 -80 Z" fill="#f08a3c"></path>
    <path d="M0 -48 C 8 -36, 10 -26, 7 -16 C 5 -9, 2 -6, 0 -6 C -3 -6, -7 -10, -8 -16 C -10 -26, -6 -36, 0 -48 Z" fill="#ffd27a"></path>`

const POWER_ICON = svg`<path d="M12 3v8"></path><path d="M6.3 7.3a8 8 0 1 0 11.4 0"></path>`
const FAN_ICON = svg`
    <path d="M12 12c0-4 1-8 4-8 2 0 3 2 1 4l-5 4Z"></path><path d="M12 12c4 0 8 1 8 4 0 2-2 3-4 1l-4-5Z"></path>
    <path d="M12 12c0 4-1 8-4 8-2 0-3-2-1-4l5-4Z"></path><path d="M12 12c-4 0-8-1-8-4 0-2 2-3 4-1l4 5Z"></path>`
const FIRE_ICON = svg`<path d="M12 3c2 3.5 6 5.5 6 10a6 6 0 0 1-12 0c0-2.5 1.2-4 2.5-5 .3 2 1.3 3 2.5 3 0-3 0-5.5 1-8Z"></path>`
const DROP_ICON = svg`<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"></path>`
const HOUSE_ICON = svg`<path d="M3 11l9-7 9 7"></path><path d="M5 10v10h14V10"></path>`
const THERMO_ICON = svg`<path d="M14 14.8V5a2 2 0 1 0-4 0v9.8a4 4 0 1 0 4 0Z"></path>`
const ALERT_ICON = svg`<circle cx="12" cy="12" r="9"></circle><path d="M12 8v5M12 16v.01"></path>`
const WARN_ICON = svg`<path d="M12 3 2 20h20L12 3Z"></path><path d="M12 10v4M12 17v.01"></path>`

const STYLE = html`<style>
    .cb-wrap { position: relative; overflow: hidden; border-radius: var(--ha-card-border-radius, 12px); }
    .cb { font-family: var(--ha-font-family-body, var(--paper-font-body1_-_font-family, Roboto, sans-serif)); font-variant-numeric: tabular-nums; }
    .cb .num { font-family: "Space Grotesk", var(--ha-font-family-body, sans-serif); font-weight: 600; }
    .cb button { font: inherit; }
    .cb .click { cursor: pointer; }
    .cb .abs { position: absolute; }
    .cb .flow { stroke-dasharray: 6 10; animation: cb-flow .9s linear infinite; }
    .cb .spin { transform-box: fill-box; transform-origin: center; animation: cb-spin 1.4s linear infinite; }
    .cb .flicker { transform-box: fill-box; transform-origin: 50% 100%; animation: cb-flicker 1.6s ease-in-out infinite; }
    .cb .smoke { transform-box: fill-box; transform-origin: center; animation: cb-smoke 2.4s linear infinite; }
    .cb .plug { animation: cb-plug 6s ease-in-out infinite; }
    .cb .blink { animation: cb-blink 1.2s ease-in-out infinite; }
    @keyframes cb-flow { to { stroke-dashoffset: -16; } }
    @keyframes cb-spin { to { transform: rotate(360deg); } }
    @keyframes cb-flicker { 0%, 100% { transform: scale(1, 1); } 50% { transform: scale(1.05, .86); } }
    @keyframes cb-smoke { from { transform: translateY(0) scale(1); opacity: .55; } to { transform: translateY(-18px) scale(2.5); opacity: 0; } }
    @keyframes cb-plug { 0%, 100% { opacity: .2; } 40%, 75% { opacity: 1; } }
    @keyframes cb-blink { 0%, 100% { stroke-opacity: 1; } 50% { stroke-opacity: .35; } }
    @media (prefers-reduced-motion: reduce) { .cb .flow, .cb .spin, .cb .flicker, .cb .smoke, .cb .plug, .cb .blink { animation: none; } }

    /* Synoptic (fixed 680x600, scaled to the card width) */
    .syn { position: absolute; left: 0; top: 0; width: 680px; height: 600px; transform-origin: 0 0; background: #0e1417; color: #e7ecee;
        font-family: "IBM Plex Sans", system-ui, sans-serif; }
    .syn .top { left: 24px; right: 24px; top: 18px; height: 48px; display: flex; align-items: center; gap: 12px; }
    .syn .chip { display: flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 999px; background: #1a2529; border: 1px solid #2a383e; font-size: 13px; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .syn .dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .syn .src { display: flex; gap: 4px; padding: 4px; border-radius: 12px; background: #0e1417; border: 1px solid #2a383e; flex-shrink: 0; cursor: default; }
    .syn .src > span { height: 36px; display: flex; align-items: center; padding: 0 14px; border-radius: 9px; color: #6d7d83; font-size: 13px; font-weight: 600; }
    .syn .src > .on { background: #f08a3c; color: #1b1107; }
    .syn .src > .busy { background: #3a2616; color: #ffc98f; }
    .syn .src > button { height: 36px; padding: 0 14px; border-radius: 9px; border: 1px dashed #f08a3c; background: transparent; color: #f5a261; font-size: 13px; font-weight: 600; cursor: pointer; }
    .syn .src > button:hover { background: #231a14; }
    .syn .pw { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; padding: 0; cursor: pointer; flex-shrink: 0; }
    .syn .pw.on { border: 1.5px solid #f08a3c; background: #231a14; }
    .syn .pw.off { width: auto; padding: 0 16px 0 12px; gap: 8px; border-radius: 22px; border: 1.5px solid #6fd08c; background: #13241a; color: #b8f0c8; font-size: 14px; font-weight: 600; }
    .syn .pw.dis { border: 1.5px dashed #3a484e; background: #141b1e; cursor: not-allowed; }
    .syn .bar-msg { left: 24px; right: 24px; top: 74px; height: 36px; box-sizing: border-box; padding: 0 14px; border-radius: 10px; display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 500; }
    .syn .info { background: #132a36; border: 1px solid #2d5f7a; color: #bfe2f5; }
    .syn .warn { background: #33270f; border: 1px solid #7a5a1f; color: #ffd98a; }
    .syn .danger { background: #3a1517; border: 1px solid #8a2b30; color: #ffc2c4; }
    .syn .confirm { background: #1a2529; border: 1px solid #2a383e; color: #e7ecee; }
    .syn .btn { height: 28px; padding: 0 12px; border-radius: 8px; border: 1px solid #3a484e; background: #0e1417; color: #e7ecee; cursor: pointer; font-size: 13px; }
    .syn .btn.primary { border: none; background: #f08a3c; color: #1b1107; font-weight: 600; }
    .syn .cap { font-size: 11px; letter-spacing: .08em; text-transform: uppercase; }
    .syn .lbl { font-size: 11px; color: #a9b6bb; text-align: center; }
    .syn .mut { font-size: 11px; color: #8a9aa0; }
    .syn .ts { text-shadow: 0 1px 6px rgba(0, 0, 0, .45); text-align: center; }
    .syn .gauge { height: 5px; border-radius: 3px; background: #223035; }
    .syn .gauge > div { height: 5px; border-radius: 3px; background: #4aa3df; }
    .syn .steps { left: 24px; top: 562px; width: 632px; height: 26px; display: flex; align-items: center; gap: 10px; font-size: 12px; }
    .syn .steps .line { flex-grow: 1; height: 1px; background: #2a383e; }
    .syn .steps .st { display: flex; align-items: center; gap: 6px; color: #6d7d83; white-space: nowrap; }
    .syn .steps .st > span { width: 8px; height: 8px; border-radius: 50%; border: 1.5px solid #3a484e; box-sizing: border-box; }
    .syn .steps .st.done { color: #a9b6bb; }
    .syn .steps .st.done > span { border: none; background: #56666c; }
    .syn .steps .st.cur { padding: 3px 10px; border-radius: 999px; background: #2a1d12; color: #ffc98f; font-weight: 600; }
    .syn .steps .st.cur > span { border: none; background: #f08a3c; }
    .syn .veil { left: 0; top: 70px; width: 680px; height: 530px; background: rgba(14, 20, 23, .72); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; }

    /* Dashboard / compact / tile: fluid, follow the HA theme */
    .db, .cp, .tl { --cb-bg: var(--ha-card-background, var(--card-background-color, #fff)); --cb-tile: var(--secondary-background-color, #f3f0ea);
        --cb-text: var(--primary-text-color, #1d2327); --cb-muted: var(--secondary-text-color, #5d6870); --cb-line: var(--divider-color, #e5e0d8);
        --cb-heat: #d4611e; --cb-cold: #2f78b8; --cb-ok: #2f8a4c;
        color: var(--cb-text); }
    .db { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
    .db .tile { background: var(--cb-tile); border-radius: 16px; padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; }
    .db .head, .cp .head, .tl { display: flex; align-items: center; gap: 12px; }
    .db .ico, .tl .ico { width: 44px; height: 44px; border-radius: 14px; background: rgba(212, 97, 30, .15); color: var(--cb-heat); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .db .title { font-size: 18px; font-weight: 600; }
    .db .sub, .cp .sub, .tl .sub { font-size: 13px; color: var(--cb-muted); }
    .db .grow, .cp .grow, .tl .grow { flex-grow: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
    .db .state { display: flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; background: var(--cb-tile); font-size: 13px; font-weight: 500; white-space: nowrap; }
    .db .dot, .cp .dot, .tl .dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .db .pw, .cp .pw { width: 44px; height: 44px; border-radius: 50%; border: none; background: var(--cb-text); color: var(--cb-bg); display: flex; align-items: center; justify-content: center; padding: 0; cursor: pointer; flex-shrink: 0; }
    .db .pw[disabled], .cp .pw[disabled] { opacity: .35; cursor: not-allowed; }
    .db .msg, .cp .msg { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: 12px; font-size: 14px; }
    .db .msg.info, .cp .msg.info { background: rgba(47, 120, 184, .16); }
    .db .msg.warn, .cp .msg.warn { background: rgba(212, 150, 30, .18); }
    .db .msg.danger, .cp .msg.danger { background: rgba(229, 72, 77, .18); }
    .db .msg.confirm, .cp .msg.confirm { background: var(--cb-tile); }
    .db .msg .grow, .cp .msg .grow { font-weight: 500; }
    .db .btn, .cp .btn { height: 40px; padding: 0 14px; border-radius: 10px; border: 1px solid var(--cb-line); background: var(--cb-bg); color: var(--cb-text); cursor: pointer; font-size: 14px; }
    .db .btn.primary, .cp .btn.primary { border: none; background: var(--cb-heat); color: #fff; font-weight: 600; }
    .db .tile.hero { flex-direction: row; gap: 16px; align-items: center; flex-wrap: wrap; }
    .db .ring { position: relative; width: 160px; height: 160px; flex-shrink: 0; margin: 0 auto; }
    .db .ring > div { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .db .ring b { font-size: 40px; line-height: 1; }
    .db .facts { flex: 1 1 180px; display: flex; flex-direction: column; gap: 10px; }
    .db .kv { display: flex; justify-content: space-between; gap: 8px; font-size: 14px; }
    .db .kv > span:first-child { color: var(--cb-muted); }
    .db .src { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px; padding: 4px; border-radius: 12px; background: var(--cb-bg); font-size: 13px; text-align: center; }
    .db .src > div { padding: 7px 0; border-radius: 9px; color: var(--cb-muted); }
    .db .src > .on { background: var(--cb-heat); color: #fff; font-weight: 600; }
    .db .two { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
    .db .cap, .cp .cap { font-size: 13px; color: var(--cb-muted); display: flex; justify-content: space-between; align-items: center; gap: 8px; }
    .db .h { font-size: 15px; font-weight: 600; color: var(--cb-text); }
    .db .n { font-size: 24px; line-height: 1.1; }
    .db .xl { font-size: 44px; line-height: 1; }
    .db .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(90px, 1fr)); gap: 8px; }
    .db .stats > div { display: flex; flex-direction: column; gap: 2px; }
    .db .stats span { font-size: 12px; color: var(--cb-muted); }
    .db .badge { font-size: 12px; padding: 3px 9px; border-radius: 999px; background: rgba(212, 97, 30, .15); color: var(--cb-heat); }
    .db .badge.ok { background: rgba(47, 138, 76, .15); color: var(--cb-ok); }
    .db .gauge { height: 8px; border-radius: 4px; background: var(--cb-line); overflow: hidden; }
    .db .gauge > div { height: 8px; border-radius: 4px; background: var(--cb-cold); }
    .db .pump { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 12px; background: var(--cb-bg); font-size: 13px; }
    .db .pump b { display: block; }
    .db .pump span { color: var(--cb-muted); font-size: 12px; }
    .db .tile.buf { flex-direction: row; gap: 14px; }
    .db .thermo { width: 36px; min-height: 140px; border-radius: 18px; flex-shrink: 0; }
    .db .lvl { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 4px; }
    .db .lvl > div { height: 10px; border-radius: 5px; background: var(--cb-line); }
    .db .lvl > .on { background: #a8743f; }
    .db .opt { display: flex; align-items: center; gap: 8px; font-size: 13px; padding: 6px 8px; border-radius: 8px; color: var(--cb-muted); }
    .db .opt.on { background: rgba(212, 97, 30, .15); color: var(--cb-heat); font-weight: 600; }
    .db .opt.no { text-decoration: line-through; opacity: .6; }
    .cp { padding: 16px; display: flex; flex-direction: column; gap: 14px; }
    .cp .temp { display: flex; align-items: baseline; gap: 8px; }
    .cp .temp b { font-size: 36px; line-height: 1; }
    .cp .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(96px, 1fr)); gap: 8px; }
    .cp .box { padding: 10px; border-radius: 12px; background: var(--cb-tile); display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .cp .box > span:first-child { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--cb-muted); }
    .cp .box b { font-size: 18px; }
    .cp .set { font-size: 12px; color: var(--cb-muted); font-weight: 400; }
    .cp .box.row { flex-direction: row; align-items: center; gap: 10px; }
    .cp .bar { height: 10px; border-radius: 5px; }
    .tl { padding: 12px 14px; }
    .tl .chip { font-size: 12px; padding: 4px 10px; border-radius: 999px; background: var(--cb-tile); white-space: nowrap; }
    .tl b { font-size: 14px; }
</style>`

export class BioTecPlusModern {

    constructor(display) {
        this.d = display
        this.confirm = null     // null, "power" or "pellet": pending confirmation shown inside the card
    }

    // ---------------------------------------------------------------- data

    model() {
        const d = this.d
        const v = d.values
        const has = (name) => (name in v) && v[name] !== "-"
        const num = (name) => {
            if (!has(name)) {
                return null
            }
            const x = parseFloat(v[name])
            return isNaN(x) ? null : x
        }
        // Out-of-range values mean a missing sensor (same rule as Display.formatTemperature)
        const temp = (name, max = 145) => {
            const x = num(name)
            return (x !== null && x > -45 && x < max) ? Math.round(x * 10) / 10 : null
        }
        const isOn = (name) => has(name) && ["1", "on", "true", "open"].includes(String(v[name]).toLowerCase())

        const unavailable = !has("boiler_state")
        const wood = v["wood_pellet_mode"] == 0          // 0 = wood, 1 = pellets
        const controlMode = num("control_mode")
        const locked = controlMode == 2
        const stateText = unavailable ? "" : String(v["boiler_state"])
        const off = stateText == "OFF"
        const take = num("take_over")

        // Photocell of the pellet burner: < 1000 kOhm = flame seen, lower = brighter
        const fire = num("fire_sensor")
        const flameSeen = fire !== null && fire < 1000
        const pelletFlame = (wood || !flameSeen) ? 0 : (fire < 100 ? 1 : (fire < 400 ? 0.75 : 0.5))
        // Wood fire intensity from the firebox temperature (wood mode only)
        const firebox = temp("firebox_temperature", 1000)
        const woodFlame = (!wood || firebox === null) ? 0 : (firebox > 300 ? 1 : (firebox > 150 ? 0.7 : (firebox > 80 ? 0.45 : 0)))

        const lambda = num("lambda_sensor")
        const fan = has("fan") && v["fan"] != 0
        const fanValue = num("fan")
        const flue = temp("flue_gas", 1000)
        const tank = has("tank_level") ? v["tank_level"] : null
        const opMode = num("operation_mode")
        const doser = has("pellet_dispenzer") && v["pellet_dispenzer"] != 0
        const glow = v["glow"] == 1

        // Phase of the pellet cycle (heuristic: state text first, then what the sensors show)
        let phase = -1
        let stepsNote = ""
        if (unavailable) {
            phase = -1
        } else if (wood && take == 1) {
            stepsNote = "Prise en charge par les granulés — en attente de la fin du feu de bois"
        } else if (wood) {
            stepsNote = d.config["allow_power_in_wood"] === true ? "Mode bois — le bouton commande la régulation, pas le feu" : "Mode bois — la marche/arrêt se fait sur la chaudière"
        } else if (off) {
            phase = 0
        } else if (/stabil/i.test(stateText)) {
            phase = 2
        } else if (/(extin|gaš|gas[ae]nj|shut|post)/i.test(stateText)) {
            phase = 4
        } else if (/(ignit|allum|palj|light)/i.test(stateText) || (fan && !flameSeen)) {
            phase = 1
        } else {
            phase = 3
        }
        if (phase >= 0 && locked) {
            phase = -1
            stepsNote = "Accès à la chaudière désactivé — commande sur la chaudière"
        }

        const door = isOn("wood_door")

        let banner = null
        if (locked) {
            banner = { kind: "danger", text: "Accès à la chaudière temporairement désactivé" }
        } else if (door) {
            banner = { kind: "warn", text: "Porte de chargement bois ouverte" }
        } else if (tank == "Empty") {
            banner = { kind: "danger", text: "Silo à granulés vide" }
        } else if (tank == "Reserve") {
            banner = { kind: "warn", text: "Réserve de granulés atteinte — pensez à remplir le silo" }
        } else if (wood && take == 1) {
            banner = { kind: "info", text: "Prise en charge — les granulés prendront le relais du bois en fin de combustion" }
        } else if (phase == 1) {
            banner = { kind: "info", text: "Allumage — la bougie chauffe les granulés, la cellule attend la flamme" }
        }

        const tw = temp("boiler_temperature_wood")
        const tb = temp("boiler_temperature_pellet")
        const mode = opMode === null ? null : (opMode == 1 ? "Eau chaude" : "Chauffage")

        let state = unavailable ? "Indisponible" : stateText
        if (!unavailable && !off && mode) {
            state += " · " + mode.toLowerCase()
        }

        // Time of the last state change (shown when the boiler is unavailable)
        const entity = d.card.hass && d.card.hass.states[d.parameters["boiler_state"]]
        const since = entity && entity.last_changed ? new Date(entity.last_changed) : null

        return {
            unavailable: unavailable,
            state: state,
            since: since && !isNaN(since) ? since.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : null,
            off: off,
            dot: (unavailable || off) ? "#8a979c" : (locked ? "#e5484d" : ((phase == 1 || phase == 2 || phase == 4 || door) ? "#f5a261" : "#6fd08c")),
            wood: wood,
            sourceLabel: wood ? "bois" : "granulés",
            tw: tw,
            tb: tb,
            active: wood ? tw : tb,
            firebox: firebox,
            flue: flue,
            smoke: flue !== null && flue > 80,
            outdoor: temp("outdoor_temperature"),
            bt: temp("buffer_tank_temparature_up"),
            bb: temp("buffer_tank_temparature_down"),
            dhw: temp("domestic_hot_water"),
            dhwSet: temp("domestic_hot_water_target"),
            hasBuffer: d.hexBitIsClear(v["configuration"], 11),
            hasDhw: d.hexBitIsSet(v["configuration"], 5),
            hasOutdoor: "outdoor_temperature" in v,
            dep: temp("circuit_1_flow_measured_temperature"),
            depSet: temp("circuit_1_flow_target_temperature"),
            hasRad: ("second_pump" in v) || ("circuit_1_flow_measured_temperature" in v),
            room: temp("circuit_1_room_measured_temperature"),
            roomSet: temp("circuit_1_room_target_temperature"),
            hasRoom: "circuit_1_room_measured_temperature" in v,
            fire: fire,
            flameSeen: flameSeen,
            fireText: fire === null ? "--" : (fire >= 1000 ? ">1 MΩ" : fire + " kΩ"),
            pelletFlame: pelletFlame,
            woodFlame: woodFlame,
            glow: glow,
            lambda: (lambda !== null && lambda > 0.1) ? (lambda < 25.4 ? lambda : "-.-") : null,
            fan: fan,
            fanRpm: fan && fanValue !== null && fanValue > 1 ? thousands(Math.round(fanValue)) : null,
            fanText: !has("fan") ? "--" : (fan ? (fanValue !== null && fanValue > 1 ? thousands(Math.round(fanValue)) + (this.unit("fan") || " %") : "En marche") : "Arrêt"),
            airP: num("air_flow_engine_primary"),
            airS: num("air_flow_engine_secondary"),
            doser: doser,
            p1: v["boiler_pump"] == 1,
            p1d: v["boiler_pump_demand"] == 1,
            hasP2: "second_pump" in v,
            p2: v["second_pump"] == 1,
            p2d: v["second_pump_demand"] == 1,
            hasP3: "third_pump" in v,
            p3: v["third_pump"] == 1,
            p3d: v["third_pump_demand"] == 1,
            tank: tank,
            tankLabel: { "Full": "plein", "Reserve": "réserve", "Empty": "vide" }[tank] || null,
            mode: mode,
            take: take,
            takeAllowed: wood && controlMode == 1,
            locked: locked,
            door: door,
            phase: phase,
            stepsNote: stepsNote,
            plug: !wood && phase == 1,
            // In wood mode the boiler switch drives the controller, not the wood fire itself,
            // so the button stays disabled unless the card config opts in.
            powerEnabled: !unavailable && !locked && ("boiler_switch" in d.parameters)
                && (!wood || d.config["allow_power_in_wood"] === true),
            powerInWood: wood && d.config["allow_power_in_wood"] === true,
            // Wood -> pellets through the integration's button (SCCMD 1); there is no remote way back to wood
            pelletEnabled: !unavailable && wood && !locked && take != 1 && has("pellet_mode_button"),
            // Why the switch to pellets is not offered, shown when the greyed "Granulés" is tapped
            pelletReason: !wood || take == 1 ? ""
                : unavailable ? "Chaudière indisponible"
                : locked ? "Accès à distance désactivé sur la chaudière (control_mode 2)"
                : !("pellet_mode_button" in d.parameters) ? "Bouton granulés introuvable : aucune entité button.…pellet_mode (intégration 0.0.56 ou plus). Renseigner pellet_mode_button dans la carte."
                : !has("pellet_mode_button") ? "Bouton granulés indisponible dans Home Assistant (" + d.parameters["pellet_mode_button"] + ")"
                : "",
            banner: banner,
        }
    }

    unit(name) {
        const entity = this.d.parameters[name]
        const state = this.d.card.hass && this.d.card.hass.states[entity]
        const unit = state && state.attributes ? state.attributes.unit_of_measurement : null
        return unit ? " " + unit : ""
    }

    // Click handler opening the more-info dialog of a tracked entity
    info(name) {
        return () => {
            if (name in this.d.parameters) {
                this.d.showMoreInfo(this.d, name)
            }
        }
    }

    // ---------------------------------------------------------------- power

    refresh() {
        this.d.card.uiTick = (this.d.card.uiTick || 0) + 1
    }

    askPower(m) {
        if (!m.powerEnabled) {
            return
        }
        this.confirm = "power"
        this.refresh()
    }

    askPellet(m) {
        if (!m.pelletEnabled) {
            return
        }
        this.confirm = "pellet"
        this.refresh()
    }

    explainPellet(m) {
        if (!m.pelletReason) {
            return
        }
        this.confirm = "notice"
        this.notice = m.pelletReason
        this.refresh()
    }

    cancelConfirm() {
        this.confirm = null
        this.refresh()
    }

    applyConfirm(m) {
        if (this.confirm == "pellet") {
            this.d.card.hass.callService("button", "press", { entity_id: this.d.parameters["pellet_mode_button"] })
        } else {
            this.d.card.hass.callService("switch", m.off ? "turn_on" : "turn_off", { entity_id: this.d.parameters["boiler_switch"] })
        }
        this.confirm = null
        this.refresh()
    }

    // ---------------------------------------------------------------- render

    render(layout) {
        ensureFonts()
        const m = this.model()
        switch (layout) {
            case "dashboard":
                return html`${STYLE}${this.dashboard(m)}`
            case "compact":
                return html`${STYLE}${this.compact(m)}`
            case "tile":
                return html`${STYLE}${this.tile(m)}`
        }
        return html`${STYLE}${this.synoptic(m)}`
    }

    confirmText(m) {
        if (this.confirm == "pellet") {
            return "Passer en granulés ? Le retour au bois se fait sur la chaudière."
        }
        if (m.powerInWood) {
            // The switch drives the controller; the wood fire itself keeps burning
            return m.off
                ? "Allumer la régulation ? La chaudière est en mode bois."
                : "Éteindre la régulation ? Le feu de bois, lui, continue de brûler."
        }
        return m.off ? "Allumer la chaudière ?" : "Éteindre la chaudière ?"
    }

    confirmLabel(m) {
        return this.confirm == "pellet" ? "Passer en granulés" : (m.off ? "Allumer" : "Éteindre")
    }

    pumpLabel(name, running, demand) {
        return name + " · " + (running ? "marche" : (demand ? "demande" : "arrêt"))
    }

    // A · Synoptic ------------------------------------------------------

    synoptic(m) {
        const width = this.d.card.width || this.d.card.offsetWidth || 680
        const scale = width / 680
        const id = this.d.card_id
        const na = m.unavailable
        const pipe = (on, color) => on ? color : GREY
        const tankFill = { "Full": [124, 40], "Reserve": [150, 14], "Empty": [164, 0] }[m.tank] || [124, 40]
        const tankStroke = m.tank == "Reserve" ? "#b8892f" : (m.tank == "Empty" ? "#c2474d" : "#2c3a40")
        const tankColor = m.tank == "Reserve" ? "#ffd98a" : (m.tank == "Empty" ? "#ffb3b6" : "#a9b6bb")
        const fireColor = (on) => na ? "#a9b6bb" : (!on ? "#8a9aa0" : (m.firebox !== null && m.firebox >= 300 ? "#ffd27a" : "#f5a261"))
        const cellOn = !na && (m.glow || m.flameSeen)
        const fanOn = !na && m.fan
        const takeBusy = m.wood && m.take == 1

        return html`
        <div class="cb cb-wrap" style="height: ${600 * scale}px;">
        <div class="syn" style="transform: scale(${scale});">

            <!-- Top bar -->
            <div class="abs top">
                <div class="chip click" @click=${this.info("boiler_state")}>
                    <span class="dot" style="background: ${m.dot};"></span>
                    <span>${m.state}</span>
                </div>
                <div style="flex-grow: 1;"></div>
                ${m.hasOutdoor ? html`
                    <div class="click" style="display: flex; align-items: center; gap: 6px; font-size: 13px; color: #a9b6bb; flex-shrink: 0;" @click=${this.info("outdoor_temperature")}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a9b6bb" stroke-width="1.8" stroke-linecap="round">${THERMO_ICON}</svg>
                        <span class="num" style="font-size: 18px; color: #e7ecee;">${show(m.outdoor, " °C")}</span>
                        <span>ext.</span>
                    </div>` : ""}
                <!-- Source: wood -> pellets through the integration's button when available, never back to wood -->
                <div class="src" role="group" aria-label="Source de chauffe : ${m.wood ? "bois" : "granulés"}"
                    title="${m.pelletEnabled ? "Passer en granulés (le retour au bois se fait sur la chaudière)" : "Source de chauffe (le passage bois / granulés se fait sur la chaudière)"}">
                    <span class="${m.wood && !takeBusy ? "on" : ""}">Bois</span>
                    ${m.pelletEnabled ? html`
                        <button type="button" class="${this.confirm == "pellet" ? "busy" : ""}" @click=${() => this.askPellet(m)}>Granulés</button>` : html`
                        <span class="${takeBusy || m.plug ? "busy" : (m.wood ? "" : "on")}" style="${m.pelletReason ? "cursor: pointer;" : ""}"
                            title="${m.pelletReason}" @click=${() => this.explainPellet(m)}>${takeBusy ? "Prise en charge…" : (m.plug ? "Allumage…" : "Granulés")}</span>`}
                </div>
                ${this.synopticPower(m)}
            </div>

            <!-- Banner / power confirmation -->
            ${this.confirm == "notice" ? html`
                <div class="abs bar-msg warn">
                    <span style="flex-grow: 1;">${this.notice}</span>
                    <button type="button" class="btn" @click=${() => this.cancelConfirm()}>OK</button>
                </div>` : this.confirm ? html`
                <div class="abs bar-msg confirm">
                    <span style="flex-grow: 1;">${this.confirmText(m)}</span>
                    <button type="button" class="btn" @click=${() => this.cancelConfirm()}>Annuler</button>
                    <button type="button" class="btn primary" @click=${() => this.applyConfirm(m)}>${this.confirmLabel(m)}</button>
                </div>` : (m.banner ? html`
                <div class="abs bar-msg ${m.banner.kind}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">${ALERT_ICON}</svg>
                    <span>${m.banner.text}</span>
                </div>` : "")}

            <!-- Schematic -->
            <svg class="abs" width="616" height="436" viewBox="0 0 616 436" style="left: 24px; top: 118px; overflow: visible;">
                <defs>
                    <linearGradient id="${id}_buf" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stop-color="${tempColor(m.bt)}"></stop>
                        <stop offset="0.5" stop-color="${tempColor(m.bt !== null && m.bb !== null ? (m.bt + m.bb) / 2 : null)}"></stop>
                        <stop offset="1" stop-color="${tempColor(m.bb)}"></stop>
                    </linearGradient>
                    <linearGradient id="${id}_dhw" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stop-color="${tempColor(m.dhw)}"></stop>
                        <stop offset="1" stop-color="${tempColor(m.dhw !== null ? m.dhw - 14 : null)}"></stop>
                    </linearGradient>
                    <radialGradient id="${id}_glow" cx="0.5" cy="0.5" r="0.5">
                        <stop offset="0" stop-color="#ffb347" stop-opacity="0.5"></stop>
                        <stop offset="1" stop-color="#ffb347" stop-opacity="0"></stop>
                    </radialGradient>
                </defs>

                <!-- Flue duct, chimney, smoke -->
                <g class="click" @click=${this.info("flue_gas")}>
                    <rect x="16" y="70" width="230" height="18" rx="9" fill="#151e22" stroke="#2c3a40" stroke-width="1.5"></rect>
                    <rect x="68" y="86" width="14" height="12" fill="#151e22"></rect>
                    <rect x="178" y="86" width="14" height="12" fill="#151e22"></rect>
                    ${m.smoke && !na ? svg`
                        <circle class="smoke" cx="27" cy="10" r="4" fill="#8a9aa0"></circle>
                        <circle class="smoke" cx="30" cy="10" r="4" fill="#8a9aa0" style="animation-delay: -0.8s;"></circle>
                        <circle class="smoke" cx="24" cy="10" r="4" fill="#8a9aa0" style="animation-delay: -1.6s;"></circle>` : ""}
                    <rect x="18" y="16" width="18" height="66" rx="3" fill="#1c272c" stroke="${!na && m.flue !== null && m.flue > 100 ? "#f08a3c" : "#2c3a40"}" stroke-width="1.5"></rect>
                    <rect x="14" y="12" width="26" height="6" rx="2" fill="#1c272c" stroke="${!na && m.flue !== null && m.flue > 100 ? "#f08a3c" : "#2c3a40"}" stroke-width="1.5"></rect>
                </g>

                <!-- Fan (common to wood and pellets) -->
                <g class="click" @click=${this.info("fan")}>
                    <circle cx="205" cy="79" r="13" fill="#0e1417" stroke="${fanOn ? "#a9b6bb" : "#4d5c62"}" stroke-width="2"></circle>
                    <g transform="translate(196 70) scale(0.75)" fill="none" stroke="${fanOn ? "#cfd8db" : "#56666c"}" stroke-width="2" stroke-linecap="round">
                        <g class="${fanOn ? "spin" : ""}">${FAN_ICON}</g>
                    </g>
                </g>

                <!-- Wood chamber -->
                <g opacity="${m.wood ? 1 : 0.5}" class="click" @click=${this.info("boiler_temperature_wood")}>
                    <rect x="16" y="96" width="104" height="314" rx="14" fill="#151e22" stroke="${m.wood ? "#f08a3c" : "#26343a"}" stroke-width="1.5"></rect>
                    <rect x="30" y="110" width="76" height="80" rx="8" fill="none" stroke="#2c3a40" stroke-width="1.5"></rect>
                    ${m.door && !na ? svg`
                        <rect class="blink" x="30" y="110" width="76" height="80" rx="8" fill="#e5a13a" fill-opacity="0.14" stroke="#e5a13a" stroke-width="2" stroke-dasharray="5 4"></rect>
                        <path d="M30 110 L10 122 L10 202 L30 190 Z" fill="#2a2416" stroke="#e5a13a" stroke-width="1.5" stroke-linejoin="round"></path>` : ""}
                </g>
                ${m.glow && m.wood ? svg`<circle cx="68" cy="330" r="44" fill="url(#${id}_glow)" class="click" @click=${this.info("glow")}></circle>` : ""}
                ${m.woodFlame > 0 ? svg`
                    <g class="click" @click=${this.info("firebox_temperature")}>
                        <circle cx="68" cy="270" r="50" fill="url(#${id}_glow)"></circle>
                        <g transform="translate(68 300) scale(${m.woodFlame})"><g class="flicker">${FLAME}</g></g>
                    </g>` : ""}

                <!-- Pellet chamber -->
                <g opacity="${m.wood ? 0.5 : 1}">
                    <rect x="128" y="96" width="124" height="314" rx="14" fill="#18242a" stroke="${!m.wood && m.pelletFlame > 0 ? "#f08a3c" : "#2c3a40"}" stroke-width="1.5"></rect>
                    <rect x="142" y="104" width="96" height="64" rx="10" fill="#10181b" stroke="${tankStroke}" stroke-width="1.5" class="click" @click=${this.info("tank_level")}></rect>
                    ${m.tank !== null ? svg`<rect x="146" y="${tankFill[0]}" width="88" height="${tankFill[1]}" rx="6" fill="#b98a55" opacity="0.85"></rect>` : ""}
                    <rect x="184" y="174" width="12" height="48" rx="6" fill="${m.doser ? "#4aa3df" : "#2c3a40"}" class="click" @click=${this.info("pellet_dispenzer")}></rect>
                    <rect x="150" y="226" width="80" height="154" rx="12" fill="#0f1719" stroke="#2c3a40" stroke-width="1.5" class="click" @click=${this.info("fire_sensor")}></rect>
                    <path d="M162 368 H218" stroke="#5b6b72" stroke-width="3" stroke-linecap="round" stroke-dasharray="6 4"></path>
                </g>
                ${m.pelletFlame > 0 ? svg`
                    <g class="click" @click=${this.info("fire_sensor")}>
                        <circle cx="190" cy="326" r="${30 + 34 * m.pelletFlame}" fill="url(#${id}_glow)"></circle>
                        <g transform="translate(190 360) scale(${m.pelletFlame})"><g class="flicker">${FLAME}</g></g>
                    </g>` : ""}
                ${m.glow && !m.wood ? svg`<circle cx="190" cy="360" r="30" fill="url(#${id}_glow)" class="click" @click=${this.info("glow")}></circle>` : ""}

                <!-- Glow plug (bougie), lit during ignition -->
                <rect x="204" y="352" width="26" height="7" rx="3.5" fill="#3a474d"></rect>
                ${m.plug && !na ? svg`
                    <g class="plug">
                        <circle cx="214" cy="355" r="16" fill="#ff5a1f" opacity="0.4"></circle>
                        <rect x="204" y="352" width="26" height="7" rx="3.5" fill="#ff6a2a"></rect>
                    </g>` : ""}

                <!-- Boiler <-> buffer, pump P1 -->
                <path d="M252 96 H360" fill="none" stroke="${pipe(m.p1, "#f08a3c")}" opacity="0.35" stroke-width="5"></path>
                <path d="M360 360 H252" fill="none" stroke="${pipe(m.p1, "#4aa3df")}" opacity="0.35" stroke-width="5"></path>
                ${m.p1 ? svg`
                    <path d="M252 96 H360" fill="none" class="flow" stroke="#f08a3c" stroke-width="4" stroke-linecap="round"></path>
                    <path d="M360 360 H252" fill="none" class="flow" stroke="#4aa3df" stroke-width="4" stroke-linecap="round"></path>` : ""}
                <g class="click" @click=${this.info("boiler_pump")}>
                    <circle cx="306" cy="96" r="17" fill="#0e1417" stroke="${m.p1 ? "#a9b6bb" : "#4d5c62"}" stroke-width="2"></circle>
                    <path class="${m.p1 ? "spin" : ""}" d="M300 87 L315 96 L300 105 Z" fill="${m.p1 ? "#cfd8db" : "#4d5c62"}"></path>
                    ${m.p1d ? svg`<circle cx="321" cy="80" r="4" fill="#6fd08c"></circle>` : ""}
                </g>

                <!-- Buffer tank -->
                ${m.hasBuffer ? svg`
                    <g class="click" @click=${this.info("buffer_tank_temparature_up")}>
                        <rect x="360" y="30" width="110" height="370" rx="18" fill="url(#${id}_buf)"></rect>
                        <rect x="360" y="30" width="110" height="370" rx="18" fill="none" stroke="#ffffff" opacity="0.16" stroke-width="1.5"></rect>
                    </g>` : svg`
                    <rect x="400" y="30" width="30" height="370" rx="15" fill="#151e22" stroke="#26343a" stroke-width="1.5"></rect>
                    <path d="M360 96 H400 M400 360 H360${m.hasRad ? " M430 90 H470 M470 250 H430" : ""}${m.hasDhw ? " M430 280 H470 M470 336 H430" : ""}" fill="none" stroke="${GREY}" opacity="0.35" stroke-width="5"></path>`}

                <!-- Buffer -> radiators, pump P2 -->
                ${m.hasRad ? svg`
                    <path d="M470 90 H590 V124" fill="none" stroke="${pipe(m.p2, "#f08a3c")}" opacity="0.35" stroke-width="5"></path>
                    <path d="M540 226 V250 H470" fill="none" stroke="${pipe(m.p2, "#4aa3df")}" opacity="0.35" stroke-width="5"></path>
                    ${m.p2 ? svg`
                        <path d="M470 90 H590 V124" fill="none" class="flow" stroke="#f08a3c" stroke-width="4" stroke-linecap="round"></path>
                        <path d="M540 226 V250 H470" fill="none" class="flow" stroke="#4aa3df" stroke-width="4" stroke-linecap="round"></path>` : ""}
                    ${m.hasP2 ? svg`
                        <g class="click" @click=${this.info("second_pump")}>
                            <circle cx="515" cy="90" r="15" fill="#0e1417" stroke="${m.p2 ? "#a9b6bb" : "#4d5c62"}" stroke-width="2"></circle>
                            <path class="${m.p2 ? "spin" : ""}" d="M510 82 L523 90 L510 98 Z" fill="${m.p2 ? "#cfd8db" : "#4d5c62"}"></path>
                            ${m.p2d ? svg`<circle cx="529" cy="75" r="4" fill="#6fd08c"></circle>` : ""}
                        </g>` : ""}
                    <g class="click" @click=${this.info("circuit_1_flow_measured_temperature")}>
                        <rect x="526" y="124" width="78" height="102" rx="6" fill="${na ? GREY : tempColor(m.dep)}"></rect>
                        ${[540, 553, 566, 579, 592].map((x) => svg`<path d="M${x} 132 V218" stroke="#0e1417" opacity="0.35" stroke-width="3" stroke-linecap="round"></path>`)}
                        <rect x="526" y="124" width="78" height="102" rx="6" fill="none" stroke="#ffffff" opacity="0.16" stroke-width="1.5"></rect>
                    </g>` : ""}

                <!-- DHW tank, pump P3 -->
                ${m.hasDhw ? svg`
                    <path d="M470 280 H530" fill="none" stroke="${pipe(m.p3, "#f08a3c")}" opacity="0.35" stroke-width="5"></path>
                    <path d="M530 336 H470" fill="none" stroke="${pipe(m.p3, "#4aa3df")}" opacity="0.35" stroke-width="5"></path>
                    ${m.p3 ? svg`
                        <path d="M470 280 H530" fill="none" class="flow" stroke="#f08a3c" stroke-width="4" stroke-linecap="round"></path>
                        <path d="M530 336 H470" fill="none" class="flow" stroke="#4aa3df" stroke-width="4" stroke-linecap="round"></path>` : ""}
                    ${m.hasP3 ? svg`
                        <g class="click" @click=${this.info("third_pump")}>
                            <circle cx="500" cy="280" r="13" fill="#0e1417" stroke="${m.p3 ? "#a9b6bb" : "#4d5c62"}" stroke-width="2"></circle>
                            <path class="${m.p3 ? "spin" : ""}" d="M495 273 L507 280 L495 287 Z" fill="${m.p3 ? "#cfd8db" : "#4d5c62"}"></path>
                            ${m.p3d ? svg`<circle cx="512" cy="266" r="4" fill="#6fd08c"></circle>` : ""}
                        </g>` : ""}
                    <g class="click" @click=${this.info("domestic_hot_water")}>
                        <rect x="530" y="262" width="70" height="150" rx="14" fill="url(#${id}_dhw)"></rect>
                        <rect x="530" y="262" width="70" height="150" rx="14" fill="none" stroke="#ffffff" opacity="0.16" stroke-width="1.5"></rect>
                    </g>` : ""}
            </svg>

            <!-- Schematic labels: flue and fan -->
            <div class="abs click" style="left: 66px; top: 124px; width: 96px; line-height: 1.15;" @click=${this.info("flue_gas")}>
                <div class="mut">Fumées</div>
                <div class="num" style="font-size: 18px;">${show(m.flue, " °C")}</div>
                ${m.lambda !== null ? html`<div class="click" style="font-size: 12px; color: #a9b6bb; margin-top: 3px;" @click=${(e) => { e.stopPropagation(); this.info("lambda_sensor")() }}>
                    O₂ <span class="num" style="font-size: 14px; color: #e7ecee;">${m.lambda} %</span></div>` : ""}
            </div>
            <div class="abs click" style="left: 181px; top: 132px; width: 96px; text-align: center; line-height: 1.15;" @click=${this.info("fan")}>
                <div class="mut">Ventilateur</div>
                <div>${m.fanRpm !== null ? html`
                    <span class="num" style="font-size: 16px; color: #e7ecee;">${m.fanRpm}</span> <span class="mut">${this.unit("fan").trim() || "%"}</span>` : html`
                    <span class="num" style="font-size: 16px; color: ${fanOn ? "#e7ecee" : "#8a9aa0"};">${m.fanText}</span>`}</div>
            </div>

            <!-- Wood chamber labels -->
            <div class="abs click" style="left: 40px; top: 244px; width: 104px; text-align: center;" @click=${this.info("boiler_temperature_wood")}>
                <div class="cap" style="color: ${m.wood ? "#ffc98f" : "#8a9aa0"};">Bois</div>
                <div class="num" style="font-size: 22px; font-weight: 500; color: ${m.wood ? "#ffffff" : "#8d9ca2"};">${show(m.tw, "°")}</div>
            </div>
            ${m.door && !na ? html`
                <div class="abs click" style="left: 40px; top: 314px; width: 104px; display: flex; align-items: center; justify-content: center; gap: 4px; font-size: 11px; font-weight: 600; color: #ffcf7a;" @click=${this.info("wood_door")}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffcf7a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${WARN_ICON}</svg>Porte ouverte</div>` : ""}
            ${m.wood ? html`
                <div class="abs lbl click" style="left: 36px; top: 424px; width: 112px; font-size: 12px;" @click=${this.info("firebox_temperature")}>Foyer <b style="color: ${fireColor(m.woodFlame > 0)};">${show(m.firebox, " °C")}</b></div>` : ""}
            <div class="abs" style="left: 48px; top: 450px; width: 88px; display: flex; flex-direction: column; gap: 8px;">
                ${this.synopticGauge("Air prim.", m.airP, "air_flow_engine_primary")}
                ${this.synopticGauge("Air sec.", m.airS, "air_flow_engine_secondary")}
            </div>

            <!-- Pellet chamber labels -->
            ${m.tankLabel ? html`<div class="abs click" style="left: 166px; top: 226px; width: 96px; text-align: center; font-size: 10px; color: ${tankColor};" @click=${this.info("tank_level")}>Silo · ${m.tankLabel}</div>` : ""}
            <div class="abs click" style="left: 174px; top: 350px; width: 80px; text-align: center;" @click=${this.info("boiler_temperature_pellet")}>
                <div class="cap" style="color: ${m.wood ? "#8a9aa0" : "#ffc98f"};">Granulés</div>
                <div class="num" style="font-size: 22px; font-weight: 500; color: ${m.wood ? "#8d9ca2" : "#ffffff"};">${show(m.tb, "°")}</div>
            </div>
            ${!m.wood ? html`
                <div class="abs lbl click" style="left: 152px; top: 499px; width: 124px; font-size: 12px;" @click=${this.info("firebox_temperature")}>Foyer <b style="color: ${fireColor(m.pelletFlame > 0)};">${show(m.firebox, " °C")}</b></div>
                <div class="abs lbl click" style="left: 114px; top: 516px; width: 200px; white-space: nowrap;" @click=${this.info("fire_sensor")}>Cellule <b style="color: #e7ecee;">${na ? "--" : m.fireText}</b> ·
                    <span style="color: ${cellOn ? "#ffd27a" : "#8a9aa0"};">${na ? "--" : (m.glow && !m.flameSeen ? "braise" : (m.flameSeen ? "flamme détectée" : "pas de flamme"))}</span></div>` : ""}

            <!-- Hydraulic labels -->
            <div class="abs lbl" style="left: 294px; top: 236px; width: 72px;">${this.pumpLabel("P1", m.p1, m.p1d)}</div>
            ${m.hasBuffer ? html`
                <div class="abs ts click" style="left: 384px; top: 182px; width: 110px;" @click=${this.info("buffer_tank_temparature_up")}>
                    <div class="num" style="font-size: 28px; line-height: 1;">${show(m.bt, "°")}</div><div style="font-size: 11px; margin-top: 2px;">haut</div>
                </div>
                <div class="abs ts cap" style="left: 384px; top: 324px; width: 110px; color: #e7ecee; opacity: .85;">Tampon</div>
                <div class="abs ts click" style="left: 384px; top: 444px; width: 110px;" @click=${this.info("buffer_tank_temparature_down")}>
                    <div class="num" style="font-size: 28px; line-height: 1;">${show(m.bb, "°")}</div><div style="font-size: 11px; margin-top: 2px;">bas</div>
                </div>` : ""}
            ${m.hasRoom ? html`
                <div class="abs click" style="left: 494px; top: 120px; width: 146px; display: flex; flex-direction: column; gap: 2px;" @click=${this.info("circuit_1_room_measured_temperature")}>
                    <div style="display: flex; align-items: center; gap: 5px; font-size: 11px; color: #a9b6bb;">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a9b6bb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${HOUSE_ICON}</svg>Maison</div>
                    <div style="display: flex; align-items: baseline; gap: 6px;">
                        <span class="num" style="font-size: 20px; line-height: 1.1;">${show(m.room, "°")}</span>
                        ${m.roomSet !== null ? html`<span style="font-size: 11px; color: #a9b6bb;">consigne ${m.roomSet}°</span>` : ""}
                    </div>
                </div>` : ""}
            ${m.hasRad ? html`
                ${m.hasP2 ? html`<div class="abs lbl" style="left: 484px; top: ${m.hasRoom ? 172 : 150}px; width: 110px;">${this.pumpLabel("P2", m.p2, m.p2d)}</div>` : ""}
                <div class="abs ts click" style="left: 550px; top: 274px; width: 78px;" @click=${this.info("circuit_1_flow_measured_temperature")}>
                    <div class="num" style="font-size: 24px; line-height: 1;">${show(m.dep, "°")}</div>
                    ${m.depSet !== null ? html`<div style="font-size: 10px; margin-top: 3px;">consigne ${m.depSet}°</div>` : ""}
                </div>` : ""}
            ${m.hasDhw ? html`
                ${m.hasP3 ? html`<div class="abs lbl" style="left: 504px; top: 414px; width: 40px;">P3</div>` : ""}
                <div class="abs ts click" style="left: 554px; top: 424px; width: 70px;" @click=${this.info("domestic_hot_water")}>
                    <div class="num" style="font-size: 24px; line-height: 1;">${show(m.dhw, "°")}</div><div style="font-size: 11px; margin-top: 2px;">ECS</div>
                </div>
                ${m.dhwSet !== null ? html`<div class="abs lbl click" style="left: 534px; top: 534px; width: 110px;" @click=${this.info("domestic_hot_water_target")}>consigne ${m.dhwSet}°</div>` : ""}` : ""}

            <!-- Phase stepper -->
            <div class="abs steps">
                ${m.phase >= 0 ? PHASES.map((label, i) => html`
                    ${i > 0 ? html`<div class="line"></div>` : ""}
                    <div class="st ${i < m.phase ? "done" : (i == m.phase ? "cur" : "")}"><span></span>${label}</div>`) : html`
                    <div style="color: #8a9aa0;">${m.stepsNote}</div>`}
            </div>

            <!-- Unavailable -->
            ${na ? html`
                <div class="abs veil">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a9b6bb" stroke-width="1.6" stroke-linecap="round"><path d="M2 8.8a15 15 0 0 1 20 0"></path><path d="M5.5 12.5a10 10 0 0 1 13 0"></path><path d="M9 16a5 5 0 0 1 6 0"></path><path d="M12 20v.01"></path><path d="M3 3l18 18"></path></svg>
                    <div class="num" style="font-size: 22px;">Chaudière indisponible</div>
                    <div style="font-size: 13px; color: #a9b6bb;">Aucune donnée reçue du module WiFi Centrometal${m.since ? " · depuis " + m.since : ""}</div>
                </div>` : ""}
        </div>
        </div>`
    }

    synopticPower(m) {
        if (!m.powerEnabled) {
            return html`
                <button type="button" class="pw dis" disabled title="${m.wood ? "Mode bois : commande sur la chaudière (option allow_power_in_wood pour l'activer)" : "Commande indisponible"}" aria-label="Commande indisponible">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#56666c" stroke-width="2" stroke-linecap="round">${POWER_ICON}</svg>
                </button>`
        }
        if (m.off) {
            return html`
                <button type="button" class="pw off" aria-label="Allumer la chaudière" @click=${() => this.askPower(m)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8fe0a8" stroke-width="2" stroke-linecap="round">${POWER_ICON}</svg>Allumer
                </button>`
        }
        return html`
            <button type="button" class="pw on" aria-label="Éteindre la chaudière" @click=${() => this.askPower(m)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f5a261" stroke-width="2" stroke-linecap="round">${POWER_ICON}</svg>
            </button>`
    }

    synopticGauge(label, value, entity) {
        const pct = value === null ? 0 : Math.max(0, Math.min(100, value))
        return html`
            <div class="click" style="display: flex; flex-direction: column; gap: 3px;" @click=${this.info(entity)}>
                <div style="display: flex; justify-content: space-between; font-size: 11px;"><span style="color: #a9b6bb;">${label}</span><span>${show(value, " %")}</span></div>
                <div class="gauge"><div style="width: ${pct}%;"></div></div>
            </div>`
    }

    // B · Dashboard -----------------------------------------------------

    powerButton(m) {
        return html`
            <button type="button" class="pw" ?disabled=${!m.powerEnabled} aria-label="${m.off ? "Allumer la chaudière" : "Éteindre la chaudière"}"
                title="${m.powerEnabled ? "" : (m.wood ? "Mode bois : commande sur la chaudière (option allow_power_in_wood pour l'activer)" : "Commande indisponible")}"
                @click=${() => this.askPower(m)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">${POWER_ICON}</svg>
            </button>`
    }

    messages(m) {
        if (this.confirm) {
            return html`
                <div class="msg confirm">
                    <span class="grow">${this.confirmText(m)}</span>
                    <button type="button" class="btn" @click=${() => this.cancelConfirm()}>Annuler</button>
                    <button type="button" class="btn primary" @click=${() => this.applyConfirm(m)}>${this.confirmLabel(m)}</button>
                </div>`
        }
        if (m.unavailable) {
            return html`<div class="msg danger"><span class="grow">Chaudière indisponible — aucune donnée reçue${m.since ? " depuis " + m.since : ""}</span></div>`
        }
        if (m.banner) {
            return html`
                <div class="msg ${m.banner.kind}">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">${ALERT_ICON}</svg>
                    <span class="grow">${m.banner.text}</span>
                </div>`
        }
        return ""
    }

    dashboard(m) {
        const pct = m.active === null ? 0 : Math.max(0, Math.min(1, m.active / 100))
        const levels = { "Empty": 0, "Reserve": 1, "Full": 3 }[m.tank]
        return html`
        <div class="cb db">
            <div class="head">
                <div class="ico"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round">${FIRE_ICON}</svg></div>
                <div class="grow">
                    <div class="title">Chaudière</div>
                    <div class="sub">BioTec Plus · source ${m.sourceLabel}</div>
                </div>
                <div class="state click" @click=${this.info("boiler_state")}><span class="dot" style="background: ${m.dot};"></span>${m.state}</div>
                ${this.powerButton(m)}
            </div>
            ${this.messages(m)}

            <div class="tile hero">
                <div class="ring click" @click=${this.info(m.wood ? "boiler_temperature_wood" : "boiler_temperature_pellet")}>
                    <svg width="160" height="160" viewBox="0 0 180 180">
                        <circle cx="90" cy="90" r="70" fill="none" stroke="var(--cb-line)" stroke-width="14" stroke-linecap="round" stroke-dasharray="329.9 439.8" transform="rotate(135 90 90)"></circle>
                        <circle cx="90" cy="90" r="70" fill="none" stroke="var(--cb-heat)" stroke-width="14" stroke-linecap="round" stroke-dasharray="${329.9 * pct} 439.8" transform="rotate(135 90 90)"></circle>
                    </svg>
                    <div><b class="num">${show(m.active, "°")}</b><span class="sub">Chaudière ${m.sourceLabel}</span></div>
                </div>
                <div class="facts">
                    <div class="sub">Source active</div>
                    <div class="src">
                        <div class="${m.wood ? "on" : ""} click" @click=${this.info("boiler_temperature_wood")}>Bois · ${show(m.tw, "°")}</div>
                        ${m.pelletEnabled ? html`
                            <div class="click" style="outline: 1px dashed var(--cb-heat); outline-offset: -1px;" title="Passer en granulés" @click=${() => this.askPellet(m)}>Passer en granulés</div>` : html`
                            <div class="${m.wood ? "" : "on"} click" style="${m.wood && m.take == 1 ? "color: var(--cb-heat); font-weight: 600;" : ""}"
                                @click=${this.info(m.wood && m.take == 1 ? "take_over" : "boiler_temperature_pellet")}>${m.wood && m.take == 1 ? "Prise en charge…" : "Granulés · " + show(m.tb, "°")}</div>`}
                    </div>
                    ${m.hasOutdoor ? html`<div class="kv click" @click=${this.info("outdoor_temperature")}><span>Extérieur</span><span>${show(m.outdoor, " °C")}</span></div>` : ""}
                    ${m.hasRoom ? html`<div class="kv click" @click=${this.info("circuit_1_room_measured_temperature")}><span>Maison</span><span>${show(m.room, " °C")}${m.roomSet !== null ? " / " + m.roomSet + " °C" : ""}</span></div>` : ""}
                    ${m.mode ? html`<div class="kv click" @click=${this.info("operation_mode")}><span>Régime</span><span>${m.mode}</span></div>` : ""}
                    <div class="kv click" @click=${this.info("control_mode")}><span>Accès chaudière</span><span>${m.locked ? "Désactivé" : "Autorisé"}</span></div>
                </div>
            </div>

            ${m.hasBuffer || m.hasDhw || m.hasRad ? html`
            <div class="two">
                ${m.hasBuffer ? html`
                <div class="tile buf">
                    <div class="thermo" style="background: linear-gradient(${tempColor(m.bt)}, ${tempColor(m.bb)});"></div>
                    <div style="display: flex; flex-direction: column; justify-content: space-between;">
                        <div class="cap">Ballon tampon</div>
                        <div class="click" @click=${this.info("buffer_tank_temparature_up")}><div class="n num" style="color: var(--cb-heat);">${show(m.bt, "°")}</div><div class="sub">haut</div></div>
                        <div class="click" @click=${this.info("buffer_tank_temparature_down")}><div class="n num" style="color: var(--cb-cold);">${show(m.bb, "°")}</div><div class="sub">bas</div></div>
                    </div>
                </div>` : ""}
                ${m.hasRad ? html`
                <div class="tile click" style="justify-content: space-between;" @click=${this.info("circuit_1_flow_measured_temperature")}>
                    <div class="cap">Radiateurs</div>
                    <div class="xl num">${show(m.dep, "°")}</div>
                    <div class="sub">${m.depSet !== null ? "consigne " + m.depSet + "° · " : ""}${m.hasP2 ? this.pumpLabel("P2", m.p2, m.p2d) : ""}</div>
                </div>` : ""}
                ${m.hasDhw ? html`
                <div class="tile click" style="justify-content: space-between;" @click=${this.info("domestic_hot_water")}>
                    <div class="cap">Eau chaude<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">${DROP_ICON}</svg></div>
                    <div class="xl num">${show(m.dhw, "°")}</div>
                    <div class="sub">${m.dhwSet !== null ? "consigne " + m.dhwSet + "° · " : ""}${m.hasP3 ? this.pumpLabel("P3", m.p3, m.p3d) : ""}</div>
                </div>` : ""}
            </div>` : ""}

            <div class="tile">
                <div class="cap"><span class="h">Combustion</span>
                    <span style="display: flex; gap: 6px; flex-wrap: wrap;">
                        ${m.glow ? html`<span class="badge">Braise</span>` : ""}
                        ${m.doser ? html`<span class="badge ok">Doseur actif</span>` : ""}
                    </span>
                </div>
                <div class="stats">
                    <div class="click" @click=${this.info("firebox_temperature")}><span>Foyer</span><b class="n num">${show(m.firebox, "°")}</b></div>
                    <div class="click" @click=${this.info("flue_gas")}><span>Fumées</span><b class="n num">${show(m.flue, "°")}</b></div>
                    ${m.lambda !== null ? html`<div class="click" @click=${this.info("lambda_sensor")}><span>O₂ (λ)</span><b class="n num">${m.lambda} %</b></div>` : ""}
                    <div class="click" @click=${this.info("fire_sensor")}><span>Photocellule</span><b class="n num">${m.fireText}</b></div>
                </div>
            </div>

            <div class="tile">
                <div class="cap"><span class="h">Air &amp; circulation</span>
                    <span class="click" style="display: flex; align-items: center; gap: 6px;" @click=${this.info("fan")}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${m.fan ? "var(--cb-cold)" : "currentColor"}" stroke-width="2" stroke-linecap="round"><g class="${m.fan ? "spin" : ""}">${FAN_ICON}</g></svg>
                        Ventilateur · ${m.fanText}
                    </span>
                </div>
                ${this.dashboardGauge("Air primaire", m.airP, "air_flow_engine_primary")}
                ${this.dashboardGauge("Air secondaire", m.airS, "air_flow_engine_secondary")}
                <div class="two">
                    ${this.dashboardPump("Pompe P1", m.p1, m.p1d, "boiler_pump")}
                    ${m.hasP2 ? this.dashboardPump("Pompe P2", m.p2, m.p2d, "second_pump") : ""}
                    ${m.hasP3 ? this.dashboardPump("Pompe P3", m.p3, m.p3d, "third_pump") : ""}
                </div>
            </div>

            <div class="two">
                ${m.tank !== null ? html`
                <div class="tile click" @click=${this.info("tank_level")}>
                    <div class="cap">Réserve granulés</div>
                    <div class="n num">${{ "Full": "Pleine", "Reserve": "Réserve", "Empty": "Vide" }[m.tank] || m.tank}</div>
                    <div class="lvl">${[0, 1, 2].map((i) => html`<div class="${i < levels ? "on" : ""}"></div>`)}</div>
                </div>` : ""}
                <div class="tile click" style="gap: 4px;" @click=${this.info("take_over")}>
                    <div class="cap">Prise en charge</div>
                    ${TAKE_LABELS.map((label, i) => html`<div class="opt ${!m.takeAllowed ? "no" : (m.take == i ? "on" : "")}">${label}</div>`)}
                </div>
            </div>
        </div>`
    }

    dashboardGauge(label, value, entity) {
        const pct = value === null ? 0 : Math.max(0, Math.min(100, value))
        return html`
            <div class="click" style="display: flex; flex-direction: column; gap: 6px;" @click=${this.info(entity)}>
                <div class="kv" style="font-size: 13px;"><span>${label}</span><span>${show(value, " %")}</span></div>
                <div class="gauge"><div style="width: ${pct}%;"></div></div>
            </div>`
    }

    dashboardPump(label, running, demand, entity) {
        return html`
            <div class="pump click" @click=${this.info(entity)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="${running ? "var(--cb-cold)" : "var(--cb-muted)"}"><path class="${running ? "spin" : ""}" d="M8 5l11 7-11 7Z"></path></svg>
                <div><b>${label}</b><span>${running ? "En marche" : "Arrêt"}${demand ? " · demande" : ""}</span></div>
            </div>`
    }

    // C · Compact card and tile ----------------------------------------

    compact(m) {
        const lit = m.pelletFlame > 0 || m.woodFlame > 0
        return html`
        <div class="cb cp">
            <div class="head">
                <svg width="36" height="44" viewBox="-20 -82 40 84" class="click" @click=${this.info(m.wood ? "firebox_temperature" : "fire_sensor")}>
                    ${lit ? svg`<g class="flicker">${FLAME}</g>` : svg`<g opacity="0.25">${FLAME}</g>`}
                </svg>
                <div class="grow">
                    <div class="temp click" @click=${this.info(m.wood ? "boiler_temperature_wood" : "boiler_temperature_pellet")}><b class="num">${show(m.active, "°")}</b><span class="sub">chaudière ${m.sourceLabel}</span></div>
                    <div class="sub click" @click=${this.info("boiler_state")}>${m.state}${m.hasOutdoor ? " · " + show(m.outdoor, " °C") + " ext." : ""}</div>
                </div>
                ${this.powerButton(m)}
            </div>
            ${this.messages(m)}

            <!-- Combustion -->
            <div class="grid">
                <div class="box click" @click=${this.info("firebox_temperature")}><span>Foyer</span><b class="num" style="color: ${lit ? "#e0892f" : "inherit"};">${show(m.firebox, "°")}</b></div>
                <div class="box click" @click=${this.info("flue_gas")}><span>Fumées${m.lambda !== null ? " · O₂ " + m.lambda + " %" : ""}</span><b class="num">${show(m.flue, "°")}</b></div>
                <div class="box click" @click=${this.info("fan")}>
                    <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><g class="${m.fan ? "spin" : ""}">${FAN_ICON}</g></svg>Ventilateur</span>
                    <b class="num">${m.fanText}</b>
                </div>
            </div>

            <!-- Buffer -->
            ${m.hasBuffer ? html`
            <div class="click" style="display: flex; flex-direction: column; gap: 6px;" @click=${this.info("buffer_tank_temparature_up")}>
                <div class="cap"><span>Tampon · bas ${show(m.bb, "°")}</span><span>${this.pumpLabel("P1", m.p1, m.p1d)} · haut ${show(m.bt, "°")}</span></div>
                <div class="bar" style="background: linear-gradient(90deg, ${tempColor(m.bb)}, ${tempColor(m.bt)});"></div>
            </div>` : ""}

            <!-- Radiators + house -->
            ${m.hasRad || m.hasRoom ? html`
            <div class="grid">
                ${m.hasRad ? html`
                <div class="box click" @click=${this.info("circuit_1_flow_measured_temperature")}>
                    <span>Radiateurs${m.hasP2 ? " · P2" : ""}</span>
                    <span><b class="num">${show(m.dep, "°")}</b> ${m.depSet !== null ? html`<span class="set">consigne ${m.depSet}°</span>` : ""}</span>
                </div>` : ""}
                ${m.hasRoom ? html`
                <div class="box click" @click=${this.info("circuit_1_room_measured_temperature")}>
                    <span>Maison</span>
                    <span><b class="num">${show(m.room, "°")}</b> ${m.roomSet !== null ? html`<span class="set">consigne ${m.roomSet}°</span>` : ""}</span>
                </div>` : ""}
            </div>` : ""}

            <!-- DHW -->
            ${m.hasDhw ? html`
            <div class="box row click" @click=${this.info("domestic_hot_water")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--cb-muted)" stroke-width="1.8" stroke-linecap="round">${DROP_ICON}</svg>
                <span class="sub" style="flex-grow: 1; font-size: 12px;">Eau chaude sanitaire${m.hasP3 ? " · P3" : ""}</span>
                <b class="num">${show(m.dhw, "°")}</b>
                ${m.dhwSet !== null ? html`<span class="set">consigne ${m.dhwSet}°</span>` : ""}
            </div>` : ""}
        </div>`
    }

    tile(m) {
        return html`
        <div class="cb tl click" @click=${this.info("boiler_state")}>
            <div class="ico" style="width: 40px; height: 40px; border-radius: 12px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round">${FIRE_ICON}</svg>
            </div>
            <div class="grow">
                <b>Chaudière ${m.sourceLabel} · ${show(m.active, " °C")}</b>
                <span class="sub"><span class="dot" style="display: inline-block; margin-right: 6px; background: ${m.dot};"></span>${m.state}${m.unavailable ? "" : " · foyer " + show(m.firebox, "°")}</span>
            </div>
            ${m.hasRad ? html`<span class="chip">Rad. ${show(m.dep, "°")}</span>` : ""}
            ${m.hasDhw ? html`<span class="chip">ECS ${show(m.dhw, "°")}</span>` : ""}
        </div>`
    }
}
