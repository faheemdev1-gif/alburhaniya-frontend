// Browser -> real Express routes, with isolated database and SMTP (no live mail sent).
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const jwt=require('../server/node_modules/jsonwebtoken');
const nodemailer=require('../server/node_modules/nodemailer');
const {newsletterFixture}=require('../server/tests/helpers/newsletterFixture.cjs');
process.env.JWT_SECRET='newsletter-isolated-browser';
Object.assign(process.env,{SMTP_HOST:'smtp.example.test',SMTP_PORT:'465',SMTP_USER:'owner@example.test',SMTP_PASS:'test-only',CONTACT_FROM_EMAIL:'owner@example.test'});
const app=require('../server/dist/app').default;
const Model=require('../server/dist/models/NewsletterSubscriber').default;
const fixture=newsletterFixture(Model,nodemailer);
let role='admin';
const last=()=>[...fixture.rows.values()].at(-1);
function token(mail,action){return new RegExp(`/${action}#token=([a-f0-9.]+)`).exec(mail.text)[1];}
async function main(){
  const backend=app.listen(0,'127.0.0.1');await new Promise(r=>backend.once('listening',r));const base=`http://127.0.0.1:${backend.address().port}`;
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
      const req=route.request(),url=new URL(req.url());if(url.origin===origin)return route.continue();
      if(url.pathname.startsWith('/api/newsletter'))return route.fulfill({response:await route.fetch({url:base+url.pathname+url.search})});
      if(!url.pathname.startsWith('/api/'))return route.abort();
      const data=url.pathname==='/api/auth/me'?{id:'admin',name:'Admin',role,email:'admin@example.test'}:
        url.pathname==='/api/articles'?{articles:[],total:0}:url.pathname==='/api/events'?{events:[],total:0}:url.pathname==='/api/gallery'?{items:[],total:0}:url.pathname==='/api/articles/featured'?null:{};
      return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
    });
    await page.goto(origin);const form=page.getByRole('form',{name:'Newsletter sign-up'});const email=page.getByRole('textbox',{name:'Newsletter email address'});
    await email.fill('jane@example.test');fixture.state.failStore=true;await form.getByRole('button',{name:'Subscribe',exact:true}).click();
    await form.getByRole('alert').waitFor();assert.equal(await email.inputValue(),'jane@example.test');assert.equal(fixture.rows.size,0);
    fixture.state.failStore=false;delete process.env.SMTP_PASS;await form.getByRole('button',{name:'Subscribe',exact:true}).click();
    await form.getByRole('status').filter({hasText:'confirmation is currently unavailable'}).waitFor();assert.equal(last().status,'pending');assert.equal(await email.inputValue(),'jane@example.test');assert.equal(fixture.mail.length,0);
    console.log('Storage failure preserves the email; missing SMTP saves pending consent and shows an honest message.');
    process.env.SMTP_PASS='test-only';let release;fixture.state.holdMail=new Promise(r=>{release=r;});
    await form.getByRole('button',{name:'Subscribe',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#newsletter-email').matches(':disabled'));
    assert(await form.getByRole('button',{name:'Subscribing…'}).isDisabled());
    while(!fixture.mail.length)await new Promise(r=>setTimeout(r,5));fixture.state.holdMail=null;release();
    await form.getByRole('status').filter({hasText:'check your inbox'}).waitFor();assert.equal(await email.inputValue(),'');assert.equal(fixture.rows.size,1);assert.equal(fixture.mail.length,1);assert.equal(last().status,'pending');
    await page.setViewportSize({width:390,height:844});await form.scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.screenshot({path:path.resolve(__dirname,'../../../newsletter-form-mobile.png')});
    console.log('Actual API success clears the form after mail acceptance; busy state blocks duplicate submissions; mobile layout fits.');
    const mail=fixture.mail[0],confirmToken=token(mail,'confirm'),unsubscribeToken=token(mail,'unsubscribe');
    await page.goto(origin+'/newsletter/confirm#token='+confirmToken);await page.getByRole('button',{name:'Confirm subscription',exact:true}).waitFor();assert.equal(last().status,'pending');
    await page.getByRole('button',{name:'Confirm subscription',exact:true}).click();await page.getByRole('status').filter({hasText:'subscription is confirmed'}).waitFor();assert.equal(last().status,'confirmed');assert.equal(new URL(page.url()).hash,'');
    console.log('Opening a link alone does not confirm; the confirmation button records consent.');
    await page.evaluate(t=>localStorage.setItem('communitas_token',t),jwt.sign({id:'admin',role:'admin'},process.env.JWT_SECRET));
    await page.goto(origin+'/admin/subscribers');await page.getByRole('heading',{name:'Subscribers',exact:true}).waitFor();await page.getByRole('cell',{name:'confirmed',exact:true}).waitFor();
    const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Export confirmed CSV'}).click();const download=await downloadPromise;const csv=fs.readFileSync(await download.path(),'utf8');assert(csv.includes('jane@example.test'));assert(csv.includes('/unsubscribe#token='));
    await page.getByRole('textbox',{name:'Search subscriber emails'}).fill('not-here');await page.getByRole('button',{name:'Search',exact:true}).click();await page.getByRole('heading',{name:'No subscribers found'}).waitFor();
    await page.getByRole('textbox',{name:'Search subscriber emails'}).fill('');await page.getByRole('button',{name:'Search',exact:true}).click();await page.getByRole('cell',{name:'confirmed',exact:true}).waitFor();
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.setViewportSize({width:1280,height:1000});await page.screenshot({path:path.resolve(__dirname,'../../../newsletter-admin.png')});
    console.log('Admin sees confirmed consent, searches subscribers and downloads the confirmed CSV.');
    await page.goto(origin+'/newsletter/unsubscribe#token='+unsubscribeToken);assert.equal(last().status,'confirmed');await page.getByRole('button',{name:'Unsubscribe',exact:true}).click();await page.getByRole('status').filter({hasText:'have been unsubscribed'}).waitFor();assert.equal(last().status,'unsubscribed');
    await page.goto(origin+'/admin/subscribers');await page.getByRole('cell',{name:'unsubscribed',exact:true}).waitFor();const emptyDownload=page.waitForEvent('download');await page.getByRole('button',{name:'Export confirmed CSV'}).click();assert(!fs.readFileSync(await(await emptyDownload).path(),'utf8').includes('jane@example.test'));
    console.log('Unsubscribe removes the address from the admin export.');
    await page.goto(origin);await page.getByRole('textbox',{name:'Newsletter email address'}).fill('retry@example.test');fixture.state.failMail=true;await page.getByRole('form',{name:'Newsletter sign-up'}).getByRole('button',{name:'Subscribe',exact:true}).click();await page.getByRole('alert').filter({hasText:'confirmation email could not be sent'}).waitFor();assert.equal(await page.getByRole('textbox',{name:'Newsletter email address'}).inputValue(),'retry@example.test');assert.equal(last().notificationStatus,'failed');
    fixture.state.failMail=false;last().notificationAttemptedAt=new Date(0);await page.goto(origin+'/admin/subscribers');await page.getByRole('button',{name:'Resend confirmation',exact:true}).click();await page.getByRole('status').filter({hasText:'check your inbox'}).waitFor();await page.getByRole('cell',{name:/retry@example.test.*accepted by mail server/}).waitFor();
    await page.getByRole('row').filter({hasText:'retry@example.test'}).getByRole('button',{name:'Unsubscribe',exact:true}).click();await page.locator('.modal-box').getByRole('button',{name:'Unsubscribe',exact:true}).click();await page.getByRole('status').filter({hasText:'removed from the mailing list'}).waitFor();assert.equal(last().status,'unsubscribed');
    console.log('SMTP failures preserve pending sign-ups; admin resend and unsubscribe work.');
    await page.goto(origin+'/newsletter/confirm#token='+'0'.repeat(64));await page.getByRole('button',{name:'Confirm subscription',exact:true}).click();await page.getByRole('alert').filter({hasText:'invalid or expired'}).waitFor();
    role='user';await page.evaluate(t=>localStorage.setItem('communitas_token',t),jwt.sign({id:'staff',role:'user'},process.env.JWT_SECRET));await page.goto(origin+'/admin/subscribers');await page.waitForURL(origin+'/admin');assert.equal(await page.getByRole('link',{name:'Subscribers',exact:true}).count(),0);
    console.log('Invalid tokens show actionable errors; non-admin staff cannot access subscriber management.');
  }finally{fixture.restore();if(browser)await browser.close();for(const s of [frontend,backend]){s.closeAllConnections();await new Promise(r=>s.close(r));}}
}
main().catch(err=>{console.error(err);process.exitCode=1;});
