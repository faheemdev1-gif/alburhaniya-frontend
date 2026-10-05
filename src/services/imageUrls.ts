import api from './api';

export function imageUrl(url:string):string {
  if (!url) return '';
  if (/^(https?:)?\/\//i.test(url) || /^(blob:|data:image\/)/i.test(url)) return url;
  if (/^\/(uploads\/|api\/media\/|api\/site-content\/media\/)/.test(url)) {
    const base = (api.defaults.baseURL || 'http://localhost:5000/api').replace(/\/+$/,'').replace(/\/api$/,'');
    return `${base}${url}`;
  }
  // Built-in /images/ and /logo.png assets belong to the frontend.
  return url;
}

export const isImageField = (key:string) => /^(bg|img|image(Main|Top|Bottom)?|thumbImage|authorAvatar|logo(Invert)?)$/.test(key);

export function inlineImageMarkup(url:string):string {
  const src=imageUrl(url).replace(/[&"<>]/g,char=>({'&':'&amp;','"':'&quot;','<':'&lt;','>':'&gt;'}[char]!));
  return `\n<p><img src="${src}" alt="" loading="lazy" /></p>\n`;
}
