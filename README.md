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

## Choosing a layout

The card comes in five layouts, picked with the `layout` option (card 0.0.30 or later). In the dashboard, choose **Edit → Add card → Manual** and paste one of these:

| Layout | YAML | Best for |
|---|---|---|
| Synoptic (default) | `type: custom:centrometal-boiler-card` | full-width view of the whole installation |
| Dashboard | `type: custom:centrometal-boiler-card`<br>`layout: dashboard` | half-width column, follows the HA theme |
| **Compact** | `type: custom:centrometal-boiler-card`<br>`layout: compact` | small card: boiler temperature, state, buffer bar, key values |
| Tile | `type: custom:centrometal-boiler-card`<br>`layout: tile` | a single line in a sections dashboard |
| Classic | `type: custom:centrometal-boiler-card`<br>`layout: classic` | the original Centrometal display |

For example, a compact card:

```yaml
type: custom:centrometal-boiler-card
layout: compact
```

| `compact` | `tile` |
|---|---|
| <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/main/docs/images/card-compact.png" width="300" alt="Compact layout"> | <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/main/docs/images/card-tile.png" width="300" alt="Tile layout"> |

In a sections dashboard, `dashboard`, `compact` and `tile` take half the width; `synoptic` and `classic` take the full width. If the layout does not change after an update, reload the browser without cache (Ctrl+F5). Screenshots of every layout are in [Screenshots](#screenshots).

## Configuration

```
type: custom:centrometal-boiler-card
layout: synoptic | dashboard | compact | tile | classic (optional, default synoptic)
prefix: <prefix> (optional)
allow_power_in_wood: true (optional)
debug: true (optional)
```

Only the BioTec Plus is supported. The entities are detected automatically; the former `device_type: biopl` option is still accepted, any other value shows an error.

layout: (optional)
- `synoptic` (default): schematic of the whole installation — flue duct with the fan and the chimney (smoke above 80 °C), wood and pellet chambers with live flames, glow plug and photocell, P1 to the buffer tank, P2 to the radiator with the room thermostat, P3 to the DHW tank, tanks coloured by temperature, plus the pellet cycle phases (Arrêt → Allumage → Stabilisation → Fonctionnement → Extinction). Scales with the card width.
- `dashboard`: tiles following the Home Assistant theme (light or dark), for a half-width column.
- `compact`: boiler temperature, state, buffer bar and key values.
- `tile`: a single line for sections dashboards.
- `classic`: the original Centrometal display.

The radiator, the room thermostat and P3 are drawn only when the matching entities exist (heating circuit 1: `c1b_tpol1`, `c1b_tpol`, `c1b_tsob1`, `c1b_tsob`; third pump: `b_p3`, `b_zahp3`). Fan speed is shown as the percentage reported by `b_fan`.

Two values have no Centrometal entity and are only shown if you point the card at one:

| Key | Shown as |
|---|---|
| `domestic_hot_water_target` | DHW set point |
| `wood_door` | wood loading door open (`on`, `1` or `open`) |

```
type: custom:centrometal-boiler-card
wood_door: binary_sensor.boiler_door
domestic_hot_water_target: sensor.dhw_setpoint
```

Switching from wood to pellets: with the [Centrometal integration fork](https://github.com/AndroFlo/hass-centrometal-boiler) 0.0.56 or later, any `button.…pellet_mode` entity is detected and **Granulés** becomes clickable in wood mode (synoptic top bar and dashboard), with a confirmation inside the card. There is no remote way back to wood: that is done on the boiler. Without the entity, in pellet mode, during a take-over or when access to the boiler is disabled, it is an indicator only; tapping the greyed **Granulés** tells why. If your entity id does not end with `pellet_mode`, set it in the card:

```
type: custom:centrometal-boiler-card
pellet_mode_button: button.pellet_mode
```

Every value opens the Home Assistant more-info dialog when clicked. The power button asks for confirmation inside the card; it is disabled when access to the boiler is disabled (`control_mode` 2).

allow_power_in_wood: (optional, off by default)
In wood mode the power button is disabled, because `switch.<prefix>biotec_boiler_switch` drives the controller and not the wood fire itself: switching it off does not put the fire out. Set this to `true` to enable the button anyway; the confirmation then says so explicitly.

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

## Screenshots

| `synoptic` | `synoptic` (wood mode) |
|---|---|
| <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/main/docs/images/card-synoptic.png" width="420" alt="Synoptic layout"> | <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/main/docs/images/card-synoptic-wood.png" width="420" alt="Synoptic layout in wood mode"> |

| `dashboard` | `compact` and `tile` |
|---|---|
| <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/main/docs/images/card-dashboard.png" width="300" alt="Dashboard layout"> | <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/main/docs/images/card-compact.png" width="300" alt="Compact layout"><br><img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/main/docs/images/card-tile.png" width="300" alt="Tile layout"> |

`classic` layout:

![BioTec Plus](https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/main/biotec-plus-display.gif)

## Design mock-ups

The mock-ups the layouts above were built from. Values are illustrative; the phase timeline at the bottom of the scenarios is not implemented (it needs the list of Centrometal `boiler_state` codes).

| A · Modern synoptic | B · Dashboard | C · Compact card & tile |
|---|---|---|
| <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/main/docs/images/proposal-a-synoptic.png" width="420" alt="Modern synoptic"> | <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/main/docs/images/proposal-b-dashboard.png" width="220" alt="Dashboard"> | <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/main/docs/images/proposal-c-compact.png" width="220" alt="Compact card and tile"> |

### Usage scenarios (synoptic)

| | |
|---|---|
| <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/main/docs/images/scenario-01-off.png" width="420" alt="Off"><br>Off | <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/main/docs/images/scenario-02-ignition.png" width="420" alt="Ignition in progress"><br>Ignition in progress |
| <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/main/docs/images/scenario-03-stabilisation.png" width="420" alt="Stabilisation"><br>Stabilisation | <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/main/docs/images/scenario-04-running.png" width="420" alt="Heating — pump P1 running"><br>Heating — pump P1 running |
| <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/main/docs/images/scenario-05-dhw.png" width="420" alt="DHW charging — pump P2 running"><br>DHW charging — pump P2 running | <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/main/docs/images/scenario-06-wood.png" width="420" alt="Wood mode"><br>Wood mode |
| <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/main/docs/images/scenario-07-takeover.png" width="420" alt="Take-over wood → pellets"><br>Take-over wood → pellets | <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/main/docs/images/scenario-08-extinction.png" width="420" alt="Extinction / post-ventilation"><br>Extinction / post-ventilation |
| <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/main/docs/images/scenario-09-reserve.png" width="420" alt="Pellet reserve reached"><br>Pellet reserve reached | <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/main/docs/images/scenario-10-empty.png" width="420" alt="Pellet silo empty"><br>Pellet silo empty |
| <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/main/docs/images/scenario-11-locked.png" width="420" alt="Boiler access disabled"><br>Boiler access disabled | <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/main/docs/images/scenario-12-fault.png" width="420" alt="Fault"><br>Fault |
| <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/main/docs/images/scenario-13-unavailable.png" width="420" alt="Boiler unavailable"><br>Boiler unavailable | |
