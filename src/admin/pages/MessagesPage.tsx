import { useEffect, useState } from 'react';
import api from '../../services/api';
import { PageHeader, Btn, Spinner, EmptyState } from '../components/Shared';
import './MessagesPage.css';

type Message = { _id:string; firstName:string; lastName:string; email:string; interest:string; message:string; status:string; notificationStatus:string; createdAt:string };
export default function MessagesPage() {
  const [messages,setMessages] = useState<Message[]>([]);
  const [status,setStatus] = useState('all');
  const [page,setPage] = useState(1);
  const [total,setTotal] = useState(0);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  const [configured,setConfigured] = useState(false);
  const [selected,setSelected] = useState<Message|null>(null);
  const [working,setWorking] = useState(false);
  const [reload,setReload] = useState(0);
  useEffect(()=>{
    let active=true; setLoading(true); setError('');
    api.get('/contact',{params:{status,page}}).then(({data})=>{
      if(active){setMessages(data.messages);setTotal(data.total);setConfigured(data.emailConfigured);}
    }).catch((err)=>{if(active)setError(err.response?.data?.message||'Could not load messages. Please try again.');})
      .finally(()=>{if(active)setLoading(false);});
    return ()=>{active=false;};
  },[status,page,reload]);
  async function update(nextStatus:string) {
    if(!selected || working)return;
    setWorking(true);setError('');
    try {const {data}=await api.patch(`/contact/${selected._id}`,{status:nextStatus});setSelected(data);setReload(n=>n+1);}
    catch(err:any){setError(err.response?.data?.message||'Could not save the message status.');}
    finally{setWorking(false);}
  }
  async function notify() {
    if(!selected || working)return;
    setWorking(true);setError('');
    try{const {data}=await api.post(`/contact/${selected._id}/notify`);setSelected(data);setReload(n=>n+1);if(data.notificationStatus==='failed')setError('Email delivery failed. Check your SMTP settings. The message is saved here.');}
    catch(err:any){setError(err.response?.data?.message||'Could not send the notification.');}
    finally{setWorking(false);}
  }
  const reply = selected ? `mailto:${encodeURIComponent(selected.email)}?subject=${encodeURIComponent('Re: '+selected.interest)}` : '';
  return <div>
    <PageHeader title="Messages" subtitle="Enquiries submitted through the homepage contact form." action={<Btn onClick={()=>setReload(n=>n+1)} disabled={loading||working}>Refresh</Btn>}/>
    {!loading&&!configured&&<p className="messages-note">Messages are saved here. Configure backend SMTP settings to enable email notifications.</p>}
    {error&&<p role="alert" className="messages-note">{error}</p>}
    <div className="messages-toolbar"><label>Status <select className="admin-input" value={status} disabled={working} onChange={e=>{setStatus(e.target.value);setPage(1);setSelected(null);}}>{['all','new','read','resolved'].map(s=><option key={s} value={s}>{s}</option>)}</select></label></div>
    <div className="messages-grid">
      <div>{loading?<Spinner/>:error&&messages.length===0?<p>Use Refresh to try again.</p>:messages.length===0?<EmptyState icon="✉" title="No messages" body="New contact enquiries will appear here."/>:
        <div className="messages-list">{messages.map(m=><button key={m._id} disabled={working} className={`message-item ${selected?._id===m._id?'selected':''}`} onClick={()=>setSelected(m)}>
          <strong>{m.firstName} {m.lastName}</strong><span>{m.interest}</span><small>{new Date(m.createdAt).toLocaleString()} · {m.status}</small>
        </button>)}</div>}
        <div className="messages-pagination"><Btn small disabled={page===1||loading||working} onClick={()=>{setPage(p=>p-1);setSelected(null);}}>Previous</Btn><span>Page {page} · {total} messages</span><Btn small disabled={page*25>=total||loading||working} onClick={()=>{setPage(p=>p+1);setSelected(null);}}>Next</Btn></div>
      </div>
      {selected&&<article className="message-detail"><h2>{selected.firstName} {selected.lastName}</h2><p>{selected.email}</p><p>{selected.interest} · {new Date(selected.createdAt).toLocaleString()}</p><p className="message-body">{selected.message}</p>
        <p>Status: {selected.status}</p><p>Email notification: {selected.notificationStatus==='sent'?'Accepted by mail server':selected.notificationStatus}</p>
        <div className="message-actions"><a className="message-reply" href={reply}>Reply by email</a><Btn small disabled={working||selected.status==='read'} onClick={()=>update('read')}>Mark read</Btn><Btn small disabled={working||selected.status==='resolved'} onClick={()=>update('resolved')}>Resolve</Btn><Btn small variant="secondary" disabled={working||selected.status==='new'} onClick={()=>update('new')}>Mark new</Btn>
        {configured&&selected.notificationStatus!=='sent'&&<Btn small disabled={working} onClick={notify}>{working?'Working…':'Retry email notification'}</Btn>}</div>
      </article>}
    </div>
  </div>;
}
