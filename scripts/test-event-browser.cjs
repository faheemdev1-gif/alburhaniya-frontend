// UI interaction checks with isolated API responses; no live registrations or emails.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const event = { _id: '111111111111111111111111', title: 'Community Day', slug: 'community-day', category: 'Gathering', categoryKey: 'gathering', status: 'upcoming', featured: true, dateISO: '2099-01-01', dateLabel: '1 January 2099', day: '01', month: 'JAN', year: '2099', timeStart: '10:00', timeEnd: '12:00', location: 'Manchester', address: 'Community Centre', capacity: 3, registered: 0, price: 'Free', organiser: 'Al-Burhaniya', image: '/logo.png', thumbImage: '/logo.png', tags: [], shortDesc: 'Community day', fullDesc: 'Welcome', schedule: [], highlights: [] };
async function main() {
 const dist = path.resolve(__dirname, '../dist');
 const server = http.createServer((req,res)=>{let name=path.join(dist,new URL(req.url,'http://localhost').pathname);if(!name.startsWith(dist)||!fs.existsSync(name)||!fs.statSync(name).isFile())name=path.join(dist,'index.html');res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png'})[path.extname(name)]||'application/octet-stream');res.end(fs.readFileSync(name));});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
 let browser;
 try {
  browser = await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,args:['--no-sandbox','--disable-dev-shm-usage']});
  const page = await browser.newPage({viewport:{width:1440,height:1000}});
  const registrations = [], subscribers = []; let fail = true, eventListFail = false, emailRetried = false;
  await page.route('**/*', async route => {
   const req=route.request(),url=new URL(req.url());if(url.origin===origin)return route.continue();if(!url.pathname.startsWith('/api/'))return route.abort();
   let data = {}, status = 200;
   if(url.pathname===`/api/events/${event._id}/register`){registrations.push(req.postDataJSON());status=fail?503:201;data=fail?{message:'Registration could not be saved. Try again.'}:{reference:'222222222222222222222222',registered:2,spotsLeft:1,message:'Saved'};}
   else if(url.pathname===`/api/events/${event._id}/registrations`){data={event,registrations:[{_id:'222222222222222222222222',firstName:'Jane',lastName:'Smith',email:'jane@example.test',phone:'+44 1234',notes:'Two guests',places:2,createdAt:'2026-10-14T12:00:00Z',organiserNotificationStatus:emailRetried?'sent':'failed',confirmationNotificationStatus:emailRetried?'sent':'failed'}],total:1,emailConfigured:true};}
   else if(url.pathname.endsWith('/notify')){emailRetried=true;data={message:'Email retry processed.'};}
   else if(url.pathname==='/api/auth/me'){data={id:'admin',role:'admin',name:'Admin',email:'admin@example.test'};}
   else if(url.pathname==='/api/newsletter/subscribe'){subscribers.push(req.postDataJSON());data={confirmationAvailable:true,message:'Check your inbox for a confirmation link.'};}
   else if(url.pathname==='/api/events'){status=eventListFail?503:200;data=eventListFail?{message:'Unavailable'}:{events:url.searchParams.get('status')==='past'?[]:[event],total:1,pages:1};}
   else if(url.pathname.endsWith('/related')){status=503;data={message:'Related events unavailable'};}
   else if(url.pathname==='/api/events/community-day')data=event;
   else if(url.pathname==='/api/articles')data={articles:[],total:0};
   else if(url.pathname==='/api/gallery')data={items:[]};
   await route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
  });
  await page.goto(origin+'/donate');await page.getByRole('heading',{name:'Make a Donation'}).waitFor();await page.getByRole('form',{name:'Choose your donation'}).getByRole('button',{name:'£25.00',exact:true}).click();assert.match(await page.getByRole('form',{name:'Choose your donation'}).getByRole('status').textContent(),/£25.00/);
  await page.goto(origin+'/events/community-day');await page.getByRole('button',{name:'Register Free Place'}).click();
  const modal=page.getByRole('dialog',{name:'Register for Event'});await modal.waitFor();
  await modal.getByLabel('First Name').fill('Jane');await modal.getByLabel('Last Name').fill('Smith');await modal.getByLabel('Email Address').fill('jane@example.test');await modal.getByLabel('Phone (optional)').fill('+44 1234');await modal.getByLabel('Number of places').selectOption('2');await modal.getByLabel('Anything we should know? (optional)').fill('Two guests');
  await modal.getByRole('button',{name:'Confirm Registration'}).click();await modal.getByRole('alert').waitFor();assert.equal(await modal.getByLabel('Email Address').inputValue(),'jane@example.test');assert.equal(await modal.getByText("You're registered!").count(),0);
  fail=false;await modal.getByRole('button',{name:'Confirm Registration'}).click();await modal.getByRole('heading',{name:"You're registered!"}).waitFor();assert.equal(registrations.length,2);assert.equal(registrations[0].submissionId,registrations[1].submissionId);assert.equal(registrations[1].places,2);assert.equal(registrations[1].notes,'Two guests');assert.match(await modal.getByRole('status').textContent(),/222222222222222222222222/);await modal.getByRole('button',{name:'Close',exact:true}).click();await page.getByText('2 of 3 registered').waitFor();
  for(const route of ['/events','/events/community-day','/articles','/gallery']){
   await page.goto(origin+route);const form=page.getByRole('form',{name:'Newsletter sign-up'});await form.getByRole('textbox',{name:'Newsletter email address'}).fill('reader@example.test');await form.getByRole('button',{name:'Subscribe',exact:true}).click();await form.getByRole('status').filter({hasText:'confirmation link'}).waitFor();
  }
  assert.equal(subscribers.length,4);assert(subscribers.every(s=>s.email==='reader@example.test'));
  await page.evaluate(()=>localStorage.setItem('communitas_token','isolated-admin-token'));
  await page.goto(origin+`/admin/events/${event._id}/registrations`);await page.getByRole('cell').filter({hasText:'jane@example.test'}).waitFor();await page.getByRole('button',{name:'Retry emails'}).click();await page.getByText('Organiser: sent').waitFor();assert.equal(emailRetried,true);
  eventListFail=true;await page.goto(origin+'/events');await page.getByRole('alert').filter({hasText:'could not be loaded'}).waitFor();eventListFail=false;await page.getByRole('button',{name:'Try again'}).click();await page.getByRole('alert').waitFor({state:'hidden'});
  await page.setViewportSize({width:390,height:844});await page.goto(origin+'/events/community-day');await page.getByRole('button',{name:'Register Free Place'}).click();await page.getByRole('dialog').waitFor();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.getByRole('dialog').screenshot({path:path.resolve(__dirname,'../../../event-registration-mobile.png')});
  console.log('Donation page, saved registration payload, failure/retry, updated capacity, all four newsletter banners, admin registrations/retry, related-event failure, event-load retry and mobile modal passed.');
 }finally{if(browser)await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
}
main().catch(err=>{console.error(err);process.exitCode=1;});
