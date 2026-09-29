# lovelace-centrometal-boiler-card

Home assistant lovelace card to support the Centrometal (https://www.centrometal.hr/) **BioTec Plus** boiler with WiFi integration into Home Assistant (a free and open-source software for home automation designed to be a central control system for smart home devices with a focus on local control and privacy).

## Installation

### HACS (custom repository)

1. In Home Assistant open **HACS**, click the three dots menu (top right) and choose **Custom repositories**.
2. Add `https://github.com/AndroFlo/lovelace-centrometal-boiler-card` with type **Dashboard** (called **Lovelace** / **Plugin** in older HACS versions).
3. Search for **Centrometal Boiler Display Card**, click **Download** and reload the browser when asked.
4. HACS registers the dashboard resource automatically (`/hacsfiles/lovelace-centrometal-boiler-card/centrometal-boiler-card.js`).

### Manual

1. Copy the content of the `dist` folder to `<config>/www/community/lovelace-centrometal-boiler-card/`.
2. Add a dashboard resource (**Settings → Dashboards → ⋮ → Resources**): URL `/local/community/lovelace-centrometal-boiler-card/centrometal-boiler-card.js`, type **JavaScript module**.

The images are loaded from `/local/community/lovelace-centrometal-boiler-card/images/`, so keep this folder name.

## Configuration

```
type: custom:centrometal-boiler-card
layout: synoptic | dashboard | compact | tile | classic (optional, default synoptic)
prefix: <prefix> (optional)
debug: true (optional)
```

Only the BioTec Plus is supported. The entities are detected automatically; the former `device_type: biopl` option is still accepted, any other value shows an error.

layout: (optional)
- `synoptic` (default): schematic of the whole installation — flue duct with the fan and the chimney, wood and pellet chambers with live flames, P1 to the buffer tank, P2 to the radiator, P3 to the DHW tank, tanks coloured by temperature. Scales with the card width, best in a full-width card.
- `dashboard`: tiles following the Home Assistant theme (light or dark), for a half-width column.
- `compact`: boiler temperature, state, buffer bar and key values.
- `tile`: a single line for sections dashboards.
- `classic`: the original Centrometal display.

The radiator, the room thermostat and P3 are drawn only when the matching entities exist (heating circuit 1: `c1b_tpol1`, `c1b_tpol`, `c1b_tsob1`, `c1b_tsob`; third pump: `b_p3`, `b_zahp3`). Fan speed is shown as the percentage reported by `b_fan`, and there is no DHW setpoint entity, so none is displayed.

Every value opens the Home Assistant more-info dialog when clicked. The power button asks for confirmation inside the card; it is disabled in wood mode and when access to the boiler is disabled.

debug: true (optional)
Logs every change of the boiler entities to the browser console. Off by default.

prefix: <prefix>
Prefix is optional, if defined when adding device to HA all entities are prefixed with it. Here you can define the prefix for boiler entities. This is usefull if you add several boilers into system to distinguish entities per boiler.

## Multiple boilers

```
- type: custom:centrometal-boiler-card
  prefix: john
- type: custom:centrometal-boiler-card
  prefix: jack
```

| `synoptic` | `synoptic` (wood mode) |
|---|---|
| <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/beta/docs/images/card-synoptic.png" width="420" alt="Synoptic layout"> | <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/beta/docs/images/card-synoptic-wood.png" width="420" alt="Synoptic layout in wood mode"> |

| `dashboard` | `compact` and `tile` |
|---|---|
| <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/beta/docs/images/card-dashboard.png" width="300" alt="Dashboard layout"> | <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/beta/docs/images/card-compact.png" width="300" alt="Compact layout"><br><img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/beta/docs/images/card-tile.png" width="300" alt="Tile layout"> |

`classic` layout:

![BioTec Plus](https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/main/biotec-plus-display.gif)

## Design mock-ups

The mock-ups the layouts above were built from. Values are illustrative; the phase timeline at the bottom of the scenarios is not implemented (it needs the list of Centrometal `boiler_state` codes).

| A · Modern synoptic | B · Dashboard | C · Compact card & tile |
|---|---|---|
| <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/beta/docs/images/proposal-a-synoptic.png" width="420" alt="Modern synoptic"> | <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/beta/docs/images/proposal-b-dashboard.png" width="220" alt="Dashboard"> | <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/beta/docs/images/proposal-c-compact.png" width="220" alt="Compact card and tile"> |

### Usage scenarios (synoptic)

| | |
|---|---|
| <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/beta/docs/images/scenario-01-off.png" width="420" alt="Off"><br>Off | <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/beta/docs/images/scenario-02-ignition.png" width="420" alt="Ignition in progress"><br>Ignition in progress |
| <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/beta/docs/images/scenario-03-stabilisation.png" width="420" alt="Stabilisation"><br>Stabilisation | <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/beta/docs/images/scenario-04-running.png" width="420" alt="Heating — pump P1 running"><br>Heating — pump P1 running |
| <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/beta/docs/images/scenario-05-dhw.png" width="420" alt="DHW charging — pump P2 running"><br>DHW charging — pump P2 running | <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/beta/docs/images/scenario-06-wood.png" width="420" alt="Wood mode"><br>Wood mode |
| <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/beta/docs/images/scenario-07-takeover.png" width="420" alt="Take-over wood → pellets"><br>Take-over wood → pellets | <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/beta/docs/images/scenario-08-extinction.png" width="420" alt="Extinction / post-ventilation"><br>Extinction / post-ventilation |
| <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/beta/docs/images/scenario-09-reserve.png" width="420" alt="Pellet reserve reached"><br>Pellet reserve reached | <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/beta/docs/images/scenario-10-empty.png" width="420" alt="Pellet silo empty"><br>Pellet silo empty |
| <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/beta/docs/images/scenario-11-locked.png" width="420" alt="Boiler access disabled"><br>Boiler access disabled | <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/beta/docs/images/scenario-12-fault.png" width="420" alt="Fault"><br>Fault |
| <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/beta/docs/images/scenario-13-unavailable.png" width="420" alt="Boiler unavailable"><br>Boiler unavailable | |
