/**
 * EMU Configurator — Application Entry Point
 * ============================================
 *
 * Wires the config engine to the parts manifest panel
 * and handles action buttons (download, share, reset).
 */

import * as ConfigEngine from './configEngine.js';
import * as PrintList    from './printList.js';
import { downloadStls }  from './downloadManager.js';

// ────────────────────────────────────────────────────────────────────
//  Config change handler
// ────────────────────────────────────────────────────────────────────

function onConfigChange(_config, activeParts) {
    PrintList.update(activeParts);
}

// ────────────────────────────────────────────────────────────────────
//  Action buttons
// ────────────────────────────────────────────────────────────────────

function setupButtons() {
    // Download STLs
    const dlBtn = document.getElementById('download-stls');
    if (dlBtn) {
        dlBtn.addEventListener('click', async () => {
            const parts = ConfigEngine.getActiveParts();
            dlBtn.disabled = true;
            dlBtn.textContent = 'Preparing…';
            try {
                await downloadStls(parts, (done, total, msg) => {
                    dlBtn.textContent = `${msg} (${done}/${total})`;
                });
            } finally {
                dlBtn.disabled = false;
                dlBtn.textContent = 'Download STLs';
            }
        });
    }

    // Share configuration
    const shareBtn = document.getElementById('share-config');
    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            const url = ConfigEngine.generateShareUrl();
            try {
                await navigator.clipboard.writeText(url);
                shareBtn.textContent = 'URL Copied!';
                setTimeout(() => { shareBtn.textContent = 'Share Configuration'; }, 2000);
            } catch {
                prompt('Copy this configuration URL:', url);
            }
        });
    }

    // Reset
    const resetBtn = document.getElementById('reset-config');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            ConfigEngine.resetToDefaults();
        });
    }
}

// ────────────────────────────────────────────────────────────────────
//  Bootstrap
// ────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    // Print list
    PrintList.init(document.getElementById('print-list'));

    // Config engine (generates UI + triggers first update)
    ConfigEngine.onChange(onConfigChange);
    ConfigEngine.init();

    // Wire up action buttons
    setupButtons();
});
