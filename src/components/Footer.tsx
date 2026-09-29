import { Link } from 'react-router-dom';
import { useContent, imageUrl, safeHref } from '../content';

export function Footer() {
  const { branding, contact, navigation } = useContent();
  const explore = [
    {label:navigation.about,href:'/#about'}, {label:navigation.activities,href:'/#activities'},
    {label:navigation.events,href:'/events'}, {label:navigation.articles,href:'/articles'},
    {label:navigation.gallery,href:'/gallery'}
  ];
  const columns = [
    {title:branding.footerExplore, links:explore},
    {title:branding.footerInvolved, links:branding.footerLinks},
    {title:branding.footerProgrammes, links:branding.programmeLinks},
    {title:branding.footerInfo, links:branding.infoLinks},
  ];
  return <footer id="footer"><div className="container"><div className="footer-top row gy-4">
    <div className="col-lg-4"><Link to="/" className="footer-brand"><span className="brand-emblem"><img alt="Al Burhaniya International" src={imageUrl(branding.logo)} width="100%" style={{maxWidth:250}}/></span></Link><p className="footer-tagline">{branding.footerTagline}</p><p className="footer-charity">{branding.footerRegistration}</p></div>
    {columns.map((column,i)=><div key={i} className="col-6 col-lg-2"><h6 className="footer-heading">{column.title}</h6><ul className="footer-links">{column.links.map((link,j)=><li key={j}><Link to={safeHref(link.href)}>{link.label}</Link></li>)}</ul></div>)}
  </div><div className="footer-bottom"><span>{branding.copyright}</span><div className="social-links">{(['facebook','instagram','twitter','youtube','whatsapp'] as const).filter(k=>contact[k]).map(k=><a key={k} href={safeHref(contact[k])} className="soc-link sm" aria-label={k}><i className={`bi bi-${k==='twitter'?'twitter-x':k}`}/></a>)}</div></div></div></footer>;
}
