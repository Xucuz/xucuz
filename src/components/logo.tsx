/** The original Xucuz wordmark is cropped from the supplied brand artwork.
 * The Xucina character remains outside this fixed viewport.
 * Shared by the header and footer so the identity is identical in both places.
 */
export function Logo(){
 return <span className="xucuz-brand-lockup" aria-label="Xucuz.com — Türkiye’nin en ucuzunu birlikte bulalım" style={{display:'inline-flex',flexDirection:'column',alignItems:'center',gap:3,flexShrink:0}}>
  <span aria-hidden="true" style={{display:'block',width:166,height:96,backgroundImage:'url(/xucina-brand.jpg)',backgroundRepeat:'no-repeat',backgroundSize:'260px 173px',backgroundPosition:'-92px -70px'}}/>
  <span style={{fontSize:10,fontWeight:700,letterSpacing:'.015em',lineHeight:1.2,textAlign:'center',color:'inherit'}}>Türkiye’nin en ucuzunu birlikte bulalım</span>
 </span>;
}
