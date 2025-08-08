import React, { useMemo, useState } from 'react'

const INITIAL_QUESTIONS = [
  // İmmünoloji
  { id: 1, q: 'CVID, XLA ve HIV enfeksiyonu birlikte olduğunda klinik seyir nasıl değişir?', cat: 'İmmünoloji', date: '2025-08-08' },
  { id: 2, q: 'Selektif IgA eksikliğinde salgısal IgA düzeyi nasıldır?', cat: 'İmmünoloji', date: '2025-08-08' },
  { id: 3, q: 'Downey hücreleri nerede görülür?', cat: 'İmmünoloji', date: '2025-08-08' },
  { id: 4, q: '1013. soruda neden “anerjik cevap” olmaz?', cat: 'İmmünoloji', date: '2025-08-08' },
  { id: 5, q: '0 kan grubunda doğal antikorlar ve immün yanıt nasıldır?', cat: 'İmmünoloji', date: '2025-08-08' },
  { id: 6, q: 'Chediak–Higashi sendromunda trombosit sayısı ve fonksiyonu?', cat: 'İmmünoloji', date: '2025-08-08' },
  { id: 7, q: 'Mast hücrelerinin direkt uyarımı: kontrast maddeye bağlı anaflaktoid reaksiyon mekanizması?', cat: 'İmmünoloji', date: '2025-08-08' },
  { id: 8, q: 'AB0 uyumsuzluğu: antijen–antikor eşleşmesi ve klinik sonuçlar?', cat: 'İmmünoloji', date: '2025-08-06' },
  { id: 9, q: 'Gama-c zinciri (γc) defekti hangi immün yetmezliktedir ve kalıtımı nasıldır?', cat: 'İmmünoloji', date: '2025-07-25' },

  // Nöroloji
  { id: 20, q: 'ALS ile SMA arasındaki klinik farklılıklar nelerdir?', cat: 'Nöroloji', date: '2025-08-07' },
  { id: 21, q: 'ALS’de hem hiporefleksi hem hiperrefleksi birlikte olabilir mi?', cat: 'Nöroloji', date: '2025-08-07' },
  { id: 22, q: 'Dravet sendromu vaka örneği ve EEG bulguları nelerdir?', cat: 'Nöroloji', date: '2025-08-07' },
  { id: 23, q: 'Parsiyel nöbet sadece anterior temporal bölgede mi EEG bulgusu verir?', cat: 'Nöroloji', date: '2025-08-07' },
  { id: 24, q: 'West sendromu TUS tarzı vaka örneği ve hipsaritmi?', cat: 'Nöroloji', date: '2025-08-07' },
  { id: 25, q: 'Myasteniada DTR’ler azalır mı?', cat: 'Nöroloji', date: '2025-08-07' },
  { id: 26, q: 'Guillain–Barré’de neden DTR yoktur ve duyu kusuru nasıl seyreder?', cat: 'Nöroloji', date: '2025-08-04' },
  { id: 27, q: 'Konus medullaris sendromunda neden DTR artar?', cat: 'Nöroloji', date: '2025-08-05' },

  // Pediatri
  { id: 40, q: 'Mekonyum ileusunda direkt grafi nasıl görünür (gerçek radyoloji bulgusu)?', cat: 'Pediatri', date: '2025-08-07' },
  { id: 41, q: 'SMA’da dil fasikülasyonu görülür mü?', cat: 'Pediatri', date: '2025-08-04' },
  { id: 42, q: 'NF1’de Lisch nodülleri: retinal hamartom mudur?', cat: 'Pediatri', date: '2025-08-04' },
  { id: 43, q: 'Juvenil idiopatik artrit ile Still hastalığı aynı şey midir?', cat: 'Pediatri', date: '2025-07-28' },

  // Genel Cerrahi / Göğüs
  { id: 60, q: 'Enterotomi nasıl uygulanır ve neden “kontamine yara”dır?', cat: 'Genel Cerrahi', date: '2025-08-02' },
  { id: 61, q: 'Anastomoz ve ostomi arasındaki farklar nelerdir?', cat: 'Genel Cerrahi', date: '2025-08-01' },
  { id: 62, q: 'Abdominoperineal rezeksiyon ve Hartmann prosedürü nedir?', cat: 'Genel Cerrahi', date: '2025-08-01' },
  { id: 63, q: 'Distrübütif şok nedir? Vazodilatatuvar şok nedenleri?', cat: 'Genel Cerrahi', date: '2025-07-30' },
  { id: 64, q: 'Tansiyon pnömotoraks ile kapalı pnömotoraks farkı?', cat: 'Göğüs Hastalıkları', date: '2025-07-30' },
  { id: 65, q: 'Temiz-kontamine yara nedir?', cat: 'Genel Cerrahi', date: '2025-07-30' },

  // Kardiyoloji / Yoğun Bakım / Nefro
  { id: 80, q: 'Oksijen satürasyonu ile PaO₂ arasındaki fark nedir?', cat: 'Kardiyoloji/Yoğun Bakım', date: '2025-07-29' },
  { id: 81, q: 'Hiperkalemi ve β-agonist/epinefrin/süksinilkolin etkisi nasıl?', cat: 'Kardiyoloji/Yoğun Bakım', date: '2025-07-30' },
  { id: 82, q: 'Hipernatremi ve hiponatremide oligürinin mekanizması?', cat: 'Nefroloji', date: '2025-07-30' },

  // Endokrinoloji / Nefro
  { id: 100, q: 'Eksojen iyot/tiroid hormonu alımı ile tirotoksikoz: tanıda tiroglobulin nasıl kullanılır?', cat: 'Endokrinoloji', date: '2025-07-11' },
  { id: 101, q: 'Tiroid nodülünde TSH düzeyi ve sıcak/soğuk nodül malignite ilişkisi?', cat: 'Endokrinoloji', date: '2025-07-11' },
  { id: 102, q: 'Gordon sendromunda hiperkalsiüri beklenir mi? NCC/NCX/TRPV5 ilişkisi?', cat: 'Nefroloji', date: '2025-07-09' },

  // Hematoloji
  { id: 120, q: 'Poikilositoz nedir?', cat: 'Hematoloji', date: '2025-08-03' },
  { id: 121, q: 'Retikülosit düşüklüğü nedenleri?', cat: 'Hematoloji', date: '2025-08-03' },
  { id: 122, q: 'Auer çubuğu görüntüsü ve ayırıcı tanısı?', cat: 'Hematoloji', date: '2025-07-27' },
  { id: 123, q: 'Cabot halkası/Howell–Jolly cisimciği/bazofilik noktalanma nerede görülür?', cat: 'Hematoloji', date: '2025-07-26' },
  { id: 124, q: 'Normokromazi hangi laboratuvar parametresiyle değerlendirilir?', cat: 'Hematoloji', date: '2025-07-26' },

  // Onkoloji
  { id: 140, q: 'RCC paraneoplastik bulgular (hipoglisemi, HCC ile kıyas) nelerdir?', cat: 'Onkoloji', date: '2025-08-05' },
  { id: 141, q: 'İnflamatuar meme kanseri kesin tanısı nedir? Pozitif cerrahi sınır?', cat: 'Onkoloji', date: '2025-08-01' },
  { id: 142, q: 'Lynch sendromu vs FAP sıklığı ve Amsterdam kriterleri?', cat: 'Onkoloji', date: '2025-08-01' },
  { id: 143, q: 'Benign tiroid nodülü için lobektomi endikasyonları ve Hürthle hücreli Ca cerrahisi?', cat: 'Onkoloji', date: '2025-07-31' },

  // Nefroloji
  { id: 160, q: 'Subepitelyal “hörgüç” hangi glomerülopatide? Benzer lezyonlarla kıyasla.', cat: 'Nefroloji', date: '2025-08-03' },
  { id: 161, q: 'APSGN nefritik midir? Nefritik sendrom patogenezinde kapiller daralma rolü?', cat: 'Nefroloji', date: '2025-08-03' },

  // Enfeksiyon
  { id: 180, q: 'TB’de adrenal bez görüntüsü nasıldır?', cat: 'Enfeksiyon', date: '2025-07-11' },

  // Gastroenteroloji
  { id: 200, q: 'Alkol ve diyet peptik ülser patogenezinde rol oynar mı?', cat: 'Gastroenteroloji', date: '2025-07-07' },
  { id: 201, q: 'Aspirin mide kanseri riskini nasıl etkiler?', cat: 'Gastroenteroloji', date: '2025-07-07' },
  { id: 202, q: 'Alkalen reflü gastritin kesin tanısı nasıl konur?', cat: 'Gastroenteroloji', date: '2025-07-07' },

  // Psikiyatri
  { id: 220, q: 'REM uyku davranış bozukluğu ve uyku terörü farkları?', cat: 'Psikiyatri', date: '2025-08-05' },
  { id: 221, q: 'Şizoid/şizotipal/paranoid kişilik bozukluğu farkları?', cat: 'Psikiyatri', date: '2025-08-05' },

  // Radyoloji
  { id: 240, q: 'ARDS’de akciğer grafisi örnek bulgular?', cat: 'Radyoloji', date: '2025-08-03' },

  // Kadın-Doğum
  { id: 260, q: 'Yarık damak–dudakla birliktelik gösteren anomaliler ve sıklıkları?', cat: 'Kadın-Doğum', date: '2025-07-31' },

  // Fizyoloji
  { id: 280, q: '2,3-BPG oksijeni nasıl “serbestleştirir”?', cat: 'Fizyoloji', date: '2025-07-26' },
  { id: 281, q: 'Katekolaminler aldosteron salgısını nasıl etkiler?', cat: 'Fizyoloji', date: '2025-07-29' },
]

const CATS = ['Hepsi', ...Array.from(new Set(INITIAL_QUESTIONS.map(x => x.cat))).sort((a,b) => a.localeCompare(b,'tr'))]

function downloadJSON(data, filename = 'tus-soru-arsivi.json') {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; document.body.appendChild(a); a.click()
  a.remove(); URL.revokeObjectURL(url)
}

export default function App() {
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('Hepsi')
  const [items, setItems] = useState(INITIAL_QUESTIONS)
  const [showAdd, setShowAdd] = useState(false)
  const [newQ, setNewQ] = useState('')
  const [newCat, setNewCat] = useState(CATS[1] || 'İmmünoloji')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items
      .filter(x => cat === 'Hepsi' ? true : x.cat === cat)
      .filter(x => q ? x.q.toLowerCase().includes(q) : true)
      .sort((a,b) => b.date.localeCompare(a.date))
  }, [items, query, cat])

  function addItem() {
    if (!newQ.trim()) return
    const next = {
      id: Math.max(...items.map(i => i.id), 0) + 1,
      q: newQ.trim(),
      cat: newCat,
      date: new Date().toISOString().slice(0,10),
    }
    setItems([next, ...items])
    setShowAdd(false); setNewQ('')
  }

  return (
    <div>
      <div className="header">
        <div className="container hstack">
          <div className="title">TUS Soru Arşivi</div>
          <div className="badge">Serhat</div>
          <div className="spacer" />
          <button onClick={() => downloadJSON(items)}>Dışa Aktar (JSON)</button>
          <button className="primary" onClick={() => setShowAdd(true)}>Soru Ekle</button>
        </div>
      </div>

      <div className="container" style={{paddingTop: 16}}>
        <div className="toolbar">
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Arama (örn. nefritik, Lynch, hiperkalemi)" />
          <select value={cat} onChange={e => setCat(e.target.value)}>
            {CATS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="grid">
          {filtered.map(item => (
            <div key={item.id} className="card">
              <div className="cat">{item.cat}</div>
              <div className="q">{item.q}</div>
              <div className="row">
                <span>{new Date(item.date).toLocaleDateString('tr-TR')}</span>
                <div className="hstack">
                  <button onClick={() => navigator.clipboard.writeText(item.q)}>Kopyala</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && <div className="empty">Kayıt bulunamadı. Filtreleri temizle.</div>}

        <div className="footer">
          Bu site, Serhat'ın ChatGPT konuşmalarındaki TUS odaklı sorulardan derlenen bir arşivdir. Eğitim amaçlıdır.
        </div>
      </div>

      {showAdd && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target.classList.contains('modal-backdrop')) setShowAdd(false) }}>
          <div className="modal">
            <h3>Yeni Soru Ekle</h3>
            <div style={{display:'grid', gap:8, marginTop:8}}>
              <label>Soru</label>
              <input value={newQ} onChange={e => setNewQ(e.target.value)} placeholder="Soru metni" />
              <label>Kategori</label>
              <select value={newCat} onChange={e => setNewCat(e.target.value)}>
                {CATS.filter(c => c!=='Hepsi').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="actions" style={{marginTop:12}}>
              <button onClick={() => setShowAdd(false)}>İptal</button>
              <button className="primary" onClick={addItem}>Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
