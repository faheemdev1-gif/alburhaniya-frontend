const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const {buildSync}=require('esbuild');
const sharp=require('../server/node_modules/sharp');
const root=path.resolve(__dirname,'..');
const bundle=buildSync({stdin:{contents:`import * as images from './src/services/imagePreparation'; window.imageTools=images;`,resolveDir:root,loader:'ts'},bundle:true,format:'iife',write:false}).outputFiles[0].text;
const productionBackend='https://peru-nightingale-490437.hostingersite.com';
async function main(){
  const server=http.createServer((req,res)=>{
    const pathname=new URL(req.url,'http://localhost').pathname;
    if(pathname==='/image-tools.js'){res.setHeader('Content-Type','text/javascript');res.end(bundle);return;}
    if(pathname==='/image-test'){res.setHeader('Content-Type','text/html');res.end('<script src="/image-tools.js"></script>');return;}
    let filename=path.join(root,'dist',pathname);
    if(!fs.existsSync(filename)||!fs.statSync(filename).isFile())filename=path.join(root,'dist/index.html');
    const ext=path.extname(filename);res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.jpg':'image/jpeg','.JPG':'image/jpeg','.webp':'image/webp'})[ext]||'application/octet-stream');res.end(fs.readFileSync(filename));
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin=`http://127.0.0.1:${server.address().port}`;
  let browser;
  try{
    const launch={headless:true,args:['--no-sandbox','--disable-dev-shm-usage']};
    if(process.env.CHROMIUM_EXECUTABLE_PATH)launch.executablePath=process.env.CHROMIUM_EXECUTABLE_PATH;
    browser=await chromium.launch(launch);
    const page=await browser.newPage({viewport:{width:1280,height:1000}});
    await page.goto(origin+'/image-test');
    const sample=fs.readFileSync(path.join(root,'public/images/every-voice.JPG'));
    assert(sample.length>5*1024*1024);
    const prepared=await page.evaluate(async data=>{
      const bytes=Uint8Array.from(atob(data),c=>c.charCodeAt(0));
      const file=await window.imageTools.prepareImage(new File([bytes],'camera.JPG',{type:'image/jpeg'}));
      const bitmap=await createImageBitmap(file);const result={bytes:file.size,width:bitmap.width,height:bitmap.height,type:file.type};bitmap.close();return result;
    },sample.toString('base64'));
    assert(prepared.bytes<=900*1024);assert(Math.max(prepared.width,prepared.height)<=1920);
    console.log('Camera photo compressed:',sample.length,'->',prepared.bytes,'bytes;',prepared.width+'x'+prepared.height);
    const transparency=await page.evaluate(async()=>{
      const canvas=document.createElement('canvas');canvas.width=200;canvas.height=200;
      const context=canvas.getContext('2d');context.fillStyle='#ff3300';context.fillRect(50,50,100,100);
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
      const file=await window.imageTools.prepareImage(new File([blob],'logo.png',{type:'image/png'}));
      const bitmap=await createImageBitmap(file);context.clearRect(0,0,200,200);context.drawImage(bitmap,0,0);bitmap.close();
      return {corner:context.getImageData(0,0,1,1).data[3],center:context.getImageData(100,100,1,1).data[3]};
    });
    assert.equal(transparency.corner,0);assert.equal(transparency.center,255);
    console.log('Transparent logo retains transparency.');
    // Cover the native decoder fallback too.
    const fallback=await page.evaluate(async()=>{
      const original=window.createImageBitmap;window.createImageBitmap=undefined;
      try{const c=document.createElement('canvas');c.width=20;c.height=10;const blob=await new Promise(resolve=>c.toBlob(resolve,'image/png'));const output=await window.imageTools.prepareImage(new File([blob],'photo.png',{type:'image/png'}));return output.size>0;}finally{window.createImageBitmap=original;}
    });assert(fallback);
    const samplePng=await sharp(sample).resize(20,20).png().toBuffer();
    const uploads=[];let failNext=false;
    let gallery=[{_id:'gallery-test',title:'Community',category:'general',size:'normal',order:0,imageUrl:'/api/media/existing',thumbnailUrl:'/api/media/existing/thumbnail'}];
    const article={_id:'article-test',title:'Community story',image:'/api/media/existing',authorAvatar:'/api/media/existing/thumbnail',author:'Author',category:'Community',dateISO:'2026-10-05',published:true,featured:false,content:'<p>Story</p>',excerpt:'Story'};
    const event={_id:'event-test',title:'Community event',image:'/api/media/existing',thumbImage:'/api/media/existing/thumbnail',dateISO:'2026-10-05',category:'Gathering',categoryKey:'gathering',shortDesc:'Community'};
    await page.addInitScript(()=>localStorage.setItem('communitas_token','isolated-browser-test'));
    await page.route('**/*',async route=>{
      const request=route.request(),url=new URL(request.url());
      if(url.origin===origin)return route.continue();
      if(url.origin!==productionBackend)return route.abort();
      const pathname=url.pathname,method=request.method();
      if(method==='GET'&&pathname.startsWith('/api/media/'))return route.fulfill({status:200,contentType:'image/png',body:samplePng});
      let data={};
      if(pathname==='/api/auth/me')data={id:'admin',name:'Admin',role:'admin',email:'test@example.com'};
      else if(pathname==='/api/site-content')data={};
      else if(pathname==='/api/articles')data={articles:[article],total:1};
      else if(pathname==='/api/articles/featured')data=null;
      else if(pathname==='/api/articles/article-test')data=article;
      else if(pathname==='/api/events')data={events:[event],total:1};
      else if(pathname==='/api/gallery'&&method==='GET')data={items:gallery,total:gallery.length};
      else if(pathname==='/api/users')data=[];
      if(['POST','PUT'].includes(method)&&request.headers()['content-type']?.startsWith('multipart/form-data')){
        const type=request.headers()['content-type'];assert(/boundary=/.test(type));
        const boundary=type.split('boundary=')[1],body=request.postDataBuffer().toString('latin1');
        const part=body.split('--'+boundary).find(p=>p.includes('name="image"'));
        assert(part);const image=Buffer.from(part.slice(part.indexOf('\r\n\r\n')+4,-2),'latin1');
        const meta=await sharp(image).metadata();assert(image.length<=900*1024);assert.equal(meta.format,'webp');
        assert.equal(request.headers().authorization,'Bearer isolated-browser-test');
        if(failNext){failNext=false;return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({message:'Storage is unavailable'})});}
        const id=String(uploads.length+1);uploads.push({path:pathname,bytes:image.length});
        data={url:'/api/media/'+id,thumbnailUrl:'/api/media/'+id+'/thumbnail',width:meta.width,height:meta.height,bytes:image.length};
        if(pathname.startsWith('/api/gallery')){const item={...gallery[0],imageUrl:data.url,thumbnailUrl:data.thumbnailUrl};gallery=method==='PUT' ? [item] : [...gallery,item];data=item;}
      }
      return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
    });
    const file={name:'every-voice.JPG',mimeType:'image/jpeg',buffer:sample};
    async function uploadInput(locator){const count=uploads.length;await locator.setInputFiles(file);await page.waitForFunction(()=>!Array.from(document.querySelectorAll('input[type=file]')).some(input=>input.disabled));assert.equal(uploads.length,count+1);}
    await page.goto(origin+'/admin/content');await page.getByRole('heading',{name:'Website Content'}).waitFor();
    let websiteFields=0;
    for(const [section,count] of [['Homepage slider',4],['About us',3],['Activities & programmes',7],['Testimonials',5],['Logo & footer',2]]){
      await page.locator('.content-tabs').getByRole('button',{name:section,exact:true}).click();
      const inputs=page.locator('.content-panel input[type=file]');assert.equal(await inputs.count(),count);
      for(let i=0;i<count;i++){await uploadInput(inputs.nth(i));websiteFields++;}
    }
    // Failed upload must keep the prior published-image value.
    const first=page.locator('.content-panel .content-image').first(),previous=await first.locator('img').getAttribute('src');
    failNext=true;await first.locator('input[type=file]').setInputFiles(file);await page.getByText('Storage is unavailable',{exact:true}).waitFor();
    assert.equal(await first.locator('img').getAttribute('src'),previous);
    for(const route of ['/admin/articles/new','/admin/events/new']){
      await page.goto(origin+route);const inputs=page.locator('input[type=file]');await inputs.first().waitFor({state:'attached'});assert.equal(await inputs.count(),3);
      for(let i=0;i<3;i++)await uploadInput(inputs.nth(i));
      const body=page.locator('textarea').last(); // Article body is last; event body has later fields.
      if(route.includes('articles'))assert.match(await body.inputValue(),/img src="https:\/\/peru-nightingale/);
      else assert.match(await page.getByPlaceholder('Full event details…').inputValue(),/img src="https:\/\/peru-nightingale/);
    }
    await page.goto(origin+'/admin/gallery');await page.getByRole('button',{name:'+ Upload Photo',exact:true}).click();
    await page.locator('.upload-modal input[type=file]').setInputFiles(file);
    const count=uploads.length;await page.locator('.upload-modal').getByRole('button',{name:'Upload Photo',exact:true}).click();await page.locator('.upload-modal').waitFor({state:'detached'});assert.equal(uploads.length,count+1);
    await page.locator('.gallery-card').first().hover();await page.getByRole('button',{name:'Edit photo',exact:true}).first().click();
    await page.locator('.upload-modal input[type=file]').setInputFiles(file);await page.getByRole('button',{name:'Save Photo',exact:true}).click();await page.locator('.upload-modal').waitFor({state:'detached'});
    assert.equal(uploads.at(-1).path,'/api/gallery/gallery-test');
    for(const route of ['/admin/articles','/admin/events','/admin']){
      await page.goto(origin+route);await page.locator('img').first().waitFor({state:'attached'});
      const sources=await page.locator('img').evaluateAll(images=>images.map(image=>image.src));
      assert(sources.some(src=>src.startsWith(productionBackend+'/api/media/')));assert(!sources.some(src=>src.includes('localhost:5000')));
    }
    console.log('Verified',websiteFields,'website image fields, 3 article upload controls, 3 event upload controls, gallery creation and replacement, error preservation, and admin previews.');
    console.log('All browser image checks passed.');
  }finally{if(browser)await browser.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
}
main().catch(err=>{console.error(err);process.exitCode=1;});
