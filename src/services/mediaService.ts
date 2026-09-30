import api from './api';

export interface UploadedImage { url:string; thumbnailUrl:string; width:number; height:number; bytes:number }
export async function uploadImage(file:File):Promise<UploadedImage> {
  if (!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type)) throw new Error('Choose a JPG, PNG, WebP, or GIF image.');
  if (file.size > 10 * 1024 * 1024) throw new Error('Image must be 10 MB or smaller.');
  const form = new FormData(); form.append('image',file);
  const {data} = await api.post<UploadedImage>('/media',form,{headers:{'Content-Type':'multipart/form-data'}});
  return data;
}
export function imageError(err:any) { return err?.response?.data?.message || err?.message || 'Image upload failed.'; }
