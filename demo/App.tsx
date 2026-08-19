import { useEffect, useState } from "react";
import { Marko } from "../src";

const depots = [
  { name: "Harbor East", region: "North", vehicles: 412, util: "81.4%" },
  { name: "Riverside", region: "North", vehicles: 356, util: "74.9%" },
  { name: "Crossroads", region: "Central", vehicles: 298, util: "72.0%" },
  { name: "Summit Park", region: "South", vehicles: 218, util: "69.8%" },
];

export function App() {
  const [dark, setDark] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Tailwind/shadcn convention: theme lives as a class on <html>.
  // Marko's default theme="host" picks this up on its own.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.classList.toggle("light", !dark);
  }, [dark]);
  const bg = dark ? "#17181C" : "#FAFAFB";
  const card = dark ? "#1F2126" : "#FFFFFF";
  const border = dark ? "#2A2D33" : "#EBEBEE";
  const ink = dark ? "#E8EAEE" : "#26282C";
  const mute = dark ? "#8B8E95" : "#8A8D93";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: bg,
        color: ink,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "14px 28px",
          borderBottom: `1px solid ${border}`,
          background: card,
        }}
      >
        <div style={{ width: 22, height: 22, borderRadius: 5, background: ink }} />
        <h1 style={{ fontSize: 14, margin: 0 }}>Fleet Operations</h1>
        <span style={{ fontSize: 12, color: mute }}>Overview · Q3 2026</span>
        <button
          style={{
            marginLeft: "auto",
            fontSize: 12,
            padding: "4px 12px",
            borderRadius: 6,
            border: `1px solid ${border}`,
            background: "transparent",
            color: ink,
            cursor: "pointer",
          }}
          onClick={() => setModalOpen(true)}
        >
          Open settings
        </button>
        <button
          style={{
            fontSize: 12,
            padding: "4px 12px",
            borderRadius: 6,
            border: `1px solid ${border}`,
            background: "transparent",
            color: ink,
            cursor: "pointer",
          }}
          onClick={() => setDark((d) => !d)}
        >
          {dark ? "Light host" : "Dark host"}
        </button>
      </header>

      <main style={{ maxWidth: 1120, margin: "28px auto 0", padding: "0 28px 120px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
          {[
            ["Active vehicles", "1,284"],
            ["Utilization", "76.2%"],
            ["Open work orders", "93"],
            ["Avg. downtime", "3.1 hrs"],
          ].map(([label, value]) => (
            <div
              key={label}
              id={`kpi-${label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
              style={{
                background: card,
                border: `1px solid ${border}`,
                borderRadius: 8,
                padding: "14px 16px",
              }}
            >
              <div style={{ fontSize: 11, color: mute }}>{label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{value}</div>
              <div style={{ fontSize: 11, color: mute }}>vs last 30d</div>
            </div>
          ))}
        </div>

        <section
          id="utilization-chart"
          style={{
            background: card,
            border: `1px solid ${border}`,
            borderRadius: 8,
            padding: "16px 18px",
            marginTop: 14,
          }}
        >
          <h2 style={{ fontSize: 12, margin: "0 0 10px" }}>Utilization, last 12 weeks</h2>
          <svg width="100%" height="120" viewBox="0 0 1000 120" preserveAspectRatio="none">
            <polyline
              points="0,86 90,80 180,84 270,70 360,74 450,60 540,64 630,50 720,56 810,40 900,46 1000,30"
              fill="none"
              stroke={mute}
              strokeWidth="2"
            />
          </svg>
        </section>

        <section
          style={{
            background: card,
            border: `1px solid ${border}`,
            borderRadius: 8,
            marginTop: 14,
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead>
              <tr>
                {["Depot", "Region", "Vehicles", "Utilization"].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      textAlign: i >= 2 ? "right" : "left",
                      fontSize: 11,
                      color: mute,
                      padding: "9px 16px",
                      borderBottom: `1px solid ${border}`,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {depots.map((d) => (
                <tr key={d.name} id={`row-${d.name.toLowerCase().replace(/\s+/g, "-")}`}>
                  <td style={{ padding: "9px 16px", borderBottom: `1px solid ${border}` }}>{d.name}</td>
                  <td style={{ padding: "9px 16px", borderBottom: `1px solid ${border}` }}>{d.region}</td>
                  <td style={{ padding: "9px 16px", borderBottom: `1px solid ${border}`, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{d.vehicles}</td>
                  <td style={{ padding: "9px 16px", borderBottom: `1px solid ${border}`, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{d.util}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>

      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background: "rgba(0,0,0,.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            id="settings-modal"
            style={{
              width: 420,
              background: card,
              border: `1px solid ${border}`,
              borderRadius: 12,
              padding: 20,
              color: ink,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 15, margin: 0 }}>Fleet settings</h2>
            <p id="modal-refresh" style={{ fontSize: 13, color: mute, margin: "12px 0 4px" }}>
              Refresh interval
            </p>
            <div style={{ fontSize: 13 }}>Every 15 minutes</div>
            <p id="modal-units" style={{ fontSize: 13, color: mute, margin: "12px 0 4px" }}>
              Distance units
            </p>
            <div style={{ fontSize: 13 }}>Kilometers</div>
            <button
              style={{
                marginTop: 16,
                fontSize: 12,
                padding: "6px 14px",
                borderRadius: 6,
                border: `1px solid ${border}`,
                background: "transparent",
                color: ink,
                cursor: "pointer",
              }}
              onClick={() => setModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <Marko />
    </div>
  );
}
