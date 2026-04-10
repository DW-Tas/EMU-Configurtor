/**
 * EMU Configurator — Print List
 * =============================
 *
 * Renders the active-parts print list grouped by category, with
 * quantities, colour indicators, notes, and print-profile reference.
 */

import { partsManifest } from './partsManifest.js';
import { stlUrl, stlFilename } from './stlHelpers.js';

let containerEl = null;

export function init(container) {
    containerEl = container;
}

// ────────────────────────────────────────────────────────────────────
//  Update  (called by config engine on every change)
// ────────────────────────────────────────────────────────────────────

export function update(activeParts) {
    if (!containerEl) return;
    containerEl.replaceChildren();

    if (activeParts.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'section-note';
        empty.textContent = 'No parts match the current configuration.';
        containerEl.appendChild(empty);
        return;
    }

    // Group parts by category (preserving insertion order)
    const groups = new Map();
    for (const part of activeParts) {
        const cat = part.category || 'Other';
        if (!groups.has(cat)) groups.set(cat, []);
        groups.get(cat).push(part);
    }

    // Build table
    // Build list
    const list = document.createElement('ul');
    list.className = 'parts-list';

    for (const [category, parts] of groups) {
        // Category header
        const header = document.createElement('li');
        header.className = 'part-category-header';
        header.textContent = category;
        list.appendChild(header);

        for (const part of parts) {
            list.appendChild(buildPartRow(part));
        }
    }

    containerEl.appendChild(list);

    // Print-profile reference at the bottom
    renderPrintProfiles(containerEl, activeParts);
}

// ────────────────────────────────────────────────────────────────────
//  Helpers
// ────────────────────────────────────────────────────────────────────

function buildPartRow(part) {
    const li = document.createElement('li');
    li.className = 'part-file-entry';

    // Name span with colour dot + filename
    const nameSpan = document.createElement('span');
    nameSpan.className = 'part-file';
    const nameRow = `<span class="part-name-row">${colorDot(part.colorCategory)} ${esc(part.name)}</span>`;
    const filename = stlFilename(part);
    const fileRow = filename ? `<span class="part-filename">${esc(filename)}</span>` : '';
    nameSpan.innerHTML = nameRow + fileRow;

    // Quantity span
    const qtySpan = document.createElement('span');
    qtySpan.className = 'part-qty';
    qtySpan.textContent = `×${part.resolvedQty}`;

    // STL link span
    const linkSpan = document.createElement('span');
    linkSpan.className = 'part-stl-link';
    const url = stlUrl(part);
    if (url) {
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = fileExtLabel(part) + ' ↗';
        a.title = stlFilename(part);
        linkSpan.appendChild(a);
    }

    li.appendChild(nameSpan);
    li.appendChild(qtySpan);
    li.appendChild(linkSpan);

    // Notes as a div inside the same li (wraps to next line via flex-wrap)
    if (part.notes) {
        const note = document.createElement('div');
        note.className = 'print-note';
        note.textContent = part.notes;
        li.appendChild(note);
    }

    return li;
}



function fileExtLabel(part) {
    const name = stlFilename(part).toLowerCase();
    if (name.endsWith('.3mf')) return '3MF';
    if (name.endsWith('.step') || name.endsWith('.stp')) return 'STEP';
    return 'STL';
}

/** Colour dot legend matching filament prefix conventions. */
function colorDot(category) {
    const map = {
        main:        '<span class="color-dot dot-main" title="Main colour" aria-label="Main colour"></span>',
        default:     '<span class="color-dot dot-main" title="Main colour" aria-label="Main colour"></span>',
        accent:      '<span class="color-dot dot-accent" title="Accent colour" aria-label="Accent colour"></span>',
        translucent: '<span class="color-dot dot-translucent" title="Translucent" aria-label="Translucent"></span>',
        tpu:         '<span class="color-dot dot-tpu" title="TPU" aria-label="TPU"></span>',
        spiralVase:  '<span class="color-dot dot-main" title="Spiral-vase mode" aria-label="Spiral-vase mode"></span>',
    };
    return map[category] || map.default;
}

function esc(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
}

// ────────────────────────────────────────────────────────────────────
//  Print profiles reference
// ────────────────────────────────────────────────────────────────────

function renderPrintProfiles(container, activeParts) {
    const used = new Set(activeParts.map(p => p.printProfile).filter(Boolean));
    if (used.size === 0) return;

    const section = document.createElement('div');
    section.className = 'print-profiles-section';

    const heading = document.createElement('h4');
    heading.textContent = 'Print Settings Reference';
    section.appendChild(heading);

    for (const pid of used) {
        const profile = partsManifest.printProfiles[pid];
        if (!profile) continue;

        const block = document.createElement('div');
        block.className = 'print-profile';

        const name = document.createElement('strong');
        name.textContent = profile.name;
        block.appendChild(name);

        // Compact settings summary
        if (profile.settings) {
            const summary = document.createElement('div');
            summary.className = 'print-profile-settings';
            summary.textContent = Object.entries(profile.settings)
                .map(([k, v]) => `${camelToTitle(k)}: ${v}`)
                .join(' · ');
            block.appendChild(summary);
        }

        // Notes
        if (profile.notes?.length) {
            const ul = document.createElement('ul');
            ul.className = 'print-profile-notes';
            for (const note of profile.notes) {
                const li = document.createElement('li');
                li.textContent = note;
                ul.appendChild(li);
            }
            block.appendChild(ul);
        }

        section.appendChild(block);
    }

    container.appendChild(section);
}

function camelToTitle(s) {
    return s.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()).trim();
}
