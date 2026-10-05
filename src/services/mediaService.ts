import api from './api';
import axios from 'axios';
import { prepareImage } from './imagePreparation';
export { validateImage } from './imagePreparation';

export interface UploadedImage { url:string; thumbnailUrl:string; width?:number; height?:number; bytes?:number }
export async function uploadImage(file:File):Promise<UploadedImage> {
  const form = new FormData(); form.append('image',await prepareImage(file));
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
  if (!data || typeof data.url !== 'string' || !data.url) {
    throw new Error('The backend returned an invalid upload response. Check the API URL and redeploy the backend.');
  }
  // Older content-editor backends returned only {url}.
  return {...data, thumbnailUrl:data.thumbnailUrl || data.url} as UploadedImage;
}
export function imageError(err:any) {
  if (err?.response?.status === 413 || /file too large/i.test(err?.response?.data?.message || '')) return 'The server rejected the image size. Deploy the updated frontend to enable automatic compression, and set backend MAX_FILE_SIZE_MB=10.';
  if (err?.response?.status === 404) return 'The image upload endpoint is missing. Deploy the updated backend and check VITE_API_URL ends in /api.';
  if (err?.response?.status === 401) return 'Your session has expired. Log in again before uploading.';
  if (err?.response?.status === 403) return 'An admin account is required to upload images.';
  if (axios.isAxiosError(err) && !err.response) return 'Could not reach the image server. Please try again once the backend is available.';
  return err?.response?.data?.message || err?.message || 'Image upload failed.';
}
