// Actual browser -> local Express checkout routes. Stripe is isolated; no payments are made.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {randomUUID}=require('node:crypto');
const {chromium}=require('playwright');
const originalFetch=global.fetch;
const app=require('../server/dist/app').default;
const {DONATION_CONTRACT}=require('../server/dist/services/stripeCheckout');
const sessions=new Map(),requests=[],stripeCalls=[];
let releaseStripe=null,waitStripe=null,failStripe=false;
delete process.env.STRIPE_SECRET_KEY;
delete process.env.DONATION_SITE_URL;
global.fetch=async(url,options={})=>{
  if(!String(url).startsWith('https://api.stripe.com/'))return originalFetch(url,options);
  stripeCalls.push({url,options});if(waitStripe)await waitStripe;
  if(failStripe)return new Response(JSON.stringify({error:{message:'private-stripe-key'}}),{status:500});
  if(options.method==='GET'){const id=String(url).split('/').at(-1);return new Response(JSON.stringify(sessions.get(id)||{error:{}}),{status:sessions.has(id)?200:404});}
  const body=new URLSearchParams(options.body),amount=Number(body.get('line_items[0][price_data][unit_amount]'));
  const id='cs_test_'+randomUUID().replaceAll('-',''),session={id,url:'https://checkout.stripe.com/c/pay/'+id,amount_total:amount,currency:'gbp',mode:'payment',status:'open',payment_status:'unpaid',metadata:{donation_contract:DONATION_CONTRACT,amount_pence:String(amount)}};
  sessions.set(id,session);return new Response(JSON.stringify(session),{status:200});
};
async function main(){
 const backend=app.listen(0,'127.0.0.1');await new Promise(r=>backend.once('listening',r));const base=`http://127.0.0.1:${backend.address().port}`;
 const dist=path.resolve(__dirname,'../dist');
 const frontend=http.createServer((req,res)=>{
  let name=path.join(dist,new URL(req.url,'http://localhost').pathname);if(!name.startsWith(dist)||!fs.existsSync(name)||!fs.statSync(name).isFile())name=path.join(dist,'index.html');
  res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.JPG':'image/jpeg','.svg':'image/svg+xml'})[path.extname(name)]||'application/octet-stream');res.end(fs.readFileSync(name));
 });
 await new Promise(r=>frontend.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${frontend.address().port}`;
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage'],...(process.env.CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.CHROMIUM_EXECUTABLE_PATH}:{})});
  const page=await browser.newPage({viewport:{width:1440,height:1080}});
  await page.route('**/*',async route=>{
   const req=route.request(),url=new URL(req.url());if(url.origin===origin)return route.continue();
   if(url.hostname==='checkout.stripe.com'){
    const session=sessions.get(url.pathname.split('/').at(-1));return route.fulfill({contentType:'text/html',body:`<h1>Isolated Stripe checkout</h1><p>GBP ${(session.amount_total/100).toFixed(2)}</p>`});
   }
   if(url.pathname.startsWith('/api/donations')){
    if(req.method()==='POST')requests.push(req.postDataJSON());return route.fulfill({response:await route.fetch({url:base+url.pathname+url.search})});
   }
   if(!url.pathname.startsWith('/api/'))return route.abort();
   const data=url.pathname==='/api/articles'?{articles:[],total:0}:url.pathname==='/api/events'?{events:[],total:0}:url.pathname==='/api/gallery'?{items:[],total:0}:url.pathname==='/api/articles/featured'?null:{};
   return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
  });
  await page.goto(origin+'/#donate');const form=page.locator('#donate').getByRole('form',{name:'Choose your donation'});
  const total=form.getByRole('status');assert.match(await total.textContent(),/£10\.00/);
  for(const amount of ['10','25','50','100','250','500']){
   await form.getByRole('button',{name:`£${amount}.00`,exact:true}).click();assert.match(await total.textContent(),new RegExp(`£${amount}\\.00`));assert.equal(await form.getByRole('button',{name:`£${amount}.00`,exact:true}).getAttribute('aria-pressed'),'true');assert(await form.getByRole('button',{name:`Donate £${amount}.00`,exact:true}).isEnabled());
  }
  const custom=form.getByRole('textbox',{name:'Custom donation amount in pounds'});await custom.fill('73.17');assert.match(await total.textContent(),/£73\.17/);assert.equal(await form.locator('button[aria-pressed=true]').count(),0);
  for(const value of ['0','-10','1e3','10.999','10000.01']){await custom.fill(value);assert(await form.getByRole('button',{name:'Donate',exact:true}).isDisabled());assert.match(await total.textContent(),/valid amount/);}
  assert.equal(requests.length,0);await custom.fill('73.17');
  console.log('All six presets and custom pence update the live total and button; invalid amounts cannot start checkout.');
  await page.locator('.floating-donate-button').click();const modal=page.getByRole('dialog',{name:'Make a donation'});await modal.waitFor();assert.match(await modal.getByRole('status').textContent(),/£73\.17/);
  await modal.getByRole('button',{name:'£250.00',exact:true}).click();assert.match(await total.textContent(),/£250\.00/);await page.keyboard.press('Shift+Tab');
  await modal.getByRole('button',{name:'Close donation window'}).focus();await page.keyboard.press('Shift+Tab');assert.equal(await modal.getByRole('button',{name:'Donate £250.00'}).evaluate(el=>el===document.activeElement),true);await page.keyboard.press('Tab');assert.equal(await modal.getByRole('button',{name:'Close donation window'}).evaluate(el=>el===document.activeElement),true);
  await page.keyboard.press('Escape');assert.equal(await modal.count(),0);assert(await page.locator('.floating-donate-button').evaluate(el=>el===document.activeElement));
  console.log('Homepage and floating modal share the amount; keyboard focus stays in the modal and restores on close.');
  await page.locator('#donate').screenshot({path:path.resolve(__dirname,'../../../donation-widget-desktop.png')});
  await page.setViewportSize({width:390,height:844});await form.scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await form.screenshot({path:path.resolve(__dirname,'../../../donation-widget-mobile.png')});
  await custom.fill('73.17');await form.getByRole('button',{name:'Donate £73.17'}).click();await form.getByRole('alert').filter({hasText:'not configured'}).waitFor();assert.equal(await custom.inputValue(),'73.17');assert.equal(requests.length,1);assert.equal(stripeCalls.length,0);
  process.env.STRIPE_SECRET_KEY='sk_test_browserIsolated123';waitStripe=new Promise(r=>{releaseStripe=r;});
  await form.getByRole('button',{name:'Donate £73.17'}).click();await form.getByRole('button',{name:'Opening secure checkout…'}).waitFor();assert(await custom.isDisabled());assert(await form.getByRole('button',{name:'Opening secure checkout…'}).isDisabled());
  for(let i=0;i<100&&!stripeCalls.length;i++)await new Promise(r=>setTimeout(r,10));assert.equal(stripeCalls.length,1);waitStripe=null;releaseStripe();
  await page.waitForURL('https://checkout.stripe.com/**');assert.equal(requests.length,2);assert.equal(requests[0].requestId,requests[1].requestId);assert.equal(requests[1].amountPence,7317);assert.equal(new URLSearchParams(stripeCalls[0].options.body).get('line_items[0][price_data][unit_amount]'),'7317');assert.match(await page.locator('body').textContent(),/GBP 73\.17/);
  console.log('Configuration failure retains selection; retry is idempotent, busy controls block repeat clicks, and checkout receives exactly £73.17.');
  const session=[...sessions.values()].at(-1);
  await page.goBack();await page.locator('#donate').getByRole('button',{name:'Donate £73.17'}).waitFor();assert(await page.locator('#donate').getByRole('button',{name:'Donate £73.17'}).isEnabled());
  await page.goto(origin+'/donation/return?cancelled=1');await page.getByRole('heading',{name:'Checkout cancelled'}).waitFor();assert.equal(await page.getByText(/Stripe has confirmed/).count(),0);
  await page.getByRole('link',{name:'Back to donation form'}).click();assert.match(await page.locator('#donate').getByRole('status').textContent(),/£73\.17/);
  await page.goto(origin+'/donation/return?session_id='+session.id);await page.getByRole('status').filter({hasText:'not confirmed yet'}).waitFor();assert.equal(await page.getByRole('heading',{name:'Thank you for your support'}).count(),0);
  session.status='complete';session.payment_status='paid';await page.getByRole('button',{name:'Check payment status'}).click();await page.getByRole('heading',{name:'Thank you for your support'}).waitFor();await page.getByRole('status').filter({hasText:'confirmed your £73.17 donation'}).waitFor();
  console.log('Cancelled checkout keeps the amount; unpaid return does not claim success; server-verified payment shows the exact confirmed amount.');
  await page.goto(origin+'/#donate');failStripe=true;await page.locator('#donate').getByRole('button',{name:'Donate £73.17'}).click();await page.locator('#donate').getByRole('alert').filter({hasText:'temporarily unavailable'}).waitFor();assert.equal(await page.locator('#donate').getByRole('textbox',{name:'Custom donation amount in pounds'}).inputValue(),'73.17');failStripe=false;
  await page.goto(origin+'/donation/return?session_id=bad');await page.getByRole('alert').filter({hasText:'Invalid payment session'}).waitFor();assert.equal(await page.getByRole('heading',{name:'Thank you for your support'}).count(),0);
  assert(!fs.readFileSync(path.join(dist,'index.html'),'utf8').includes('buy-button.js'));
  console.log('Stripe outages and forged return URLs show honest errors. Desktop and mobile layouts fit without the old embedded script.');
 }finally{global.fetch=originalFetch;if(browser)await browser.close();for(const s of[frontend,backend]){s.closeAllConnections();await new Promise(r=>s.close(r));}}
}
main().catch(err=>{console.error(err);process.exitCode=1;});
