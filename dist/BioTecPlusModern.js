import {
    html,
    svg,
} from "https://unpkg.com/lit-element@2.0.1/lit-element.js?module";

// Modern layouts of the BioTec Plus card: "synoptic" (default), "dashboard", "compact" and "tile".
// Everything is drawn in SVG/CSS from BioTecPlusDisplay.values; clicking a value opens the HA more-info dialog.

const COLD = [47, 120, 184]
const HOT = [233, 128, 58]
const GREY = "#3a474d"

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

const FLAME = svg`
    <path d="M0 -80 C 15 -60, 24 -44, 18 -22 C 14 -8, 6 0, 0 0 C -6 0, -16 -8, -18 -22 C -22 -40, -12 -56, 0 -80 Z" fill="#f08a3c"></path>
    <path d="M0 -48 C 8 -36, 10 -26, 7 -16 C 5 -9, 2 -6, 0 -6 C -3 -6, -7 -10, -8 -16 C -10 -26, -6 -36, 0 -48 Z" fill="#ffd27a"></path>`

const POWER_ICON = svg`<path d="M12 3v8"></path><path d="M6.3 7.3a8 8 0 1 0 11.4 0"></path>`
const FAN_ICON = svg`
    <path d="M12 12c0-4 1-8 4-8 2 0 3 2 1 4l-5 4Z"></path><path d="M12 12c4 0 8 1 8 4 0 2-2 3-4 1l-4-5Z"></path>
    <path d="M12 12c0 4-1 8-4 8-2 0-3-2-1-4l5-4Z"></path><path d="M12 12c-4 0-8-1-8-4 0-2 2-3 4-1l4 5Z"></path>`
const FIRE_ICON = svg`<path d="M12 3c2 3.5 6 5.5 6 10a6 6 0 0 1-12 0c0-2.5 1.2-4 2.5-5 .3 2 1.3 3 2.5 3 0-3 0-5.5 1-8Z"></path>`
const RADIATOR_ICON = svg`<rect x="3" y="6" width="18" height="12" rx="2"></rect><path d="M8 6v12M12 6v12M16 6v12"></path>`
const TAP_ICON = svg`<path d="M4 8h10a4 4 0 0 1 4 4v1"></path><path d="M8 5v3"></path><path d="M18 17v.01M16 20v.01M20 20v.01"></path>`
const ALERT_ICON = svg`<circle cx="12" cy="12" r="9"></circle><path d="M12 8v5M12 16v.01"></path>`

const STYLE = html`<style>
    .cb-wrap { position: relative; overflow: hidden; border-radius: var(--ha-card-border-radius, 12px); }
    .cb { font-family: var(--ha-font-family-body, var(--paper-font-body1_-_font-family, Roboto, sans-serif)); font-variant-numeric: tabular-nums; }
    .cb button { font: inherit; }
    .cb .click { cursor: pointer; }
    .cb .abs { position: absolute; }
    .cb .flow { stroke-dasharray: 6 10; animation: cb-flow .9s linear infinite; }
    .cb .spin { transform-box: fill-box; transform-origin: center; animation: cb-spin 1.4s linear infinite; }
    .cb .flicker { transform-box: fill-box; transform-origin: 50% 100%; animation: cb-flicker 1.6s ease-in-out infinite; }
    @keyframes cb-flow { to { stroke-dashoffset: -16; } }
    @keyframes cb-spin { to { transform: rotate(360deg); } }
    @keyframes cb-flicker { 0%, 100% { transform: scale(1, 1); } 50% { transform: scale(1.05, .86); } }
    @media (prefers-reduced-motion: reduce) { .cb .flow, .cb .spin, .cb .flicker { animation: none; } }

    /* Synoptic (fixed 960x600, scaled to the card width) */
    .syn { position: absolute; left: 0; top: 0; width: 960px; height: 600px; transform-origin: 0 0; background: #0e1417; color: #e7ecee; }
    .syn .chip { display: flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 999px; background: #1a2529; border: 1px solid #2a383e; font-size: 13px; }
    .syn .dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .syn .pill { display: flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 10px; background: #1a2529; font-size: 13px; color: #cfd8db; }
    .syn .pw { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; padding: 0; cursor: pointer; }
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
    .syn .cap { font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: #8a9aa0; }
    .syn .lbl { font-size: 11px; color: #a9b6bb; text-align: center; }
    .syn .big { font-size: 28px; font-weight: 600; line-height: 1; }
    .syn .ts { text-shadow: 0 1px 6px rgba(0, 0, 0, .4); }
    .syn .panel { left: 664px; top: 118px; width: 272px; height: 436px; box-sizing: border-box; padding: 18px; border-radius: 16px; background: #141d21; border: 1px solid #223035; display: flex; flex-direction: column; gap: 10px; }
    .syn .row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
    .syn .row > span:first-child { color: #a9b6bb; display: flex; align-items: center; gap: 8px; }
    .syn .val { font-size: 15px; font-weight: 500; }
    .syn .sep { height: 1px; background: #223035; margin: 4px 0; }
    .syn .gauge { height: 6px; border-radius: 3px; background: #223035; }
    .syn .gauge > div { height: 6px; border-radius: 3px; background: #4aa3df; }
    .syn .seg { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 4px; padding: 4px; border-radius: 10px; background: #0e1417; font-size: 12px; text-align: center; }
    .syn .seg > div { padding: 6px 0; border-radius: 7px; color: #a9b6bb; }
    .syn .seg > .on { background: #f08a3c; color: #1b1107; font-weight: 600; }
    .syn .seg.no > div { color: #56666c; text-decoration: line-through; }
    .syn .badge { font-size: 11px; padding: 2px 8px; border-radius: 999px; background: #3a2616; color: #ffc98f; }
    .syn .strip { left: 24px; top: 564px; width: 912px; height: 26px; display: flex; align-items: center; gap: 20px; font-size: 12px; color: #a9b6bb; }
    .syn .strip b { color: #e7ecee; font-weight: 500; }
    .syn .veil { left: 0; top: 70px; width: 960px; height: 530px; background: rgba(14, 20, 23, .78); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; }

    /* Dashboard / compact / tile: fluid, follow the HA theme */
    .db, .cp, .tl { --cb-bg: var(--ha-card-background, var(--card-background-color, #fff)); --cb-tile: var(--secondary-background-color, #f3f0ea);
        --cb-text: var(--primary-text-color, #1d2327); --cb-muted: var(--secondary-text-color, #5d6870); --cb-line: var(--divider-color, #e5e0d8);
        --cb-heat: #d4611e; --cb-cold: #2f78b8; --cb-ok: #2f8a4c;
        color: var(--cb-text); }
    .db { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
    .db .tile, .cp .tile { background: var(--cb-tile); border-radius: 16px; padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; }
    .db .head, .cp .head, .tl { display: flex; align-items: center; gap: 12px; }
    .db .ico, .tl .ico { width: 44px; height: 44px; border-radius: 14px; background: rgba(212, 97, 30, .15); color: var(--cb-heat); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .db .title { font-size: 18px; font-weight: 600; }
    .db .sub, .cp .sub, .tl .sub { font-size: 13px; color: var(--cb-muted); }
    .db .grow, .cp .grow, .tl .grow { flex-grow: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
    .db .state, .tl .state { display: flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; background: var(--cb-tile); font-size: 13px; font-weight: 500; white-space: nowrap; }
    .db .dot, .cp .dot, .tl .dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .db .pw, .cp .pw { width: 44px; height: 44px; border-radius: 50%; border: none; background: var(--cb-text); color: var(--cb-bg); display: flex; align-items: center; justify-content: center; padding: 0; cursor: pointer; flex-shrink: 0; }
    .db .pw[disabled], .cp .pw[disabled] { opacity: .35; cursor: not-allowed; }
    .db .msg, .cp .msg { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: 12px; font-size: 14px; }
    .db .msg.warn, .cp .msg.warn { background: rgba(212, 150, 30, .18); }
    .db .msg.danger, .cp .msg.danger { background: rgba(229, 72, 77, .18); }
    .db .msg.confirm, .cp .msg.confirm { background: var(--cb-tile); }
    .db .msg .grow, .cp .msg .grow { font-weight: 500; }
    .db .btn, .cp .btn { height: 40px; padding: 0 14px; border-radius: 10px; border: 1px solid var(--cb-line); background: var(--cb-bg); color: var(--cb-text); cursor: pointer; font-size: 14px; }
    .db .btn.primary, .cp .btn.primary { border: none; background: var(--cb-heat); color: #fff; font-weight: 600; }
    .db .tile.hero { flex-direction: row; gap: 16px; align-items: center; flex-wrap: wrap; }
    .db .ring { position: relative; width: 160px; height: 160px; flex-shrink: 0; margin: 0 auto; }
    .db .ring > div { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .db .ring b { font-size: 40px; font-weight: 600; line-height: 1; }
    .db .facts { flex: 1 1 180px; display: flex; flex-direction: column; gap: 10px; }
    .db .kv { display: flex; justify-content: space-between; gap: 8px; font-size: 14px; }
    .db .kv > span:first-child { color: var(--cb-muted); }
    .db .src { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px; padding: 4px; border-radius: 12px; background: var(--cb-bg); font-size: 13px; text-align: center; }
    .db .src > div { padding: 7px 0; border-radius: 9px; color: var(--cb-muted); }
    .db .src > .on { background: var(--cb-heat); color: #fff; font-weight: 600; }
    .db .two { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
    .db .cap, .cp .cap { font-size: 13px; color: var(--cb-muted); display: flex; justify-content: space-between; align-items: center; gap: 8px; }
    .db .h { font-size: 15px; font-weight: 600; color: var(--cb-text); }
    .db .n, .cp .n { font-size: 24px; font-weight: 600; line-height: 1.1; }
    .db .xl { font-size: 44px; font-weight: 600; line-height: 1; }
    .db .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(90px, 1fr)); gap: 8px; }
    .db .stats > div, .cp .stats > div { display: flex; flex-direction: column; gap: 2px; }
    .db .stats span, .cp .stats span { font-size: 12px; color: var(--cb-muted); }
    .db .badge { font-size: 12px; padding: 3px 9px; border-radius: 999px; background: rgba(212, 97, 30, .15); color: var(--cb-heat); }
    .db .badge.ok { background: rgba(47, 138, 76, .15); color: var(--cb-ok); }
    .db .gauge, .cp .gauge { height: 8px; border-radius: 4px; background: var(--cb-line); overflow: hidden; }
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
    .cp .temp b { font-size: 34px; font-weight: 600; line-height: 1; }
    .cp .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 8px; }
    .cp .stats > div { padding: 10px; border-radius: 12px; background: var(--cb-tile); }
    .cp .stats b { font-size: 18px; }
    .cp .gauge.buf { height: 10px; border-radius: 5px; }
    .tl { padding: 12px 14px; }
    .tl .chip { font-size: 12px; padding: 4px 10px; border-radius: 999px; background: var(--cb-tile); white-space: nowrap; }
    .tl b { font-size: 14px; }
</style>`

export class BioTecPlusModern {

    constructor(display) {
        this.d = display
        this.confirm = false
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

        const unavailable = !has("boiler_state")
        const wood = v["wood_pellet_mode"] == 0          // 0 = wood, 1 = pellets
        const controlMode = num("control_mode")
        const locked = controlMode == 2
        const off = v["boiler_state"] == "OFF"

        // Photocell of the pellet burner: < 1000 kOhm = flame seen, lower = brighter
        const fire = num("fire_sensor")
        const pelletFlame = (fire === null || fire >= 1000) ? 0 : (fire < 100 ? 1 : (fire < 400 ? 0.75 : 0.5))
        // Wood fire intensity from the firebox temperature (wood mode only)
        const firebox = temp("firebox_temperature", 1000)
        const woodFlame = (!wood || firebox === null) ? 0 : (firebox > 300 ? 1 : (firebox > 150 ? 0.7 : (firebox > 80 ? 0.45 : 0)))

        const lambda = num("lambda_sensor")
        const fan = has("fan") && v["fan"] != 0
        const fanValue = num("fan")
        const tank = has("tank_level") ? v["tank_level"] : null
        const opMode = num("operation_mode")
        const take = num("take_over")

        let banner = null
        if (locked) {
            banner = { kind: "danger", text: "Accès à la chaudière temporairement désactivé" }
        } else if (tank == "Empty") {
            banner = { kind: "danger", text: "Silo à granulés vide" }
        } else if (tank == "Reserve") {
            banner = { kind: "warn", text: "Réserve de granulés atteinte — pensez à remplir le silo" }
        }

        const tw = temp("boiler_temperature_wood")
        const tb = temp("boiler_temperature_pellet")

        return {
            unavailable: unavailable,
            state: unavailable ? "Indisponible" : v["boiler_state"],
            off: off,
            dot: (unavailable || off) ? "#8a979c" : (locked ? "#e5484d" : "#6fd08c"),
            wood: wood,
            sourceLabel: wood ? "bois" : "granulés",
            tw: tw,
            tb: tb,
            active: wood ? tw : tb,
            firebox: firebox,
            flue: temp("flue_gas", 1000),
            outdoor: temp("outdoor_temperature"),
            bt: temp("buffer_tank_temparature_up"),
            bb: temp("buffer_tank_temparature_down"),
            dhw: temp("domestic_hot_water"),
            hasBuffer: d.hexBitIsClear(v["configuration"], 11),
            hasDhw: d.hexBitIsSet(v["configuration"], 5),
            hasOutdoor: "outdoor_temperature" in v,
            fire: fire,
            fireText: fire === null ? "--" : (fire >= 1000 ? ">1M" : fire + " k"),
            pelletFlame: pelletFlame,
            woodFlame: woodFlame,
            glow: v["glow"] == 1,
            lambda: (lambda !== null && lambda > 0.1) ? (lambda < 25.4 ? lambda : "-.-") : null,
            fan: fan,
            fanText: !has("fan") ? "--" : (fan ? (fanValue !== null && fanValue > 1 ? fanValue + this.unit("fan") : "En marche") : "Arrêt"),
            airP: num("air_flow_engine_primary"),
            airS: num("air_flow_engine_secondary"),
            doser: has("pellet_dispenzer") && v["pellet_dispenzer"] != 0,
            p1: v["boiler_pump"] == 1,
            p1d: v["boiler_pump_demand"] == 1,
            hasP2: "second_pump" in v,
            p2: v["second_pump"] == 1,
            p2d: v["second_pump_demand"] == 1,
            tank: tank,
            tankLabel: { "Full": "plein", "Reserve": "réserve", "Empty": "vide" }[tank] || null,
            mode: opMode === null ? null : (opMode == 1 ? "Eau chaude" : "Chauffage"),
            take: take,
            takeAllowed: wood && controlMode == 1,
            locked: locked,
            powerEnabled: !unavailable && !wood && !locked && ("boiler_switch" in d.parameters),
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
        this.confirm = true
        this.refresh()
    }

    cancelPower() {
        this.confirm = false
        this.refresh()
    }

    applyPower(m) {
        this.d.card.hass.callService("switch", m.off ? "turn_on" : "turn_off", { entity_id: this.d.parameters["boiler_switch"] })
        this.confirm = false
        this.refresh()
    }

    // ---------------------------------------------------------------- render

    render(layout) {
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
        return m.off ? "Allumer la chaudière ?" : "Éteindre la chaudière ?"
    }

    // A · Synoptic ------------------------------------------------------

    synoptic(m) {
        const width = this.d.card.width || this.d.card.offsetWidth || 960
        const scale = width / 960
        const id = this.d.card_id
        const hot = m.p1 ? "#f08a3c" : GREY
        const cold = m.p1 ? "#4aa3df" : GREY
        const dhwHot = m.p2 ? "#f08a3c" : GREY
        const dhwCold = m.p2 ? "#4aa3df" : GREY
        const tankFill = { "Full": [84, 44], "Reserve": [112, 16], "Empty": [128, 0] }[m.tank] || [84, 44]
        const tankStroke = m.tank == "Reserve" ? "#b8892f" : (m.tank == "Empty" ? "#c2474d" : "#2c3a40")
        const takeLabels = ["Inactive", "Granulés ON", "Granulés OFF"]

        return html`
        <div class="cb cb-wrap" style="height: ${600 * scale}px;">
        <div class="syn" style="transform: scale(${scale});">

            <!-- Top bar -->
            <div class="abs" style="left: 24px; right: 24px; top: 18px; height: 48px; display: flex; align-items: center; gap: 16px;">
                <div style="font-size: 20px; font-weight: 600;">BioTec Plus</div>
                <div class="chip click" @click=${this.info("boiler_state")}>
                    <span class="dot" style="background: ${m.dot};"></span>
                    <span>${m.state}${m.unavailable || m.off ? "" : " · " + m.sourceLabel}</span>
                </div>
                <div style="flex-grow: 1;"></div>
                ${m.hasOutdoor ? html`
                    <div class="click" style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: #a9b6bb;" @click=${this.info("outdoor_temperature")}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a9b6bb" stroke-width="1.8" stroke-linecap="round"><path d="M14 14.8V5a2 2 0 1 0-4 0v9.8a4 4 0 1 0 4 0Z"></path></svg>
                        <span>Extérieur</span>
                        <span style="font-size: 16px; color: #e7ecee;">${show(m.outdoor, " °C")}</span>
                    </div>` : ""}
                ${m.mode ? html`
                    <div class="pill click" @click=${this.info("operation_mode")}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#cfd8db" stroke-width="1.8" stroke-linecap="round">${m.mode == "Chauffage" ? RADIATOR_ICON : TAP_ICON}</svg>
                        <span>${m.mode}</span>
                    </div>` : ""}
                ${this.synopticPower(m)}
            </div>

            <!-- Banner / power confirmation -->
            ${this.confirm ? html`
                <div class="abs bar-msg confirm">
                    <span style="flex-grow: 1;">${this.confirmText(m)}</span>
                    <button type="button" class="btn" @click=${() => this.cancelPower()}>Annuler</button>
                    <button type="button" class="btn primary" @click=${() => this.applyPower(m)}>${m.off ? "Allumer" : "Éteindre"}</button>
                </div>` : (m.banner ? html`
                <div class="abs bar-msg ${m.banner.kind}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">${ALERT_ICON}</svg>
                    <span>${m.banner.text}</span>
                </div>` : "")}

            <!-- Flue gas and fan, above the boiler on the left -->
            ${this.confirm || m.banner ? "" : html`
                <div class="abs" style="left: 24px; top: 76px; height: 34px; display: flex; align-items: center; gap: 22px;">
                    <div class="click" style="display: flex; align-items: baseline; gap: 7px;" @click=${this.info("flue_gas")}>
                        <span style="font-size: 12px; color: #8e9ea4;">Fumées</span>
                        <span style="font-size: 19px; font-weight: 600;">${show(m.flue, " °C")}</span>
                    </div>
                    <div class="click" style="display: flex; align-items: center; gap: 7px;" @click=${this.info("fan")}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${m.fan ? "#4aa3df" : "#56666c"}" stroke-width="2" stroke-linecap="round"><g class="${m.fan ? "spin" : ""}">${FAN_ICON}</g></svg>
                        <span style="font-size: 12px; color: #8e9ea4;">Ventilateur</span>
                        <span style="font-size: 19px; font-weight: 600;">${m.fanText}</span>
                    </div>
                </div>`}

            <!-- Schematic -->
            <svg class="abs" width="616" height="436" viewBox="0 0 616 436" style="left: 24px; top: 118px;">
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

                <!-- Wood chamber -->
                <g opacity="${m.wood ? 1 : 0.5}" class="click" @click=${this.info("boiler_temperature_wood")}>
                    <rect x="16" y="60" width="104" height="350" rx="14" fill="#151e22" stroke="${m.wood ? "#f08a3c" : "#26343a"}" stroke-width="1.5"></rect>
                    <rect x="30" y="80" width="76" height="110" rx="8" fill="none" stroke="#2c3a40" stroke-width="1.5"></rect>
                    <rect x="30" y="300" width="76" height="40" rx="6" fill="none" stroke="#2c3a40" stroke-width="1.5"></rect>
                    <rect x="30" y="352" width="76" height="44" rx="6" fill="none" stroke="#2c3a40" stroke-width="1.5"></rect>
                </g>

                <!-- Firebox temperature (A) and wood air flaps (B primary, C secondary) -->
                <g class="click" @click=${this.info("firebox_temperature")} opacity="${m.wood ? 1 : 0.5}">
                    <text x="68" y="126" text-anchor="middle" fill="#8e9ea4" font-size="11">Foyer</text>
                    <text x="68" y="152" text-anchor="middle" fill="#e7ecee" font-size="22" font-weight="600">${show(m.firebox, "°")}</text>
                </g>
                <g class="click" @click=${this.info("air_flow_engine_primary")} opacity="${m.wood ? 1 : 0.5}">
                    <text x="36" y="316" fill="#8e9ea4" font-size="10">Primaire</text>
                    <text x="100" y="333" text-anchor="end" fill="#e7ecee" font-size="15" font-weight="600">${show(m.airP, " %")}</text>
                </g>
                <g class="click" @click=${this.info("air_flow_engine_secondary")} opacity="${m.wood ? 1 : 0.5}">
                    <text x="36" y="370" fill="#8e9ea4" font-size="10">Secondaire</text>
                    <text x="100" y="388" text-anchor="end" fill="#e7ecee" font-size="15" font-weight="600">${show(m.airS, " %")}</text>
                </g>
                ${m.glow ? svg`<circle cx="68" cy="330" r="44" fill="url(#${id}_glow)" class="click" @click=${this.info("glow")}></circle>` : ""}
                ${m.woodFlame > 0 ? svg`
                    <circle cx="68" cy="270" r="${24 + 30 * m.woodFlame}" fill="url(#${id}_glow)"></circle>
                    <g transform="translate(68 300) scale(${0.8 * m.woodFlame})"><g class="flicker">${FLAME}</g></g>` : ""}

                <!-- Pellet chamber -->
                <g opacity="${m.wood ? 0.5 : 1}">
                    <rect x="128" y="24" width="124" height="386" rx="14" fill="#18242a" stroke="${!m.wood && !m.off ? "#f08a3c" : "#2c3a40"}" stroke-width="1.5"></rect>
                    <rect x="142" y="40" width="96" height="92" rx="10" fill="#10181b" stroke="${tankStroke}" stroke-width="1.5" class="click" @click=${this.info("tank_level")}></rect>
                    ${m.tank !== null ? svg`<rect x="146" y="${tankFill[0]}" width="88" height="${tankFill[1]}" rx="6" fill="#b98a55" opacity="0.85"></rect>` : ""}
                    <rect x="184" y="140" width="12" height="76" rx="6" fill="${m.doser ? "#4aa3df" : "#2c3a40"}" class="click" @click=${this.info("pellet_dispenzer")}></rect>
                    <rect x="150" y="226" width="80" height="154" rx="12" fill="#0f1719" stroke="#2c3a40" stroke-width="1.5" class="click" @click=${this.info("fire_sensor")}></rect>
                    <path d="M162 368 H218" stroke="#5b6b72" stroke-width="3" stroke-linecap="round" stroke-dasharray="6 4"></path>
                </g>
                ${m.pelletFlame > 0 ? svg`
                    <circle cx="190" cy="326" r="${30 + 34 * m.pelletFlame}" fill="url(#${id}_glow)"></circle>
                    <g transform="translate(190 360) scale(${m.pelletFlame})"><g class="flicker">${FLAME}</g></g>` : ""}

                <!-- Boiler <-> buffer, pump P1 -->
                <path d="M252 96 H360" fill="none" stroke="${hot}" opacity="0.35" stroke-width="5"></path>
                <path d="M360 360 H252" fill="none" stroke="${cold}" opacity="0.35" stroke-width="5"></path>
                ${m.p1 ? svg`
                    <path d="M252 96 H360" fill="none" class="flow" stroke="#f08a3c" stroke-width="4" stroke-linecap="round"></path>
                    <path d="M360 360 H252" fill="none" class="flow" stroke="#4aa3df" stroke-width="4" stroke-linecap="round"></path>` : ""}
                <g class="click" @click=${this.info("boiler_pump")}>
                    <circle cx="306" cy="360" r="17" fill="#0e1417" stroke="${m.p1 ? "#4aa3df" : "#4d5c62"}" stroke-width="2"></circle>
                    <path class="${m.p1 ? "spin" : ""}" d="M300 351 L315 360 L300 369 Z" fill="${m.p1 ? "#4aa3df" : "#4d5c62"}"></path>
                    ${m.p1d ? svg`<circle cx="321" cy="344" r="4" fill="#6fd08c"></circle>` : ""}
                </g>

                <!-- Buffer tank -->
                ${m.hasBuffer ? svg`
                    <g class="click" @click=${this.info("buffer_tank_temparature_up")}>
                        <rect x="360" y="30" width="110" height="370" rx="55" fill="url(#${id}_buf)"></rect>
                        <rect x="360" y="30" width="110" height="370" rx="55" fill="none" stroke="#ffffff" opacity="0.16" stroke-width="1.5"></rect>
                    </g>` : svg`
                    <path d="M360 96 V360" fill="none" stroke="${GREY}" opacity="0.35" stroke-width="5" stroke-dasharray="2 8"></path>`}

                <!-- DHW tank, pump P2 -->
                ${m.hasDhw ? svg`
                    <path d="M470 90 H560 V130" fill="none" stroke="${dhwHot}" opacity="0.35" stroke-width="5"></path>
                    <path d="M560 340 V380 H470" fill="none" stroke="${dhwCold}" opacity="0.35" stroke-width="5"></path>
                    ${m.p2 ? svg`
                        <path d="M470 90 H560 V130" fill="none" class="flow" stroke="#f08a3c" stroke-width="4" stroke-linecap="round"></path>
                        <path d="M560 340 V380 H470" fill="none" class="flow" stroke="#4aa3df" stroke-width="4" stroke-linecap="round"></path>` : ""}
                    ${m.hasP2 ? svg`
                        <g class="click" @click=${this.info("second_pump")}>
                            <circle cx="515" cy="380" r="15" fill="#0e1417" stroke="${m.p2 ? "#4aa3df" : "#4d5c62"}" stroke-width="2"></circle>
                            <path class="${m.p2 ? "spin" : ""}" d="M510 372 L523 380 L510 388 Z" fill="${m.p2 ? "#4aa3df" : "#4d5c62"}"></path>
                            ${m.p2d ? svg`<circle cx="529" cy="365" r="4" fill="#6fd08c"></circle>` : ""}
                        </g>` : ""}
                    <g class="click" @click=${this.info("domestic_hot_water")}>
                        <rect x="520" y="130" width="80" height="210" rx="40" fill="url(#${id}_dhw)"></rect>
                        <rect x="520" y="130" width="80" height="210" rx="40" fill="none" stroke="#ffffff" opacity="0.16" stroke-width="1.5"></rect>
                    </g>` : ""}
            </svg>

            <!-- Schematic labels -->
            <div class="abs click" style="left: 40px; top: 186px; width: 104px; text-align: center;" @click=${this.info("boiler_temperature_wood")}>
                <div class="cap" style="color: ${m.wood ? "#ffc98f" : "#8a9aa0"};">Bois</div>
                <div style="font-size: 22px; color: ${m.wood ? "#ffffff" : "#8d9ca2"};">${show(m.tw, "°")}</div>
            </div>
            ${m.tankLabel ? html`<div class="abs lbl click" style="left: 166px; top: 166px; width: 96px; color: ${m.tank == "Full" ? "#cfd8db" : (m.tank == "Reserve" ? "#ffd98a" : "#ffb3b6")};" @click=${this.info("tank_level")}>Granulés · ${m.tankLabel}</div>` : ""}
            <div class="abs lbl click" style="left: 152px; top: 532px; width: 124px;" @click=${this.info("boiler_temperature_pellet")}>Granulés <b style="color: ${m.wood ? "#a9b6bb" : "#ffffff"};">${show(m.tb, " °C")}</b></div>
            <div class="abs click" style="left: 282px; top: 152px; width: 100px;" @click=${this.info(m.wood ? "boiler_temperature_wood" : "boiler_temperature_pellet")}>
                <div style="font-size: 30px; font-weight: 600; line-height: 1;">${show(m.active, "°")}</div>
                <div class="lbl" style="text-align: left; margin-top: 4px;">Chaudière ${m.sourceLabel}</div>
            </div>
            <div class="abs lbl" style="left: 290px; top: 502px; width: 80px;">P1 · ${m.p1 ? "marche" : (m.p1d ? "demande" : "arrêt")}</div>
            ${m.hasDhw && m.hasP2 ? html`<div class="abs lbl" style="left: 479px; top: 520px; width: 72px;">P2 · ${m.p2 ? "marche" : (m.p2d ? "demande" : "arrêt")}</div>` : ""}
            ${m.hasBuffer ? html`
                <div class="abs ts click" style="left: 384px; top: 182px; width: 110px; text-align: center;" @click=${this.info("buffer_tank_temparature_up")}>
                    <div class="big">${show(m.bt, "°")}</div><div style="font-size: 11px; margin-top: 2px;">haut</div>
                </div>
                <div class="abs ts cap" style="left: 384px; top: 324px; width: 110px; text-align: center; color: #e7ecee;">Tampon</div>
                <div class="abs ts click" style="left: 384px; top: 444px; width: 110px; text-align: center;" @click=${this.info("buffer_tank_temparature_down")}>
                    <div class="big">${show(m.bb, "°")}</div><div style="font-size: 11px; margin-top: 2px;">bas</div>
                </div>` : html`
                <div class="abs lbl" style="left: 300px; top: 330px; width: 120px;">Vers l'installation</div>`}
            ${m.hasDhw ? html`
                <div class="abs ts click" style="left: 544px; top: 324px; width: 80px; text-align: center;" @click=${this.info("domestic_hot_water")}>
                    <div class="big" style="font-size: 26px;">${show(m.dhw, "°")}</div><div style="font-size: 11px; margin-top: 2px;">ECS</div>
                </div>` : ""}

            <!-- Right panel -->
            <div class="abs panel">
                <div class="cap">Combustion</div>
                ${m.lambda !== null ? html`<div class="row click" @click=${this.info("lambda_sensor")}><span>Oxygène (λ)</span><span class="val">${m.lambda} %</span></div>` : ""}
                <div class="row click" @click=${this.info("fire_sensor")}><span>Photocellule</span>
                    <span style="display: flex; align-items: center; gap: 8px;">${m.glow ? html`<span class="badge">Braise</span>` : ""}<span class="val">${m.fireText}</span></span></div>
                <div class="sep"></div>
                <div class="cap">Alimentation</div>
                <div class="row click" @click=${this.info("pellet_dispenzer")}><span>Doseur granulés</span><span style="color: ${m.doser ? "#6fd08c" : "#a9b6bb"};">${m.doser ? "Actif" : "Arrêt"}</span></div>
                <div class="sep"></div>
                <div class="cap">Prise en charge</div>
                <div class="seg click ${m.takeAllowed ? "" : "no"}" @click=${this.info("take_over")}>
                    ${takeLabels.map((label, i) => html`<div class="${m.takeAllowed && m.take == i ? "on" : ""}">${label}</div>`)}
                </div>
            </div>

            <!-- Bottom strip -->
            <div class="abs strip">
                <span class="click" @click=${this.info("control_mode")}>Accès chaudière : <b style="color: ${m.locked ? "#ffc2c4" : "#e7ecee"};">${m.locked ? "désactivé" : "autorisé"}</b></span>
                <span class="click" @click=${this.info("wood_pellet_mode")}>Source : <b>${m.wood ? "bois" : "granulés"}</b></span>
                ${m.wood ? html`<span>Mode bois — la marche/arrêt se fait sur la chaudière</span>` : ""}
            </div>

            <!-- Unavailable -->
            ${m.unavailable ? html`
                <div class="abs veil">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a9b6bb" stroke-width="1.6" stroke-linecap="round"><path d="M2 8.8a15 15 0 0 1 20 0"></path><path d="M5.5 12.5a10 10 0 0 1 13 0"></path><path d="M9 16a5 5 0 0 1 6 0"></path><path d="M12 20v.01"></path><path d="M3 3l18 18"></path></svg>
                    <div style="font-size: 22px; font-weight: 600;">Chaudière indisponible</div>
                    <div style="font-size: 13px; color: #a9b6bb;">Aucune donnée reçue de l'intégration Centrometal</div>
                </div>` : ""}
        </div>
        </div>`
    }

    synopticPower(m) {
        if (!m.powerEnabled) {
            return html`
                <button type="button" class="pw dis" disabled title="${m.wood ? "Mode bois : commande sur la chaudière" : "Commande indisponible"}" aria-label="Commande indisponible">
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
            <div class="click" style="display: flex; flex-direction: column; gap: 6px; font-size: 13px;" @click=${this.info(entity)}>
                <div class="row"><span>${label}</span><span>${show(value, " %")}</span></div>
                <div class="gauge"><div style="width: ${pct}%;"></div></div>
            </div>`
    }

    // B · Dashboard -----------------------------------------------------

    powerButton(m) {
        return html`
            <button type="button" class="pw" ?disabled=${!m.powerEnabled} aria-label="${m.off ? "Allumer la chaudière" : "Éteindre la chaudière"}"
                title="${m.powerEnabled ? "" : (m.wood ? "Mode bois : commande sur la chaudière" : "Commande indisponible")}"
                @click=${() => this.askPower(m)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">${POWER_ICON}</svg>
            </button>`
    }

    messages(m) {
        if (this.confirm) {
            return html`
                <div class="msg confirm">
                    <span class="grow">${this.confirmText(m)}</span>
                    <button type="button" class="btn" @click=${() => this.cancelPower()}>Annuler</button>
                    <button type="button" class="btn primary" @click=${() => this.applyPower(m)}>${m.off ? "Allumer" : "Éteindre"}</button>
                </div>`
        }
        if (m.unavailable) {
            return html`<div class="msg danger"><span class="grow">Chaudière indisponible — aucune donnée reçue</span></div>`
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
        const takeLabels = ["Inactive", "Granulés ON", "Granulés OFF"]
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
                    <div><b>${show(m.active, "°")}</b><span class="sub">Chaudière ${m.sourceLabel}</span></div>
                </div>
                <div class="facts">
                    <div class="sub">Source active</div>
                    <div class="src click" @click=${this.info("wood_pellet_mode")}>
                        <div class="${m.wood ? "on" : ""}">Bois · ${show(m.tw, "°")}</div>
                        <div class="${m.wood ? "" : "on"}">Granulés · ${show(m.tb, "°")}</div>
                    </div>
                    ${m.hasOutdoor ? html`<div class="kv click" @click=${this.info("outdoor_temperature")}><span>Extérieur</span><span>${show(m.outdoor, " °C")}</span></div>` : ""}
                    ${m.mode ? html`<div class="kv click" @click=${this.info("operation_mode")}><span>Régime</span><span>${m.mode}</span></div>` : ""}
                    <div class="kv click" @click=${this.info("control_mode")}><span>Accès chaudière</span><span>${m.locked ? "Désactivé" : "Autorisé"}</span></div>
                </div>
            </div>

            ${m.hasBuffer || m.hasDhw ? html`
            <div class="two">
                ${m.hasBuffer ? html`
                <div class="tile buf">
                    <div class="thermo" style="background: linear-gradient(${tempColor(m.bt)}, ${tempColor(m.bb)});"></div>
                    <div style="display: flex; flex-direction: column; justify-content: space-between;">
                        <div class="cap">Ballon tampon</div>
                        <div class="click" @click=${this.info("buffer_tank_temparature_up")}><div class="n" style="color: var(--cb-heat);">${show(m.bt, "°")}</div><div class="sub">haut</div></div>
                        <div class="click" @click=${this.info("buffer_tank_temparature_down")}><div class="n" style="color: var(--cb-cold);">${show(m.bb, "°")}</div><div class="sub">bas</div></div>
                    </div>
                </div>` : ""}
                ${m.hasDhw ? html`
                <div class="tile click" style="justify-content: space-between;" @click=${this.info("domestic_hot_water")}>
                    <div class="cap">Eau chaude</div>
                    <div class="xl">${show(m.dhw, "°")}</div>
                    ${m.hasP2 ? html`<div class="sub">Pompe P2 · ${m.p2 ? "marche" : (m.p2d ? "demande" : "arrêt")}</div>` : ""}
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
                    <div class="click" @click=${this.info("firebox_temperature")}><span>Foyer</span><b class="n">${show(m.firebox, "°")}</b></div>
                    <div class="click" @click=${this.info("flue_gas")}><span>Fumées</span><b class="n">${show(m.flue, "°")}</b></div>
                    ${m.lambda !== null ? html`<div class="click" @click=${this.info("lambda_sensor")}><span>O₂ (λ)</span><b class="n">${m.lambda} %</b></div>` : ""}
                    <div class="click" @click=${this.info("fire_sensor")}><span>Photocellule</span><b class="n">${m.fireText}</b></div>
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
                </div>
            </div>

            <div class="two">
                ${m.tank !== null ? html`
                <div class="tile click" @click=${this.info("tank_level")}>
                    <div class="cap">Réserve granulés</div>
                    <div class="n">${{ "Full": "Pleine", "Reserve": "Réserve", "Empty": "Vide" }[m.tank] || m.tank}</div>
                    <div class="lvl">${[0, 1, 2].map((i) => html`<div class="${i < levels ? "on" : ""}"></div>`)}</div>
                </div>` : ""}
                <div class="tile click" style="gap: 4px;" @click=${this.info("take_over")}>
                    <div class="cap">Prise en charge</div>
                    ${takeLabels.map((label, i) => html`<div class="opt ${!m.takeAllowed ? "no" : (m.take == i ? "on" : "")}">${label}</div>`)}
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
        return html`
        <div class="cb cp">
            <div class="head">
                <svg width="32" height="40" viewBox="-20 -82 40 84" class="click" @click=${this.info("fire_sensor")}>
                    ${m.pelletFlame > 0 || m.woodFlame > 0 ? svg`<g class="flicker">${FLAME}</g>` : svg`<g opacity="0.25">${FLAME}</g>`}
                </svg>
                <div class="grow">
                    <div class="temp click" @click=${this.info(m.wood ? "boiler_temperature_wood" : "boiler_temperature_pellet")}><b>${show(m.active, "°")}</b><span class="sub">chaudière ${m.sourceLabel}</span></div>
                    <div class="sub click" @click=${this.info("boiler_state")}>${m.state}${m.hasOutdoor ? " · " + show(m.outdoor, " °C") + " ext." : ""}</div>
                </div>
                ${this.powerButton(m)}
            </div>
            ${this.messages(m)}
            ${m.hasBuffer ? html`
            <div class="click" style="display: flex; flex-direction: column; gap: 6px;" @click=${this.info("buffer_tank_temparature_up")}>
                <div class="cap"><span>Tampon · bas ${show(m.bb, "°")}</span><span>haut ${show(m.bt, "°")}</span></div>
                <div class="gauge buf" style="background: linear-gradient(90deg, ${tempColor(m.bb)}, ${tempColor(m.bt)});"></div>
            </div>` : ""}
            <div class="stats">
                ${m.hasDhw ? html`<div class="click" @click=${this.info("domestic_hot_water")}><span>ECS</span><b>${show(m.dhw, "°")}</b></div>` : ""}
                <div class="click" @click=${this.info("flue_gas")}><span>Fumées</span><b>${show(m.flue, "°")}</b></div>
                ${m.lambda !== null ? html`<div class="click" @click=${this.info("lambda_sensor")}><span>O₂</span><b>${m.lambda} %</b></div>` :
                    html`<div class="click" @click=${this.info("firebox_temperature")}><span>Foyer</span><b>${show(m.firebox, "°")}</b></div>`}
            </div>
        </div>`
    }

    tile(m) {
        return html`
        <div class="cb tl click" @click=${this.info("boiler_state")}>
            <div class="ico" style="width: 40px; height: 40px; border-radius: 12px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round">${FIRE_ICON}</svg>
            </div>
            <div class="grow">
                <b>Chaudière · ${show(m.active, " °C")}</b>
                <span class="sub"><span class="dot" style="display: inline-block; margin-right: 6px; background: ${m.dot};"></span>${m.state}${m.unavailable ? "" : " · " + m.sourceLabel}</span>
            </div>
            ${m.hasDhw ? html`<span class="chip">ECS ${show(m.dhw, "°")}</span>` : ""}
            ${m.hasBuffer ? html`<span class="chip">${show(m.bt, "°")}/${show(m.bb, "°")}</span>` : ""}
        </div>`
    }
}
