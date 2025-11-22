// src/FusionCrossSectionPage.js
import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function FusionCrossSectionPage() {
  const [model, setModel] = useState("bass");
  const [VB, setVB] = useState("");
  const [RB, setRB] = useState("");
  const [hw, setHw] = useState("");
  const [Ecm, setEcm] = useState("");
  const [sigma, setSigma] = useState(null);
  const [data, setData] = useState([]);

  // Retrieve reaction data
  const stored = JSON.parse(localStorage.getItem("fusion_inputs") || "{}");
  const { Zp = 20, Ap = 48, Zt = 82, At = 208 } = stored;

  // --- Barrier calculations for 8 models ---
  const calculateBass = () => {
    const RB = 1.07 * (Math.cbrt(Ap) + Math.cbrt(At));
    const VB = 1.44 * Zp * Zt / RB;
    const hw = 4.5 - 0.002 * Zp * Zt;
    return { VB, RB, hw };
  };

  const calculateDutt = () => {
    const RB = 1.28 * (Math.cbrt(Ap) + Math.cbrt(At)) - 0.76 + 0.8 * (1 / Math.cbrt(Ap) + 1 / Math.cbrt(At));
    const VB = 1.44 * Zp * Zt / RB;
    const hw = 0.065 * Zp * Zt / Math.pow(Math.cbrt(Ap) + Math.cbrt(At), 1.5);
    return { VB, RB, hw };
  };

  const calculateManju = () => {
    const b = 1.0;
    const R0p = 1.24 * Math.cbrt(Ap) * (1 + 1.646 / Ap - 0.191 * ((Ap - 2 * Zp) / Ap));
    const R0t = 1.24 * Math.cbrt(At) * (1 + 1.646 / At - 0.191 * ((At - 2 * Zt) / At));
    const Cp = R0p * (1 - b ** 2 / R0p ** 2);
    const Ct = R0t * (1 - b ** 2 / R0t ** 2);
    const num = (Zp * Zt) / (Math.cbrt(Ap) + Math.cbrt(At));
    const SB = -1.236e-7 * num ** 3 + 7.774e-5 * num ** 2 - 2.324e-2 * num + 3.759;
    const RB = SB + Cp + Ct;
    const VB = 1.4057 * ((Zp * Zt / RB) * (1 - 1 / RB)) + 5.4746;
    const hw = -3.34e-7 * num ** 3 + 1.39e-4 * num ** 2 - 2.37e-2 * num + 5.67;
    return { VB, RB, hw };
  };

  const calculateActi = () => {
    const Rp = 1.28 * Math.cbrt(Ap) - 0.76 + 0.8 / Math.cbrt(Ap);
    const Rt = 1.28 * Math.cbrt(At) - 0.76 + 0.8 / Math.cbrt(At);
    const RB = Rp + Rt;
    const VB = 1.44 * Zp * Zt / RB;
    const hw = Math.max(4.5 - 0.002 * Zp * Zt, 3.0);
    return { VB, RB, hw };
  };

  const calculateAdam = () => {
    const RB = 1.25 * (Math.cbrt(Ap) + Math.cbrt(At));
    const VB = 1.44 * Zp * Zt / RB;
    const hw = 4.0;
    return { VB, RB, hw };
  };

  const calculateArora = () => {
    const RB = 7.359 + 3.076e-3 * Ap - 1.182e-6 * Ap ** 2 + 1.567e-11 * Ap ** 3;
    const VB = 1.44 * Zp * Zt / RB;
    const hw = 4.5 - 0.002 * Zp * Zt;
    return { VB, RB, hw };
  };

  const calculateWS = () => {
    const r0 = 1.2;
    const a = 0.65;
    const RB = r0 * (Math.cbrt(Ap) + Math.cbrt(At));
    const V0 = 50;
    const VB = V0 * (1 - Math.exp(-RB / a)) + 1.44 * Zp * Zt / RB;
    const hw = 4.0;
    return { VB, RB, hw };
  };

  const calculateProx = () => {
    const RB = 1.17 * (Math.cbrt(Ap) + Math.cbrt(At));
    const VB = 1.44 * Zp * Zt / RB;
    const hw = 4.0;
    return { VB, RB, hw };
  };

  const models = {
    bass: { name: "Bass (1973)", func: calculateBass },
    dutt: { name: "Dutt–Puri (2010)", func: calculateDutt },
    manju: { name: "Manjunatha (2018)", func: calculateManju },
    acti: { name: "Actinide (2018)", func: calculateActi },
    adam: { name: "Adamian (2003)", func: calculateAdam },
    arora: { name: "Arora–Puri–Gupta (2000)", func: calculateArora },
    ws: { name: "Woods–Saxon", func: calculateWS },
    prox: { name: "Proximity", func: calculateProx },
  };

  // Auto-fill VB, RB, hw when model changes
  useEffect(() => {
    const { VB, RB, hw } = models[model].func();
    setVB(VB.toFixed(3));
    setRB(RB.toFixed(3));
    setHw(hw.toFixed(3));
  }, [model]);

  // Calculate σ for a range of Ecm
  const calculateSigmaRange = () => {
    const Vb = parseFloat(VB);
    const Rb = parseFloat(RB);
    const hbarw = parseFloat(hw);
    if ([Vb, Rb, hbarw].some((v) => isNaN(v))) {
      alert("Please fill all barrier fields!");
      return;
    }

    const dataArray = [];
const step = 0.5;

for (let Ec = Vb - 50; Ec <= Vb + 100; Ec += step) {
  const x = (2 * Math.PI * (Ec - Vb)) / hbarw;

  // Numerically stable log(1 + exp(x))
  let logTerm;
  if (x > 100) {
    logTerm = x; // approximation for very large x
  } else {
    logTerm = Math.log(1 + Math.exp(x));
  }

  const sigmaVal = Math.PI * Rb ** 2 * (hbarw / Ec) * logTerm * 10; // fm² -> mb

  dataArray.push({ 
  Ecm: parseFloat(Ec.toFixed(2)), 
  sigma: Math.max(sigmaVal, 1e-3) // keep as number
});

}

setData(dataArray);

  };

  return (
    <div style={{ padding: 20, minHeight: "100vh", background: "#050a1f", color: "#e3e8ff" }}>
      <h1 style={{ textAlign: "center", color: "#6fa8ff" }}>⚡ Fusion Cross Section</h1>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        {/* Inputs */}
        <div style={{ backgroundColor: "#0d1b3d", padding: 20, borderRadius: 12, minWidth: 220, boxShadow: "0 0 20px rgba(111,168,255,0.5)" }}>
          <h3 style={{ color: "#b8d4ff" }}>Barrier Parameters</h3>
          <select value={model} onChange={(e) => setModel(e.target.value)} style={{ width: "100%", padding: 6, borderRadius: 6, marginBottom: 10 }}>
            {Object.keys(models).map((key) => (
              <option key={key} value={key}>{models[key].name}</option>
            ))}
          </select>

          <label>Vᴮ (MeV): <input type="number" value={VB} onChange={(e) => setVB(e.target.value)} style={{ width: "80px" }} /></label><br />
          <label>Rᴮ (fm): <input type="number" value={RB} onChange={(e) => setRB(e.target.value)} style={{ width: "80px" }} /></label><br />
          <label>ℏω (MeV): <input type="number" value={hw} onChange={(e) => setHw(e.target.value)} style={{ width: "80px" }} /></label><br />

          <button onClick={calculateSigmaRange} style={{ marginTop: 10, padding: 10, borderRadius: 8, background: "#6fa8ff", color: "#050a1f", width: "100%" }}>
            Calculate σ(Ecm)
          </button>
        </div>

        {/* Table */}
        <div style={{ backgroundColor: "#0d1b3d", padding: 20, borderRadius: 12, minWidth: 250, maxHeight: "80vh", overflowY: "auto", boxShadow: "0 0 20px rgba(111,168,255,0.5)" }}>
          <h3 style={{ color: "#b8d4ff", textAlign: "center" }}>Ecm vs σ (mb)</h3>
          <table style={{ borderCollapse: "collapse", width: "100%", color: "#fff" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #6fa8ff", padding: 6 }}>Ecm (MeV)</th>
                <th style={{ border: "1px solid #6fa8ff", padding: 6 }}>σ (mb)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d, idx) => (
                <tr key={idx}>
                  <td style={{ border: "1px solid #6fa8ff", padding: 4 }}>{d.Ecm}</td>
                  <td style={{ border: "1px solid #6fa8ff", padding: 4 }}>{d.sigma}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Graph */}
        <div style={{ backgroundColor: "#eceef4ff", padding: 20, borderRadius: 12, minWidth: 600, height: 500, boxShadow: "0 0 20px rgba(8, 13, 21, 0.5)" }}>
          <h3 style={{ color: "#18171aff", textAlign: "center" }}>Fusion Cross Section vs Ecm</h3>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={data}>
              <CartesianGrid stroke="#0a0505ff" strokeDasharray="3 3" />
              <XAxis dataKey="Ecm" label={{ value: "Ecm (MeV)", position: "insideBottomRight", offset: -5 }} />
              <YAxis scale="log" domain={['auto', 'auto']} label={{ value: "σ (mb)", angle: -90, position: "insideLeft", offset: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="sigma" stroke="#ca1a07ff" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
