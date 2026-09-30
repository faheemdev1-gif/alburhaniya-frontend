import { useEffect, useState } from 'react';
import api from '../../services/api';
import { defaults, mergeContent, imageUrl, type SiteContent } from '../../content';
import { PageHeader, Btn, Spinner } from '../components/Shared';
import './SiteContentPage.css';
import { uploadImage as storeImage, imageError } from '../../services/mediaService';

const labels: Record<string,string> = { hero:'Homepage slider',stats:'Statistics strip',about:'About us',activities:'Activities & programmes',events:'Events section',articles:'Articles section',gallery:'Gallery section',join:'Membership banner',donate:'Donation section',testimonials:'Testimonials',contact:'Contact & social links',newsletter:'Newsletter banner',innerPages:'Article, event & gallery pages',navigation:'Navigation labels',branding:'Logo & footer' };
const human = (s:string) => s.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase());
const isImage = (key:string) => /^(bg|img|image(Main|Top|Bottom)?|logo(Invert)?)$/.test(key);
type Item = string | boolean | Item[] | {[key:string]:Item};
export default function SiteContentPage() {
  const [data,setData] = useState<SiteContent>(defaults);
  const [section,setSection] = useState<keyof SiteContent>('hero');
  const [busy,setBusy] = useState(true);
  const [loadError,setLoadError] = useState(false);
  const [saving,setSaving] = useState(false);
  const [message,setMessage] = useState('');
  const [dirty,setDirty] = useState(false);
  useEffect(()=>{api.get('/site-content').then(r=>setData(mergeContent(r.data))).catch(()=>{setLoadError(true);setMessage('Could not load saved content. Check the backend before saving.');}).finally(()=>setBusy(false));},[]);
  useEffect(()=>{const before=(e:BeforeUnloadEvent)=>{if(dirty){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',before);return()=>window.removeEventListener('beforeunload',before);},[dirty]);
  function update(path:(string|number)[],value:Item) {
    setData(previous=>{
      const copy=structuredClone(previous);
      let target: any=copy;
      for(const part of path.slice(0,-1)) target=target[part];
      target[path[path.length-1]]=value;
      return copy;
    });
    setDirty(true);setMessage('');
  }
  async function uploadImage(file:File,path:(string|number)[]) {
    setSaving(true);setMessage('Uploading image…');
    try {const r=await storeImage(file);update(path,r.url);setMessage('Image uploaded. Save changes to publish it.');}
    catch(err:any){setMessage(imageError(err));}
    finally{setSaving(false);}
  }
  function field(value:Item,path:(string|number)[],key:string):React.ReactNode {
    if(Array.isArray(value)) return <div className="content-array" key={key}>
      <h3>{human(key)}</h3>
      {value.map((item,i)=><div className="content-item" key={i}>
        <div className="content-item-bar"><strong>{human(key)} {i+1}</strong><div>
          <button type="button" disabled={i===0} onClick={()=>{const next=[...value];[next[i-1],next[i]]=[next[i],next[i-1]];update(path,next);}}>↑</button>
          <button type="button" disabled={i===value.length-1} onClick={()=>{const next=[...value];[next[i+1],next[i]]=[next[i],next[i+1]];update(path,next);}}>↓</button>
          <button type="button" onClick={()=>update(path,value.filter((_,n)=>n!==i))}>Remove</button>
        </div></div>{field(item,[...path,i],String(i+1))}</div>)}
      <Btn onClick={()=>update(path,[...value,structuredClone(value[0] || (defaults as any)[section][key]?.[0] || {})])}>+ Add {human(key).replace(/s$/,'')}</Btn>
    </div>;
    if(value && typeof value==='object') return <div key={key} className="content-fields">{Object.entries(value).map(([k,v])=>field(v,[...path,k],k))}</div>;
    if(typeof value==='boolean') return <label className="content-field"><span>{human(key)}</span><input type="checkbox" checked={value} onChange={e=>update(path,e.target.checked)}/></label>;
    return <label className="content-field" key={key}><span>{human(key)}</span>
      {key==='title'||key==='heading' ? <small>Use &lt;em&gt; for accent text and &lt;br/&gt; for a new line.</small>:null}
      {value.length>100 || /paragraph|description|body|quote|sub|text/i.test(key)
        ? <textarea className="admin-textarea" rows={4} value={value} onChange={e=>update(path,e.target.value)}/>
        : <input className="admin-input" value={value} onChange={e=>update(path,e.target.value)}/>}
      {isImage(key)&&<div className="content-image">{value&&<img src={imageUrl(value)} alt="Preview"/>}<input type="file" accept="image/jpeg,image/png,image/gif,image/webp" disabled={saving} onChange={e=>{const f=e.target.files?.[0];if(f)uploadImage(f,path);e.target.value='';}}/></div>}
    </label>;
  }
  async function save(){setSaving(true);setMessage('');try{await api.put('/site-content',data);setDirty(false);setMessage('Published. Refresh the website to see your changes.');}catch(err:any){setMessage(err.response?.data?.message||'Save failed. Your edits are still here.');}finally{setSaving(false);}}
  if(busy)return <Spinner/>;
  return <div><PageHeader title="Website Content" subtitle="Edit the slider, homepage sections, images, contact details, and footer." action={<Btn onClick={save} disabled={saving||!dirty||loadError}>{saving?'Working…':'Publish changes'}</Btn>}/>
    {message&&<p role="status" className="content-message">{message}</p>}
    <div className="content-editor"><nav aria-label="Content sections" className="content-tabs">{(Object.keys(labels) as (keyof SiteContent)[]).map(k=><button key={k} type="button" className={section===k?'selected':''} onClick={()=>setSection(k)}>{labels[k]}</button>)}</nav>
    <div className="content-panel"><h2>{labels[section]}</h2>{field(data[section] as Item,[section],section)}<div className="content-bottom"><Btn onClick={save} disabled={saving||!dirty||loadError}>{saving?'Working…':'Publish changes'}</Btn></div></div></div>
  </div>;
}
