/**
 * EMU MMU Configurator — Parts Manifest
 * ======================================
 *
 * Single source of truth for all configuration options, part definitions,
 * compatibility rules, and print settings.
 *
 * ADDING A NEW CONFIG OPTION:
 *   1. Add to configOptions (with a unique key)
 *   2. Add the key to the relevant configSections entry
 *   3. Add any visibility/enable rules to optionRules
 *   4. Add/update parts that reference the new option
 *
 * ADDING A NEW PART:
 *   1. Add an entry to `parts` with a unique key
 *   2. Set requires / excludeIf conditions
 *   3. Set qty (number or formula object)
 *   4. Set colorCategory and printProfile
 *
 * COLOR CATEGORIES (match filament prefix conventions):
 *   "main"        — main color (no prefix or [m] prefix)
 *   "accent"      — accent color ([a] prefix)
 *   "translucent" — translucent ([t] prefix)
 *   "tpu"         — TPU material ([TPU] prefix)
 *   "spiralVase"  — printed in spiral/vase mode
 *   "default"     — alias for main color
 *
 * QUANTITY FORMATS:
 *   Number:  fixed qty (e.g. 1)
 *   Object:  { multiply: "configKey", factor: N, offset: N, min: N }
 *            multiply — config key whose value is the base
 *            factor   — multiplier (default 1)
 *            offset   — added after multiply (default 0)
 *            min      — floor clamp (default 0)
 *
 * PER-FILE COUNT:
 *   perFile: N — indicates the STL produces N items per print.
 *   The print list will display both total items and number of prints.
 */

export const partsManifest = {
    version: "0.1.0",

    // ── STL base URL (local repo raw files) ──────────────────────────
    stlBaseUrl: "https://raw.githubusercontent.com/DW-Tas/EMU/main/STL/",

    // ── External STL sources ─────────────────────────────────────────
    externalSources: {
        slb: {
            name: "SLB Board for EMU (kashine6)",
            baseUrl: "https://raw.githubusercontent.com/kashine6/SLB-Board-For-EMU/main/STLS/",
        },
        ioBoard: {
            name: "EMU I/O Board (kashine6)",
            baseUrl: "https://raw.githubusercontent.com/kashine6/EMU-IO-Board/main/STLS/",
        },
    },

    // ══════════════════════════════════════════════════════════════════
    //  PRINT PROFILES
    // ══════════════════════════════════════════════════════════════════
    printProfiles: {
        structural: {
            name: "Structural (Filamentalist & Stepper)",
            settings: {
                layerHeight: "0.2 mm",
                firstLayerHeight: "0.2 mm",
                walls: 4,
                infill: "40 %",
                infillType: "Gyroid",
                extrusionWidth: "0.4 mm",
                wallOrder: "Inner → Outer",
                wallGenerator: "Arachne",
                topBottomSurfaces: "1 wall",
                thickBridges: false,
                zHop: "0.2 mm",
            },
            notes: [
                "Parts are NOT shrinkage-compensated — calibrate your filament first.",
                "Disable thick bridges — over-extrusion causes bearings/magnets not to fit.",
                "Idler_Roller_Axle and Stepper_Tension_Arm: print with 999 walls for strength.",
            ],
        },
        dryBox: {
            name: "Dry Box",
            settings: {
                layerHeight: "0.2 mm",
                firstLayerHeight: "0.2 mm",
                walls: 3,
                infill: "15 %",
                lidWalls: 4,
                lidInfill: "30 %",
                infillType: "Gyroid",
                extrusionWidth: "0.4 mm",
                wallOrder: "Inner → Outer",
                wallGenerator: "Arachne",
                topBottomSurfaces: "1 wall",
                thickBridges: false,
                zHop: "0.2 mm",
            },
            notes: [
                "Lid: use 4 walls and 30 % infill for strength in the front lip.",
                "Over-extrude box & lid by ~2 % (EM +0.02) for air-tightness.",
                "Print with extra first-layer squish + adhesion promoter + pre-heated chamber.",
                "Do NOT use mouse ears on the lid (slicer fills in aesthetic lines).",
                "Mouse ears on box corners are OK if needed.",
            ],
        },
        base: {
            name: "Base Unit",
            settings: {
                layerHeight: "0.2 mm",
                firstLayerHeight: "0.2 mm",
                walls: 3,
                infill: "15 %",
                infillType: "Gyroid",
                extrusionWidth: "0.4 mm",
                wallOrder: "Outer → Inner → Outer",
                wallGenerator: "Arachne",
                topBottomSurfaces: "1 wall",
                thickBridges: false,
                zHop: "0.2 mm",
            },
            notes: [
                "Paint-on fuzzy skin on outer walls (0.1 distance, 0.1–0.2 mm depth, displacement).",
                "Eject-button lens: 99 walls recommended to hide infill through natural ABS.",
                "Print with extra first-layer squish + adhesion promoter + pre-heated chamber.",
            ],
        },
        tpuCdr: {
            name: "TPU CDR Ring",
            settings: {
                layerHeight: "0.2 mm",
                firstLayerHeight: "0.2 mm",
                extrusionWidth: "0.4 mm",
                walls: 6,
                avoidCrossingWalls: true,
                seam: "Random",
                wallOrder: "Inner → Outer",
                zHop: "OFF",
            },
            notes: [
                "Print solid (6 walls, no infill gap).",
                "Random seam — avoids an aligned seam bump.",
                "Z-Hop OFF to reduce stringing.",
                "Slight negative retract extra-length (−0.1) can help.",
            ],
        },
        spiralVase: {
            name: "Spiral / Vase Mode",
            settings: { mode: "Spiral Vase" },
            notes: ["Print in spiral-vase mode."],
        },
    },

    // ══════════════════════════════════════════════════════════════════
    //  CONFIGURATION SECTIONS  (drives UI panel layout)
    // ══════════════════════════════════════════════════════════════════
    configSections: [
        {
            id: "unit-setup",
            label: "Unit Setup",
            options: ["laneCount"],
        },
        {
            id: "electronics",
            label: "Electronics",
            options: ["boardType"],
        },
        {
            id: "pcb-upgrades",
            label: "PCB Upgrades",
            description: "Recommended optional PCB upgrades that simplify wiring and assembly.",
            options: ["pcbHatchBoard", "pcbMultiLed", "pcbIoBoard"],
        },
        {
            id: "cable-routing",
            label: "Cable Routing",
            options: ["cableEntry", "cableExit"],
            subHeaders: { cableEntry: "Inlet Side", cableExit: "Outlet Side" },
        },
        {
            id: "sync-sensor",
            label: "Sync Sensor",
            options: ["syncType"],
        },
        {
            id: "dry-box",
            label: "Dry Box",
            options: ["lidLeft", "lidRight"],
            subHeaders: { lidLeft: "Left Half", lidRight: "Right Half" },
        },
        {
            id: "button",
            label: "Eject Button",
            options: ["buttonStyle", "diffuserThickness"],
        },
        {
            id: "filamentalist-options",
            label: "Filamentalist",
            options: ["cdrType"],
        },

    ],

    // ══════════════════════════════════════════════════════════════════
    //  CONFIG OPTIONS  (auto-generates UI controls)
    // ══════════════════════════════════════════════════════════════════
    configOptions: {
        // ── Unit Setup ───────────────────────────────────────────────
        laneCount: {
            label: "Number of Lanes",
            type: "number",
            min: 1,
            max: 16,
            default: 5,
            description: "Total filament lanes in your EMU setup",
        },


        // ── Electronics ──────────────────────────────────────────────
        boardType: {
            label: "Controller Board",
            type: "radio",
            default: "ebb42",
            options: [
                { value: "ebb42", label: "BTT EBB42", description: "Recommended" },
                { value: "ebb36", label: "BTT EBB36", description: "Fully compatible" },
                { value: "slb",   label: "Solo Lane Board (SLB)", description: "Simplifies wiring significantly" },
            ],
        },

        // ── PCB Upgrades ─────────────────────────────────────────────
        pcbHatchBoard: {
            label: "PCB Hatch Board",
            type: "checkbox",
            default: false,
            description: "Replaces printed wiring hatch — simplifies wiring & sealing",
        },
        pcbMultiLed: {
            label: "Multi-LED Button PCB",
            type: "checkbox",
            default: false,
            description: "Dynamic lighting on eject button — replaces standard button parts",
        },
        pcbIoBoard: {
            label: "I/O Board",
            type: "checkbox",
            default: false,
            description: "Dedicated I/O board — uses different cable entry / exit parts",
        },

        // ── Cable Routing ────────────────────────────────────────────
        cableEntry: {
            label: "Cable Entry (Entry Side)",
            type: "radio",
            default: "default",
            options: [
                { value: "default",  label: "Default (CAN + 3-pin JST)" },
                { value: "io-board", label: "I/O Board Version" },
            ],
        },
        cableExit: {
            label: "Cable Exit (Exit Side)",
            type: "radio",
            default: "blank",
            options: [
                { value: "blank",    label: "Blank (sealed)" },
                { value: "default",  label: "CAN + 3-pin JST" },
                { value: "io-board", label: "I/O Board Version" },
            ],
        },

        // ── Sync Sensor ──────────────────────────────────────────────
        syncType: {
            label: "Sync Sensor Type",
            type: "radio",
            default: "standard",
            options: [
                { value: "standard", label: "Standard EMU Sync" },
                { value: "psf",      label: "PSF (Proportional Sync Feedback)", description: "Clog / tangle detection + better sync" },
            ],
        },

        // ── Dry Box ──────────────────────────────────────────────────
        lidLeft: {
            label: "Box Lid — Left Side",
            type: "radio",
            default: "standard",
            options: [
                { value: "standard", label: "Standard" },
                { value: "mmu",      label: "MMU border (no logo)" },
                { value: "emu",      label: "MMU border (EMU logo)" },
            ],
        },
        lidRight: {
            label: "Box Lid — Right Side",
            type: "radio",
            default: "standard",
            options: [
                { value: "standard", label: "Standard" },
                { value: "mmu",      label: "MMU border (no logo)" },
                { value: "emu",      label: "MMU border (EMU logo)" },
            ],
        },

        // ── Eject Button ─────────────────────────────────────────────
        buttonStyle: {
            label: "Button Style",
            type: "radio",
            default: "standard",
            options: [
                { value: "standard", label: "Standard" },
                { value: "mmu",      label: "MMU" },
            ],
        },
        diffuserThickness: {
            label: "Diffuser Thickness",
            type: "radio",
            default: "standard",
            options: [
                { value: "standard", label: "Standard" },
                { value: "thicker",  label: "Thicker (for PCB)" },
            ],
        },

        // ── Filamentalist ────────────────────────────────────────────
        cdrType: {
            label: "CDR Type",
            type: "radio",
            default: "abs",
            options: [
                { value: "abs", label: "Standard ABS" },
                { value: "tpu", label: "TPU Flex Ring" },
            ],
        },


    },

    // ══════════════════════════════════════════════════════════════════
    //  OPTION RULES  (visibility & availability)
    // ══════════════════════════════════════════════════════════════════
    optionRules: [
        // I/O Board cable entry option only available when PCB I/O Board is ticked
        {
            option: "cableEntry",
            value: "io-board",
            enabledIf: { pcbIoBoard: true },
        },
        // I/O Board cable exit option only available when PCB I/O Board is ticked
        {
            option: "cableExit",
            value: "io-board",
            enabledIf: { pcbIoBoard: true },
        },
        // Diffuser thickness is irrelevant when Multi-LED PCB is selected
        // (it has its own fixed parts)
        {
            option: "diffuserThickness",
            hiddenIf: { pcbMultiLed: true },
        },
    ],

    // ══════════════════════════════════════════════════════════════════
    //  PARTS
    //  Every printable part with conditions, quantities, and metadata.
    // ══════════════════════════════════════════════════════════════════
    parts: {

        // ═══════════════════════════════════════
        //  BASE ASSEMBLY
        // ═══════════════════════════════════════

        // --- Base frames ---
        "base-single": {
            name: "Single Lane Base",
            category: "Base",
            stlPath: "Base/Single_Lane_Base.stl",
            qty: 1,
            colorCategory: "default",
            printProfile: "base",
            requires: { laneCount: { max: 1 } },
        },
        "base-multi-left": {
            name: "Multi Lane Base — Left",
            category: "Base",
            stlPath: "Base/Multi_Lane_Base-Left.stl",
            qty: 1,
            colorCategory: "default",
            printProfile: "base",
            requires: { laneCount: { min: 2 } },
        },
        "base-multi-right": {
            name: "Multi Lane Base — Right",
            category: "Base",
            stlPath: "Base/Multi_Lane_Base-Right.stl",
            qty: 1,
            colorCategory: "default",
            printProfile: "base",
            requires: { laneCount: { min: 2 } },
        },
        "base-multi-expander": {
            name: "Multi Lane Base — Expander",
            category: "Base",
            stlPath: "Base/Multi_Lane_Base-Expander.stl",
            qty: { multiply: "laneCount", offset: -2, min: 0 },
            colorCategory: "default",
            printProfile: "base",
            requires: { laneCount: { min: 3 } },
        },

        // --- Board mounts (per lane) ---
        "base-mount-ebb42": {
            name: "EBB42 Board Mount",
            category: "Base",
            stlPath: "Base/[a]_Ebb42_Mount.stl",
            qty: { multiply: "laneCount" },
            colorCategory: "accent",
            printProfile: "base",
            requires: { boardType: "ebb42" },
        },
        "base-mount-ebb36": {
            name: "EBB36 Board Mount",
            category: "Base",
            stlPath: "Base/[a]_Ebb36_Mount.stl",
            qty: { multiply: "laneCount" },
            colorCategory: "accent",
            printProfile: "base",
            requires: { boardType: "ebb36" },
        },
        "base-mount-slb": {
            name: "SLB Board Mount",
            category: "Base",
            externalUrl: "https://raw.githubusercontent.com/kashine6/SLB-Board-For-EMU/main/STLS/%5Ba%5D_SLB_Mount_for_EMU.stl",
            qty: { multiply: "laneCount" },
            colorCategory: "accent",
            printProfile: "base",
            requires: { boardType: "slb" },
            notes: "Source: kashine6/SLB-Board-For-EMU",
        },

        // --- Cable Entry (Entry Side) — 1 set per unit ---
        "cable-entry-inside-default": {
            name: "Cable Entry — Inside (Entry Side)",
            category: "Base",
            stlPath: "Base/[a]_Cable_Entry-Inside.stl",
            qty: 1,
            colorCategory: "accent",
            printProfile: "base",
            requires: { cableEntry: "default" },
        },
        "cable-entry-outside-default": {
            name: "Cable Entry — Outside (Entry Side)",
            category: "Base",
            stlPath: "Base/[a]_Cable_Entry-Outside.stl",
            qty: 1,
            colorCategory: "accent",
            printProfile: "base",
            requires: { cableEntry: "default" },
        },
        "cable-entry-inside-ioboard": {
            name: "Cable Entry — I/O Board Inside (Entry Side)",
            category: "Base",
            externalUrl: "https://raw.githubusercontent.com/kashine6/EMU-IO-Board/main/STLS/%5Ba%5D_Cable%20Entry%20-%20IO%20Board%20Inner.stl",
            qty: 1,
            colorCategory: "accent",
            printProfile: "base",
            requires: { cableEntry: "io-board" },
            notes: "Source: kashine6/EMU-IO-Board",
        },
        "cable-entry-outside-ioboard": {
            name: "Cable Entry — I/O Board Outside (Entry Side)",
            category: "Base",
            externalUrl: "https://raw.githubusercontent.com/kashine6/EMU-IO-Board/main/STLS/%5Bm%5D_Cable%20Entry%20-%20IO%20Board%20OutSide.stl",
            qty: 1,
            colorCategory: "main",
            printProfile: "base",
            requires: { cableEntry: "io-board" },
            notes: "Source: kashine6/EMU-IO-Board",
        },

        // --- Cable Exit (Exit Side) — 1 set per unit ---
        "cable-exit-inside-blank": {
            name: "Cable Entry — Inside [blank] (Exit Side)",
            category: "Base",
            stlPath: "Base/[a]_Cable_Entry-Inside_[blank].stl",
            qty: 1,
            colorCategory: "accent",
            printProfile: "base",
            requires: { cableExit: "blank" },
        },
        "cable-exit-outside-blank": {
            name: "Cable Entry — Outside [blank] (Exit Side)",
            category: "Base",
            stlPath: "Base/[a]_Cable_Entry-Outside_[blank].stl",
            qty: 1,
            colorCategory: "accent",
            printProfile: "base",
            requires: { cableExit: "blank" },
        },
        "cable-exit-inside-default": {
            name: "Cable Entry — Inside (Exit Side)",
            category: "Base",
            stlPath: "Base/[a]_Cable_Entry-Inside.stl",
            qty: 1,
            colorCategory: "accent",
            printProfile: "base",
            requires: { cableExit: "default" },
        },
        "cable-exit-outside-default": {
            name: "Cable Entry — Outside (Exit Side)",
            category: "Base",
            stlPath: "Base/[a]_Cable_Entry-Outside.stl",
            qty: 1,
            colorCategory: "accent",
            printProfile: "base",
            requires: { cableExit: "default" },
        },
        "cable-exit-inside-ioboard": {
            name: "Cable Entry — I/O Board Inside (Exit Side)",
            category: "Base",
            externalUrl: "https://raw.githubusercontent.com/kashine6/EMU-IO-Board/main/STLS/%5Ba%5D_Cable%20Entry%20-%20IO%20Board%20Inner.stl",
            qty: 1,
            colorCategory: "accent",
            printProfile: "base",
            requires: { cableExit: "io-board" },
            notes: "Source: kashine6/EMU-IO-Board",
        },
        "cable-exit-outside-ioboard": {
            name: "Cable Entry — I/O Board Outside (Exit Side)",
            category: "Base",
            externalUrl: "https://raw.githubusercontent.com/kashine6/EMU-IO-Board/main/STLS/%5Bm%5D_Cable%20Entry%20-%20IO%20Board%20OutSide.stl",
            qty: 1,
            colorCategory: "main",
            printProfile: "base",
            requires: { cableExit: "io-board" },
            notes: "Source: kashine6/EMU-IO-Board",
        },

        // --- Wago holder (per lane) ---
        "base-wago-holder": {
            name: "Wago 221-413 Holder",
            category: "Base",
            stlPath: "Base/[a]_Wago221-413_Holder.stl",
            qty: { multiply: "laneCount" },
            colorCategory: "accent",
            printProfile: "base",
            excludeIf: { boardType: "slb" },
        },

        // --- Button parts (standard — no Multi-LED PCB) ---
        "base-button-front": {
            name: "Button Front",
            category: "Base",
            stlPath: "Base/Button_Front.stl",
            qty: { multiply: "laneCount" },
            colorCategory: "default",
            printProfile: "base",
            excludeIf: { pcbMultiLed: true },
        },
        "base-button-rear": {
            name: "Button Rear",
            category: "Base",
            stlPath: "Base/Button_Rear.stl",
            qty: { multiply: "laneCount" },
            colorCategory: "default",
            printProfile: "base",
            excludeIf: { pcbMultiLed: true },
        },
        "base-button-filter": {
            name: "Button Filter",
            category: "Base",
            stlPath: "Base/Button_Filter.stl",
            qty: { multiply: "laneCount" },
            colorCategory: "default",
            printProfile: "base",
            excludeIf: { pcbMultiLed: true },
        },

        // --- Button diffusers (standard — no Multi-LED PCB) ---
        "base-diffuser-standard": {
            name: "Button Diffuser",
            category: "Base",
            stlPath: "Base/[t]_Button_Diffuser.stl",
            qty: { multiply: "laneCount" },
            colorCategory: "translucent",
            printProfile: "base",
            requires: { buttonStyle: "standard", diffuserThickness: "standard" },
            excludeIf: { pcbMultiLed: true },
        },
        "base-diffuser-standard-thicker": {
            name: "Button Diffuser (Thicker PCB)",
            category: "Base",
            stlPath: "Base/[t]_Button_Diffuser[thicker_PCB].stl",
            qty: { multiply: "laneCount" },
            colorCategory: "translucent",
            printProfile: "base",
            requires: { buttonStyle: "standard", diffuserThickness: "thicker" },
            excludeIf: { pcbMultiLed: true },
        },
        "base-diffuser-mmu": {
            name: "Button Diffuser (MMU)",
            category: "Base",
            stlPath: "Base/Button Diffuser MMU/[t]_Button_Diffuser_MMU.3mf",
            qty: { multiply: "laneCount" },
            colorCategory: "translucent",
            printProfile: "base",
            requires: { buttonStyle: "mmu", diffuserThickness: "standard" },
            excludeIf: { pcbMultiLed: true },
            notes: "Multi-colour 3MF file",
        },
        "base-diffuser-mmu-thicker": {
            name: "Button Diffuser (MMU, Thicker PCB)",
            category: "Base",
            stlPath: "Base/Button Diffuser MMU/[t]_Button_Diffuser_MMU[thicker_PCB].3mf",
            qty: { multiply: "laneCount" },
            colorCategory: "translucent",
            printProfile: "base",
            requires: { buttonStyle: "mmu", diffuserThickness: "thicker" },
            excludeIf: { pcbMultiLed: true },
            notes: "Multi-colour 3MF file",
        },

        // --- Button parts (Multi-LED PCB versions) ---
        "pcb-button-front": {
            name: "Button Front (Multi-LED PCB)",
            category: "Base",
            externalUrl: "https://raw.githubusercontent.com/DW-Tas/EMU/main/PCB%20(recommended%20options)/multi_led_button/STL/Button_Front.stl",
            qty: { multiply: "laneCount" },
            colorCategory: "default",
            printProfile: "base",
            requires: { pcbMultiLed: true },
        },
        "pcb-button-rear": {
            name: "Button Rear (Multi-LED PCB)",
            category: "Base",
            externalUrl: "https://raw.githubusercontent.com/DW-Tas/EMU/main/PCB%20(recommended%20options)/multi_led_button/STL/Button_Rear.stl",
            qty: { multiply: "laneCount" },
            colorCategory: "default",
            printProfile: "base",
            requires: { pcbMultiLed: true },
        },
        "pcb-button-filter": {
            name: "Button Filter (Multi-LED PCB)",
            category: "Base",
            externalUrl: "https://raw.githubusercontent.com/DW-Tas/EMU/main/PCB%20(recommended%20options)/multi_led_button/STL/Non-MMU%20diffuser/Button_Filter.stl",
            qty: { multiply: "laneCount" },
            colorCategory: "default",
            printProfile: "base",
            requires: { pcbMultiLed: true, buttonStyle: "standard" },
        },
        "pcb-diffuser-standard": {
            name: "Button Diffuser (Multi-LED PCB)",
            category: "Base",
            externalUrl: "https://raw.githubusercontent.com/DW-Tas/EMU/main/PCB%20(recommended%20options)/multi_led_button/STL/Non-MMU%20diffuser/%5Bt%5D_Button_Diffuser.stl",
            qty: { multiply: "laneCount" },
            colorCategory: "translucent",
            printProfile: "base",
            requires: { pcbMultiLed: true, buttonStyle: "standard" },
        },
        "pcb-diffuser-mmu": {
            name: "Button Diffuser MMU (Multi-LED PCB)",
            category: "Base",
            externalUrl: "https://raw.githubusercontent.com/DW-Tas/EMU/main/PCB%20(recommended%20options)/multi_led_button/STL/%5Bt%5D_Button_Diffuser_MMU_L0_L16.step",
            qty: { multiply: "laneCount" },
            colorCategory: "translucent",
            printProfile: "base",
            requires: { pcbMultiLed: true, buttonStyle: "mmu" },
            notes: "STEP file — may need conversion to STL for printing",
        },

        // ═══════════════════════════════════════
        //  DRY BOX
        // ═══════════════════════════════════════

        "box-base": {
            name: "Box Base",
            category: "Dry Box",
            stlPath: "Box/Box_Base.stl",
            qty: { multiply: "laneCount" },
            colorCategory: "default",
            printProfile: "dryBox",
        },
        "box-latch": {
            name: "Box Latch",
            category: "Dry Box",
            stlPath: "Box/Box_Latch.stl",
            qty: { multiply: "laneCount" },
            colorCategory: "default",
            printProfile: "dryBox",
        },
        "box-wiring-hatch": {
            name: "Box Wiring Hatch",
            category: "Dry Box",
            stlPath: "Box/[a]_Box_wiring_hatch.stl",
            qty: { multiply: "laneCount" },
            colorCategory: "accent",
            printProfile: "dryBox",
            excludeIf: { pcbHatchBoard: true },
            notes: "Not needed if using the PCB Hatch Board",
        },

        // --- Box lids — left side ---
        "box-lid-left-standard": {
            name: "Box Lid — Left (Standard)",
            category: "Dry Box",
            stlPath: "Box/[a]_Box_Lid_left.stl",
            qty: { multiply: "laneCount" },
            colorCategory: "accent",
            printProfile: "dryBox",
            requires: { lidLeft: "standard" },
        },
        "box-lid-left-mmu": {
            name: "Box Lid — Left (MMU Logo)",
            category: "Dry Box",
            stlPath: "Box/Lid MMU/[a]_Box_Lid_left_mmu.3mf",
            qty: { multiply: "laneCount" },
            colorCategory: "accent",
            printProfile: "dryBox",
            requires: { lidLeft: "mmu" },
            notes: "Multi-colour 3MF file",
        },
        "box-lid-left-emu": {
            name: "Box Lid — Left (EMU Logo)",
            category: "Dry Box",
            stlPath: "Box/Lid MMU/[a]_Box_Lid_left_mmu_emu_logo.3mf",
            qty: { multiply: "laneCount" },
            colorCategory: "accent",
            printProfile: "dryBox",
            requires: { lidLeft: "emu" },
            notes: "Multi-colour 3MF file",
        },

        // --- Box lids — right side ---
        "box-lid-right-standard": {
            name: "Box Lid — Right (Standard)",
            category: "Dry Box",
            stlPath: "Box/[a]_Box_Lid_right.stl",
            qty: { multiply: "laneCount" },
            colorCategory: "accent",
            printProfile: "dryBox",
            requires: { lidRight: "standard" },
        },
        "box-lid-right-mmu": {
            name: "Box Lid — Right (MMU Logo)",
            category: "Dry Box",
            stlPath: "Box/Lid MMU/[a]_Box_Lid_right_mmu.3mf",
            qty: { multiply: "laneCount" },
            colorCategory: "accent",
            printProfile: "dryBox",
            requires: { lidRight: "mmu" },
            notes: "Multi-colour 3MF file",
        },
        "box-lid-right-emu": {
            name: "Box Lid — Right (EMU Logo)",
            category: "Dry Box",
            stlPath: "Box/Lid MMU/[a]_Box_Lid_right_mmu_emu_logo.3mf",
            qty: { multiply: "laneCount" },
            colorCategory: "accent",
            printProfile: "dryBox",
            requires: { lidRight: "emu" },
            notes: "Multi-colour 3MF file",
        },

        // ═══════════════════════════════════════
        //  STEPPER ASSEMBLY  (per lane)
        // ═══════════════════════════════════════

        "stepper-main-body": {
            name: "Stepper Main Body",
            category: "Stepper",
            stlPath: "Stepper/Stepper_Main_Body.stl",
            qty: { multiply: "laneCount" },
            colorCategory: "default",
            printProfile: "structural",
        },
        "stepper-box-mnt-front-l": {
            name: "Box Mount Front L",
            category: "Stepper",
            stlPath: "Stepper/Box_Mnt_Front_L.stl",
            qty: { multiply: "laneCount" },
            colorCategory: "default",
            printProfile: "structural",
        },
        "stepper-box-mnt-front-r": {
            name: "Box Mount Front R",
            category: "Stepper",
            stlPath: "Stepper/Box_Mnt_Front_R.stl",
            qty: { multiply: "laneCount" },
            colorCategory: "default",
            printProfile: "structural",
        },
        "stepper-led-holder": {
            name: "LED Holder",
            category: "Stepper",
            stlPath: "Stepper/LED_holder.stl",
            qty: { multiply: "laneCount" },
            colorCategory: "default",
            printProfile: "structural",
        },
        "stepper-bme280-holder": {
            name: "BME280 Humidity Sensor Holder",
            category: "Stepper",
            stlPath: "Stepper/[a]_BME280_Holder.stl",
            qty: { multiply: "laneCount" },
            colorCategory: "accent",
            printProfile: "structural",
        },
        "stepper-motor-plate": {
            name: "Stepper Motor Plate",
            category: "Stepper",
            stlPath: "Stepper/[a]_Stepper_Motor_Plate.stl",
            qty: { multiply: "laneCount" },
            colorCategory: "accent",
            printProfile: "structural",
        },
        "stepper-tension-arm": {
            name: "Stepper Tension Arm (MR693zz)",
            category: "Stepper",
            stlPath: "Stepper/[a]_Stepper_Tension_Arm[MR693zz].stl",
            qty: { multiply: "laneCount" },
            colorCategory: "accent",
            printProfile: "structural",
            notes: "Print with 999 walls for strength",
        },

        // ═══════════════════════════════════════
        //  FILAMENTALIST  (per lane)
        // ═══════════════════════════════════════

        "fil-chassis-l": {
            name: "Chassis L (688 Bearing)",
            category: "Filamentalist",
            stlPath: "Filamentalist/Chassis_L_688_Bearing.stl",
            qty: { multiply: "laneCount" },
            colorCategory: "default",
            printProfile: "structural",
        },
        "fil-chassis-r": {
            name: "Chassis R (688 Bearing)",
            category: "Filamentalist",
            stlPath: "Filamentalist/Chassis_R_688_Bearing.stl",
            qty: { multiply: "laneCount" },
            colorCategory: "default",
            printProfile: "structural",
        },
        "fil-bearing-bushing": {
            name: "688 Bearing Bushing",
            category: "Filamentalist",
            stlPath: "Filamentalist/688_Bearing_Bushing.stl",
            qty: { multiply: "laneCount" },
            colorCategory: "default",
            printProfile: "structural",
        },
        "fil-tensioner-mount": {
            name: "Tensioner Mount with Sensor",
            category: "Filamentalist",
            stlPath: "Filamentalist/EMU_Tensioner_Mount_with_Sensor.stl",
            qty: { multiply: "laneCount" },
            colorCategory: "default",
            printProfile: "structural",
        },
        "fil-idler-axle": {
            name: "Idler Roller Axle",
            category: "Filamentalist",
            stlPath: "Filamentalist/Idler_Roller_Axle.stl",
            qty: { multiply: "laneCount" },
            colorCategory: "default",
            printProfile: "structural",
            notes: "Print with 999 walls for strength",
        },
        "fil-cdr-abs": {
            name: "CDR",
            category: "Filamentalist",
            stlPath: "Filamentalist/[a]_CDR.stl",
            qty: { multiply: "laneCount" },
            colorCategory: "accent",
            printProfile: "structural",
            requires: { cdrType: "abs" },
        },
        "fil-cdr-tpu": {
            name: "CDR (TPU version)",
            category: "Filamentalist",
            stlPath: "Filamentalist/(Option) TPU_CDR/[a]_CDR.stl",
            qty: { multiply: "laneCount" },
            colorCategory: "accent",
            printProfile: "tpuCdr",
            requires: { cdrType: "tpu" },
        },
        "fil-tpu-half-ring": {
            name: "TPU Half Ring Flex 1.65 mm",
            category: "Filamentalist",
            stlPath: "Filamentalist/(Option) TPU_CDR/[TPU]_Half_Ring_Flex_1.65mm_x2.stl",
            qty: { multiply: "laneCount", factor: 2 },
            perFile: 2,
            colorCategory: "tpu",
            printProfile: "tpuCdr",
            requires: { cdrType: "tpu" },
        },
        "fil-idler-roller": {
            name: "Idler Roller",
            category: "Filamentalist",
            stlPath: "Filamentalist/[a]_Idler_Roller_x2.stl",
            qty: { multiply: "laneCount", factor: 2 },
            perFile: 2,
            colorCategory: "accent",
            printProfile: "structural",
        },
        "fil-rim-roller": {
            name: "Rim Roller (Square Nut)",
            category: "Filamentalist",
            stlPath: "Filamentalist/[a]_Rim_Roller_SquareNut_x2.stl",
            qty: { multiply: "laneCount", factor: 2 },
            perFile: 2,
            colorCategory: "accent",
            printProfile: "structural",
        },
        "fil-tensioner-arm": {
            name: "Tensioner Arm",
            category: "Filamentalist",
            stlPath: "Filamentalist/[a]_Tensioner_Arm.stl",
            qty: { multiply: "laneCount" },
            colorCategory: "accent",
            printProfile: "structural",
        },

        // ═══════════════════════════════════════
        //  DESICCANT BOX  (per lane)
        // ═══════════════════════════════════════

        "desiccant-base": {
            name: "Desiccant Box Base",
            category: "Desiccant Box",
            stlPath: "Desiccant-box/Desiccant_Box_Base.stl",
            qty: { multiply: "laneCount" },
            colorCategory: "default",
            printProfile: "structural",
        },
        "desiccant-lid": {
            name: "Desiccant Box Lid",
            category: "Desiccant Box",
            stlPath: "Desiccant-box/[a]_Desiccant_Box_Lid.stl",
            qty: { multiply: "laneCount" },
            colorCategory: "accent",
            printProfile: "structural",
        },
        "desiccant-funnel": {
            name: "Desiccant Box Funnel",
            category: "Desiccant Box",
            stlPath: "Desiccant-box/[spiral_vase]Desiccant_Box_Funnel.stl",
            qty: { multiply: "laneCount" },
            colorCategory: "default",
            printProfile: "spiralVase",
        },

        // ═══════════════════════════════════════
        //  COMBINER  (auto-calculated from lane count)
        //  These parts are injected by configEngine, not by requires/excludeIf.
        //  They are kept here as reference definitions only.
        // ═══════════════════════════════════════

        "combiner-2-1": {
            name: "Combiner 2-to-1",
            category: "Combiner",
            stlPath: "Combiner/Combiner_2-1.stl",
            qty: 0,
            colorCategory: "default",
            printProfile: "structural",
            _combinerPorts: 2,
        },
        "combiner-4-1": {
            name: "Combiner 4-to-1",
            category: "Combiner",
            stlPath: "Combiner/Combiner_4-1.stl",
            qty: 0,
            colorCategory: "default",
            printProfile: "structural",
            _combinerPorts: 4,
        },
        "combiner-8-1": {
            name: "Combiner 8-to-1",
            category: "Combiner",
            stlPath: "Combiner/Combiner_8-1.stl",
            qty: 0,
            colorCategory: "default",
            printProfile: "structural",
            _combinerPorts: 8,
        },

        // ═══════════════════════════════════════
        //  EMU SYNC  (Tension-Compression Sensor)
        // ═══════════════════════════════════════

        // --- Standard EMU Sync ---
        "sync-main-body": {
            name: "EMUSync Main Body",
            category: "EMU Sync",
            stlPath: "Tension-compression-sensor/EMUSync_main_body.stl",
            qty: 1,
            colorCategory: "default",
            printProfile: "structural",
            requires: { syncType: "standard" },
        },
        "sync-cable-cover": {
            name: "EMUSync Cable Cover",
            category: "EMU Sync",
            stlPath: "Tension-compression-sensor/[a]_Cable_cover.stl",
            qty: 1,
            colorCategory: "accent",
            printProfile: "structural",
            requires: { syncType: "standard" },
        },
        "sync-ecas-trigger": {
            name: "EMUSync ECAS Trigger",
            category: "EMU Sync",
            stlPath: "Tension-compression-sensor/[a]_ECAS_trigger.stl",
            qty: 1,
            colorCategory: "accent",
            printProfile: "structural",
            requires: { syncType: "standard" },
        },
        "sync-end-cap": {
            name: "EMUSync End Cap",
            category: "EMU Sync",
            stlPath: "Tension-compression-sensor/[a]_End_cap.stl",
            qty: 1,
            colorCategory: "accent",
            printProfile: "structural",
            requires: { syncType: "standard" },
        },

        // --- PSF Version ---
        "sync-psf-main-body": {
            name: "EMUSync Main Body (PSF)",
            category: "EMU Sync",
            stlPath: "Tension-compression-sensor/Proportional Sync Feedback (PSF) Version/EMUSync_main_body[PSF].stl",
            qty: 1,
            colorCategory: "default",
            printProfile: "structural",
            requires: { syncType: "psf" },
        },
        "sync-psf-cable-cover": {
            name: "EMUSync Cable Cover (PSF)",
            category: "EMU Sync",
            stlPath: "Tension-compression-sensor/Proportional Sync Feedback (PSF) Version/[a]_Cable_cover[PSF].stl",
            qty: 1,
            colorCategory: "accent",
            printProfile: "structural",
            requires: { syncType: "psf" },
        },
        "sync-psf-ecas-trigger": {
            name: "EMUSync ECAS Trigger (PSF)",
            category: "EMU Sync",
            stlPath: "Tension-compression-sensor/Proportional Sync Feedback (PSF) Version/[a]_ECAS_trigger[PSF].stl",
            qty: 1,
            colorCategory: "accent",
            printProfile: "structural",
            requires: { syncType: "psf" },
        },
        "sync-psf-end-cap": {
            name: "EMUSync End Cap (PSF)",
            category: "EMU Sync",
            stlPath: "Tension-compression-sensor/Proportional Sync Feedback (PSF) Version/[a]_End_cap[PSF].stl",
            qty: 1,
            colorCategory: "accent",
            printProfile: "structural",
            requires: { syncType: "psf" },
        },
        "sync-psf-ecas-clip": {
            name: "ECAS Clip",
            category: "EMU Sync",
            stlPath: "Tension-compression-sensor/Proportional Sync Feedback (PSF) Version/ECAS_Clip_x2.stl",
            qty: 2,
            perFile: 2,
            colorCategory: "default",
            printProfile: "structural",
            requires: { syncType: "psf" },
        },

        // ═══════════════════════════════════════
        //  TOOLS
        // ═══════════════════════════════════════

        "tool-sync-assembly": {
            name: "EMUSync Trigger Assembly Tool",
            category: "Tools",
            stlPath: "Tools/EMUSync trigger assembly installation tool.stl",
            qty: 1,
            colorCategory: "default",
            printProfile: "structural",
            requires: { syncType: "standard" },
        },
        "tool-ptfe-cutter": {
            name: "PTFE Cutter and Length Tool",
            category: "Tools",
            stlPath: "Tools/PTFE Cutter and Length Tool.stl",
            qty: 1,
            colorCategory: "default",
            printProfile: "structural",
            requires: { syncType: "standard" },
        },
        "tool-ptfe-cutter-psf": {
            name: "PTFE Cutter and Length Tool (PSF)",
            category: "Tools",
            stlPath: "Tools/PTFE Cutter and Length Tool[PSF].stl",
            qty: 1,
            colorCategory: "default",
            printProfile: "structural",
            requires: { syncType: "psf" },
        },
    },
};
