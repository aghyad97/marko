/**
 * Marko chrome styles. Injected once into <head>.
 *
 * Every color/size flows through a --marko-* custom property, so host apps
 * can override the skin by redefining properties on [data-marko-root]:
 *
 *   [data-marko-root] { --marko-accent: #f0a500; }
 *
 * Dark is Marko's home mode; light is a designed remap, not an inversion.
 */
export const STYLE_ID = "marko-styles";

export const css = `
[data-marko-root]{
  /* surfaces (dark ladder) */
  --marko-s0:#161618;
  --marko-s1:#1C1C1F;
  --marko-s2:#232327;
  --marko-s3:#2C2C31;
  /* text emphasis tiers */
  --marko-text-hi:rgba(250,250,250,.95);
  --marko-text-mid:rgba(250,250,250,.62);
  --marko-text-low:rgba(250,250,250,.40);
  /* the one accent */
  --marko-accent:#58A6FF;
  --marko-accent-ink:#0B1723;
  --marko-accent-dim:rgba(88,166,255,.15);
  --marko-accent-line:rgba(88,166,255,.35);
  /* status */
  --marko-danger:#F2726B;
  --marko-danger-ink:#1F0D0B;
  /* hairlines + shadow */
  --marko-hair:rgba(255,255,255,.09);
  --marko-shadow-pop:0 16px 48px rgba(0,0,0,.5), 0 2px 8px rgba(0,0,0,.35);
  --marko-shadow-dock:0 10px 30px rgba(0,0,0,.45), 0 2px 6px rgba(0,0,0,.3);
  --marko-scrim:rgba(0,0,0,.45);
  /* geometry + type */
  --marko-radius:12px;
  --marko-radius-sm:8px;
  --marko-font:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  --marko-mono:ui-monospace,"SF Mono",SFMono-Regular,Menlo,Consolas,monospace;
  --marko-sheet-w:360px;
  --marko-z:2147483000;
}
[data-marko-root][data-marko-theme="light"]{
  --marko-s0:#FFFFFF;
  --marko-s1:#F7F7F8;
  --marko-s2:#EFEFF1;
  --marko-s3:#E4E4E7;
  --marko-text-hi:rgba(24,24,27,.95);
  --marko-text-mid:rgba(24,24,27,.64);
  --marko-text-low:rgba(24,24,27,.44);
  --marko-accent:#0969DA;
  --marko-accent-ink:#FFFFFF;
  --marko-accent-dim:rgba(9,105,218,.10);
  --marko-accent-line:rgba(9,105,218,.35);
  --marko-danger:#C93A31;
  --marko-danger-ink:#FFF5F4;
  --marko-hair:rgba(24,24,27,.11);
  --marko-shadow-pop:0 16px 48px rgba(24,24,27,.18), 0 2px 8px rgba(24,24,27,.10);
  --marko-shadow-dock:0 10px 30px rgba(24,24,27,.16), 0 2px 6px rgba(24,24,27,.10);
  --marko-scrim:rgba(24,24,27,.32);
}

[data-marko-root], [data-marko-root] *{ box-sizing:border-box; }
:where([data-marko-root]) :where(button){ font:inherit; background:none; border:none; padding:0; cursor:pointer; color:inherit; }
[data-marko-root] :where(button,textarea):focus-visible{
  outline:2px solid var(--marko-accent); outline-offset:2px;
}

/* ---- capture layer (review mode on) ---- */
.mk-capture{
  position:fixed; inset:0; z-index:calc(var(--marko-z) - 40);
  cursor:crosshair;
}
.mk-hoverbox{
  position:fixed; z-index:calc(var(--marko-z) - 39);
  border:1.5px dashed var(--marko-accent); border-radius:6px;
  background:var(--marko-accent-dim);
  pointer-events:none;
}

/* ---- pins: numbered markers, badge sits above the anchor point ---- */
.mk-pin{
  position:absolute; z-index:calc(var(--marko-z) - 30);
  width:24px; height:24px; margin:-27px 0 0 -5px;
  border-radius:50% 50% 50% 4px;
  background:var(--marko-s1);
  border:1.5px solid var(--marko-accent);
  color:var(--marko-accent);
  font-family:var(--marko-font); font-size:11px; font-weight:600;
  display:flex; align-items:center; justify-content:center;
  box-shadow:var(--marko-shadow-dock);
  transition:transform 140ms ease-out;
}
.mk-pin:hover{ transform:scale(1.12); }
.mk-pin[data-resolved="true"]{
  border-color:var(--marko-text-low); color:var(--marko-text-low);
}
.mk-pin[data-active="true"]{ background:var(--marko-accent); color:var(--marko-accent-ink); }

/* ---- icon buttons ---- */
.mk-ib{
  width:28px; height:28px; flex:none;
  display:inline-flex; align-items:center; justify-content:center;
  border-radius:7px; color:var(--marko-text-mid);
  transition:background 120ms ease-out, color 120ms ease-out;
}
.mk-ib:hover{ background:var(--marko-s2); color:var(--marko-text-hi); }
.mk-ib[data-on="true"]{ background:var(--marko-accent-dim); color:var(--marko-accent); }
.mk-ib[data-danger]:hover{ background:var(--marko-accent-dim); color:var(--marko-danger); }
.mk-ib[data-ok="true"]{ color:var(--marko-accent); }

/* ---- pin hover tooltip ---- */
.mk-tip{
  position:absolute; z-index:calc(var(--marko-z) - 8);
  transform:translate(-50%, -100%);
  max-width:280px; min-width:120px;
  background:var(--marko-s0); border:1px solid var(--marko-hair);
  border-radius:var(--marko-radius-sm);
  box-shadow:var(--marko-shadow-pop);
  font-family:var(--marko-font);
  padding:8px 11px; pointer-events:none;
}
.mk-tip-text{
  font-size:12.5px; line-height:1.45; color:var(--marko-text-hi);
  display:-webkit-box; -webkit-line-clamp:4; -webkit-box-orient:vertical;
  overflow:hidden; overflow-wrap:break-word; white-space:pre-wrap;
}
.mk-tip-text[data-empty="true"]{ color:var(--marko-text-low); font-style:italic; }
.mk-tip-meta{ font-size:10.5px; color:var(--marko-text-mid); margin-top:4px; }

/* ---- popover ---- */
.mk-pop{
  position:absolute; z-index:calc(var(--marko-z) - 10);
  width:320px;
  background:var(--marko-s0);
  border:1px solid var(--marko-hair);
  border-radius:var(--marko-radius);
  box-shadow:var(--marko-shadow-pop);
  font-family:var(--marko-font); font-size:13px; color:var(--marko-text-hi);
  overflow:hidden;
}
.mk-pop-head{
  display:flex; align-items:center; gap:8px;
  padding:9px 9px 9px 12px; border-bottom:1px solid var(--marko-hair);
}
.mk-pop-num{
  width:19px; height:19px; flex:none; border-radius:50%;
  border:1.5px solid var(--marko-accent); color:var(--marko-accent);
  font-size:10px; font-weight:600;
  display:flex; align-items:center; justify-content:center;
}
.mk-pop-sel{
  font-family:var(--marko-mono); font-size:11px; color:var(--marko-text-mid);
  flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
}
.mk-kbd{
  font-family:var(--marko-mono); font-size:9.5px; color:var(--marko-text-low);
  border:1px solid var(--marko-hair); border-radius:4px; padding:1px 5px;
}
.mk-btn .mk-kbd{ margin-left:7px; }
.mk-kbd-onaccent{ color:var(--marko-accent-ink); border-color:currentColor; opacity:.75; }
.mk-pop-body{ padding:12px; }
.mk-pop textarea{
  width:100%; min-height:78px; resize:vertical;
  background:var(--marko-s1); border:1px solid var(--marko-hair);
  border-radius:var(--marko-radius-sm);
  font-family:var(--marko-font); font-size:13px; line-height:1.5;
  color:var(--marko-text-hi); padding:9px 10px;
}
.mk-pop textarea::placeholder{ color:var(--marko-text-low); }
.mk-pop-foot{
  display:flex; align-items:center; gap:4px;
  padding:8px 9px; border-top:1px solid var(--marko-hair);
}
.mk-savehint{ font-size:11px; color:var(--marko-text-low); margin-left:4px; flex:1; }
.mk-btn{
  font-size:12.5px; font-weight:500; border-radius:var(--marko-radius-sm);
  padding:6px 13px; border:1px solid transparent;
}
.mk-btn-primary{ background:var(--marko-accent); color:var(--marko-accent-ink); }
.mk-btn-primary:hover{ filter:brightness(1.08); }
.mk-btn-quiet{ color:var(--marko-text-mid); border-color:var(--marko-hair); }
.mk-btn-quiet:hover{ color:var(--marko-text-hi); background:var(--marko-s2); }
.mk-btn-danger{ background:var(--marko-danger); color:var(--marko-danger-ink); }

/* ---- review rail ---- */
.mk-rail{
  position:fixed; top:0; bottom:0; right:0; width:16px;
  z-index:calc(var(--marko-z) - 35); pointer-events:none;
}
.mk-rail-tick{
  position:absolute; left:0; width:16px; height:14px; margin-top:-7px;
  display:flex; align-items:center; justify-content:flex-end;
  pointer-events:auto; border-radius:4px 0 0 4px;
}
.mk-rail-tick::after{
  content:''; width:11px; height:4px; border-radius:2px 0 0 2px;
  background:var(--marko-accent);
}
.mk-rail-tick[data-resolved="true"]::after{ background:var(--marko-text-low); }
.mk-rail-tick:hover::after{ width:16px; }

/* ---- side sheet (overlay + scrim, shadcn-style) ---- */
.mk-scrim{
  position:fixed; inset:0; z-index:calc(var(--marko-z) - 22);
  background:var(--marko-scrim);
  opacity:0; pointer-events:none; transition:opacity 200ms ease-out;
}
.mk-scrim[data-open="true"]{ opacity:1; pointer-events:auto; }
.mk-sheet{
  position:fixed; top:0; right:0; bottom:0;
  width:min(var(--marko-sheet-w), calc(100vw - 24px));
  z-index:calc(var(--marko-z) - 20);
  background:var(--marko-s0); border-left:1px solid var(--marko-hair);
  box-shadow:var(--marko-shadow-pop);
  display:flex; flex-direction:column;
  font-family:var(--marko-font); font-size:13px; color:var(--marko-text-hi);
  transform:translateX(calc(100% + 24px)); transition:transform 220ms ease-out;
}
.mk-sheet[data-open="true"]{ transform:translateX(0); }
.mk-sheet-head{ padding:13px 12px 10px 16px; border-bottom:1px solid var(--marko-hair); }
.mk-sheet-head-row{ display:flex; align-items:center; gap:8px; }
.mk-sheet-title{ font-size:14px; font-weight:600; letter-spacing:-.01em; flex:1; }
.mk-sheet-count{ font-size:11.5px; color:var(--marko-text-mid); }
.mk-filters{ display:flex; gap:6px; margin-top:10px; }
.mk-chip{
  font-size:11.5px; font-weight:500; color:var(--marko-text-mid);
  background:var(--marko-s1); border:1px solid var(--marko-hair);
  border-radius:99px; padding:3px 11px;
}
.mk-chip:hover{ color:var(--marko-text-hi); }
.mk-chip[data-on="true"]{
  color:var(--marko-accent); background:var(--marko-accent-dim); border-color:var(--marko-accent-line);
}
.mk-rows{ flex:1; overflow-y:auto; overscroll-behavior:contain; }
.mk-row{
  position:relative;
  display:flex; gap:10px; padding:11px 14px 11px 16px;
  border-bottom:1px solid var(--marko-hair);
}
.mk-row:hover{ background:var(--marko-s1); }
.mk-row[data-current="true"]{ background:var(--marko-s1); }
.mk-row-num{
  width:21px; height:21px; flex:none; margin-top:1px; border-radius:50%;
  border:1.5px solid var(--marko-accent); color:var(--marko-accent);
  font-size:10px; font-weight:600;
  display:flex; align-items:center; justify-content:center;
}
.mk-row[data-resolved="true"] .mk-row-num{ border-color:var(--marko-text-low); color:var(--marko-text-low); }
.mk-row-body{ flex:1; min-width:0; }
.mk-row-sel{
  font-family:var(--marko-mono); font-size:10.5px; color:var(--marko-text-mid);
  overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
}
.mk-row-text{ font-size:13px; line-height:1.5; margin:4px 0 0; white-space:pre-wrap; overflow-wrap:break-word; }
.mk-row[data-resolved="true"] .mk-row-text{ color:var(--marko-text-low); }
.mk-row-meta{ font-size:11px; color:var(--marko-text-mid); margin-top:5px; }
.mk-row[data-detached="true"] .mk-row-num{ border-style:dashed; }
.mk-offscreen{ font-style:italic; color:var(--marko-text-low); }
.mk-row-acts{
  position:absolute; top:7px; right:10px;
  display:flex; align-items:center; gap:1px;
  background:var(--marko-s0); border:1px solid var(--marko-hair);
  border-radius:var(--marko-radius-sm); padding:1px;
  box-shadow:var(--marko-shadow-dock);
  opacity:0; transform:translateY(-2px);
  transition:opacity 120ms ease-out, transform 120ms ease-out;
  pointer-events:none;
}
.mk-row:hover .mk-row-acts,
.mk-row:focus-within .mk-row-acts{
  opacity:1; transform:translateY(0); pointer-events:auto;
}
.mk-row-acts .mk-ib{ width:26px; height:26px; border-radius:6px; }
@media (hover: none){
  .mk-row-acts{ opacity:1; transform:none; pointer-events:auto; }
}
.mk-row-edit{ margin-top:6px; }
.mk-row-edit textarea{
  width:100%; min-height:68px; resize:vertical;
  background:var(--marko-s1); border:1px solid var(--marko-accent-line);
  border-radius:var(--marko-radius-sm);
  font-family:var(--marko-font); font-size:13px; line-height:1.5;
  color:var(--marko-text-hi); padding:8px 10px;
}
.mk-row-edit-acts{ display:flex; align-items:center; gap:8px; margin-top:6px; justify-content:flex-end; }
.mk-empty{
  padding:40px 24px; text-align:center; color:var(--marko-text-mid); font-size:12.5px; line-height:1.6;
}
.mk-empty b{ display:block; color:var(--marko-text-hi); font-size:13px; margin-bottom:4px; font-weight:600; }
.mk-sheet-foot{
  border-top:1px solid var(--marko-hair); padding:10px 12px;
  display:flex; flex-direction:column; gap:8px;
}
.mk-export-row{ display:flex; gap:8px; }
.mk-exportbtn{
  flex:1; display:inline-flex; align-items:center; justify-content:center; gap:7px;
  font-size:12px; font-weight:500; color:var(--marko-text-mid);
  background:var(--marko-s1); border:1px solid var(--marko-hair);
  border-radius:var(--marko-radius-sm); padding:8px 0;
}
.mk-exportbtn:hover{ color:var(--marko-text-hi); background:var(--marko-s2); }
.mk-exportbtn:disabled{ opacity:.45; cursor:default; }
.mk-clearbtn{
  display:inline-flex; align-items:center; justify-content:center; gap:7px;
  font-size:12px; color:var(--marko-danger);
  padding:6px 0; border-radius:var(--marko-radius-sm);
}
.mk-clearbtn:hover{ background:var(--marko-accent-dim); }

/* ---- dock (bottom-right control cluster) ---- */
.mk-dock{
  position:fixed; right:20px; bottom:20px;
  transition:opacity 160ms ease-out;
}
.mk-dock[data-hidden="true"]{ opacity:0; pointer-events:none; }
.mk-dock{
  z-index:calc(var(--marko-z) - 5);
  display:flex; align-items:center; gap:2px;
  background:var(--marko-s0); border:1px solid var(--marko-hair);
  border-radius:99px; padding:5px;
  box-shadow:var(--marko-shadow-dock);
  font-family:var(--marko-font); color:var(--marko-text-hi);
  white-space:nowrap;
}
.mk-dock .mk-ib{ width:auto; min-width:34px; height:34px; border-radius:99px; padding:0 9px; gap:6px; }
.mk-dock .mk-kbd{ font-size:9px; padding:0 4px; }
.mk-dock .mk-ib[data-on="true"] .mk-kbd{ color:var(--marko-accent); border-color:var(--marko-accent-line); }
.mk-dock-sep{ width:1px; height:18px; background:var(--marko-hair); margin:0 3px; }

/* ---- confirm dialog (viewport-centered, above everything) ---- */
.mk-dim{
  position:fixed; inset:0; z-index:calc(var(--marko-z) - 2);
  background:var(--marko-scrim);
}
.mk-dialog{
  position:fixed; z-index:calc(var(--marko-z) - 1);
  top:50%; left:50%; transform:translate(-50%,-50%);
  width:min(400px, calc(100vw - 40px));
  background:var(--marko-s0); border:1px solid var(--marko-hair);
  border-radius:var(--marko-radius); box-shadow:var(--marko-shadow-pop);
  font-family:var(--marko-font); color:var(--marko-text-hi);
  padding:18px;
}
.mk-dialog h2{ margin:0; font-size:14px; font-weight:600; }
.mk-dialog p{ margin:8px 0 0; font-size:12.5px; line-height:1.55; color:var(--marko-text-mid); }
.mk-dialog-acts{ display:flex; justify-content:flex-end; gap:8px; margin-top:16px; }

@media (prefers-reduced-motion: reduce){
  [data-marko-root] *{ transition:none !important; }
}
`;

export function injectStyles(doc: Document): () => void {
  let el = doc.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (el) return () => {};
  el = doc.createElement("style");
  el.id = STYLE_ID;
  el.textContent = css;
  doc.head.appendChild(el);
  return () => el?.remove();
}
