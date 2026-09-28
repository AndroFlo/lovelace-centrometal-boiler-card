import {
    html,
} from "https://unpkg.com/lit-element@2.0.1/lit-element.js?module";

import { DisplaySubArea } from "./DisplaySubArea.js?v=0.0.29"
import { DisplayWithPowerButton } from "./DisplayWithPowerButton.js?v=0.0.29"

export class CmPeletDisplay extends DisplayWithPowerButton {

    constructor(card) {
        super(card, 0, 0, 1024, 562)
    }

    configureDisplay() {
        try {
            this.configureParameter("sensor.cm_pelet", "boiler_state")
            this.configureParameter("sensor.cm_pelet", "command_active")
            this.configureParameter("sensor.cm_pelet", "firmware_version")
            this.configureParameter("sensor.cm_pelet", "boiler_temperature")
            this.configureParameter("sensor.cm_pelet", "fire_sensor")
            this.configureParameter("sensor.cm_pelet", "heater_fan_state")
            this.configureParameter("sensor.cm_pelet", "setup")

            // Optional
            this.configureParameter("sensor.cm_pelet", "outdoor_temperature", "optional")
            this.configureParameter("sensor.cm_pelet", "buffer_tank_up", "optional")
            this.configureParameter("sensor.cm_pelet", "buffer_tank_down", "optional")
            this.configureParameter("sensor.cm_pelet", "circuit_1_flow_temperature", "optional")
            this.configureParameter("sensor.cm_pelet", "circuit_1_pump", "optional")
            this.configureParameter("sensor.cm_pelet", "circuit_2_flow_temperature", "optional")
            this.configureParameter("sensor.cm_pelet", "circuit_2_pump", "optional")
            this.configureParameter("sensor.cm_pelet", "boiler_pump", "optional")
            this.configureParameter("sensor.cm_pelet", "operation_mode|b_zlj", "optional")
            this.configureParameter("sensor.cm_pelet", "boiler_operational", "optional")
            this.configureParameter("sensor.cm_pelet", "additional_features", "optional")
            this.configureParameter("sensor.cm_pelet", "centroplus|b_cp", "optional")
            this.configureParameter("sensor.cm_pelet", "b_smd", "optional", 0)
            this.configureParameter("sensor.cm_pelet", "freeze_guard", "optional")
            this.configureParameter("sensor.cm_pelet", "freeze_monitor", "optional")
            this.configureParameter("sensor.cm_pelet", "b_tpov1", "optional")
            this.configureParameter("sensor.cm_pelet", "circuit_1_flow_measured_temperature|c1b_tpol1", "optional")

            // Service
            this.configureParameter("switch.cm_pelet", "boiler_switch")

        } catch (error) {
            return error;
        }

        // define Sub areas of display
        this.fireArea = new DisplaySubArea(this, 130, 350, 190, 90)
        this.flameArea = new DisplaySubArea(this, 90, 392, 100, 70)
        this.fanArea = new DisplaySubArea(this, 220, 390, 140, 130)
        this.setupArea = new DisplaySubArea(this, 387, 10, 500, 550)

        return this;
    }

    createContent(hass)
    {
        this.updateParameterValues(hass);

        if (this.values["boiler_state"] == "-") {
            return this.createCard("cmpelet/peletsetdisplay-clean.png",
                html`${this.createText("Boiler unavailable", 36, "color: #ffffff;", 390, 30)}`)
        }

        // Firmware versions are compared as strings, as the device reports them ("v1.25")
        const fw = this.values["firmware_version"]
        const fwBefore125 = fw < 'v1.25'
        const fwBefore126 = fw < 'v1.26'
        const fwAfter125 = fw > 'v1.25'
        const fw125 = fw > 'v1.24' && fw < 'v1.26'
        const showBoilerState = (this.values['b_smd'] == 0 || fwBefore125)

        return this.createCard("cmpelet/peletsetdisplay-clean.png", html`

            <!-- boiler image on background -->
            ${this.conditional(
                fwAfter125 && this.values["centroplus"] == 1,
                this.createImage("cmpelet/boiler_centroplus.png", -1, 9, 347, null, 0))}
            ${this.conditional(
                fwBefore125,
                this.createImage("cmpelet/boiler_pst_pellets.png", -1, 9, 386, null, 0))}
            ${this.conditional(
                fw125, html`
                ${this.conditional(this.values["b_smd"] == '0', this.createImage("cmpelet/boiler_pst_pellets.png", -1, 0, 386, null, 0))}
                ${this.conditional(this.values["b_smd"] == '1', this.createImage("cmpelet/boiler_pst_wood.png", 1, 5, 373, null, 0))}
                `)}
            ${this.conditional(
                fwAfter125 && this.values["centroplus"] == '0', html`
                ${this.conditional(this.values["b_smd"] == '0', this.createImage("cmpelet/boiler_pst_pellets.png", -1, 0, 386, null, 0))}
                ${this.conditional(this.values["b_smd"] == '1', this.createImage("cmpelet/boiler_pst_wood.png", 1, 5, 373, null, 0))}
            `)}

            <!-- Outdoor temperature -->
            ${this.createImage("cmpelet/vanjska.png", 890, 125, 20, "auto", 3, "outdoor_temperature")}
            ${this.createText(this.formatTemperature("outdoor_temperature") + " °C", 28, "color: #ffffff; text-align: right; ",
                820, 140, null, null, 3, null, "outdoor_temperature")}

            <!-- Boiler temperature -->
            ${this.createText(this.values["boiler_temperature"] + " °C", 42, "color: #FFFFFF;", 47, 33, null, null, 4, null, "boiler_temperature")}

            <!-- Boiler power states -->
            ${this.conditional(
                showBoilerState,
                this.createText(this.values["boiler_state"], 32, "color: #ffffff; text-align: center;", 900, 360, 120, null, 3, null, "boiler_state"))}
            ${this.conditional(
                showBoilerState && this.values["boiler_state"] === "OFF",
                this.createText("", 32,
                    "display:block; background-repeat: no-repeat; background-image: url('" + this.images_folder + "peltec/start_stop.png?v=0.0.29'); background-position: 0px 0px;",
                945, 390, 36, 36, 2, -1))}
            ${this.conditional(
                showBoilerState &&
                this.values["command_active"] == 0 && this.values["boiler_state"] !== "OFF",
                this.createImage("peltec/stopradi.gif", 942, 390, 36, "auto"))}
            ${this.conditional(
                showBoilerState && this.values["boiler_state"] !== "OFF",
                this.createImage("peltec/start.gif", 901, 440, 118, null))}
            ${this.conditional(
                showBoilerState && this.values["command_active"] == 1 && this.values["boiler_state"] == "S7-3",
                this.createImage("peltec/pauza.png", 942, 390, 40, null))}
            ${this.conditional(
                showBoilerState && this.values["command_active"] == 1 && this.values["boiler_state"] !== "OFF" && this.values["boiler_state"] !== "S7-3",
                this.createImage("peltec/playradi.gif", 942, 390, 40, null))}

            <!-- Fire -->
            ${this.conditional(
                (fwAfter125 && this.values['centroplus'] == 1),
                html`${this.fireArea.createSubArea(2, "",
                    html`
                        ${this.conditional(
                            this.values["fire_sensor"] >= 1000,
                            this.fireArea.createText(">1M", 20, "color: #ffffff;", 25, 15, null, null, 3, null, "fire_sensor"))}
                        ${this.conditional(
                            this.values["fire_sensor"] < 1000,
                            this.fireArea.createText(this.values["fire_sensor"] + "k", 20, "color: #ffffff;", 25, 15, null, null, 3, -1, "fire_sensor"))}
                `)}`)}
            ${this.conditional(
                (fwAfter125 && this.values['centroplus'] == 0),
                html`${this.fireArea.createSubArea(2, "",
                    html`
                        ${this.conditional(
                            this.values["fire_sensor"] >= 1000,
                            this.fireArea.createText(">1M", 20, "color: #ffffff;", -100, 10, null, null, 3, null, "fire_sensor"))}
                        ${this.conditional(
                            this.values["fire_sensor"] < 1000,
                            this.fireArea.createText(this.values["fire_sensor"] + "k", 20, "color: #ffffff;", -100, 10, null, null, 3, -1, "fire_sensor"))}
                `)}`)}
            ${this.conditional(
                (fwBefore126),
                html`${this.fireArea.createSubArea(2, "",
                    html`
                        ${this.conditional(
                            this.values["fire_sensor"] >= 1000,
                            this.fireArea.createText(">1M", 20, "color: #ffffff;", -100, 10, null, null, 3, null, "fire_sensor"))}
                        ${this.conditional(
                            this.values["fire_sensor"] < 1000,
                            this.fireArea.createText(this.values["fire_sensor"] + "k", 20, "color: #ffffff;", -100, 10, null, null, 3, -1, "fire_sensor"))}
                `)}`)}

            <!-- Flame Image -->
            ${this.conditional(
                (fwAfter125 && this.values['b_smd'] == 0 && this.values['centroplus'] == 0),
                html`${this.flameArea.createSubArea(2, "",
                    this.conditional(
                        this.values["fire_sensor"] < 1000,
                        this.flameArea.createImage("cmpelet/vatra2.gif", 10, 10, 120, "auto", 2, "fire_sensor"),
                        this.flameArea.createImage("transparent.png", 10, 10, 120, "auto", 2, "fire_sensor"))
                    )}
                `)}
            ${this.conditional(
                (fwAfter125 && this.values['b_smd'] == 0 && this.values['centroplus'] == 1),
                html`${this.flameArea.createSubArea(2, "",
                    this.conditional(
                        this.values["fire_sensor"] < 1000,
                        this.flameArea.createImage("cmpelet/vatra2.gif", 60, 22, 100, "auto", 2, "fire_sensor"),
                        this.flameArea.createImage("transparent.png", 60, 22, 100, "auto", 2, "fire_sensor"))
                    )}
                `)}
            ${this.conditional(
                (fw125),
                html`${this.flameArea.createSubArea(2, "",
                    this.conditional(
                        this.values["fire_sensor"] < 1000,
                        this.flameArea.createImage("cmpelet/vatra2.gif", 10, 10, 120, "auto", 2, "fire_sensor"))
                    )}
                `)}
            ${this.conditional(
                (fwBefore125),
                html`${this.flameArea.createSubArea(2, "",
                    this.conditional(
                        this.values["fire_sensor"] < 1000,
                        this.flameArea.createImage("cmpelet/vatra2.gif", 10, 10, 120, "auto", 2, "fire_sensor"))
                    )}
                `)}

            <!-- Fan -->
            ${this.conditional(
                ("centroplus" in this.values && this.values['centroplus'] == 1 && fwAfter125),
                html`${this.fanArea.createSubArea(2, "",
                    html`
                        ${this.conditional(
                            this.values["heater_fan_state"] == 0,
                            this.fanArea.createImage("cmpelet/ventilatorStoji.png", 22, 48, 44, null, 3, "heater_fan_state"))}
                        ${this.conditional(
                            this.values["heater_fan_state"] != 0,
                            this.fanArea.createImage("cmpelet/ventilator-pelet.gif", 22, 48, 44, null, 3, "heater_fan_state"))}
                        ${this.fanArea.createText(this.values["heater_fan_state"], 25, "color: #ffffff; text-align: center;", 20, 13, null, null, 3, -1, "heater_fan_state")}
            `)}`)}
            ${this.conditional(
                ("centroplus" in this.values && this.values['centroplus'] == 0 && fwAfter125),
                html`${this.fanArea.createSubArea(2, "",
                    html`
                        ${this.conditional(
                            this.values["heater_fan_state"] == 0,
                            this.fanArea.createImage("cmpelet/ventilatorStoji.png", 70, 65, 44, null, 3, "heater_fan_state"))}
                        ${this.conditional(
                            this.values["heater_fan_state"] != 0,
                            this.fanArea.createImage("cmpelet/ventilator-pelet.gif", 70, 65, 44, null, 3, "heater_fan_state"))}
                        ${this.fanArea.createText(this.values["heater_fan_state"], 25, "color: #ffffff; text-align: center;", 95, 31, null, null, 3, -1, "heater_fan_state")}
            `)}`)}
            ${this.conditional(
                (fwBefore126),
                html`${this.fanArea.createSubArea(2, "",
                    html`
                        ${this.conditional(
                            this.values["heater_fan_state"] == 0,
                            this.fanArea.createImage("cmpelet/ventilatorStoji.png", 70, 65, 44, null, 3, "heater_fan_state"))}
                        ${this.conditional(
                            this.values["heater_fan_state"] != 0,
                            this.fanArea.createImage("cmpelet/ventilator-pelet.gif", 70, 65, 44, null, 3, "heater_fan_state"))}
                        ${this.fanArea.createText(this.values["heater_fan_state"], 25, "color: #ffffff; text-align: center;", 95, 31, null, null, 3, -1, "heater_fan_state")}
            `)}`)}

            <!-- Hydraulic setup (A.0.0, A.0.1, A.0.2, I.7.0) -->
            ${this.createSetup(this.values["setup"])}

            <!-- Net monitor -->
            ${this.createImage("unit/netMon.png", 935, 260, 50, null, 2)}

            <!-- Boiler Operational -->
            ${this.conditional(
                "boiler_operational" in this.values && this.values["boiler_operational"] != 0,
                this.createImage("unit/uklMon.png", 935, 200, 50, null, 2)
            )}

            <!-- Remote control -->
            ${this.conditional(
                "additional_features" in this.values && (this.values["additional_features"] & 64) > 0,
                this.createImage("unit/vanjMon.png", 935, 75, 50, null, 2)
            )}

            <!-- Tap/radiator mode -->
            ${this.conditional(
                "operation_mode" in this.values && (this.values["operation_mode"] == 0 || this.values["operation_mode"] == 2),
                this.createImage("cmpelet/radijatorSlavina.png", 800, 10, 80, "auto", 2)
            )}
            ${this.conditional(
                "operation_mode" in this.values && (this.values["operation_mode"] == 1),
                this.createImage("cmpelet/slavina.png", 800, 10, 80, "auto", 2)
            )}
            <!-- Freeze Guard -->
            ${this.conditional("freeze_guard" in this.values && this.values["freeze_guard"] == 1,
                html`
                    ${this.createImage("unit/freezMon.png", 935, 135, 50, "auto", 2, "freeze_guard")}
                    ${this.conditional("freeze_monitor" in this.values && this.values["freeze_monitor"] == 10,
                        this.createImage("unit/cx.png", 935, 140, 50, "auto", 3, "freeze_monitor")
                )}`,
                this.createImage("transparent.png", 935, 135, 50, "auto", 2, "freeze_guard")
            )}

            <!-- Boiler power button -->
            ${this.createPowerButton(function (root) { this.turnCmPeletOn(root); }, function (root) { this.turnCmPeletOff(root); })}

        `);
    }

    createSetup(setup) {
        switch (setup) {
            case "A.0.0":
                return this.setupArea.createSubArea(2, "", html`
                    ${this.createBufferTank("cmpelet/a00_cjevovod.png", 457)}
                `)
            case "A.0.1":
                return this.setupArea.createSubArea(2, "", html`
                    ${this.createBufferTank("cmpelet/a00_cjevovod.png", 457)}
                    ${this.createHeatingCircuit(100, "circuit_1_flow_measured_temperature", "circuit_1_pump")}
                `)
            case "A.0.2":
                return this.setupArea.createSubArea(2, "", html`
                    ${this.createBufferTank("cmpelet/a00_cjevovod.png", 457)}
                    ${this.createHeatingCircuit(100, "circuit_1_flow_temperature", "circuit_1_pump")}
                    ${this.createHeatingCircuit(270, "circuit_2_flow_temperature", "circuit_2_pump")}
                `)
            case "I.7.0":
                return this.setupArea.createSubArea(2, "", html`
                    ${this.createBufferTank("cmpelet/g00_cjevovod.png", 483)}
                    ${this.setupArea.createImage("cmpelet/senzor_vodoravni.png", 82, 450, 45, null, 3)}
                    ${this.setupArea.createText("M", 28, "color: #ffffff; text-align: center;", 118, 345)}
                    ${this.conditional(
                        "b_tpov1" in this.values,
                        this.setupArea.createText(this.values["b_tpov1"] + " °C", 26, "color: #ffffff;", 100, 490, null, null, 3, null, "b_tpov1")
                    )}
                `)
        }
        return html``
    }

    // Buffer tank with its temperatures, piping and boiler pump
    createBufferTank(pipeImage, pumpTop) {
        const area = this.setupArea
        return html`
            ${area.createImage("cmpelet/akumulacijskiSpr.png", 160, 215, 140, "auto", 2)}
            ${this.conditional(
                "buffer_tank_up" in this.values,
                area.createText(this.values["buffer_tank_up"] + " °C", 32, "color: #0000ff;", 190, 275, null, null, 3, null, "buffer_tank_up")
            )}
            ${this.conditional(
                "buffer_tank_down" in this.values,
                area.createText(this.values["buffer_tank_down"] + " °C", 32, "color: #0000ff;", 190, 478, null, null, 3, null, "buffer_tank_down")
            )}
            ${area.createImage(pipeImage, 0, 280, 160, "auto", 2)}
            ${area.createImage("cmpelet/pumpaStojiLijevo.png", 15, pumpTop, 64, null, 3, "boiler_pump")}
            ${this.conditional(
                "boiler_pump" in this.values && this.values["boiler_pump"] == 1,
                area.createImage("cmpelet/pumpaokrece.gif", 15, pumpTop, 64, null, 4, "boiler_pump")
            )}`
    }

    // Heating circuit (mixing valve "M", flow temperature, pump) drawn at horizontal position x
    createHeatingCircuit(x, temperature, pump) {
        const area = this.setupArea
        return html`
            ${area.createImage("cmpelet/krug_grijanja.png", x, -10, 80, "auto", 3)}
            ${area.createImage("cmpelet/senzor_vodoravni_2.png", x - 20, 60, 45, null, 3)}
            ${area.createText("M", 28, "color: #ffffff; text-align: center;", x + 40, 65)}
            ${area.createText(this.formatTemperature(temperature, "-.-") + " °C", 20, "color: #ffffff; text-align: right;",
                x - 60, 87, null, null, 3, null, temperature)}
            ${this.conditional(
                pump in this.values && this.values[pump] == 1,
                area.createImage("cmpelet/pumpaokrece.gif", x, 11, 53, null, 4, pump),
                area.createImage("transparent.png", x, 11, 53, null, 4, pump)
            )}`
    }

    turnCmPeletOn(root) {
        root.hass.callService("switch", "turn_on", {entity_id: root.display.parameters["boiler_switch"]});
    }

    turnCmPeletOff(root) {
        root.hass.callService("switch", "turn_off", {entity_id: root.display.parameters["boiler_switch"]});
    }

}
