import React, { useEffect, useMemo, useState } from 'react'
import { QA as SEED } from '../data'

const BOX_INTERVALS = [0,1,2,4,7,15]
const KEY='tus-proplus-state-v1'
const todayISO = () => new Date().toISOString().slice(0,10)
const addDays = (iso, n)=>{const d=new Date(iso); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10)}
const load = ()=>{ try{return JSON.parse(localStorage.getItem(KEY))||{}}catch{return{}} }
const save = (s)=>localStorage.setItem(KEY, JSON.stringify(s))

const CAT_ICON = {
  'İmmünoloji':'🧪','Nöroloji':'🧠','Pediatri':'👶','Genel Cerrahi':'🩺','Göğüs Hastalıkları':'🫁',
  'Kardiyoloji/Yoğun Bakım':'❤️','Endokrinoloji':'🧬','Nefroloji':'🫘','Hematoloji':'🩸',
  'Onkoloji':'🎗️','Enfeksiyon':'🦠','Gastro':'🫗','Psikiyatri':'🧩','Radyoloji':'🩻','Kadın-Doğum':'🤰','Fizyoloji':'📈'
}

function useCards(){
  const [cards, setCards] = useState(()=>{
    const st = load()
    return st.cards || SEED.map(c=>({...c, box:1, due:todayISO(), history:[]}))
  })
  useEffect(()=>save({cards}),[cards])
  return [cards, setCards]
}

function BrandBar({progress, todayCount, onExport, onImport, onReset, mode, setMode}){
  return (
    <div className="header">
      <div className="container">
        <div className="hstack">
          <div className="brand">
            <div className="logo">TUS</div>
            <div>
              <div className="title" style={{fontFamily:'Manrope,Inter'}}>Soru Arşivi • Pro+</div>
              <div className="sub">Bugün {todayCount} kart • Hedef: ustala</div>
            </div>
            <span className="badge">Serhat</span>
          </div>
          <div className="spacer" />
          <button className="btn" onClick={onExport}>Yedek (.json)</button>
          <label className="btn">İçe Aktar
            <input type="file" accept="application/json" style={{display:'none'}} onChange={onImport}/>
          </label>
          <button className="btn ghost" onClick={onReset}>Sıfırla</button>
          <button className="btn" onClick={()=>setMode(mode==='minimal'?'detailed':'minimal')}>{mode==='minimal'?'Detaylı':'Minimal'}</button>
        </div>
        <div className="kpi">
          <div className="pill" title="İlerleme">
            Günlük ilerleme
            <div className="progress" style={{width:220, marginTop:6}}><div style={{width:`${Math.round(progress*100)}%`}}/></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App(){
  const [cards, setCards] = useCards()
  const [tab, setTab] = useState('study') // default study mode
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('Hepsi')
  const [mode, setMode] = useState('minimal')
  const [onlyDue, setOnlyDue] = useState(false)

  const cats = useMemo(()=>['Hepsi', ...Array.from(new Set(cards.map(c=>c.cat))).sort((a,b)=>a.localeCompare(b,'tr'))],[cards])
  const todayDue = useMemo(()=>cards.filter(c=>c.due<=todayISO()),[cards])
  const totalDue = todayDue.length

  const filtered = useMemo(()=>{
    const s=q.trim().toLowerCase()
    return cards
      .filter(x => (cat==='Hepsi'||x.cat===cat))
      .filter(x => (!onlyDue || x.due<=todayISO()))
      .filter(x => (!s || x.q.toLowerCase().includes(s) || (x.a||'').toLowerCase().includes(s)))
  },[cards, q, cat, onlyDue])

  // Progress: approximate = studied today / total due
  const studiedToday = useMemo(()=> cards.reduce((acc,c)=>acc + (c.history?.some(h=>h.date===todayISO())?1:0),0),[cards])
  const progress = totalDue ? Math.min(1, studiedToday/totalDue) : 1

  function grade(card, tag){
    const delta = tag==='again'?-1:tag==='hard'?0:tag==='good'?1:2
    const nextBox = Math.max(1, Math.min(5, (card.box||1)+delta))
    const nextDue = addDays(todayISO(), BOX_INTERVALS[nextBox])
    setCards(cards.map(c => c.id===card.id ? {...c, box:nextBox, due:nextDue, history:[...c.history,{date:todayISO(),grade:tag}]} : c))
  }

  function exportJSON(){
    const blob = new Blob([JSON.stringify({cards},null,2)],{type:'application/json'})
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='tus-proplus.json'; a.click(); URL.revokeObjectURL(url)
  }
  function importJSON(e){
    const f=e.target.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ try{const o=JSON.parse(r.result); if(o.cards) setCards(o.cards); else if(Array.isArray(o)) setCards(o); else alert('Geçersiz JSON');}catch{alert('JSON okunamadı')}}; r.readAsText(f)
  }
  function resetAll(){ if(confirm('İlerleme sıfırlansın mı?')) setCards(SEED.map(c=>({...c,box:1,due:todayISO(),history:[]}))) }

  return (
    <div>
      <BrandBar
        progress={progress}
        todayCount={totalDue}
        onExport={exportJSON}
        onImport={importJSON}
        onReset={resetAll}
        mode={mode}
        setMode={setMode}
      />

      <div className="container" style={{paddingTop:12}}>
        <div className="hstack" style={{gap:8,marginBottom:12}}>
          <button className={`btn ${tab==='study'?'primary':''}`} onClick={()=>setTab('study')}>Çalış</button>
          <button className={`btn ${tab==='browse'?'primary':''}`} onClick={()=>setTab('browse')}>Liste</button>
          <div className="spacer"></div>
          <div className="switch">
            <input id="dueSwitch" type="checkbox" checked={onlyDue} onChange={e=>setOnlyDue(e.target.checked)} />
            <label htmlFor="dueSwitch">Sadece bugün due</label>
          </div>
        </div>

        {tab==='study' ? (
          <Study cards={cards} onGrade={grade} />
        ) : (
          <>
            <div className="toolbar">
              <input className="input" placeholder="Ara (soru/cevap)" value={q} onChange={e=>setQ(e.target.value)} />
              <select value={cat} onChange={e=>setCat(e.target.value)}>{cats.map(c=><option key={c} value={c}>{c}</option>)}</select>
              <select value={mode} onChange={e=>setMode(e.target.value)}>
                <option value="minimal">Minimal</option>
                <option value="detailed">Detaylı</option>
              </select>
              <div></div>
            </div>
            <div className="grid">
              {filtered.map(item => (
                <Card key={item.id} item={item} mode={mode} />
              ))}
            </div>
          </>
        )}

        <div className="footer">Pro+ görünüm • Poppins/Manrope tipografi • Kısayollar: Space, 1-4 • JSON yedek • LocalStorage</div>
      </div>
    </div>
  )
}

function Card({item, mode}){
  const color = `var(--cat-${(item.cat||'').replaceAll(' ','\\ ').replaceAll('/','\\/')})`
  const icon = CAT_ICON[item.cat] || '📌'
  return (
    <div className="card" style={{borderColor:color}}>
      <div className="tag" style={{color}}>{icon} {item.cat} • Kutu {item.box} • {item.due}</div>
      <div className="q" style={{fontFamily:'Manrope,Inter'}}>{item.q}</div>
      {mode==='detailed' && <div className="a">{item.a}</div>}
      <div className="hstack" style={{justifyContent:'space-between',marginTop:8}}>
        <span className="small">ID: {item.id}</span>
        <span className="chip" title="kopyala" onClick={()=>navigator.clipboard.writeText(item.q+' — '+item.a)}>Kopyala</span>
      </div>
    </div>
  )
}

function Study({cards,onGrade}){
  const due = useMemo(()=>cards.filter(c=>c.due<=todayISO()).sort((a,b)=>a.due.localeCompare(b.due)),[cards])
  const [i,setI]=useState(0); const [show,setShow]=useState(false)
  useEffect(()=>setShow(false),[i])

  // Keyboard shortcuts
  useEffect(()=>{
    function onKey(e){
      if(e.code==='Space'){ e.preventDefault(); setShow(s=>!s); }
      if(['Digit1','Digit2','Digit3','Digit4'].includes(e.code)){
        const map={Digit1:'again',Digit2:'hard',Digit3:'good',Digit4:'easy'}
        const tag = map[e.code]; if(due.length>0){ onGrade(due[i % due.length], tag); setI(v=>v+1); setShow(false) }
      }
    }
    window.addEventListener('keydown', onKey); return ()=>window.removeEventListener('keydown', onKey)
  },[i,due,onGrade])

  if(due.length===0){
    return <div className="quiz due"><b>Bugün tekrar yok.</b><div className="small">Liste sekmesinden çalışabilir veya yarına bekleyebilirsin.</div></div>
  }
  const card = due[i % due.length]
  const total = due.length
  const current = (i % due.length) + 1
  const pct = Math.round((current-1)/total*100)

  return (
    <div className="quiz">
      <div className="hstack" style={{justifyContent:'space-between',marginBottom:8}}>
        <div className="small">Due: {total} kart</div>
        <div className="small">Kısayollar: Space, 1-4</div>
      </div>
      <div className="progress" style={{marginBottom:10}}><div style={{width:`${pct}%`}}/></div>
      <h3 style={{margin:'6px 0 8px 0', fontFamily:'Manrope,Inter'}}>{card.cat}</h3>
      <div className="q" style={{fontSize:18,fontWeight:800,fontFamily:'Manrope,Inter'}}>{card.q}</div>
      {!show ? (
        <button className="btn primary" style={{marginTop:10}} onClick={()=>setShow(true)}>Cevabı Göster</button>
      ) : (
        <div className="a" style={{marginTop:8}}>{card.a}</div>
      )}
      <hr className="sep" />
      <div className="options">
        <button className="btn" onClick={()=>{onGrade(card,'again'); setI(i+1)}}>1 • Tekrar</button>
        <button className="btn" onClick={()=>{onGrade(card,'hard'); setI(i+1)}}>2 • Zor</button>
        <button className="btn" onClick={()=>{onGrade(card,'good'); setI(i+1)}}>3 • İyi</button>
        <button className="btn" onClick={()=>{onGrade(card,'easy'); setI(i+1)}}>4 • Kolay</button>
      </div>
    </div>
  )
}
