/* 浏览器本地架构配置；不调用远程服务。导出的原始数据与安全显示数据分开。 */
(() => {
'use strict';
const D=window.PIPI_DATA, rootIds=['robot','app','cloud','external','vision'], key='pipi-architecture-v1';
const clone=x=>JSON.parse(JSON.stringify(x));
const html=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const groups={access:'统一接入',perception:'感知与交互',teaching:'教学上下文与建议',decision:'辅助决策',support:'知识与基础服务'};
const iconNames=['grid','cloud','robot','app','globe','vision','voice','activity','steps','core','database','user','book','target','spark','gateway'];
const view=D.modules;Object.setPrototypeOf(view,null);let defaults=clone(view),raw,history=[],persistent=true,loadError='';
const placement={gateway:'access',vision:'perception',voice:'perception',activity:'teaching',step:'teaching',teaching:'teaching',core:'decision'};
for(const [id,m] of Object.entries(defaults)){m.parent='';m.group=placement[id]||'support';}
for(const [id,m] of Object.entries(defaults))for(const child of m.children)if(defaults[child])defaults[child].parent=id;
function validate(data){
 if(!data||data.schema!=='pipi-architecture/v1'||!data.modules||Array.isArray(data.modules)||typeof data.modules!=='object')throw Error('请选择导出的 PiPi 架构 JSON 文件。');
 const ids=Object.keys(data.modules);if(ids.length>250)throw Error('最多支持 250 个模块。');for(const id of rootIds)if(!Object.hasOwn(data.modules,id))throw Error('配置缺少系统入口：'+id);
 const result=Object.create(null);
 for(const id of ids){if(!/^[a-z][a-z0-9-]{0,63}$/.test(id)||['constructor','prototype','__proto__'].includes(id))throw Error('模块标识无效。');const m=data.modules[id];if(!m||typeof m!=='object')throw Error('模块内容无效。');const n={};for(const field of ['name','en','role','project','note','parent','group','icon','status']){const v=m[field]??'';if(typeof v!=='string'||v.length>6000)throw Error('字段格式或长度无效：'+field);n[field]=v.trim();}if(!n.name||!n.role)throw Error('模块名称与职责必填。');if(!Object.hasOwn(D.statuses,n.status))throw Error('模块状态无效。');if(!iconNames.includes(n.icon))n.icon='grid';if(!Object.hasOwn(groups,n.group))n.group='support';for(const field of ['input','output','dependencies','children']){if(!Array.isArray(m[field])||m[field].length>250||m[field].some(v=>typeof v!=='string'||v.length>2000))throw Error('列表格式无效：'+field);n[field]=[...new Set(m[field].map(v=>v.trim()).filter(Boolean))];}result[id]=n;}
 for(const [id,m] of Object.entries(result)){if(m.parent&&(m.parent===id||!Object.hasOwn(result,m.parent)))throw Error('所属模块无效：'+m.name);if(rootIds.includes(id)&&m.parent!==defaults[id].parent)throw Error('系统入口的所属层级不能改变。');for(const dep of m.dependencies)if(dep===id||!Object.hasOwn(result,dep))throw Error('依赖模块不存在或引用自身：'+m.name);const visited=new Set([id]);let parent=m.parent;while(parent){if(visited.has(parent))throw Error('所属层级形成了循环。');visited.add(parent);parent=result[parent].parent;}}
 // 以 parent 为层级依据；保留子模块顺序和纯文本组件，补全新增子节点。
 for(const [id,m] of Object.entries(result)){m.children=m.children.filter(c=>!Object.hasOwn(result,c)||result[c].parent===id);for(const [cid,child] of Object.entries(result))if(child.parent===id&&!m.children.includes(cid))m.children.push(cid);}
 return clone(result);
}
function sync(){for(const id of Object.keys(view))delete view[id];for(const [id,m] of Object.entries(raw)){const n=clone(m);for(const field of ['name','en','role','project','note'])n[field]=html(n[field]);for(const field of ['input','output','children'])n[field]=n[field].map(v=>Object.hasOwn(raw,v)?v:html(v));view[id]=n;}}
function persist(){try{localStorage.setItem(key,JSON.stringify({schema:'pipi-architecture/v1',modules:raw}));persistent=true;}catch{persistent=false;}}
raw=clone(defaults);try{const text=localStorage.getItem(key);if(text)raw=validate(JSON.parse(text));}catch(e){loadError='本地配置无法加载，已使用项目默认架构。';if(e instanceof SyntaxError||e.message?.includes('配置')||e.message?.includes('模块')){}else persistent=false;}
sync();
function commit(next){const valid=validate({schema:'pipi-architecture/v1',modules:next});history.push(clone(raw));if(history.length>20)history.shift();raw=valid;sync();persist();}
function remove(id,base=raw){if(rootIds.includes(id))throw Error('系统入口可编辑，保留其导航位置。');if(!raw[id])return;const next=clone(base),parent=next[id].parent,children=Object.entries(next).filter(([,m])=>m.parent===id).map(([k])=>k);for(const [mid,m] of Object.entries(next)){m.dependencies=m.dependencies.filter(x=>x!==id);const index=m.children.indexOf(id);if(index>=0)m.children.splice(index,1,...(mid===parent?children:[]));if(m.parent===id)m.parent=parent;}delete next[id];commit(next);}
window.PIPI_STORE={groups,iconNames,rootIds,view,validate,commit,remove,html,get modules(){return raw;},get persistent(){return persistent;},get loadError(){return loadError;},get canUndo(){return history.length>0;},undo(){if(!history.length)return;raw=history.pop();sync();persist();},export(){return {schema:'pipi-architecture/v1',version:'V0.3',exportedAt:new Date().toISOString(),modules:clone(raw)};}};
})();
