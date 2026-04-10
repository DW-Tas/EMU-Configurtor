/**
 * EMU Configurator — STL Helpers
 * ===============================
 *
 * Shared URL and filename helpers for STL/3MF part files.
 */

import { partsManifest } from './partsManifest.js';

/** Build the download URL for a part. */
export function stlUrl(part) {
    if (part.externalUrl) return part.externalUrl;
    if (!part.stlPath) return null;
    const encoded = part.stlPath
        .split('/')
        .map(seg => encodeURIComponent(seg))
        .join('/');
    return partsManifest.stlBaseUrl + encoded;
}

/** Extract the decoded filename from a part's URL or path. */
export function stlFilename(part) {
    const raw = part.externalUrl || part.stlPath || '';
    return decodeURIComponent(raw.split('/').pop());
}
