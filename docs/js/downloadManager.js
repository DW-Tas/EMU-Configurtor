/**
 * EMU Configurator — Download Manager
 * ====================================
 *
 * Handles STL / 3MF file downloads and ZIP bundling.
 * Fetches files on demand from the EMU repo and third-party repos.
 */

import { partsManifest } from './partsManifest.js';

// ────────────────────────────────────────────────────────────────────
//  Public API
// ────────────────────────────────────────────────────────────────────

/**
 * Download all STLs for the given active parts as a ZIP.
 * @param {Array} activeParts - resolved parts from configEngine.getActiveParts()
 * @param {Function} [onProgress] - (completed, total, message) callback
 */
export async function downloadStls(activeParts, onProgress) {
    if (typeof JSZip === 'undefined') {
        alert('JSZip library failed to load — cannot create ZIP.');
        return;
    }

    const zip = new JSZip();
    const errors = [];

    // De-duplicate by download URL (e.g. entry + exit may share the same STL)
    const unique = new Map();
    for (const part of activeParts) {
        const url = stlUrl(part);
        if (!unique.has(url)) {
            unique.set(url, { part, filename: stlFilename(part) });
        }
    }

    const total = unique.size;
    let done = 0;
    if (onProgress) onProgress(0, total, 'Starting download…');

    // Download in small parallel batches
    const entries = [...unique.entries()];
    const BATCH = 3;

    for (let i = 0; i < entries.length; i += BATCH) {
        const batch = entries.slice(i, i + BATCH);
        await Promise.all(
            batch.map(async ([url, { part, filename }]) => {
                try {
                    const res = await fetch(url);
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    const blob = await res.blob();
                    const folder = sanitiseFolder(part.category || 'Other');
                    zip.file(`${folder}/${filename}`, blob);
                } catch (err) {
                    errors.push(`${part.name}: ${err.message}`);
                }
                done++;
                if (onProgress) onProgress(done, total, `Downloading ${part.name}…`);
            })
        );
    }

    if (onProgress) onProgress(total, total, 'Creating ZIP…');

    const blob = await zip.generateAsync({ type: 'blob' });

    // Trigger browser download
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `EMU_STLs_${activeParts.length}_parts.zip`;
    a.click();
    URL.revokeObjectURL(a.href);

    if (errors.length) {
        console.warn('Download errors:', errors);
        alert(`Download complete with ${errors.length} error(s):\n${errors.join('\n')}`);
    }
}

// ────────────────────────────────────────────────────────────────────
//  Helpers
// ────────────────────────────────────────────────────────────────────

function stlUrl(part) {
    if (part.externalUrl) return part.externalUrl;
    // Encode each path segment individually to handle spaces & brackets
    const encoded = part.stlPath
        .split('/')
        .map(seg => encodeURIComponent(seg))
        .join('/');
    return partsManifest.stlBaseUrl + encoded;
}

function stlFilename(part) {
    const raw = part.externalUrl || part.stlPath || '';
    return decodeURIComponent(raw.split('/').pop());
}

/** Remove characters that are invalid in ZIP folder names. */
function sanitiseFolder(name) {
    return name.replace(/[<>:"/\\|?*]/g, '_');
}
