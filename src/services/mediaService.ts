import api from './api';
import axios from 'axios';

export interface UploadedImage { url:string; thumbnailUrl:string; width?:number; height?:number; bytes?:number }
export function validateImage(file:File):void {
  if (!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type)) throw new Error('Choose a JPG, PNG, WebP, or GIF image.');
  if (!file.size) throw new Error('The image file is empty. Choose another image.');
  if (file.size > 10 * 1024 * 1024) throw new Error('Image must be 10 MB or smaller.');
}
export async function uploadImage(file:File):Promise<UploadedImage> {
  validateImage(file);
  const form = new FormData(); form.append('image',file);
  let data: Partial<UploadedImage>;
  try {
    ({data} = await api.post<UploadedImage>('/media',form));
  } catch (err) {
    // Retry only an explicit missing route. Never retry a timeout or storage error:
    // those requests may already have saved the image.
    if (!axios.isAxiosError(err) || err.response?.status !== 404 ||
        err.response.data?.message !== 'Route not found') throw err;
    ({data} = await api.post<UploadedImage>('/site-content/image',form));
  }
  if (typeof data.url !== 'string' || !data.url) {
    throw new Error('The backend returned an invalid upload response. Check the API URL and redeploy the backend.');
  }
  // Older content-editor backends returned only {url}.
  return {...data, thumbnailUrl:data.thumbnailUrl || data.url} as UploadedImage;
}
export function imageError(err:any) {
  if (err?.response?.status === 404) return 'The image upload endpoint is missing. Deploy the updated backend and check VITE_API_URL ends in /api.';
  if (err?.response?.status === 401) return 'Your session has expired. Log in again before uploading.';
  if (err?.response?.status === 403) return 'An admin account is required to upload images.';
  if (axios.isAxiosError(err) && !err.response) return 'Could not reach the image server. Please try again once the backend is available.';
  return err?.response?.data?.message || err?.message || 'Image upload failed.';
}
