// Test the exported behavior in the same lightweight DOM as the existing suite.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
class Element{constructor(){this.children=[];this.textContent='';this.value='';this.elements={namedItem:()=>new Element()}}append(...x){this.children.push(...x)}replaceChildren(){this.children=[]}addEventListener(){}scrollIntoView(){}reset(){}}
const els=new Map(),get=id=>{if(!els.has(id))els.set(id,new Element());return els.get(id)};get('viewMode').value='current';
const storage=new Map();const context=vm.createContext({document:{getElementById:get,createElement:()=>new Element()},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},crypto:require('crypto').webcrypto,URL,Intl,Date,console,FormData:class{},setTimeout,window:{scrollTo(){}},fetch:()=>new Promise(()=>{})});
vm.runInContext(fs.readFileSync('index.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1],context);const run=s=>vm.runInContext(s,context);context.feed=JSON.parse(fs.readFileSync('data/reality.json','utf8'));run('mergeFeed(feed,true);render();showFeedStatus()');
assert.equal(run('feedMetadata.comparables.length'),20);assert.equal(get('listingCards').children.length,10);assert.match(get('pipelineStatus').textContent,/zatím není doložen/);
assert.equal(run('median([1,9,3,5])'),4);assert.equal(run('median([9,1,5])'),5);
assert.equal(run('marketGroups(latestComparables(feedMetadata.comparables).filter(x=>!comparableReason(x))).reduce((s,g)=>s+g.n,0)'),15);
// Reserved, conditional and area-conflict offers are visible evidence but excluded from stats.
assert(run("comparableReason(comparableRecord(feedMetadata.comparables.find(x=>x.id==='sreality-369213516')))").length>0);
assert(run("comparableReason(comparableRecord(feedMetadata.comparables.find(x=>x.id==='sreality-2197606476')))").length>0);
assert.equal(run("latestComparables([...feedMetadata.comparables,...feedMetadata.comparables]).length"),20);
context.v={sale:8000000,renov:1000000,reserve:15,other:100000,loan:70,rate:6,months:6,monthly:10000,finance:20000,salePct:3,saleFixed:20000,target:20,goal:'roi'};
const result=run('dealMath(v)');assert(Math.abs(result.roiAtMax-20)<1e-9);assert(Math.abs(result.fixed-1590000)<1e-9);assert(Math.abs(result.max-((8000000/1.2-1590000)/1.021))<1e-7);
run("v.goal='profit';v.target=1000000");assert(Math.abs(run('dealMath(v).profitAtMax')-1000000)<1e-7);
assert.throws(()=>run('dealMath({...v,renov:null})'));assert.throws(()=>run('dealMath({...v,loan:101})'));
assert(run('dealMath({...v,sale:1}).max')<0);
assert.equal(run('dealMath({...v,loan:0,rate:0,months:0}).a'),0);
assert.equal(run("changeLabel({archived:false,priceHistory:[{date:'2026-10-30',price:5000000},{date:'2026-10-31',price:4500000}]}).startsWith('Zlevnění')"),true);
assert.equal(run("changeLabel({baseline:true,first_seen_at:new Date().toISOString()})"),'');
get('marketCity').value='Bakov nad Jizerou';run('renderMarket()');assert.match(get('marketCount').textContent,/2 platných/);
get('marketMin').value='90';get('marketMax').value='40';run('renderMarket()');assert.match(get('marketCount').textContent,/nesmí/);
console.log('PASS: sample medians, duplicate identity, filters, exclusions, dated metadata, financed ROI/profit limits, validation, negative limit, baseline/change labels');
