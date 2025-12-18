import React, { useState, useMemo} from "react";

function BarrierPage({ Zp, Ap, Zt, At }) {
  const [model, setModel] = useState("bass");
  const [showComparison, setShowComparison] = useState(false);
  
// Ensure numeric inputs
  const parseInputs = () => {
    const zp = Number(Zp);
    const ap = Number(Ap);
    const zt = Number(Zt);
    const at = Number(At);
    return { zp, ap, zt, at };
  };
  const { zp, ap, zt, at } = parseInputs();

  // --- Fusion barrier calculations ---
  const calculateBass = (Zp, Zt, Ap, At) => {
  Zp = Number(Zp); Zt = Number(Zt); Ap = Number(Ap); At = Number(At);
  if (!Zp || !Zt || !Ap || !At) return { VB: 0, RB: 0, hw: 0 };

  const e2 = 1.44; // MeV·fm
  const Rp3 = Math.cbrt(Ap);
  const Rt3 = Math.cbrt(At);

  const RB = 1.07 * (Rp3 + Rt3) + 0.54;
  const VB = e2 * (Zp * Zt) / RB - 50 / (Rp3 + Rt3);
  const hw = 0.065 * (Zp * Zt) / Math.pow(Rp3 + Rt3, 1.5); // better curvature

  return {
    VB: Number(VB.toFixed(3)),
    RB: Number(RB.toFixed(3)),
    hw: Number(hw.toFixed(3)),
  };
};

  const calculateDutt = (Zp, Zt, Ap, At) => {
  Zp = Number(Zp); Zt = Number(Zt); Ap = Number(Ap); At = Number(At);
  if (!Zp || !Zt || !Ap || !At) return { VB: 0, RB: 0, hw: 0 };

  // Choose proximity version (Prox 77 used here)
  const alpha = 5.18419;
  const beta = 0.33979;
  const delta = 0.99903;

  const C1 = 1.28 * Math.cbrt(Ap) - 0.76 + 0.8 / Math.cbrt(Ap);
  const C2 = 1.28 * Math.cbrt(At) - 0.76 + 0.8 / Math.cbrt(At);

  const x = (Zp * Zt) / (Math.cbrt(Ap) + Math.cbrt(At));
  const sB = alpha * Math.exp(-beta * Math.pow(x - 2, 0.25));

  const RB = C1 + C2 + sB;
  const VB = delta * ((1.44 * Zp * Zt / RB) * (1 - 0.75 / RB)) * 0.95;
  const hw = 0.065 * Zp * Zt / Math.pow(Math.cbrt(Ap) + Math.cbrt(At), 1.5);

  return {
    VB: Number(VB.toFixed(3)),
    RB: Number(RB.toFixed(3)),
    hw: Number(hw.toFixed(3)),
  };
};

 const calculateManju = (Zp, Zt, Ap, At) => {
  Zp = Number(Zp); Zt = Number(Zt); Ap = Number(Ap); At = Number(At);
  if (!Zp || !Zt || !Ap || !At) return { VB: 0, RB: 0, hw: 0 };
    const b = 1.0;
    // Step 1: R00i
const R00p = 1.24 * Math.cbrt(Ap) *
  (1 + 1.646 / Ap - 0.191 * ((Ap - 2 * Zp) / Ap));
const R00t = 1.24 * Math.cbrt(At) *
  (1 + 1.646 / At - 0.191 * ((At - 2 * Zt) / At));

   // Step 2: R0i (truncate at b^2 term)
const R0p = R00p * (1 - (7/2) * (b*b) / (R00p*R00p));
const R0t = R00t * (1 - (7/2) * (b*b) / (R00t*R00t));

// Step 3: Ci
const Cp = R0p * (1 - (b*b) / (R0p*R0p));
const Ct = R0t * (1 - (b*b) / (R0t*R0t));

    const num = (Zp * Zt) / (Math.cbrt(Ap) + Math.cbrt(At));
    const SB = -1.236e-7 * num ** 3 + 7.774e-5 * num ** 2 - 2.324e-2 * num + 3.759;
    const RB = SB + Cp + Ct;
    const VB = 1.4057 * ((Zp * Zt / RB) * (1 - 1 / RB)) + 5.4746;
    let hw = -3.34e-7 * num ** 3 + 1.39e-4 * num ** 2 - 2.37e-2 * num + 5.67;
    if (hw < 0) hw = 0.5; // Prevent negative hw for very heavy nuclei
    return {
    VB: Number(VB.toFixed(3)),
    RB: Number(RB.toFixed(3)),
    hw: Number(hw.toFixed(3)),
  };
};
  const calculateActinide = (Zp, Zt, Ap, At) => {
  Zp = Number(Zp);
  Zt = Number(Zt);
  Ap = Number(Ap);
  At = Number(At);
  if (!Zp || !Zt || !Ap || !At) return { VB: 0, RB: 0, hw: 0 };
    const b = 1.0;
    const R0p = 1.28 * Math.cbrt(Ap) - 0.76 + 0.8 / Math.cbrt(Ap)
    const R0t = 1.28 * Math.cbrt(At) - 0.76 + 0.8 / Math.cbrt(At);
    const Cp = R0p * (1 - (b ** 2) / (R0p ** 2));
    const Ct = R0t * (1 - (b ** 2) / (R0t ** 2));
    const num = (Zp * Zt) / (Math.cbrt(Ap) + Math.cbrt(At));
    const SB = -1.79e-7 * num ** 3 + 1.05e-4 * num ** 2 - 2.76e-2 * num + 3.98;
    const RB = SB + Cp + Ct;
    const VB = 1.435 * ((Zp * Zt / RB) * (1 - 1 / RB)) + 1.866;
    let hw = 1.46e-7 * num ** 3 - 9.4e-5 * num ** 2 +1.02e-2 * num -4.02;
    if (hw < 0) hw = 0.5; // Prevent negative hw
    return {
    VB: Number(VB.toFixed(3)),
    RB: Number(RB.toFixed(3)),
    hw: Number(hw.toFixed(3)),
  };
};

  
  const calculateAdamian = (Zp, Zt, Ap, At) => {
  Zp = Number(Zp);
  Zt = Number(Zt);
  Ap = Number(Ap);
  At = Number(At);
  if (!Zp || !Zt || !Ap || !At) return { VB: 0, RB: 0, hw: 0 };
    const RB = 1.25 * (Math.cbrt(Ap) + Math.cbrt(At));
    const VB = 1.44 * Zp * Zt / RB;
    const hw = 4.0;
    return {
    VB: Number(VB.toFixed(3)),
    RB: Number(RB.toFixed(3)),
    hw: Number(hw.toFixed(3)),
  };
};

  const calculateArora = (Zp, Zt, Ap, At) => {
  Zp = Number(Zp);
  Zt = Number(Zt);
  Ap = Number(Ap);
  At = Number(At);
  if (!Zp || !Zt || !Ap || !At) return { VB: 0, RB: 0, hw: 0 };
    const RB = 7.359 + 3.076e-3 * Ap - 1.182e-6 * Ap ** 2 + 1.567e-11 * Ap ** 3;
    const VB = 1.44 * Zp * Zt / RB;
    const hw = 4.5 - 0.002 * Zp * Zt;
     return {
    VB: Number(VB.toFixed(3)),
    RB: Number(RB.toFixed(3)),
    hw: Number(hw.toFixed(3)),
  };
};


  const calculateWoodsSaxon = (Zp, Zt, Ap, At) => {
  // Convert inputs safely to numbers
  Zp = Number(Zp);
  Zt = Number(Zt);
  Ap = Number(Ap);
  At = Number(At);

  // Return zeros if inputs missing
  if (!Zp || !Zt || !Ap || !At) return { VB: 0, RB: 0, hw: 0 };

  // --- Parameters ---
  const r0 = 1.2;   // fm, nuclear radius constant
  const a = 0.65;   // fm, diffuseness
  const V0 = 50;    // MeV, nuclear potential depth

  // --- Calculations ---
  const RB = r0 * (Math.cbrt(Ap) + Math.cbrt(At)); // barrier radius
  const VC = (1.44 * Zp * Zt) / RB;                // Coulomb potential
  const VN = V0 * Math.exp(-RB / a);         // WS nuclear term
  const VB = VC + VN;                              // total barrier height

  // ℏω from empirical scaling (Dutt-style)
  const hw = 0.065 * (Zp * Zt) / Math.pow(Math.cbrt(Ap) + Math.cbrt(At), 1.5);

  // Return formatted
  return {
    VB: Number(VB.toFixed(3)),
    RB: Number(RB.toFixed(3)),
    hw: Number(hw.toFixed(3)),
  };
};

  const calculateProximity = (Zp, Zt, Ap, At) => {
  Zp = Number(Zp);
  Zt = Number(Zt);
  Ap = Number(Ap);
  At = Number(At);
  if (!Zp || !Zt || !Ap || !At) return { VB: 0, RB: 0, hw: 0 };

  // Parameters
  const r0 = 1.17; // fm
  const a = 0.63;  // fm, diffuseness
  const gamma = 0.9517 * (1 - 1.7826 * ((Ap - 2 * Zp) / Ap) ** 2); // surface energy coefficient

  // Effective radii
  const C1 = r0 * Math.cbrt(Ap)+0.5;
  const C2 = r0 * Math.cbrt(At)+0.5;
  const RB = C1 + C2;

  // Barrier height (Coulomb + surface correction)
  const VB = (1.44 * Zp * Zt) / RB - 0.01 * gamma * (C1 * C2) / (C1 + C2);

  // Curvature (empirical Dutt-like)
  const hw = 0.065 * (Zp * Zt) / Math.pow(Math.cbrt(Ap) + Math.cbrt(At), 1.5);

  return {
    VB: Number(VB.toFixed(3)),
    RB: Number(RB.toFixed(3)),
    hw: Number(hw.toFixed(3)),
  };
};

  const models = {
    bass: { name: "Bass (1973)", func: calculateBass },
    dutt: { name: "Dutt–Puri (2010)", func: calculateDutt },
    manju: { name: "Manjunatha (2018)", func: calculateManju },
    acti: { name: "Actinide (2018)", func: calculateActinide },
    adam: { name: "Adamian (2003)", func: calculateAdamian },
    arora: { name: "Arora–Puri–Gupta (2000)", func: calculateArora },
    ws: { name: "Woods–Saxon", func: calculateWoodsSaxon },
    prox: { name: "Proximity", func: calculateProximity },
  };

  const selected = models[model].func(zp, zt, ap, at);

  return (
    <div style={{ backgroundColor: "#050a1f", color: "#ebecf0ff", minHeight: "100vh", padding: "30px" }}>
      <h1 style={{ color: "#6fa8ff", textAlign: "center" }}> Fusion Barrier Calculations</h1>

      <div style={{ display: "flex", justifyContent: "flex-start", gap: "30px", flexWrap: "wrap" }}>
        {/* Left: Dropdown */}
        <div style={{ minWidth: "250px" }}>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            style={{ padding: "10px", borderRadius: "8px", fontSize: "16px", marginBottom: "20px", width: "100%" }}
          >
            {Object.keys(models).map((key) => (
              <option key={key} value={key}>{models[key].name}</option>
            ))}
          </select>

          <button
            onClick={() => setShowComparison(!showComparison)}
            style={{
              marginTop: "10px",
              backgroundColor: "#6fa8ff",
              border: "none",
              color: "#050a1f",
              padding: "10px 20px",
              borderRadius: "8px",
              cursor: "pointer",
              width: "100%"
            }}
          >
            🔍 Compare All Models
          </button>
        </div>

        {/* Middle: Selected Model Values */}
        <div style={{ backgroundColor: "#0d1b3d", padding: "20px", borderRadius: "12px", minWidth: "300px", boxShadow: "0 0 20px rgba(203, 211, 224, 0.5)" }}>
          <h3 style={{ color: "#bac8dcff" }}>Selected Model Values</h3>
          <p>Vᴮ: <strong>{selected.VB.toFixed(2)} MeV</strong></p>
          <p>Rᴮ: <strong>{selected.RB.toFixed(2)} fm</strong></p>
          <p>ℏω: <strong>{selected.hw.toFixed(2)} MeV</strong></p>
        </div>

        {/* Right: Comparison Table */}
        {showComparison && (
          <div style={{ backgroundColor: "#0d1b3d", padding: "20px", borderRadius: "12px", minWidth: "400px", boxShadow: "0 0 20px rgba(111,168,255,0.5)" }}>
            <h3 style={{ color: "#b8d4ff", textAlign: "center" }}>Comparison Table</h3>
            <table style={{ borderCollapse: "collapse", margin: "0 auto", color: "#fff", width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ border: "1px solid #6fa8ff", padding: "6px 12px" }}>Model</th>
                  <th style={{ border: "1px solid #6fa8ff", padding: "6px 12px" }}>Vᴮ</th>
                  <th style={{ border: "1px solid #6fa8ff", padding: "6px 12px" }}>Rᴮ</th>
                  <th style={{ border: "1px solid #6fa8ff", padding: "6px 12px" }}>ℏω</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(models).map((key) => {
                  const val = models[key].func(zp, zt, zp, zt);
                  return (
                    <tr key={key}>
                      <td style={{ border: "1px solid #6fa8ff", padding: "6px 12px" }}>{models[key].name}</td>
                      <td style={{ border: "1px solid #6fa8ff", padding: "6px 12px" }}>{val.VB.toFixed(2)}</td>
                      <td style={{ border: "1px solid #6fa8ff", padding: "6px 12px" }}>{val.RB.toFixed(2)}</td>
                      <td style={{ border: "1px solid #6fa8ff", padding: "6px 12px" }}>{val.hw.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
 {/* ---- NRV Link Box ---- */}
    <div style={{
      width: "250px",
      backgroundColor: "#0d1b3d",
      padding: "20px",
      borderRadius: "12px",
      textAlign: "center",
      boxShadow: "0 0 20px rgba(111,168,255,0.5)",
      marginLeft: "50px",
      flexShrink: 0,
      marginBottom: "20px",
      marginTop: "-40px"
    }}>
      <h3 style={{ color: "#b8d4ff" }}>NRV Fusion Webpage</h3>
      <a
        href="http://nrv.jinr.ru/nrv/webnrv/fusion/"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#6fa8ff", textDecoration: "underline", fontSize: "16px" }}
      >
        Open NRV Fusion Webpage
      </a>
    </div>
  </div>
);
}


export default BarrierPage;