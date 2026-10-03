import pandas as pd, json, os, datetime
H=os.path.expanduser('~/dcad/'); OUT=os.path.expanduser('~/site/data/tx/dallas/')
def rd(f,cols): return pd.read_csv(H+f,usecols=cols,dtype=str,encoding='latin1')
ap=rd('ACCOUNT_APPRL_YEAR.CSV',['ACCOUNT_NUM','SPTD_CODE','DIVISION_CD','TOT_VAL','HMSTD_CAP_VAL','PREV_MKT_VAL'])
ap=ap[(ap.SPTD_CODE=='A11')&(ap.DIVISION_CD=='RES')]
inf=rd('ACCOUNT_INFO.CSV',['ACCOUNT_NUM','APPRAISAL_YR','STREET_NUM','FULL_STREET_NAME','PROPERTY_CITY','PROPERTY_ZIPCODE','NBHD_CD','EXCLUDE_OWNER'])
inf=inf[(inf.APPRAISAL_YR=='2026')&(inf.EXCLUDE_OWNER!='Y')]
rs=rd('RES_DETAIL.CSV',['ACCOUNT_NUM','TAX_OBJ_ID','YR_BUILT','TOT_LIVING_AREA_SF','CDU_RATING_DESC','PCT_COMPLETE'])
rs=rs.sort_values('TOT_LIVING_AREA_SF',key=lambda s:pd.to_numeric(s,errors='coerce').fillna(0),ascending=False).drop_duplicates('ACCOUNT_NUM')
ld=rd('LAND.CSV',['ACCOUNT_NUM','AREA_SIZE','AREA_UOM_DESC'])
ld['a']=pd.to_numeric(ld.AREA_SIZE,errors='coerce').fillna(0)
ld.loc[ld.AREA_UOM_DESC.str.contains('ACRE',na=False),'a']*=43560
ld.loc[~ld.AREA_UOM_DESC.fillna('').str.contains('SQUARE FEET|ACRE'),'a']=0
ld=ld.groupby('ACCOUNT_NUM').a.sum().reset_index()
d=ap.merge(inf,on='ACCOUNT_NUM').merge(rs,on='ACCOUNT_NUM',how='left').merge(ld,on='ACCOUNT_NUM',how='left')
for c in ['STREET_NUM','FULL_STREET_NAME','PROPERTY_CITY','PROPERTY_ZIPCODE','NBHD_CD','CDU_RATING_DESC']: d[c]=d[c].fillna('').str.strip()
n=lambda s: pd.to_numeric(s,errors='coerce').fillna(0).round().astype(int)
d['sf']=n(d.TOT_LIVING_AREA_SF);d['yr']=n(d.YR_BUILT);d['land']=n(d.a);d['mkt']=n(d.TOT_VAL);d['asd']=n(d.HMSTD_CAP_VAL);d['pr']=n(d.PREV_MKT_VAL)
d['addr']=(d.STREET_NUM+' '+d.FULL_STREET_NAME).str.replace(r'\s+',' ',regex=True).str.strip()
d=d[(d.STREET_NUM.str.len()>0)&(d.STREET_NUM!='0')&(d.addr.str.len()>4)&(d.mkt>0)&(d.NBHD_CD!='')]
d['n']=d.addr.str.upper().str.replace(r'[^A-Z0-9 ]','',regex=True)
d['acct']=d.ACCOUNT_NUM
d['qa']=d.CDU_RATING_DESC
print('rows',len(d))
for nb,g in d.groupby('NBHD_CD'):
    rows=[[r.acct,r.addr,r.sf,r.yr,r.land,r.qa,r.mkt,r.asd,r.pr] for r in g.itertuples()]
    json.dump(rows,open(OUT+'n/'+nb.replace('/','_').replace(' ','_')+'.json','w'),separators=(',',':'))
d['p']=d.n.str[:3].str.replace(' ','_')
for p,g in d.groupby('p'):
    json.dump([[r.n,r.PROPERTY_ZIPCODE[:5],r.NBHD_CD.replace('/','_').replace(' ','_'),r.acct] for r in g.sort_values('n').itertuples()],open(OUT+'i/'+p+'.json','w'),separators=(',',':'))
json.dump({'county':'Dallas County, TX (Dallas CAD)','state_class':'A11 single-family residence','rows':len(d),'data_as_of':'2026-07-20 (certified roll)','tax_year':2026,
 'source':'Dallas Central Appraisal District certified data products, https://www.dallascad.org/dataproducts.aspx','generated':datetime.date.today().isoformat(),
 'excluded':['owner names (never read into output)','accounts flagged EXCLUDE_OWNER','non A11 classes','accounts without a street number']},open(OUT+'manifest.json','w'),indent=1)
