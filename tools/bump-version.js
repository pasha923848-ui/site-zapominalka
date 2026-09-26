const fs=require('fs'),path=require('path');
const out=[];
(function walk(d){for(const f of fs.readdirSync(d)){const p=path.join(d,f);
 if(fs.statSync(p).isDirectory()){if(f==='files'||f==='tools')continue;walk(p);}
 else if(/\.(html|js|css|svg|webmanifest)$/.test(f))out.push(p.split(path.sep).join('/').replace(/^\.\//,''));}})('.');
const v=new Date().toISOString().slice(0,16).split('-').join('').split(':').join('').split('T').join('');
fs.writeFileSync('version.json',JSON.stringify({v,files:out},null,1));
console.log(v,out.length);
