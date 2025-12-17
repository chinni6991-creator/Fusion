import React, { useEffect, useState, useCallback } from "react";
import Papa from "papaparse";

export default function EnergyPage({ Zp, Ap, Zt, At }) {

  const [massData, setMassData] = useState([]);
  const [Q, setQ] = useState(null);
  const [Elab, setElab] = useState("");
  const [Ecm, setEcm] = useState("");
  const [EStar, setEStar] = useState("");
  const [activeField, setActiveField] = useState("");
  const [loading, setLoading] = useState(true);

  const reaction = { Zp, Ap, Zt, At };


  // 🌸 Load mass_excess.csv file
  useEffect(() => {
    setLoading(true);
    Papa.parse(process.env.PUBLIC_URL + "/m_values/mass_excess.csv", {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const cleaned = results.data.map((row) => ({
          Z: parseInt((row.Z ?? row.z ?? "").toString().trim() || "0", 10),
          A: parseInt((row.A ?? row.a ?? "").toString().trim() || "0", 10),
          Mexp: (row.Mexp ?? "").toString().trim() === "" ? null : parseFloat((row.Mexp ?? "").toString()),
          Mth: (row.Mth ?? "").toString().trim() === "" ? null : parseFloat((row.Mth ?? "").toString()),
        }));
        setMassData(cleaned);
        setLoading(false);
      },
      error: (err) => {
        console.error("Error loading mass_excess.csv:", err);
        setLoading(false);
      },
    });
  }, []);

  // 🌻 Helper — useCallback to avoid ESLint warnings
  const getMassExcess = useCallback(
    (Z, A) => {
      if (!Z || !A || massData.length === 0) return null;
      const entry = massData.find((r) => r.Z === Number(Z) && r.A === Number(A));
      if (!entry) return null;
      return entry.Mexp !== null ? entry.Mexp : entry.Mth;
    },
    [massData]
  );

  // 🌼 Compute Q-value
  const computeQfromMasses = useCallback(() => {
    const { Zp, Ap, Zt, At } = reaction;
    const Mp = getMassExcess(Number(Zp), Number(Ap));
    const Mt = getMassExcess(Number(Zt), Number(At));
    const Mc = getMassExcess(Number(Zp) + Number(Zt), Number(Ap) + Number(At));
    if (Mp == null || Mt == null || Mc == null) {
      setQ(null);
      return null;
    }
    const qval = Mp + Mt - Mc;
    setQ(Number(qval.toFixed(3)));
    return qval;
  }, [reaction, getMassExcess]);

  // 🌸 Auto compute Q when massData or reaction changes
  useEffect(() => {
  if (reaction.Zp && reaction.Ap && reaction.Zt && reaction.At && massData.length > 0) {
    computeQfromMasses();
  } else {
    setQ(null);
  }
}, [reaction, massData, computeQfromMasses]);

  // 🌼 Recalculation functions
  const recalcFromElab = (val) => {
    setActiveField("Elab");
    setElab(val);
    const ApVal = Number(reaction.Ap);
    const AtVal = Number(reaction.At);
    const qVal = Number(Q);
    if (!val || isNaN(ApVal) || isNaN(AtVal) || isNaN(qVal)) {
      setEcm("");
      setEStar("");
      return;
    }
    const elab = Number(val);
    const ecm = (AtVal / (ApVal + AtVal)) * elab;
    const estar = ecm + qVal;
    setEcm(ecm.toFixed(3));
    setEStar(estar.toFixed(3));
  };

  const recalcFromEcm = (val) => {
    setActiveField("Ecm");
    setEcm(val);
    const ApVal = Number(reaction.Ap);
    const AtVal = Number(reaction.At);
    const qVal = Number(Q);
    if (!val || isNaN(ApVal) || isNaN(AtVal) || isNaN(qVal)) {
      setElab("");
      setEStar("");
      return;
    }
    const ecm = Number(val);
    const elab = ((ApVal + AtVal) / AtVal) * ecm;
    const estar = ecm + qVal;
    setElab(elab.toFixed(3));
    setEStar(estar.toFixed(3));
  };

  const recalcFromEStar = (val) => {
    setActiveField("EStar");
    setEStar(val);
    const ApVal = Number(reaction.Ap);
    const AtVal = Number(reaction.At);
    const qVal = Number(Q);
    if (!val || isNaN(ApVal) || isNaN(AtVal) || isNaN(qVal)) {
      setElab("");
      setEcm("");
      return;
    }
    const estar = Number(val);
    const ecm = estar - qVal;
    const elab = ((ApVal + AtVal) / AtVal) * ecm;
    setEcm(ecm.toFixed(3));
    setElab(elab.toFixed(3));
  };

  // 🌸 Input handlers
  const handleElabChange = (e) => {
    const v = e.target.value;
    if (v === "") {
      setElab("");
      setEcm("");
      setEStar("");
      setActiveField("");
    } else recalcFromElab(v);
  };

  const handleEcmChange = (e) => {
    const v = e.target.value;
    if (v === "") {
      setEcm("");
      setElab("");
      setEStar("");
      setActiveField("");
    } else recalcFromEcm(v);
  };

  const handleEStarChange = (e) => {
    const v = e.target.value;
    if (v === "") {
      setEStar("");
      setEcm("");
      setElab("");
      setActiveField("");
    } else recalcFromEStar(v);
  };

  // 🌼 If still loading CSV
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#040b20", color: "#7cc0ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 22, animation: "pulse 1.5s infinite" }}>🌸 Loading mass data...</div>
        <style>
          {`
            @keyframes pulse {
              0% { opacity: 0.4; }
              50% { opacity: 1; }
              100% { opacity: 0.4; }
            }
          `}
        </style>
      </div>
    );
  }

  // 🌸 UI display
  return (
    <div style={{ minHeight: "100vh", background: "#040b20", color: "#e7eefc", padding: 28 }}>
      <h1 style={{ color: "#7cc0ff", fontSize: 28, marginBottom: 16 }}> Energy Calculations</h1>

      <div style={{ fontSize: 18, marginBottom: 8 }}>
        Q-value:{" "}
        <span style={{ fontWeight: 700, fontSize: 18 }}>
          {Q === null ? "Mass excess not found!" : `${Q.toFixed(3)} MeV`}
        </span>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
        <div style={{ marginTop: 28, background: "#032b59", padding: 20, borderRadius: 20, width: 300, maxWidth: "80%" }}>
          <h2 style={{ color: "#bfe0ff", marginTop: 0, marginBottom: 10 }}>Energy Relationships (MeV)</h2>

          <div style={{ display: "grid", gap: 10 }}>
            <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Elab:</span>
              <input
                type="number"
                step="any"
                value={Elab}
                onChange={handleElabChange}
                placeholder="Enter Elab"
                style={{ width: 160, padding: 6, borderRadius: 6, border: "1px solid #2b4a6f" }}
              />
            </label>

            <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Ecm:</span>
              <input
                type="number"
                step="any"
                value={Ecm}
                onChange={handleEcmChange}
                placeholder="Enter Ecm"
                style={{ width: 160, padding: 6, borderRadius: 6, border: "1px solid #2b4a6f" }}
              />
            </label>

            <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>E*:</span>
              <input
                type="number"
                step="any"
                value={EStar}
                onChange={handleEStarChange}
                placeholder="Enter E*"
                style={{ width: 160, padding: 6, borderRadius: 6, border: "1px solid #2b4a6f" }}
              />
            </label>
          </div>

          <div style={{ marginTop: 12, color: "#e1e8f1", fontSize: 13 }}>
            Tip: Type in any one field (Elab, Ecm, or E*) — the others update automatically.
          </div>
        </div>
      </div>
    </div>
  );
}
