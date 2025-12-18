// src/FusionCrossSectionPage.js
import React, { useState, useEffect, useMemo } from "react";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function FusionCrossSectionPage({ Zp, Ap, Zt, At }) {

  const [model, setModel] = useState("bass");
  const [data, setData] = useState([]);

  const zp = Number(Zp);
  const ap = Number(Ap);
  const zt = Number(Zt);
  const at = Number(At);


  // --- Barrier calculations for 8 models ---
  const calculateBass = () => {
 if (!zp || !zt || !ap || !at) return { VB: 0, RB: 0, hw: 0 };   
  const e2 = 1.44; // MeV·fm
  const Rp3 = Math.cbrt(ap);
  const Rt3 = Math.cbrt(at);
  const RB = 1.07 * (Rp3 + Rt3) + 0.54;
  const VB = e2 * (zp * zt) / RB - 50 / (Rp3 + Rt3);
  const hw = 0.065 * (zp * zt) / Math.pow(Rp3 + Rt3, 1.5);

    return { VB, RB, hw };
  };

  const calculateDutt = () => {
    if (!zp || !zt || !ap || !at) return { VB: 0, RB: 0, hw: 0 };
  const C1 = 1.28 * Math.cbrt(ap) - 0.76 + 0.8 / Math.cbrt(ap);
  const C2 = 1.28 * Math.cbrt(at) - 0.76 + 0.8 / Math.cbrt(at);
  const x = (zp * zt) / (Math.cbrt(ap) + Math.cbrt(at));
  const alpha = 5.18419, beta = 0.33979, delta = 0.99903;
  const sB = alpha * Math.exp(-beta * Math.pow(x - 2, 0.25));
  const RB = C1 + C2 + sB;
  const VB = delta * ((1.44 * zp * zt / RB) * (1 - 0.75 / RB)) * 0.95;
  const hw = 0.065 * zp * zt / Math.pow(Math.cbrt(ap) + Math.cbrt(at), 1.5);
    return { VB, RB, hw };
  };

  const calculateManju = () => {
   if (!zp || !zt || !ap || !at) return { VB: 0, RB: 0, hw: 0 }; 
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
  const num = (zp * zt) / (Math.cbrt(ap) + Math.cbrt(at));
  const SB = -1.236e-7 * num ** 3 + 7.774e-5 * num ** 2 - 2.324e-2 * num + 3.759;
  const RB = SB + Cp + Ct;
  const VB = 1.4057 * ((zp * zt / RB) * (1 - 1 / RB)) + 5.4746;
  let hw = -3.34e-7 * num ** 3 + 1.39e-4 * num ** 2 - 2.37e-2 * num + 5.67;
  if (hw < 0) hw = 0.5;
    return { VB, RB, hw };
  };

  const calculateActi = () => {
   if (!zp || !zt || !ap || !at) return { VB: 0, RB: 0, hw: 0 }; 
  const b = 1.0;
  const R0p = 1.28 * Math.cbrt(Ap) - 0.76 + 0.8 / Math.cbrt(Ap)
    const R0t = 1.28 * Math.cbrt(At) - 0.76 + 0.8 / Math.cbrt(At);
  const Cp = R0p * (1 - b ** 2 / R0p ** 2);
  const Ct = R0t * (1 - b ** 2 / R0t ** 2);
  const num = (zp * zt) / (Math.cbrt(ap) + Math.cbrt(at));
  const SB = -1.79e-7 * num ** 3 + 1.05e-4 * num ** 2 - 2.76e-2 * num + 3.98;
  const RB = SB + Cp + Ct;
  const VB = 1.435 * ((zp * zt / RB) * (1 - 1 / RB)) + 1.866;
  let hw = 1.46e-7 * num ** 3 + 9.4e-5 * num ** 2 + 1.02e-2 * num - 4.02;
  if (hw < 0) hw = 0.5;
    return { VB, RB, hw };
  };

  const calculateAdam = () => {
   if (!zp || !zt || !ap || !at) return { VB: 0, RB: 0, hw: 0 };
  const RB = 1.25 * (Math.cbrt(ap) + Math.cbrt(at));
  const VB = 1.44 * zp * zt / RB;
  const hw = 4.0;
    return { VB, RB, hw };
  };

  const calculateArora = () => {
  if (!zp || !zt || !ap || !at) return { VB: 0, RB: 0, hw: 0 };  
  const RB = 7.359 + 3.076e-3 * ap - 1.182e-6 * ap ** 2 + 1.567e-11 * ap ** 3;
  const VB = 1.44 * zp * zt / RB;
  const hw = 4.5 - 0.002 * zp * zt;
    return { VB, RB, hw };
  };

  const calculateWS = () => {
   if (!zp || !zt || !ap || !at) return { VB: 0, RB: 0, hw: 0 }; 
  const r0 = 1.2, a = 0.65, V0 = 50;
  const RB = r0 * (Math.cbrt(ap) + Math.cbrt(at));
  const VC = 1.44 * zp * zt / RB;
  const VN = V0 * Math.exp(-RB / a);
  const VB = VC + VN;
  const hw = 0.065 * zp * zt / Math.pow(Math.cbrt(ap) + Math.cbrt(at), 1.5);
    return { VB, RB, hw };
  };

  const calculateProx = () => {
  if (!zp || !zt || !ap || !at) return { VB: 0, RB: 0, hw: 0 };  
  const r0 = 1.17, a = 0.63;
  const gamma = 0.9517 * (1 - 1.7826 * ((ap - 2 * zp) / ap) ** 2);
  const C1 = r0 * Math.cbrt(ap) + 0.5;
  const C2 = r0 * Math.cbrt(at) + 0.5;
  const RB = C1 + C2;
  const VB = 1.44 * zp * zt / RB - 0.01 * gamma * (C1 * C2) / (C1 + C2);
  const hw = 0.065 * zp * zt / Math.pow(Math.cbrt(ap) + Math.cbrt(at), 1.5);
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

  // --- Recalculate barriers whenever inputs or model change ---

const [VB, setVB] = useState(0);
const [RB, setRB] = useState(0);
const [hw, setHw] = useState(0);

useEffect(() => {
  if (!Zp || !Ap || !Zt || !At) return;

  const zp = Number(Zp);
  const ap = Number(Ap);
  const zt = Number(Zt);
  const at = Number(At);

  const result = models[model].func(zp, ap, zt, at);
  setVB(result.VB);
  setRB(result.RB);
  setHw(result.hw);

}, [Zp, Ap, Zt, At, model]);


  // Calculate σ for a range of Ecm
  // Calculate σ(E) using FULL Wong formula (1973)
const calculateSigmaRange = () => {
    if (VB <= 0 || RB <= 0 || hw <= 0) return;

  const dataArray = [];
  const step = 0.5;
const Estart = Vb - 2 * hbarw; // effective fusion onset
  for (let Ec = Estart; Ec <= Vb + 100; Ec += step) {
    if (Ec <= 0) continue;

    const x = (2 * Math.PI * (Ec - Vb)) / hbarw;

   
let sigmaVal;
    if (x < -50) {
      sigmaVal = 0; // numerically ~0 (deep sub-barrier)
    } else {
      sigmaVal =
  (hbarw * Rb * Rb) / (2 * Ec) *
  Math.log(1 + Math.exp(x));

      }

 sigmaVal *= 10; // fm² → mb


    dataArray.push({
      Ecm: +Ec.toFixed(2),
      sigma: sigmaVal > 0 ? sigmaVal : null, // safe for log-scale
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

       <p>Vᴮ = {VB.toFixed(3)} MeV</p>
          <p>Rᴮ = {RB.toFixed(3)} fm</p>
          <p>ℏω = {hw.toFixed(3)} MeV</p>


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