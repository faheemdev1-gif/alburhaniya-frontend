const {test} = require('node:test');
const assert = require('node:assert/strict');
const {buildSync} = require('esbuild');
const Module = require('node:module');
const path = require('node:path');
const bundled = buildSync({stdin:{contents:`export {default as api} from './src/services/api'; export * from './src/services/mediaService'; export {adminGallery} from './src/admin/services/adminApi'; export {AxiosError} from 'axios'; export * from './src/services/imagePreparation'; export * from './src/services/imageUrls'; export {defaults} from './src/content';`,resolveDir:path.resolve(__dirname,'..'),loader:'ts'},bundle:true,platform:'node',format:'cjs',write:false,define:{'import.meta.env.VITE_API_URL':'"https://backend.example/api/"'}});
const moduleInstance = new Module(path.join(__dirname,'compiled-test.cjs'));
moduleInstance.paths = module.paths;
moduleInstance._compile(bundled.outputFiles[0].text,path.join(__dirname,'compiled-test.cjs'));
const {api,uploadImage,imageError,adminGallery,AxiosError} = moduleInstance.exports;
const originalLocalStorage = global.localStorage;
global.localStorage={getItem:()=> 'test-admin-token',removeItem:()=>{}};
const originalDocument=global.document,originalDecoder=global.createImageBitmap;
global.createImageBitmap=async()=>({width:3,height:2,close(){}});
global.document={createElement:()=>({getContext:()=>({drawImage(){}}),toBlob:callback=>callback(new Blob([new Uint8Array([1,2,3])],{type:'image/webp'}))})};
const file = () => new File([new Uint8Array([1,2,3])],'photo.png',{type:'image/png'});
function response(config,status,data){return {config,status,data,headers:{},statusText:String(status)};}
function failure(config,status,data){return new AxiosError('Request failed',undefined,config,{},response(config,status,data));}

test('frontend upload compatibility, validation and errors', async t => {
  try {
    await t.test('normal upload sends a File in FormData with the JWT', async()=> {
      api.defaults.adapter=async config=>{
        assert.equal(config.url,'/media'); assert.equal(config.baseURL,'https://backend.example/api');
        assert(config.data instanceof FormData); assert.equal(config.data.get('image').name,'photo.webp');
        assert.equal(config.headers.Authorization,'Bearer test-admin-token');
        return response(config,201,{url:'/api/media/test',thumbnailUrl:'/api/media/test/thumbnail',width:3,height:2,bytes:20});
      };
      assert.equal((await uploadImage(file())).width,3);
    });
    await t.test('missing new route retries the older endpoint and accepts its URL-only response', async()=> {
      const calls=[];
      api.defaults.adapter=async config=>{
        calls.push(config.url);
        if(config.url==='/media') throw failure(config,404,{message:'Route not found'});
        return response(config,201,{url:'/api/site-content/media/legacy'});
      };
      const result=await uploadImage(file());
      assert.deepEqual(calls,['/media','/site-content/image']);
      assert.equal(result.thumbnailUrl,result.url);
    });
    await t.test('storage, authentication, validation and network errors never cause a second upload', async()=> {
      for(const status of [400,401,403,413,500,503,0]) {
        let calls=0;
        api.defaults.adapter=async config=>{calls++;throw status ? failure(config,status,{message:'Failed'}) : new AxiosError('Network Error','ERR_NETWORK',config);};
        await assert.rejects(()=>uploadImage(file())); assert.equal(calls,1);
      }
    });
    await t.test('an unrelated 404 is not retried', async()=> {
      let calls=0;api.defaults.adapter=async config=>{calls++;throw failure(config,404,{message:'Asset unavailable'});};
      await assert.rejects(()=>uploadImage(file()));assert.equal(calls,1);
    });
    await t.test('if both routes are missing, the message explains how to fix deployment', async()=> {
      api.defaults.adapter=async config=>{throw failure(config,404,{message:'Route not found'});};
      try{await uploadImage(file());assert.fail('Expected failure');}catch(err){assert.match(imageError(err),/Deploy the updated backend/);}
    });
    await t.test('HTML or missing URL response is rejected rather than saved into website content', async()=> {
      api.defaults.adapter=async config=>response(config,200,'<html>Wrong service</html>');
      await assert.rejects(()=>uploadImage(file()),/invalid upload response/);
    });
    await t.test('unsupported, empty and oversized files never reach the API', async()=> {
      let calls=0;api.defaults.adapter=async config=>{calls++;return response(config,201,{});};
      for(const invalid of [new File(['x'],'photo.heic',{type:'image/heic'}),new File([],'empty.png',{type:'image/png'}),new File([new Uint8Array(20*1024*1024+1)],'large.jpg',{type:'image/jpeg'})]) {
        await assert.rejects(()=>uploadImage(invalid));
      }
      assert.equal(calls,0);
    });
    await t.test('gallery requests retain FormData instead of serializing it as JSON', async()=> {
      api.defaults.adapter=async config=>{assert(config.data instanceof FormData);assert.equal(config.data.get('title'),'Photo');return response(config,201,{_id:'gallery'});};
      const form=new FormData();form.append('image',file());form.append('title','Photo');
      assert.equal((await adminGallery.create(form)).status,201);
    });
  }finally{global.document=originalDocument;global.createImageBitmap=originalDecoder;if(originalLocalStorage===undefined)delete global.localStorage;else global.localStorage=originalLocalStorage;}
});

test('all website image fields are recognized; static assets and backend images resolve correctly',()=>{
  const {imageUrl,isImageField,inlineImageMarkup,defaults}=moduleInstance.exports;
  assert.equal(imageUrl('/api/media/123'),'https://backend.example/api/media/123');
  assert.equal(imageUrl('/api/site-content/media/123'),'https://backend.example/api/site-content/media/123');
  assert.equal(imageUrl('/uploads/photo.jpg'),'https://backend.example/uploads/photo.jpg');
  assert.equal(imageUrl('/images/photo.jpg'),'/images/photo.jpg');
  assert.equal(imageUrl('/logo.png'),'/logo.png');
  assert.equal(imageUrl('https://cdn.example/photo.webp'),'https://cdn.example/photo.webp');
  assert.equal(imageUrl(''), '');
  let images=0;
  function inspect(value){if(Array.isArray(value))value.forEach(inspect);else if(value&&typeof value==='object')for(const [key,item] of Object.entries(value)){if(typeof item==='string'&&/^(?:\/images\/|\/logo|https:\/\/(?:images\.unsplash|randomuser))/.test(item)){assert(isImageField(key),key);images++;}inspect(item);}}
  inspect(defaults);assert.equal(images,21);
  assert(!isImageField('heading'));assert(isImageField('authorAvatar'));assert(isImageField('thumbImage'));
  assert.match(inlineImageMarkup('/api/media/123'),/src="https:\/\/backend.example\/api\/media\/123"/);
});
