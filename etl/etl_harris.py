import pandas as pd, json, re, os, hashlib, datetime
H=os.path.expanduser('~/hcad/'); OUT=os.path.expanduser('~/site/data/tx/harris/')
cols=['acct','state_class','site_addr_1','site_addr_3','Neighborhood_Code','bld_ar','land_ar','yr_impr','tot_mkt_val','assessed_val','prior_tot_mkt_val','value_status']
out=[]
for c in pd.read_csv(H+'real_acct.txt',sep='\t',usecols=cols,dtype=str,quoting=3,encoding='latin1',chunksize=200000):
    out.append(c[c.state_class.str.strip()=='A1'])
a=pd.concat(out)
for c in a.columns: a[c]=a[c].fillna('').str.strip()
a=a[(a.site_addr_1.str.len()>3)&(~a.site_addr_1.str.startswith('0 '))&(a.value_status!='All Values Pending')]
num=lambda s: pd.to_numeric(s,errors='coerce').fillna(0).astype(int)
for c in ['bld_ar','land_ar','yr_impr','tot_mkt_val','assessed_val','prior_tot_mkt_val']: a[c]=num(a[c])
q=[]
for c in pd.read_csv(H+'building_res.txt',sep='\t',usecols=['acct','bld_num','impr_tp','qa_cd'],dtype=str,quoting=3,encoding='latin1',chunksize=300000):
    c=c[(c.bld_num.str.strip()=='1')&(c.impr_tp.str.strip()=='1001')]; q.append(c[['acct','qa_cd']])
q=pd.concat(q); q['acct']=q.acct.str.strip(); q['qa_cd']=q.qa_cd.str.strip(); q=q.drop_duplicates('acct')
a=a.merge(q,on='acct',how='left'); a['qa_cd']=a.qa_cd.fillna('')
a['n']=a.site_addr_1.str.upper().str.replace(r'[^A-Z0-9 ]','',regex=True).str.replace(r'\s+',' ',regex=True)
a=a[a.n.str.len()>3]
print('rows',len(a))
# nbhd shards
for nb,g in a.groupby('Neighborhood_Code'):
    rows=[[r.acct,r.site_addr_1.title() if False else r.site_addr_1,r.bld_ar,r.yr_impr,r.land_ar,r.qa_cd,r.tot_mkt_val,r.assessed_val,r.prior_tot_mkt_val] for r in g.itertuples()]
    json.dump(rows,open(OUT+'n/'+nb.replace('/','_')+'.json','w'),separators=(',',':'))
# index by 3-char prefix: [normalized addr, zip, nbhd, acct]
a['p']=a.n.str[:3].str.replace(' ','_')
for p,g in a.groupby('p'):
    json.dump([[r.n,r.site_addr_3,r.Neighborhood_Code,r.acct] for r in g.sort_values('n').itertuples()],open(OUT+'i/'+p+'.json','w'),separators=(',',':'))
man={'county':'Harris County, TX','state_class':'A1 (single-family residential)','rows':len(a),'data_as_of':'2026-09-27','tax_year':2026,
 'source':'Harris Central Appraisal District PDATA bulk files (real_acct.txt, building_res.txt), https://hcad.org/hcad-online-services/pdata/','generated':datetime.date.today().isoformat(),
 'excluded':['owner names (never read into output)','parcels with all values pending','non A1 classes','accounts without a street address']}
json.dump(man,open(OUT+'manifest.json','w'),indent=1)
