export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';
export const ORIGINAL_IMAGE_LIMIT_MB = 20;
export const UPLOAD_TARGET_BYTES = 900 * 1024;

export function validateImage(file:File):void {
  if (!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type)) {
    throw new Error('Choose a JPG, PNG, WebP, or GIF image. Convert HEIC photos to JPG first.');
  }
  if (!file.size) throw new Error('The image file is empty. Choose another image.');
  if (file.size > ORIGINAL_IMAGE_LIMIT_MB * 1024 * 1024) throw new Error(`Choose an image no larger than ${ORIGINAL_IMAGE_LIMIT_MB} MB.`);
}

async function decode(file:File):Promise<{source:CanvasImageSource;width:number;height:number;release:()=>void}> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      return {source:bitmap,width:bitmap.width,height:bitmap.height,release:()=>bitmap.close()};
    } catch { /* Try the image-element decoder for older browsers. */ }
  }
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    await new Promise<void>((resolve,reject)=>{
      image.onload=()=>resolve();image.onerror=()=>reject(new Error('This image could not be opened. Try another JPG, PNG, WebP, or GIF.'));
      image.src=url;
    });
    return {source:image,width:image.naturalWidth,height:image.naturalHeight,release:()=>URL.revokeObjectURL(url)};
  } catch (err) { URL.revokeObjectURL(url);throw err; }
}

// Optimize every upload before it reaches the host's request-size limit. The
// canvas preserves transparency and makes phone orientation part of the pixels.
export async function prepareImage(file:File):Promise<File> {
  validateImage(file);
  const image = await decode(file);
  const canvas = document.createElement('canvas');
  try {
    if (!image.width || !image.height || image.width*image.height > 80_000_000) {
      throw new Error('Resize this image below 80 megapixels before uploading.');
    }
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Your browser could not prepare the image. Try a current browser.');
    const scale = Math.min(1,1920/Math.max(image.width,image.height));
    let width=Math.max(1,Math.round(image.width*scale)),height=Math.max(1,Math.round(image.height*scale));
    for (let attempt=0;attempt<10;attempt++) {
      canvas.width=width;canvas.height=height;
      context.drawImage(image.source,0,0,width,height);
      const quality = Math.max(0.66,0.86-attempt*0.04);
      const blob = await new Promise<Blob>((resolve,reject)=>canvas.toBlob(
        blob=>blob ? resolve(blob) : reject(new Error('The image could not be compressed. Try another image.')),
        'image/webp',quality));
      if (blob.size <= UPLOAD_TARGET_BYTES && blob.size > 0) {
        const extension=blob.type === 'image/webp' ? 'webp' : 'png';
        return new File([blob],`${file.name.replace(/\.[^.]+$/,'')}.${extension}`,{type:blob.type,lastModified:file.lastModified});
      }
      if(attempt>=3) {width=Math.max(1,Math.round(width*0.8));height=Math.max(1,Math.round(height*0.8));}
    }
    throw new Error('This image could not be reduced enough to upload. Please choose a smaller version.');
  } finally { image.release();canvas.width=0;canvas.height=0; }
}

export async function prepareGalleryForm(form:FormData):Promise<FormData> {
  const copy = new FormData();
  const file = form.get('image');
  for (const [key,value] of form.entries()) if(key!=='image') copy.append(key,value);
  if (file instanceof File) copy.append('image',await prepareImage(file));
  return copy;
}
