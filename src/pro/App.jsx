import React, { useEffect, useMemo, useState } from 'react'
import { QA as SEED } from '../data'

const BOX_INTERVALS = [0, 1, 2, 4, 7, 15]
const KEY = 'tus-pro-state-v1'
const todayISO = () => new Date().toISOString().slice(0,10)
const addDays = (iso, n) => { const d=new Date(iso); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10) }
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} } }
const save = (s) => localStorage.setItem(KEY, JSON.stringify(s))

function useCards(){
  const [cards, setCards] = useState(() => {
    const st = load()
    return st.cards || SEED.map(c => ({...c, box:1, due: todayISO(), history: []}))
  })
  useEffect(()=>save({cards}),[cards])
  return [cards, setCards]
}

function Header({onExport,onImport,onReset}){
  return (
    <div className="header">
      <div className="container hstack">
        <div className="title" style={{fontWeight:800,fontSize:22}}>TUS Soru Arşivi • Pro</div>
        <span className="badge">Serhat</span>
        <div className="spacer" />
        <button className="btn" onClick={onExport}>Dışa Aktar</button>
        <label className="btn">İçe Aktar<input type="file" accept="application/json" style={{display:'none'}} onChange={onImport}/></label>
        <button className="btn ghost" onClick={onReset}>Sıfırla</button>
      </div>
    </div>
  )
}

export default function App(){
  const [cards, setCards] = useCards()
  const [tab, setTab] = useState('browse')
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('Hepsi')
  const cats = useMemo(()=>['Hepsi', ...Array.from(new Set(cards.map(c=>c.cat))).sort((a,b)=>a.localeCompare(b,'tr'))],[cards])
  const filtered = useMemo(()=>{
    const s=q.trim().toLowerCase()
    return cards.filter(x => (cat==='Hepsi'||x.cat===cat) && (!s || x.q.toLowerCase().includes(s) || (x.a||'').toLowerCase().includes(s)))
  },[cards,q,cat])
  const dueToday = useMemo(()=>cards.filter(c=>c.due<=todayISO()),[cards])

  function grade(card, tag){
    const delta = tag==='again'?-1:tag==='hard'?0:tag==='good'?1:2
    const nextBox = Math.max(1, Math.min(5, (card.box||1)+delta))
    const nextDue = addDays(todayISO(), BOX_INTERVALS[nextBox])
    setCards(cards.map(c => c.id===card.id ? {...c, box:nextBox, due:nextDue, history:[...c.history,{date:todayISO(),grade:tag}]} : c))
  }

  function exportJSON(){
    const blob = new Blob([JSON.stringify({cards},null,2)],{type:'application/json'})
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='tus-pro.json'; a.click(); URL.revokeObjectURL(url)
  }
  function importJSON(e){
    const f=e.target.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ try{const o=JSON.parse(r.result); if(o.cards) setCards(o.cards); else if(Array.isArray(o)) setCards(o); else alert('Geçersiz JSON');}catch{alert('JSON okunamadı')}}; r.readAsText(f)
  }
  function resetAll(){ if(confirm('İlerleme sıfırlansın mı?')) setCards(SEED.map(c=>({...c,box:1,due:todayISO(),history:[]}))) }

  return (
    <div>
      <Header onExport={exportJSON} onImport={importJSON} onReset={resetAll} />
      <div className="container">
        <div className="kpi">
          <div className="pill">Toplam: {cards.length}</div>
          <div className="pill">Bugün tekrar: {dueToday.length}</div>
        </div>
        <div className="hstack" style={{gap:8,marginBottom:12}}>
          <button className={`btn ${tab==='browse'?'primary':''}`} onClick={()=>setTab('browse')}>Liste</button>
          <button className={`btn ${tab==='study'?'primary':''}`} onClick={()=>setTab('study')}>Çalış (Aralıklı Tekrar)</button>
        </div>

        {tab==='browse' ? (
          <>
            <div className="toolbar">
              <input className="input" placeholder="Ara (soru veya cevap)" value={q} onChange={e=>setQ(e.target.value)} />
              <select value={cat} onChange={e=>setCat(e.target.value)}>{cats.map(c=><option key={c} value={c}>{c}</option>)}</select>
              <div></div>
            </div>
            <div className="grid">
              {filtered.map(item=> (
                <div key={item.id} className="card">
                  <div className="cat">{item.cat} • Kutu {item.box} • {item.due<=todayISO()?'Bugün due':`Sonraki: ${item.due}`}</div>
                  <div className="q">{item.q}</div>
                  <div className="a">{item.a}</div>
                  <div className="hstack" style={{justifyContent:'flex-end',marginTop:8}}>
                    <button className="btn" onClick={()=>navigator.clipboard.writeText(item.q+' — '+item.a)}>Kopyala</button>
                    <button className="btn" onClick={()=>alert(item.history.map(h=>`${h.date}: ${h.grade}`).join('\n')||'Geçmiş yok')}>Geçmiş</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <Study cards={cards} onGrade={grade} />
        )}

        <div className="footer">Açık mavi, kompakt UI • Aralıklı tekrar + aktif hatırlama • Veriler tarayıcıda saklanır.</div>
      </div>
    </div>
  )
}

function Study({cards,onGrade}){
  const due = useMemo(()=>cards.filter(c=>c.due<=todayISO()).sort((a,b)=>a.due.localeCompare(b.due)),[cards])
  const [i,setI]=useState(0); const [show,setShow]=useState(false)
  useEffect(()=>setShow(false),[i])
  if(due.length===0){ return <div className="quiz due"><b>Bugün tekrar yok.</b><div className="small">Liste sekmesinden çalışabilir veya yarına bekleyebilirsin.</div></div> }
  const card = due[i % due.length]
  return (
    <div className="quiz">
      <div className="small">Due: {due.length} kart</div>
      <h3 style={{margin:'6px 0 8px 0'}}>{card.cat}</h3>
      <div className="q" style={{fontSize:16,fontWeight:600}}>{card.q}</div>
      {!show ? <button className="btn primary" style={{marginTop:10}} onClick={()=>setShow(true)}>Cevabı Göster</button> : <div className="a" style={{marginTop:8}}>{card.a}</div>}
      <hr className="sep" />
      <div className="options">
        <button className="btn" onClick={()=>{onGrade(card,'again'); setI(i+1)}}>Tekrar</button>
        <button className="btn" onClick={()=>{onGrade(card,'hard'); setI(i+1)}}>Zor</button>
        <button className="btn" onClick={()=>{onGrade(card,'good'); setI(i+1)}}>İyi</button>
        <button className="btn" onClick={()=>{onGrade(card,'easy'); setI(i+1)}}>Kolay</button>
      </div>
    </div>
  )
}
