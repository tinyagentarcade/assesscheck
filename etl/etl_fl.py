import pandas as pd, json, os, glob, datetime, re
H=os.path.expanduser('~/fl/'); ROOT=os.path.expanduser('~/site/data/fl/')
COUNTIES={'broward':'broward_nal','dade':'dade_nal','hillsborough':'hills_nal','orange':'orange_nal'}
cols=['PARCEL_ID','DOR_UC','JV','AV_SD','AV_NSD','JV_HMSTD','AV_HMSTD','JV_NON_HMSTD_RESD','AV_NON_HMSTD_RESD','ACT_YR_BLT','TOT_LVG_AREA','NO_RES_UNTS','LND_SQFOOT','NBRHD_CD','PHY_ADDR1','PHY_ZIPCD','SALE_PRC1','SALE_YR1','SALE_MO1','QUAL_CD1','MULTI_PAR_SAL1','SALE_PRC2','SALE_YR2','SALE_MO2','QUAL_CD2','MULTI_PAR_SAL2']
def run(cty,d):
    f=glob.glob(H+d+'/*.csv')[0]; o=[]
    for c in pd.read_csv(f,usecols=cols,dtype=str,chunksize=200000,encoding='latin1'):
        c=c[c.DOR_UC.fillna('').str.strip().isin(['001','1'])]; o.append(c)
    a=pd.concat(o)
    for c in a.columns: a[c]=a[c].fillna('').str.strip()
    N=lambda s: pd.to_numeric(s,errors='coerce').fillna(0).round().astype(int)
    a['jv']=N(a.JV);a['av']=N(a.AV_NSD).where(N(a.AV_NSD)>0,N(a.AV_SD));a['sf']=N(a.TOT_LVG_AREA);a['yr']=N(a.ACT_YR_BLT);a['land']=N(a.LND_SQFOOT)
    a['hs']=(N(a.JV_HMSTD)>0).astype(int); a['nh']=(N(a.JV_NON_HMSTD_RESD)>0).astype(int)
    # latest qualified single-parcel sale
    def sale(k):
        p=N(a['SALE_PRC'+k]);y=N(a['SALE_YR'+k]);m=N(a['SALE_MO'+k])
        ok=a['QUAL_CD'+k].isin(['01','02'])&(a['MULTI_PAR_SAL'+k]=='')&(p>=20000)
        return p.where(ok,0), (y*100+m).where(ok,0)
    p1,d1=sale('1');p2,d2=sale('2')
    use2=d2>d1; a['sp']=p1.where(~use2,p2); a['sd']=d1.where(~use2,d2)
    a['addr']=a.PHY_ADDR1.str.replace(r'\s+',' ',regex=True)
    a=a[(a.addr.str.match(r'^\d'))&(a.jv>0)&(a.NBRHD_CD!='')]
    a['n']=a.addr.str.upper().str.replace(r'[^A-Z0-9 ]','',regex=True)
    a['nb']=a.NBRHD_CD.str.replace(r'[^A-Za-z0-9]','_',regex=True)
    out=ROOT+cty+'/'; os.makedirs(out+'n',exist_ok=True); os.makedirs(out+'i',exist_ok=True)
    for nb,g in a.groupby('nb'):
        json.dump([[r.PARCEL_ID,r.addr,r.sf,r.yr,r.land,r.jv,r.av,1 if r.hs else (2 if r.nh else 0),r.sp,r.sd] for r in g.itertuples()],open(out+'n/'+nb+'.json','w'),separators=(',',':'))
    a['p']=a.n.str[:3].str.replace(' ','_')
    for p,g in a.groupby('p'):
        json.dump([[r.n,r.PHY_ZIPCD[:5],r.nb,r.PARCEL_ID] for r in g.sort_values('n').itertuples()],open(out+'i/'+p+'.json','w'),separators=(',',':'))
    json.dump({'county':cty,'class':'DOR_UC 001 single family','rows':len(a),'with_recent_qualified_sale':int((a.sp>0).sum()),'source':'Florida DOR PTO NAL roll 2026 (preliminary July roll except Orange: final)','generated':datetime.date.today().isoformat(),'excluded':['owner and fiduciary names and addresses (never read into output)','non single-family classes','unqualified or multi-parcel sales']},open(out+'manifest.json','w'),indent=1)
    print(cty,len(a),int((a.sp>0).sum()))
import sys
for k in (sys.argv[1:] or COUNTIES): run(k,COUNTIES[k])
