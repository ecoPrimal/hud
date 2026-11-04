/* tslint:disable */
/* eslint-disable */

/**
 * Build a complete static site from `SiteContent` JSON.
 *
 * Returns a JSON object mapping output paths to HTML content strings:
 * ```json
 * {
 *   "files": {
 *     "index.html": "<!DOCTYPE html>...",
 *     "about/index.html": "<!DOCTYPE html>...",
 *     "search-index.json": "[...]"
 *   },
 *   "file_count": 3,
 *   "total_bytes": 12345
 * }
 * ```
 *
 * # Arguments
 * * `content_json` — JSON string of `SiteContent` (pages, nav, `search_index`, `entity_registry`)
 * * `layout_json` — JSON string of `SiteLayout` (`site_title`, css, footer), or empty for defaults
 */
export function build_site(content_json: string, layout_json: string): string;

/**
 * Compile a grammar expression and data to a `SceneGraph`, returned as JSON.
 *
 * Useful for springs that want to inspect or transform the scene graph
 * before rendering.
 */
export function compile_scene(grammar_json: string, data_json: string): string;

/**
 * Initialize the WASM module with better panic messages.
 *
 * Call this once from JavaScript before using any other functions.
 * Wires `console.error` as the panic handler so Rust panics produce
 * readable stack traces in the browser devtools.
 */
export function init(): void;

/**
 * Render a single data binding to SVG.
 *
 * Springs push `DataBinding` values via `visualization.render`. This function
 * compiles one binding through the grammar pipeline and returns SVG.
 *
 * # Arguments
 *
 * * `binding_json` - JSON string of a single `DataBinding`
 * * `domain` - Optional domain hint (e.g. `"ecology"`, `"health"`).
 *   Pass empty string for default.
 */
export function render_binding(binding_json: string, domain: string): string;

/**
 * Render a single data binding to a specified modality.
 *
 * Supported modalities: `"svg"` (default), `"description"`, `"terminal"`.
 */
export function render_binding_to_modality(binding_json: string, domain: string, modality: string): string;

/**
 * Render a data binding directly to WebGL draw commands (JSON).
 *
 * Returns a JSON string containing `vertices`, `indices`, `draw_calls`,
 * and `view_projection` arrays ready for GPU upload via `gl.bufferData()`.
 *
 * This is the primary entry point for browser-side 3D/WebGL rendering
 * of petalTongue visualizations without a server round-trip.
 */
export function render_binding_webgl(binding_json: string, domain: string): string;

/**
 * Render a single data binding with threshold coloring to SVG.
 *
 * Threshold ranges color Heatmap/FieldMap cells by status
 * (normal/warning/critical) instead of continuous intensity.
 *
 * `thresholds_json` is a JSON array of `ThresholdRange` objects:
 * `[{"label":"normal","min":0.0,"max":50.0,"status":"normal"}, ...]`
 */
export function render_binding_with_thresholds(binding_json: string, domain: string, thresholds_json: string): string;

/**
 * Render multiple bindings as individual SVGs, returned as a JSON array.
 *
 * Each element is `{"id": "...", "svg": "...", "label": "..."}`.
 * Useful when the caller wants to position panels with CSS rather than
 * using the built-in dashboard grid.
 */
export function render_bindings(bindings_json: string, domain: string): string;

/**
 * Render a `ColorGrid` binding to WebGL for bingoCube commitment visualization.
 *
 * Convenience wrapper that constructs a `ColorGrid` `DataBinding` from raw parameters
 * and compiles to WebGL draw commands in a single call.
 *
 * # Arguments
 * * `id` - Grid identifier
 * * `cols` - Number of columns
 * * `rows` - Number of rows
 * * `colors_json` - JSON array of `[r,g,b,a]` arrays (row-major, f32 0.0-1.0)
 * * `reveal_fraction` - 0.0 (all hidden) to 1.0 (all revealed)
 */
export function render_color_grid_webgl(id: string, cols: number, rows: number, colors_json: string, reveal_fraction: number): string;

/**
 * Render multiple data bindings as a dashboard grid to SVG.
 *
 * `bindings_json` is a JSON array of `DataBinding` objects.
 * `config_json` is an optional JSON object with dashboard layout options:
 *
 * ```json
 * {
 *   "layout": "grid",       // "grid" (default), "vertical", "horizontal"
 *   "max_columns": 3,       // for grid layout
 *   "panel_width": 400.0,
 *   "panel_height": 300.0,
 *   "spacing": 20.0,
 *   "title": "My Dashboard",
 *   "domain": "health"
 * }
 * ```
 *
 * Pass empty string for `config_json` to use defaults.
 */
export function render_dashboard(bindings_json: string, config_json: string): string;

/**
 * Render a grammar expression and data array to SVG.
 *
 * Accepts JSON strings for both the grammar expression and the data array.
 * Returns an SVG string, or an error message prefixed with "Error:".
 */
export function render_grammar(grammar_json: string, data_json: string): string;

/**
 * Render a grammar expression to a specified output modality.
 *
 * Supported modalities: `"svg"` (default), `"description"`, `"terminal"`.
 */
export function render_grammar_to_modality(grammar_json: string, data_json: string, modality: string): string;

/**
 * Render a single page with site layout composition.
 *
 * Takes a `DocumentNode::Page` JSON and optional nav/layout config,
 * returns the rendered HTML with full site chrome (header, nav, footer, CSS).
 *
 * # Arguments
 * * `page_json` — JSON string of a `DocumentNode::Page`
 * * `nav_json` — JSON array of `NavSection` objects (or empty for no nav)
 * * `layout_json` — JSON string of `SiteLayout` (or empty for defaults)
 */
export function render_page_with_layout(page_json: string, nav_json: string, layout_json: string): string;

/**
 * Render a pre-built `SceneGraph` (as JSON) to SVG.
 *
 * Accepts the JSON output of `compile_scene` or any valid `SceneGraph`
 * JSON, and renders it to SVG without recompilation.
 */
export function render_scene(scene_json: string): string;

/**
 * Render a pre-built `SceneGraph` to a specified modality.
 */
export function render_scene_to_modality(scene_json: string, modality: string): string;

/**
 * Validate a grammar expression against Tufte principles.
 *
 * Returns a JSON report with constraint results:
 * ```json
 * {
 *   "valid": true,
 *   "score": 0.95,
 *   "results": [
 *     {"constraint": "data-ink-ratio", "passed": true, "value": 0.92, "threshold": 0.5},
 *     ...
 *   ]
 * }
 * ```
 */
export function validate_grammar(grammar_json: string, data_json: string): string;

/**
 * Return the petalTongue WASM module version.
 */
export function version(): string;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly build_site: (a: number, b: number, c: number, d: number, e: number) => void;
    readonly compile_scene: (a: number, b: number, c: number, d: number, e: number) => void;
    readonly render_binding: (a: number, b: number, c: number, d: number, e: number) => void;
    readonly render_binding_to_modality: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
    readonly render_binding_webgl: (a: number, b: number, c: number, d: number, e: number) => void;
    readonly render_binding_with_thresholds: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
    readonly render_bindings: (a: number, b: number, c: number, d: number, e: number) => void;
    readonly render_color_grid_webgl: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => void;
    readonly render_dashboard: (a: number, b: number, c: number, d: number, e: number) => void;
    readonly render_grammar: (a: number, b: number, c: number, d: number, e: number) => void;
    readonly render_grammar_to_modality: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
    readonly render_page_with_layout: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
    readonly render_scene: (a: number, b: number, c: number) => void;
    readonly render_scene_to_modality: (a: number, b: number, c: number, d: number, e: number) => void;
    readonly validate_grammar: (a: number, b: number, c: number, d: number, e: number) => void;
    readonly version: (a: number) => void;
    readonly init: () => void;
    readonly __wbindgen_export: (a: number, b: number, c: number) => void;
    readonly __wbindgen_export2: (a: number, b: number) => number;
    readonly __wbindgen_export3: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
