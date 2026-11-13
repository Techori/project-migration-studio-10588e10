import type { ImgHTMLAttributes } from 'react';
export function ResponsiveSiteImage({mobile,src,className,...props}:ImgHTMLAttributes<HTMLImageElement>&{mobile:string}){
 return <picture className={className}><source media="(max-width: 767px)" srcSet={mobile}/><img {...props} src={src} className="h-full w-full object-cover [object-position:inherit]"/></picture>;
}