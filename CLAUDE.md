# CLAUDE.md

Home Assistant Lovelace card (`custom:centrometal-boiler-card`) that renders the "synoptic" display of Centrometal boilers (PelTec, CM Pelet-set, BioTec-L, BioTec Plus) from the entities created by the Centrometal WiFi HA integration. Distributed through HACS (category `plugin`). Fork of `9a4gl/lovelace-centrometal-boiler-card`; `origin` is `AndroFlo/lovelace-centrometal-boiler-card`.

## Stack / build

- **No build step, no package.json, no tests.** `dist/` *is* the source: plain ES modules loaded as-is by the browser.
- LitElement 2.0.1 is imported straight from `https://unpkg.com/lit-element@2.0.1/lit-element.js?module` in every file (the card needs internet access to load).
- Only CI: `.github/workflows/validate.yml` (HACS validation on push/PR/release). `hacs.json` declares the entry point `centrometal-boiler-card.js`; HACS looks for it in `dist/` and copies the whole `dist/` folder to `www/community/lovelace-centrometal-boiler-card/`.
- Testing = copy `dist/` into a HA instance's `config/www/community/lovelace-centrometal-boiler-card/` and reload the dashboard. For a different local path, switch `images_folder` in `dist/DisplayArea.js` (commented line) — do not commit that.

## Architecture

```
centrometal-boiler-card.js   LitElement <centrometal-boiler-card>, picks the display from device_type
└─ DisplayArea.js            geometry + render helpers (createImage/createText/createCard/createStyle)
   ├─ DisplaySubArea.js      sub-area positioned relative to its parent (createSubArea)
   └─ Display.js             HA entity resolution, values, shouldUpdate
      ├─ BioTec.js          BioTecDisplay   (sensor.biotec*, no power button)
      └─ DisplayWithPowerButton.js   button + TURN ON / TURN OFF popup (switch.*)
         ├─ PelTec.js       PelTecDisplay       (sensor.peltec*,   background 1024x580)
         ├─ CmPelet.js      CmPeletDisplay      (sensor.cm_pelet*, 1024x562)
         └─ BioTecPlus.js   BioTecPlusDisplay   (sensor.biotec*,   1024x562)
```

The entry file also registers the card in `window.customCards` (card picker) and provides `getGridOptions` (sections dashboards) and `getStubConfig`.

### Lifecycle
1. `setConfig` copies the YAML config (`device_type`, `prefix`, optional per-entity overrides).
2. First `render` → `configureDisplay()`: if `device_type` is missing it is auto-detected from a `sensor.*_device_type` entity. Accepted values: `peltec`, `cmpelet`/`cm_pelet`, `biotec`, `biopl`.
3. Each boiler's `configureDisplay()` calls `configureParameter(...)` for every entity, then creates its `DisplaySubArea`s. If it returns a **string**, that string is shown as an error in the card.
4. Every `render` → `createContent(hass)`: `updateParameterValues` fills `this.values[name]` (HA state, `"unavailable"` or missing entity → `"-"`), then returns an `html` template stacking images and texts over a background PNG.
5. `shouldUpdate` only re-renders when a tracked entity changed or the card height changed. Changes are logged to the console only with `debug: true` in the card config.

### `configureParameter(starts_with, name, opt, value_if_missing)` (Display.js)
- Picks the first entity that **starts with** `starts_with` (e.g. `sensor.cm_pelet`, with `prefix` injected: `sensor.<prefix>_cm_pelet`) and **ends with** `name`.
- `"name|alias"`: `alias` is an alternative name, usually the raw Centrometal code (e.g. `b_zlj`, `b_tptv1`, `c1b_tpol1`).
- A key with the same name in the card YAML forces the entity_id.
- Without `"optional"` a missing entity throws → error shown. With `"optional"` it is simply absent from `this.values` (test with `"x" in this.values`), unless `value_if_missing` is given.
- `this.parameters[name]` = entity_id (used for `hass-more-info` on click and for `callService`).

### Rendering / coordinates
- All positions are **pixels of the reference background** (~1024 px wide), scaled to the real size by `getDimensionX/Y`. Font sizes are multiplied by `scale_factor` (updated by the card's `ResizeObserver`).
- `createImage(img, left, top, width, height, zIndex, entity)` / `createText(text, fontSize, css, left, top, width, height, zIndex, padding, entity)`: the last `entity` argument makes the element clickable (opens the HA more-info dialog). A `!` suffix on an image = `pointer-events: none`. `width`/`height` accept `null`, `"auto"` or a CSS string.
- Inside a sub-area use the **sub-area's** methods (`this.bufferArea.createText(...)`): coordinates are then relative to that area.
- `conditional(cond, expr, else)` is the conditional-display mechanism; `transparent.png` is used as a clickable placeholder when an element is inactive.
- `formatTemperature(name, default="--", max=145)` hides out-of-range values (missing sensor).

### Images
`dist/images/<family>/` (`peltec`, `cmpelet`, `biotec`, `biopl`, `unit`, …) — original Centrometal assets with Croatian names (`pumpa` = pump, `ventilator` = fan, `vatra` = fire, `spremnik` = tank, `slavina` = tap/DHW, `radijator` = radiator, `vanjska` = outdoor, `cjevovod` = piping, `senzor` = sensor, `grijac` = heater). Images are shared across boilers (e.g. PelTec uses `cmpelet/vanjska.png`, `biopl/dhw.png`).

## Per-boiler specifics
- **PelTec**: optional blocks depend on `configuration` (string containing `BUF`, `DHW`, …).
- **CmPelet**: the hydraulic layout depends on `setup` (`A.0.0`, `A.0.1`, `A.0.2`, `I.7.0`) — `createSetup()` picks the block for the setup and composes it from `createBufferTank()` and `createHeatingCircuit(x, ...)` in `setupArea`; add a new setup as a new `case` there. The boiler picture depends on `firmware_version`, `centroplus` and `b_smd` (0 = pellets, 1 = wood). Firmware checks are computed once at the top of `createContent` (`fwBefore125`, `fw125`, …) as **lexicographic** string comparisons: that is deliberate, since it's unknown whether Centrometal versions are decimal (v1.3 = v1.30) or semver.
- **BioTec**: blocks driven by bits of `configuration` (`conf_bit_*` sub-areas, `hexBitIsSet/Clear` helpers).

## Conventions
- **Cache-busting version**: every import and image URL carries `?v=0.0.29` (21 occurrences in `dist/`). HACS only cache-busts the entry file, so bump **all** occurrences together on every release (`grep -rn 'v=0.0.29' dist`), otherwise browsers mix stale cached modules with new ones.
- Existing style: 4-space indent (2 in `centrometal-boiler-card.js`), inconsistent semicolons, HTML comments `<!-- Section -->` to split templates. Stay consistent with the file being edited; duplication between setups is accepted (copy the closest neighbouring block and adjust coordinates).
- Commands: `turn_on`/`turn_off` on the `switch.<type>*boiler_switch` entity via `root.hass.callService`.
- Document any new boiler type/option in `README.md` (YAML example + demo GIF at repo root).

## Release (HACS)
1. Bump the `?v=` version in `dist/` and commit on `main`.
2. Push a tag equal to that version (`git tag 0.0.30 && git push origin 0.0.30`). `.github/workflows/release.yml` checks that every `?v=` in `dist/` matches the tag, then publishes the GitHub release, which HACS offers as a version.
3. HACS validation needs the GitHub repo to have a description, topics and issues enabled.
