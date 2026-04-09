/**
 * EMU Configurator — Configuration Engine
 * ========================================
 *
 * Manages configuration state, auto-generates the UI from the manifest,
 * resolves part conditions / quantities, and persists state via URL hash
 * and sessionStorage.
 *
 * Public API:
 *   init()              — call once after DOM ready
 *   getConfig()         — returns a shallow copy of current config
 *   getActiveParts()    — returns parts matching current config
 *   onChange(callback)  — register listener: callback(config, activeParts)
 *   generateShareUrl()  — shareable URL encoding current config
 *   resetToDefaults()   — reset everything to manifest defaults
 */

import { partsManifest } from './partsManifest.js';

// ────────────────────────────────────────────────────────────────────
//  State
// ────────────────────────────────────────────────────────────────────
const state = {
    config: {},
    listeners: [],
};

// ────────────────────────────────────────────────────────────────────
//  Initialisation
// ────────────────────────────────────────────────────────────────────

export function init() {
    // 1. Set defaults from manifest
    for (const [id, option] of Object.entries(partsManifest.configOptions)) {
        state.config[id] = option.default;
    }

    // 2. Try URL hash first, then session storage
    if (!loadStateFromHash()) {
        loadStateFromSession();
    }

    // 3. Build UI
    generateUI();

    // 4. Apply visibility / enable rules
    applyOptionRules();

    // 5. Notify listeners for initial render
    notifyListeners();
}

// ────────────────────────────────────────────────────────────────────
//  Public getters
// ────────────────────────────────────────────────────────────────────

export function getConfig() {
    return { ...state.config };
}

export function onChange(callback) {
    state.listeners.push(callback);
}

// ────────────────────────────────────────────────────────────────────
//  Part resolution
// ────────────────────────────────────────────────────────────────────

export function getActiveParts() {
    const config = state.config;
    const active = [];

    for (const [id, part] of Object.entries(partsManifest.parts)) {
        // Skip combiner parts — they are handled by auto-calculation below
        if (part._combinerPorts) continue;

        if (!matchesConditions(part, config)) continue;

        const qty = resolveQty(part.qty, config);
        if (qty <= 0) continue;

        active.push({
            id,
            ...part,
            resolvedQty: qty,
            resolvedPrintQty: part.perFile ? Math.ceil(qty / part.perFile) : qty,
        });
    }

    // Auto-calculate combiners from lane count
    const combinerParts = calculateCombiners(config.laneCount);
    for (const cp of combinerParts) {
        active.push(cp);
    }

    return active;
}

/**
 * Evaluate whether a part's conditions match the current config.
 *   requires  — ALL must match
 *   excludeIf — if ANY match the part is excluded
 */
function matchesConditions(part, config) {
    if (part.requires) {
        for (const [key, value] of Object.entries(part.requires)) {
            const configVal = config[key];

            if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                // Range check  { min?, max? }
                if (value.min !== undefined && configVal < value.min) return false;
                if (value.max !== undefined && configVal > value.max) return false;
            } else if (Array.isArray(value)) {
                if (!value.includes(configVal)) return false;
            } else {
                if (configVal !== value) return false;
            }
        }
    }

    if (part.excludeIf) {
        for (const [key, value] of Object.entries(part.excludeIf)) {
            const configVal = config[key];
            if (Array.isArray(value)) {
                if (value.includes(configVal)) return false;
            } else {
                if (configVal === value) return false;
            }
        }
    }

    return true;
}

/**
 * Resolve a quantity definition against the current config.
 */
function resolveQty(qtyDef, config) {
    if (typeof qtyDef === 'number') return qtyDef;
    if (qtyDef && typeof qtyDef === 'object') {
        let result = Number(config[qtyDef.multiply]) || 0;
        if (qtyDef.factor) result *= qtyDef.factor;
        if (qtyDef.offset) result += qtyDef.offset;
        if (qtyDef.min !== undefined) result = Math.max(qtyDef.min, result);
        return Math.max(0, Math.round(result));
    }
    return 1;
}

/**
 * Auto-calculate which combiners are needed for a given lane count.
 *
 * Available sizes: 2, 4, 8.
 * When chaining, the output of one combiner feeds into a port of the next,
 * consuming one of its inputs. E.g. 12 lanes → 8-1 + 8-1 (first uses 8
 * ports for lanes, second uses 1 port for the first combiner's output + up
 * to 7 more lanes; 8 + (8−1) = 15 capacity, 12 fits).
 */
function calculateCombiners(laneCount) {
    if (laneCount <= 1) return [];

    const sizes = [8, 4, 2]; // available combiner port counts, largest first
    const combinerDefs = {};
    for (const [id, part] of Object.entries(partsManifest.parts)) {
        if (part._combinerPorts) combinerDefs[part._combinerPorts] = { id, ...part };
    }

    // Greedy: pick the smallest combiner that fits remaining lanes.
    // When chaining, each additional combiner loses 1 port to the upstream output.
    const needed = []; // array of port counts
    let remaining = laneCount;

    // First combiner: all ports available for lanes
    // Subsequent combiners: 1 port consumed by upstream output, so capacity = ports - 1

    while (remaining > 0) {
        const isFirst = needed.length === 0;
        let picked = null;

        for (let i = sizes.length - 1; i >= 0; i--) {
            const s = sizes[i];
            const capacity = isFirst ? s : s - 1;
            if (capacity >= remaining) {
                picked = s;
                break;
            }
        }
        // If no size fits exactly, use the largest
        if (!picked) picked = sizes[0];

        needed.push(picked);
        const capacity = isFirst ? picked : picked - 1;
        remaining -= capacity;
    }

    // Tally quantities per size
    const tally = {};
    for (const s of needed) {
        tally[s] = (tally[s] || 0) + 1;
    }

    const result = [];
    for (const [ports, qty] of Object.entries(tally)) {
        const def = combinerDefs[Number(ports)];
        if (!def) continue;
        result.push({
            ...def,
            resolvedQty: qty,
            resolvedPrintQty: qty,
        });
    }
    return result;
}

// ────────────────────────────────────────────────────────────────────
//  Listener notification
// ────────────────────────────────────────────────────────────────────

function notifyListeners() {
    const config = getConfig();
    const activeParts = getActiveParts();
    for (const fn of state.listeners) {
        fn(config, activeParts);
    }
    saveStateToSession();
}

// ────────────────────────────────────────────────────────────────────
//  UI generation  (reads configSections + configOptions from manifest)
// ────────────────────────────────────────────────────────────────────

function generateUI() {
    const container = document.getElementById('config-sections');
    if (!container) return;
    container.innerHTML = '';

    for (const section of partsManifest.configSections) {
        const el = document.createElement('section');
        el.className = 'config-section';
        el.id = `section-${section.id}`;

        // Section heading
        const h3 = document.createElement('h3');
        h3.textContent = section.label;
        el.appendChild(h3);

        if (section.description) {
            const desc = document.createElement('p');
            desc.className = 'section-note';
            desc.textContent = section.description;
            el.appendChild(desc);
        }

        // Special layout: colour pickers side-by-side
        if (section.layout === 'color-row') {
            const row = document.createElement('div');
            row.className = 'color-pickers';
            for (const optId of section.options) {
                const opt = partsManifest.configOptions[optId];
                if (opt) row.appendChild(buildColorPicker(optId, opt));
            }
            el.appendChild(row);
        } else {
            for (const optId of section.options) {
                const opt = partsManifest.configOptions[optId];
                if (!opt) continue;
                // Optional sub-header above this option
                if (section.subHeaders && section.subHeaders[optId]) {
                    const sub = document.createElement('h4');
                    sub.className = 'option-sub-header';
                    sub.textContent = section.subHeaders[optId];
                    el.appendChild(sub);
                }
                el.appendChild(buildOption(optId, opt));
            }
        }

        container.appendChild(el);
    }
}

// ── Option builders ──────────────────────────────────────────────────

function buildOption(id, opt) {
    const wrap = document.createElement('div');
    wrap.className = 'option-wrapper';
    wrap.dataset.optionId = id;

    switch (opt.type) {
        case 'radio':    return buildRadioGroup(id, opt, wrap);
        case 'checkbox': return buildCheckbox(id, opt, wrap);
        case 'number':   return buildNumberInput(id, opt, wrap);
        case 'color':    return buildColorPicker(id, opt);
        default:         return wrap;
    }
}

function buildRadioGroup(id, opt, wrap) {
    const group = document.createElement('div');
    group.className = 'option-group';
    group.dataset.config = id;

    for (const o of opt.options) {
        const label = document.createElement('label');
        label.className = 'option';
        label.dataset.value = o.value;

        const input = document.createElement('input');
        input.type = 'radio';
        input.name = id;
        input.value = o.value;
        input.checked = state.config[id] === o.value;
        input.addEventListener('change', () => {
            state.config[id] = o.value;
            applyOptionRules();
            notifyListeners();
        });

        const span = document.createElement('span');
        span.className = 'option-label';
        span.textContent = o.label;

        label.appendChild(input);
        label.appendChild(span);

        if (o.description) {
            const desc = document.createElement('span');
            desc.className = 'option-description';
            desc.textContent = ` — ${o.description}`;
            label.appendChild(desc);
        }

        group.appendChild(label);
    }

    wrap.appendChild(group);
    return wrap;
}

function buildCheckbox(id, opt, wrap) {
    const label = document.createElement('label');
    label.className = 'option checkbox';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = id;
    input.checked = !!state.config[id];
    input.addEventListener('change', () => {
        state.config[id] = input.checked;
        applyOptionRules();
        notifyListeners();
    });

    const span = document.createElement('span');
    span.className = 'option-label';
    span.textContent = opt.label;

    label.appendChild(input);
    label.appendChild(span);
    wrap.appendChild(label);

    if (opt.description) {
        const desc = document.createElement('p');
        desc.className = 'section-note';
        desc.textContent = opt.description;
        wrap.appendChild(desc);
    }

    return wrap;
}

function buildNumberInput(id, opt, wrap) {
    const row = document.createElement('div');
    row.className = 'number-input-row';

    const btnMinus = document.createElement('button');
    btnMinus.className = 'number-btn';
    btnMinus.textContent = '−';
    btnMinus.type = 'button';

    const input = document.createElement('input');
    input.type = 'number';
    input.id = id;
    input.name = id;
    input.min = opt.min;
    input.max = opt.max;
    input.value = state.config[id];
    input.className = 'number-input';

    const btnPlus = document.createElement('button');
    btnPlus.className = 'number-btn';
    btnPlus.textContent = '+';
    btnPlus.type = 'button';

    const update = (v) => {
        const clamped = Math.max(opt.min, Math.min(opt.max, v));
        input.value = clamped;
        state.config[id] = clamped;
        applyOptionRules();
        notifyListeners();
    };

    btnMinus.addEventListener('click', () => update(state.config[id] - 1));
    btnPlus.addEventListener('click', () => update(state.config[id] + 1));
    input.addEventListener('change', () => update(parseInt(input.value, 10) || opt.min));

    row.appendChild(btnMinus);
    row.appendChild(input);
    row.appendChild(btnPlus);

    if (opt.description) {
        const desc = document.createElement('p');
        desc.className = 'section-note';
        desc.textContent = opt.description;
        wrap.appendChild(desc);
    }

    wrap.appendChild(row);
    return wrap;
}

function buildColorPicker(id, opt) {
    const group = document.createElement('div');
    group.className = 'color-picker-group';

    const label = document.createElement('label');
    label.htmlFor = id;
    label.textContent = opt.label;

    const input = document.createElement('input');
    input.type = 'color';
    input.id = id;
    input.name = id;
    input.value = state.config[id];
    input.addEventListener('input', () => {
        state.config[id] = input.value;
        notifyListeners();
    });

    group.appendChild(label);
    group.appendChild(input);
    return group;
}

// ────────────────────────────────────────────────────────────────────
//  Option rules  (enable / disable / hide based on other options)
// ────────────────────────────────────────────────────────────────────

function applyOptionRules() {
    for (const rule of partsManifest.optionRules) {
        // Hide entire option wrapper
        if (rule.hiddenIf) {
            const hidden = evaluateCondition(rule.hiddenIf);
            const wrapper = document.querySelector(`[data-option-id="${rule.option}"]`);
            if (wrapper) wrapper.style.display = hidden ? 'none' : '';
        }

        // Enable / disable a specific radio value
        if (rule.enabledIf && rule.value !== undefined) {
            const enabled = evaluateCondition(rule.enabledIf);
            const label = document.querySelector(
                `[data-config="${rule.option}"] [data-value="${rule.value}"]`
            );
            if (label) {
                label.classList.toggle('disabled', !enabled);
                const input = label.querySelector('input');
                if (input) {
                    input.disabled = !enabled;
                    // If current value is now disabled, fall back to first enabled
                    if (!enabled && input.checked) {
                        const fallback = document.querySelector(
                            `[data-config="${rule.option}"] label:not(.disabled) input`
                        );
                        if (fallback) {
                            fallback.checked = true;
                            state.config[rule.option] = fallback.value;
                        }
                    }
                }
            }
        }
    }
}

function evaluateCondition(cond) {
    for (const [key, value] of Object.entries(cond)) {
        if (state.config[key] !== value) return false;
    }
    return true;
}

// ────────────────────────────────────────────────────────────────────
//  URL hash & session persistence
// ────────────────────────────────────────────────────────────────────

function loadStateFromHash() {
    const hash = window.location.hash.slice(1);
    if (!hash) return false;
    try {
        const decoded = JSON.parse(atob(hash));
        if (decoded && decoded.config) {
            // Only accept known keys
            for (const key of Object.keys(decoded.config)) {
                if (key in partsManifest.configOptions) {
                    state.config[key] = decoded.config[key];
                }
            }
            return true;
        }
    } catch {
        console.warn('Invalid configuration URL — using defaults');
    }
    return false;
}

function loadStateFromSession() {
    try {
        const raw = sessionStorage.getItem('emu-config');
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        if (parsed) {
            for (const key of Object.keys(parsed)) {
                if (key in partsManifest.configOptions) {
                    state.config[key] = parsed[key];
                }
            }
            return true;
        }
    } catch { /* ignored */ }
    return false;
}

function saveStateToSession() {
    try {
        sessionStorage.setItem('emu-config', JSON.stringify(state.config));
    } catch { /* ignored */ }
}

export function generateShareUrl() {
    const payload = { config: state.config };
    const hash = btoa(JSON.stringify(payload));
    return `${window.location.origin}${window.location.pathname}#${hash}`;
}

export function resetToDefaults() {
    for (const [id, option] of Object.entries(partsManifest.configOptions)) {
        state.config[id] = option.default;
    }
    sessionStorage.removeItem('emu-config');
    window.location.hash = '';

    // Rebuild UI to sync inputs
    generateUI();
    applyOptionRules();
    notifyListeners();
}
