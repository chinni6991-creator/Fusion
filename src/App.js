import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import betaCSV from "./beta_values.csv"; // Make sure CSV is in src folder
import BarrierPage from "./BarrierPage";
import EnergyPage from "./EnergyPage";
import FusionCrossSectionPage from "./FusionCrossSectionPage";



export default function ReactionPage() {
  const [Zp, setZp] = useState("");
  const [Ap, setAp] = useState("");
  const [Zt, setZt] = useState("");
  const [At, setAt] = useState("");
  const [activeSection, setActiveSection] = useState(""); 
  const [betaData, setBetaData] = useState([]);
// ⚡ Store reaction data and go to Energy Page
const handleEnergyPage = () => {
  setActiveSection("energy");
};



  useEffect(() => {
    Papa.parse(betaCSV, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const cleaned = results.data.map((row) => ({
          Z: row.Z ?? row.z ?? row.Zp ?? row.Z_p,
          A: row.A ?? row.a ?? row.Ap ?? row.A_p,
          beta2: row.beta2 ?? row.b2 ?? row.beta_2 ?? "NA",
          beta4: row.beta4 ?? row.b4 ?? row.beta_4 ?? "NA",
        }));
        setBetaData(cleaned);
      },
    });
  }, []);

  const getElement = (Z) => {
    const elements = {
      1:"H",2:"He",3:"Li",4:"Be",5:"B",6:"C",7:"N",8:"O",9:"F",10:"Ne",
      11:"Na",12:"Mg",13:"Al",14:"Si",15:"P",16:"S",17:"Cl",18:"Ar",19:"K",20:"Ca",
      21:"Sc",22:"Ti",23:"V",24:"Cr",25:"Mn",26:"Fe",27:"Co",28:"Ni",29:"Cu",30:"Zn",
      31:"Ga",32:"Ge",33:"As",34:"Se",35:"Br",36:"Kr",37:"Rb",38:"Sr",39:"Y",40:"Zr",
      41:"Nb",42:"Mo",43:"Tc",44:"Ru",45:"Rh",46:"Pd",47:"Ag",48:"Cd",49:"In",50:"Sn",
      51:"Sb",52:"Te",53:"I",54:"Xe",55:"Cs",56:"Ba",57:"La",58:"Ce",59:"Pr",60:"Nd",
      61:"Pm",62:"Sm",63:"Eu",64:"Gd",65:"Tb",66:"Dy",67:"Ho",68:"Er",69:"Tm",70:"Yb",
      71:"Lu",72:"Hf",73:"Ta",74:"W",75:"Re",76:"Os",77:"Ir",78:"Pt",79:"Au",80:"Hg",
      81:"Tl",82:"Pb",83:"Bi",84:"Po",85:"At",86:"Rn",87:"Fr",88:"Ra",89:"Ac",90:"Th",
      91:"Pa",92:"U",93:"Np",94:"Pu",95:"Am",96:"Cm",97:"Bk",98:"Cf",99:"Es",100:"Fm",
      101:"Md",102:"No",103:"Lr",104:"Rf",105:"Db",106:"Sg",107:"Bh",108:"Hs",109:"Mt",
      110:"Ds",111:"Rg",112:"Cn",113:"Nh",114:"Fl",115:"Mc",116:"Lv",117:"Ts",118:"Og"
    };
    return elements[Z] || Z;
  };

  const fetchBetaValues = (Z, A) => {
    const row = betaData.find(r => Number(r.Z) === Number(Z) && Number(r.A) === Number(A));
    return row ? { beta2: row.beta2, beta4: row.beta4 } : { beta2: "NA", beta4: "NA" };
  };

  // --- Derived Reaction ---
  const totalZ = Zp && Zt ? Number(Zp)+Number(Zt) : "";
  const totalA = Ap && At ? Number(Ap)+Number(At) : "";
  const resultElement = totalZ ? getElement(totalZ) : "";

  const alpha_m = Ap && At ? Math.abs((Number(Ap)-Number(At))/(Number(Ap)+Number(At))).toFixed(3) : "NA";
  const alpha_z = Zp && Zt ? Math.abs((Number(Zp)-Number(Zt))/(Number(Zp)+Number(Zt))).toFixed(3) : "NA";
  const prodZ = Zp && Zt ? (Number(Zp)*Number(Zt)).toFixed(0) : "NA";
  const coulombParam = Zp && Zt && Ap && At ? (Number(Zp)*Number(Zt)/(Math.cbrt(Number(Ap))+Math.cbrt(Number(At)))).toFixed(3) : "NA";

  const N_Z_P = Zp && Ap ? ((Number(Ap)-Number(Zp))/Number(Zp)).toFixed(3) : "NA";
  const N_Z_T = Zt && At ? ((Number(At)-Number(Zt))/Number(Zt)).toFixed(3) : "NA";
  const isospin = N_Z_P !== "NA" && N_Z_T !== "NA" ? Math.abs(N_Z_P-N_Z_T).toFixed(3) : "NA";

  const chi_eff = Zp && Zt && Ap && At ? (
    (4*Number(Zp)*Number(Zt)/((Math.cbrt(Number(Ap))+Math.cbrt(Number(At)))*Math.cbrt(Number(Ap)*Number(At)))/(50.883*(1-1.7826*((totalA-2*totalZ)/totalA)**2))).toFixed(3)
  ) : "NA";
  const chi_m = Zp && Zt && Ap && At ? (
    ((2*totalZ**2/totalA)/(3*50.883*(1-1.7826*((totalA-2*totalZ)/totalA)**2)) + (4*Number(Zp)*Number(Zt)/((Math.cbrt(Number(Ap))+Math.cbrt(Number(At)))*Math.cbrt(Number(Ap)*Number(At)))/(3*50.883*(1-1.7826*((totalA-2*totalZ)/totalA)**2)))).toFixed(3)
  ) : "NA";

  const betaProjectile = Zp && Ap ? fetchBetaValues(Zp, Ap) : { beta2: "NA", beta4: "NA" };
  const betaTarget = Zt && At ? fetchBetaValues(Zt, At) : { beta2: "NA", beta4: "NA" };

  const inputStyle = { display:"block", width:"100px", padding:"8px", margin:"8px auto", borderRadius:"8px", border:"1px solid #862c3bff", backgroundColor:"#eaeaf2ff", color:"#0b0404ff", textAlign:"center" };
  const buttonStyle = { padding:"10px 20px", margin:"0 8px", borderRadius:"8px", border:"none", backgroundColor:"#1a3a7a", color:"#fff", cursor:"pointer" };
  const boxStyle = { backgroundColor:"#2f4371ff", padding:"15px", borderRadius:"12px", margin:"10px", width:"280px", display:"inline-block", boxShadow:"0 0 15px rgba(111,168,255,0.5)", verticalAlign:"top" };

  return (
    <div style={{ backgroundColor:"#050a1f", color:"#e3e8ff", minHeight:"100vh", padding:"20px", textAlign:"center" }}>
      <h1 style={{ color:"#6fa8ff" }}>⚛️ Fusion Reaction Input</h1>

      <div style={{ display:"flex", justifyContent:"center", gap:"50px", flexWrap:"wrap" }}>
        <div>
          <h2 style={{ color:"#8ab4ff" }}>Projectile</h2>
          <input style={inputStyle} type="number" placeholder="Zₚ" value={Zp} onChange={(e)=>setZp(e.target.value)} />
          <input style={inputStyle} type="number" placeholder="Aₚ" value={Ap} onChange={(e)=>setAp(e.target.value)} />
          <span style={{ marginLeft:"10px", fontSize:"20px" }}>{Zp && Ap && <><sup>{Ap}</sup>{getElement(Number(Zp))}</>}</span>
        </div>
        <div>
          <h2 style={{ color:"#8ab4ff" }}>Target</h2>
          <input style={inputStyle} type="number" placeholder="Zₜ" value={Zt} onChange={(e)=>setZt(e.target.value)} />
          <input style={inputStyle} type="number" placeholder="Aₜ" value={At} onChange={(e)=>setAt(e.target.value)} />
          <span style={{ marginLeft:"10px", fontSize:"20px" }}>{Zt && At && <><sup>{At}</sup>{getElement(Number(Zt))}</>}</span>
        </div>
      </div>

      {/* --- Reaction Display Automatically --- */}
      {Zp && Ap && Zt && At && (
        <p style={{ fontSize:"22px", margin:"20px 0" }}>
          <sup>{Ap}</sup>{getElement(Number(Zp))} + <sup>{At}</sup>{getElement(Number(Zt))} → <sup>{totalA}</sup>{resultElement} (Z={totalZ})
        </p>
      )}

      {/* --- Buttons --- */}
      <div style={{ marginTop:"20px" }}>
        <button style={buttonStyle} onClick={()=>setActiveSection("entrance")}>Entrance + Deformations</button>
        <button style={buttonStyle} onClick={()=>setActiveSection("fusion")}>Fusion Barriers</button>
        <button style={buttonStyle} onClick={handleEnergyPage}>Energy Calculations</button>
        <button style={buttonStyle} onClick={()=>setActiveSection("cross")}>Fusion Cross Sections</button>
      </div>

      {/* --- Entrance Channel & Deformations --- */}
      {activeSection === "entrance" && (
  <div style={{ marginTop:"25px", display:"flex", justifyContent:"center", gap:"20px", flexWrap:"wrap" }}>
    {/* --- Entrance Channel Parameters --- */}
    <div style={boxStyle}>
      <h2 style={{ color:"#b91010ff" }}>🔹 Entrance Channel Parameters</h2>
      <p>Mass Asymmetry |η<sub>m</sub>|: <strong>{alpha_m}</strong></p>
      <p>Charge Asymmetry |α<sub>z</sub>|: <strong>{alpha_z}</strong></p>
      <p>Product Z₁Z₂: <strong>{prodZ}</strong></p>
      <p>Coulomb Interaction Parameter: <strong>{coulombParam}</strong></p>
      <p>Projectile N/Z: <strong>{N_Z_P}</strong></p>
      <p>Target N/Z: <strong>{N_Z_T}</strong></p>
      <p>Isospin Asymmetry: <strong>{isospin}</strong></p>
      <p>Mean Fissility χₘ: <strong>{chi_m}</strong></p>
      <p>Effective Fissility χₑff: <strong>{chi_eff}</strong></p>
    </div>

    {/* --- Deformations --- */}
    <div style={boxStyle}>
      <h2 style={{ color:"#b91010ff" }}>🔹 Deformations</h2>
      <p>Projectile β₂: <strong>{betaProjectile.beta2}</strong></p>
      <p>Projectile β₄: <strong>{betaProjectile.beta4}</strong></p>
      <p>Target β₂: <strong>{betaTarget.beta2}</strong></p>
      <p>Target β₄: <strong>{betaTarget.beta4}</strong></p>
    </div>

    
  </div>
)}
{activeSection === "fusion" && <BarrierPage />}
   
    {activeSection === "energy" && (
  <EnergyPage 
    Zp={Zp}
    Ap={Ap}
    Zt={Zt}
    At={At}
  />
)}


    {activeSection === "cross" && <FusionCrossSectionPage />}


    </div>
  );
}
