# CLAUDE.md

Home Assistant Lovelace card (`custom:centrometal-boiler-card`) that renders the "synoptic" display of the Centrometal **BioTec Plus** boiler (the only supported model; PelTec, CM Pelet-set and BioTec-L support was removed) from the entities created by the Centrometal WiFi HA integration. Distributed through HACS (category `plugin`). Fork of `9a4gl/lovelace-centrometal-boiler-card`; `origin` is `AndroFlo/lovelace-centrometal-boiler-card`.

## Stack / build

- **No build step, no package.json, no tests.** `dist/` *is* the source: plain ES modules loaded as-is by the browser.
- LitElement 2.0.1 is imported straight from `https://unpkg.com/lit-element@2.0.1/lit-element.js?module` in every file (the card needs internet access to load).
- Only CI: `.github/workflows/validate.yml` (HACS validation on push/PR/release). `hacs.json` declares the entry point `centrometal-boiler-card.js`; HACS looks for it in `dist/` and copies the whole `dist/` folder to `www/community/lovelace-centrometal-boiler-card/`.
- Testing = copy `dist/` into a HA instance's `config/www/community/lovelace-centrometal-boiler-card/` and reload the dashboard. For a different local path, switch `images_folder` in `dist/DisplayArea.js` (commented line) — do not commit that.

## Architecture

```
centrometal-boiler-card.js   LitElement <centrometal-boiler-card>, always builds a BioTecPlusDisplay
└─ DisplayArea.js            geometry + render helpers (createImage/createText/createCard/createStyle)
   ├─ DisplaySubArea.js      sub-area positioned relative to its parent (createSubArea)
   └─ Display.js             HA entity resolution, values, shouldUpdate
      └─ DisplayWithPowerButton.js   button + TURN ON / TURN OFF popup (switch.*)
         └─ BioTecPlus.js   BioTecPlusDisplay   (sensor.biotec*, background 1024x562)
```

The entry file also registers the card in `window.customCards` (card picker) and provides `getGridOptions` (sections dashboards) and `getStubConfig`.

### Lifecycle
1. `setConfig` copies the YAML config (`prefix`, `debug`, optional per-entity overrides).
2. First `render` → `configureDisplay()`: `device_type` is optional and kept for older configs; any value other than `biopl` shows an error.
3. `BioTecPlusDisplay.configureDisplay()` calls `configureParameter(...)` for every entity, then creates its `DisplaySubArea`s. If it returns a **string**, that string is shown as an error in the card.
4. Every `render` → `createContent(hass)`: `updateParameterValues` fills `this.values[name]` (HA state, `"unavailable"` or missing entity → `"-"`), then returns an `html` template stacking images and texts over a background PNG.
5. `shouldUpdate` only re-renders when a tracked entity changed or the card height changed. Changes are logged to the console only with `debug: true` in the card config.

### `configureParameter(starts_with, name, opt, value_if_missing)` (Display.js)
- Picks the first entity that **starts with** `starts_with` (e.g. `sensor.biotec`, with `prefix` injected: `sensor.<prefix>_biotec`) and **ends with** `name`.
- `"name|alias"`: `alias` is an alternative name, usually the raw Centrometal code (e.g. `b_zlj`, `b_tptv1`).
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
`dist/images/biopl/` (plus `dist/images/transparent.png`) — original Centrometal assets with Croatian names (`pumpa` = pump, `ventilator` = fan, `vatra` = fire, `spremnik` = tank, `slavina` = tap/DHW, `radijator` = radiator, `vanjska` = outdoor, `senzor` = sensor, `dozator` = pellet feeder).

## BioTec Plus specifics
- Blocks driven by bits of `configuration` (`b_konf`) via `hexBitIsSet/Clear`: bit 11 clear = buffer tank shown, bit 5 set = DHW tank shown.
- `wood_pellet_mode` (0 = pellets, 1 = wood) shades the inactive chamber and disables the power button in wood mode; `control_mode` 2 = access to the boiler disabled; `take_over` (0/1/2) is only selectable in pellet mode with `control_mode` 1.

## Conventions
- **Cache-busting version**: every import and image URL carries `?v=0.0.30` (9 occurrences in `dist/`). HACS only cache-busts the entry file, so bump **all** occurrences together on every release (`grep -rn 'v=0.0.30' dist`), otherwise browsers mix stale cached modules with new ones.
- Existing style: 4-space indent (2 in `centrometal-boiler-card.js`), inconsistent semicolons, HTML comments `<!-- Section -->` to split templates. Stay consistent with the file being edited; duplication between blocks is accepted (copy the closest neighbouring block and adjust coordinates).
- Commands: `turn_on`/`turn_off` on the `switch.biotec*boiler_switch` entity via `root.hass.callService`.
- Document any new option in `README.md` (YAML example; demo GIF `biotec-plus-display.gif` at repo root). `docs/images/` holds screenshots of the redesign mock-ups shown in the README (outside `dist/`, so HACS does not ship them).

## Release (HACS)
1. Bump the `?v=` version in `dist/` and commit on `main`.
2. Push a tag equal to that version (`git tag 0.0.30 && git push origin 0.0.30`). `.github/workflows/release.yml` checks that every `?v=` in `dist/` matches the tag, then publishes the GitHub release, which HACS offers as a version.
3. HACS validation needs the GitHub repo to have a description, topics and issues enabled.
