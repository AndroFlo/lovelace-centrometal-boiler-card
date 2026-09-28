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
prefix: <prefix> (optional)
debug: true (optional)
```

Only the BioTec Plus is supported. The entities are detected automatically; the former `device_type: biopl` option is still accepted, any other value shows an error.

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

![BioTec Plus](https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/main/biotec-plus-display.gif)

## Redesign proposals (work in progress)

Mock-ups of a more modern UI for the BioTec Plus. They are **not implemented yet**: the card still renders the display shown above. Values are illustrative.

| A · Modern synoptic | B · Dashboard | C · Compact card & tile |
|---|---|---|
| <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/beta/docs/images/proposal-a-synoptic.png" width="420" alt="Modern synoptic"> | <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/beta/docs/images/proposal-b-dashboard.png" width="220" alt="Dashboard"> | <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/beta/docs/images/proposal-c-compact.png" width="220" alt="Compact card and tile"> |

### Usage scenarios (modern synoptic)

| | |
|---|---|
| <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/beta/docs/images/scenario-01-off.png" width="420" alt="Off"><br>Off | <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/beta/docs/images/scenario-02-ignition.png" width="420" alt="Ignition in progress"><br>Ignition in progress |
| <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/beta/docs/images/scenario-03-stabilisation.png" width="420" alt="Stabilisation"><br>Stabilisation | <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/beta/docs/images/scenario-04-running.png" width="420" alt="Heating — pump P1 running"><br>Heating — pump P1 running |
| <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/beta/docs/images/scenario-05-dhw.png" width="420" alt="DHW charging — pump P2 running"><br>DHW charging — pump P2 running | <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/beta/docs/images/scenario-06-wood.png" width="420" alt="Wood mode"><br>Wood mode |
| <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/beta/docs/images/scenario-07-takeover.png" width="420" alt="Take-over wood → pellets"><br>Take-over wood → pellets | <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/beta/docs/images/scenario-08-extinction.png" width="420" alt="Extinction / post-ventilation"><br>Extinction / post-ventilation |
| <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/beta/docs/images/scenario-09-reserve.png" width="420" alt="Pellet reserve reached"><br>Pellet reserve reached | <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/beta/docs/images/scenario-10-empty.png" width="420" alt="Pellet silo empty"><br>Pellet silo empty |
| <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/beta/docs/images/scenario-11-locked.png" width="420" alt="Boiler access disabled"><br>Boiler access disabled | <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/beta/docs/images/scenario-12-fault.png" width="420" alt="Fault"><br>Fault |
| <img src="https://github.com/AndroFlo/lovelace-centrometal-boiler-card/raw/beta/docs/images/scenario-13-unavailable.png" width="420" alt="Boiler unavailable"><br>Boiler unavailable | |
