# lovelace-centrometal-boiler-card

Home assistant lovelace card to support Centrometal (https://www.centrometal.hr/) boiler with WiFi integration into Home Assistant (a free and open-source software for home automation designed to be a central control system for smart home devices with a focus on local control and privacy).

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
device_type: peltec | cmpelet | biotec | biopl (optional)
prefix: <prefix> (optional)
debug: true (optional)
```
device_type:
Optional parameter, if you have only one boiler the card shall properly detect device type.
- peltec (PelTec and PelTec Lambda)
- cmpelet (CentroPlus + Cm Pelet-set, EKO-CK P + Cm Pelet-Set)
- biotec (BioTec-L)
- biopl (BioTec Plus)

debug: true (optional)
Logs every change of the boiler entities to the browser console. Off by default.

prefix: <prefix>
Prefix is optional, if defined when adding device to HA all entities are prefixed with it. Here you can define the prefix for boiler entities. This is usefull if you add several boilers into system to distinguish entities per boiler.

## Multiple boilers

```
- type: custom:centrometal-boiler-card
  device_type: peltec
  prefix: john
- type: custom:centrometal-boiler-card
  device_type: cmpelet
  prefix: mike
- type: custom:centrometal-boiler-card
  device_type: biotec
  prefix: joe
- type: custom:centrometal-boiler-card
  device_type: cmpelet
  prefix: alex
- type: custom:centrometal-boiler-card
  device_type: biopl
  prefix: jack
```

![Peltec Display Example](https://github.com/9a4gl/lovelace-centrometal-boiler-card/raw/main/all-display.gif)

## PelTec Lambda

```
type: custom:centrometal-boiler-card
device_type: peltec
```

![Peltec Display Example](https://github.com/9a4gl/lovelace-centrometal-boiler-card/raw/main/peltec-display.gif)

## Centro Plus + Cm Pelet-set

```
type: custom:centrometal-boiler-card
device_type: cmpelet
```

![CentroPlus](https://github.com/9a4gl/lovelace-centrometal-boiler-card/raw/main/cmpelet-display.gif)

## BioTec-L

```
type: custom:centrometal-boiler-card
device_type: biotec
```

![BioTec](https://github.com/9a4gl/lovelace-centrometal-boiler-card/raw/main/biotec-display.gif)

## BioTec Plus

```
type: custom:centrometal-boiler-card
device_type: biopl
```

![BioTec Plus](https://github.com/9a4gl/lovelace-centrometal-boiler-card/raw/main/biotec-plus-display.gif)

## EKO-CK P + Cm Pelet-set
```
type: custom:centrometal-boiler-card
device_type: cmpelet
```

![EKO-CK P](https://github.com/9a4gl/lovelace-centrometal-boiler-card/raw/main/eko-ckp-display.gif)

