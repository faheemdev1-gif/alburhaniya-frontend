// Browser -> real local Express routes; MongoDB and outbound SMTP are isolated.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const jwt=require('../server/node_modules/jsonwebtoken');
const nodemailer=require('../server/node_modules/nodemailer');
process.env.JWT_SECRET='contact-browser-isolated';
Object.assign(process.env,{SMTP_HOST:'smtp.example.test',SMTP_PORT:'465',SMTP_USER:'owner@example.test',SMTP_PASS:'test-only',CONTACT_FROM_EMAIL:'owner@example.test',CONTACT_TO_EMAIL:'owner@example.test'});
const app=require('../server/dist/app').default;
const Model=require('../server/dist/models/ContactMessage').default;
const rows=new Map(),requests=[],mail=[];
let failSave=true,failEmail=true,role='admin',releaseMail;
function wrap(row){const q={select:()=>q,then:(resolve,reject)=>Promise.resolve(row).then(resolve,reject)};return q;}
Model.create=async data=>{
  if(failSave)throw Error('isolated storage failure');
  if([...rows.values()].some(r=>r.submissionId===data.submissionId))throw {code:11000};
  const id=String(rows.size+1).padStart(24,'0');const row={...data,_id:id,id,status:'new',notificationStatus:'pending',createdAt:new Date(),get(k){return this[k];}};rows.set(id,row);return row;
};
Model.findOne=async query=>[...rows.values()].find(r=>r.submissionId===query.submissionId);
Model.findById=id=>wrap(rows.get(id));
Model.findOneAndUpdate=async(query,update)=>{const row=rows.get(query._id);if(!row||!['pending','failed','disabled'].includes(row.notificationStatus))return null;Object.assign(row,update.$set);return row;};
Model.updateOne=async(query,update)=>{Object.assign(rows.get(query._id),update.$set);};
Model.findByIdAndUpdate=(id,update)=>{const row=rows.get(id);if(row)Object.assign(row,update.$set);return wrap(row);};
Model.find=filter=>{let start=0,count=25;const q={sort:()=>q,skip:n=>{start=n;return q;},limit:n=>{count=n;return q;},select:()=>q,lean:async()=>[...rows.values()].filter(r=>!filter.status||r.status===filter.status).slice(start,start+count)};return q;};
Model.countDocuments=async filter=>[...rows.values()].filter(r=>!filter.status||r.status===filter.status).length;
nodemailer.createTransport=()=>({close(){},async sendMail(data){mail.push(data);if(releaseMail)await new Promise(resolve=>{releaseMail=resolve;});if(failEmail)throw Error('isolated email failure');return {accepted:['owner@example.test']};}});

async function main(){
  const backend=app.listen(0,'127.0.0.1');await new Promise(r=>backend.once('listening',r));
  const base=`http://127.0.0.1:${backend.address().port}`;
  const dist=path.resolve(__dirname,'../dist');
  const frontend=http.createServer((req,res)=>{
    let name=path.join(dist,new URL(req.url,'http://localhost').pathname);
    if(!name.startsWith(dist)||!fs.existsSync(name)||!fs.statSync(name).isFile())name=path.join(dist,'index.html');
    res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.JPG':'image/jpeg','.svg':'image/svg+xml'})[path.extname(name)]||'application/octet-stream');res.end(fs.readFileSync(name));
  });
  await new Promise(r=>frontend.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${frontend.address().port}`;
  let browser;
  try{
    browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage'],...(process.env.CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.CHROMIUM_EXECUTABLE_PATH}:{})});
    const page=await browser.newPage({viewport:{width:1280,height:1000}});
    await page.route('**/*',async route=>{
      const req=route.request(),url=new URL(req.url());
      if(url.origin===origin)return route.continue();
      if(url.pathname.startsWith('/api/contact')){
        if(req.method()==='POST'&&url.pathname==='/api/contact')requests.push(req.postDataJSON());
        return route.fulfill({response:await route.fetch({url:base+url.pathname+url.search})});
      }
      if(!url.pathname.startsWith('/api/'))return route.abort();
      const data=url.pathname==='/api/auth/me'?{id:'admin',name:'Admin',role,email:'admin@example.test'}:
        url.pathname==='/api/articles'?{articles:[],total:0}:url.pathname==='/api/events'?{events:[],total:0}:url.pathname==='/api/gallery'?{items:[],total:0}:url.pathname==='/api/articles/featured'?null:{};
      return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
    });
    await page.goto(origin+'/#contact');
    await page.locator('#cf-first').fill('Jane');await page.locator('#cf-last').fill('Smith');await page.locator('#cf-email').fill('jane@example.test');await page.locator('#cf-interest').selectOption('Volunteering');
    const message='<img src=x onerror="window.contactXss=true">\nI would like to volunteer.';
    await page.locator('#cf-msg').fill(message);
    await page.getByRole('button',{name:'Send Message'}).click();
    await page.getByRole('alert').filter({hasText:'could not be saved'}).waitFor();
    assert.equal(await page.locator('#cf-first').inputValue(),'Jane');assert.equal(await page.locator('#cf-msg').inputValue(),message);assert.equal(rows.size,0);
    console.log('Failed submission retains fields and displays the backend error.');
    failSave=false;releaseMail=true;
    await page.getByRole('button',{name:'Send Message'}).click();
    await page.waitForFunction(()=>document.querySelector('#cf-first').matches(':disabled'));
    assert.equal(await page.getByRole('button',{name:'Sending…'}).isDisabled(),true);
    await page.waitForFunction(()=>document.querySelector('.contact-form').getAttribute('aria-busy')==='true');
    for(let i=0;i<100&&typeof releaseMail!=='function';i++)await new Promise(r=>setTimeout(r,10));
    assert.equal(typeof releaseMail,'function');const release=releaseMail;releaseMail=null;release();
    await page.getByRole('status').filter({hasText:'Your message has been received'}).waitFor();
    assert.equal(await page.locator('#cf-first').inputValue(),'');assert.equal(rows.size,1);assert.equal(requests.length,2);assert.equal(requests[0].submissionId,requests[1].submissionId);
    assert.equal([...rows.values()][0].notificationStatus,'failed');
    console.log('Success follows actual backend persistence, resets fields and prevents simultaneous sends.');
    const token=jwt.sign({id:'admin',role:'admin'},process.env.JWT_SECRET);await page.evaluate(t=>localStorage.setItem('communitas_token',t),token);
    await page.goto(origin+'/admin/messages');await page.getByRole('heading',{name:'Messages',exact:true}).waitFor();
    await page.getByRole('button',{name:/Jane Smith/}).click();
    assert.equal(await page.locator('.message-body').textContent(),message);assert.equal(await page.evaluate(()=>window.contactXss),undefined);
    assert((await page.getByRole('link',{name:'Reply by email'}).getAttribute('href')).startsWith('mailto:jane%40example.test'));
    await page.getByRole('button',{name:'Mark read',exact:true}).click();await page.getByText('Status: read',{exact:true}).waitFor();
    await page.getByRole('button',{name:'Resolve',exact:true}).click();await page.getByText('Status: resolved',{exact:true}).waitFor();
    failEmail=false;await page.getByRole('button',{name:'Retry email notification'}).click();await page.getByText('Email notification: Accepted by mail server',{exact:true}).waitFor();
    assert.equal(rows.size,1);assert.equal(mail.length,2);assert.equal(mail.at(-1).replyTo,'jane@example.test');
    console.log('Admin inbox safely renders message text, changes status, opens reply and retries a failed notification.');
    await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    role='user';const staff=jwt.sign({id:'staff',role:'user'},process.env.JWT_SECRET);await page.evaluate(t=>localStorage.setItem('communitas_token',t),staff);await page.goto(origin+'/admin/messages');await page.waitForURL(origin+'/admin');assert.equal(await page.getByRole('link',{name:'Messages',exact:true}).count(),0);
    console.log('Mobile layout fits the screen; non-admin staff cannot access the inbox.');
  }finally{if(browser)await browser.close();for(const s of [frontend,backend]){s.closeAllConnections();await new Promise(r=>s.close(r));}}
}
main().catch(err=>{console.error(err);process.exitCode=1;});
