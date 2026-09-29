import {
  html,
  LitElement,
} from "https://unpkg.com/lit-element@2.0.1/lit-element.js?module";

import { BioTecPlusDisplay } from "./BioTecPlus.js?v=0.0.30-beta.5"

class LovelaceCentrometalBoilerCard extends LitElement {

  constructor() {
    super();
    this.display = null;
    this.configured = false;
    this.mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    this.observer = new ResizeObserver(entries => {
      entries.forEach(entry => {
        if (this.display != null) {
          this.display.scale_factor = entry.contentRect.height / this.display.area_height
          this.display.width = entry.contentRect.width;
          this.display.height = entry.contentRect.height;
        }
        this.width = entry.contentRect.width
        this.height = entry.contentRect.height
        // console.log("Size ", this.width, "x", this.height)
      })
    })
  }

  connectedCallback() {
    super.connectedCallback();
    this.observer.observe(this);
  }

  disconnectedCallback() {
    this.observer.disconnect();
    super.disconnectedCallback();
  }

  static get properties() {
    return {
      width: Number,
      height: Number,
      uiTick: Number,     // bumped by the display for local UI changes (power confirmation)
      hass: {},
      config: {},
    };
  }

  shouldUpdate(changedProperties) {
    if (!this.hass) {
      return false;
    }
    if (this.display === null) {
      return true; // first render configures the display
    }
    if (changedProperties.has("height") || changedProperties.has("width") || changedProperties.has("uiTick")) {
      return true;
    }
    if (changedProperties.has("hass")) {
      if (typeof this.display === 'string' || this.display instanceof String) {
        return false;
      }
      if (this.display != null) {
        const oldHass = changedProperties.get("hass");
        if (this.display.shouldUpdate(oldHass, this.hass)) {
          return true;
        }
      }
    }
    return false;
  }

  configureDisplay() {
    // Only BioTec Plus is supported; device_type stays optional for older configs
    if ("device_type" in this.config && this.config["device_type"].toLowerCase() !== "biopl") {
      return "Boiler type not supported: " + this.config["device_type"] + ". Only BioTec Plus (biopl) is supported.";
    }
    return new BioTecPlusDisplay(this).configureDisplay();
  }

  render() {
    if (this.configured === false) {
      this.display = this.configureDisplay();
      if (typeof this.display === 'string' || this.display instanceof String) {
        return html`
          <ha-card style="height: auto;">
            <h1 class="card-header">Centrometal Boiler Card</h1>
            <p style="padding: 20px; line-height: 30px;">Error: ${this.display}</p></ha-card>`;
      }
      this.configured = true;
    }

    return html`<ha-card>${this.display.createContent(this.hass)}</ha-card>`;
  }

  setConfig(config) {
    this.config = { ...config };
    this.style.cssText = "display: block;";
  }

  // Masonry view: one unit is ~50px, the card is ~0.55 x its width high
  layoutName() {
    return ((this.config && this.config["layout"]) || "synoptic").toString().toLowerCase();
  }

  getCardSize() {
    return { dashboard: 12, compact: 5, tile: 1, classic: 6 }[this.layoutName()] || 9;
  }

  // Sections dashboard: the synoptic and classic displays take the full width, the other layouts half of it
  getGridOptions() {
    switch (this.layoutName()) {
      case "dashboard":
      case "compact":
      case "tile":
        return { columns: 6, min_columns: 4 };
    }
    return { columns: "full", min_columns: 6 };
  }

  static getStubConfig() {
    return {};
  }

}

customElements.define('centrometal-boiler-card', LovelaceCentrometalBoilerCard);

// Show the card in the dashboard "Add card" picker
window.customCards = window.customCards || [];
window.customCards.push({
  type: "centrometal-boiler-card",
  name: "Centrometal Boiler Card",
  description: "Display of the Centrometal BioTec Plus boiler",
  documentationURL: "https://github.com/AndroFlo/lovelace-centrometal-boiler-card",
});

console.info(
  `%c centrometal-boiler-card %c`,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
)
