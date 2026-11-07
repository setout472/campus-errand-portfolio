export const TYPES=['快递代取','好物代买','打印跑腿','校园互助'];
export const STATUS={open:'待接单',accepted:'进行中',delivered:'待确认',completed:'待评价',reviewed:'已完成',cancelled:'已取消'};
const uid=()=>globalThis.crypto.randomUUID();
const clean=(v,max)=>String(v??'').trim().slice(0,max);
export function createState(){
 const now=Date.now();
 const rows=[
 ['北门有个小快递，求顺路带回','快递代取','北门菜鸟驿站','8 号宿舍楼下',3,'林同学','北校区',30,'一个轻便的书籍包裹，大约 500g。送到楼下即可，我会下来拿。取件信息在接单后协商。',96],
 ['续命咖啡！想要一杯冰美式','好物代买','一食堂 · 青禾咖啡','图书馆南门',4,'陈同学','中心区',45,'中杯、少冰、不加糖。商品费用另行协商，感谢金仅为跑腿酬谢。',92],
 ['课程报告打印，帮送到明理楼','打印跑腿','文印中心','明理楼 A102',5,'周同学','中心区',60,'共 12 页，黑白双面打印。请不要在公开任务中上传包含隐私的材料。打印费另计。',98],
 ['帮把落下的课本带回宿舍','校园互助','第三教学楼门口','3 号宿舍楼下',2,'许同学','南校区',90,'朋友会在教学楼门口交接一本高等数学教材。谢谢顺路的同学！',90],
 ['一食堂顺路带份晚饭','好物代买','一食堂一楼','6 号宿舍楼下',4,'叶同学','南校区',40,'想要一份番茄鸡蛋盖饭，不放辣。餐费另计，先沟通再购买。',95],
 ['借用一把伞，明天原路送还','校园互助','图书馆东门','图书馆东门',0,'夏同学','中心区',50,'突然下雨没带伞。如果你有多余的雨伞，可以在图书馆门口交接，约好归还时间。',94]
 ];
 return {version:2,tasks:rows.map((r,i)=>({id:'seed-'+i,title:r[0],type:r[1],from:r[2],to:r[3],price:r[4],name:r[5],area:r[6],deadline:now+r[7]*60000,description:r[8],ownerCredit:r[9],owner:'student-'+i,runner:null,status:'open',created:now-i*180000,history:[{text:'任务发布，等待顺路的同学',time:now-i*180000}]})),ledger:[],messages:[{id:uid(),title:'欢迎来到搭把手',text:'这里是免登录演示空间。所有任务与信用均为示例，你的操作仅保存在当前浏览器。',time:now,read:false}],notes:[],favorites:[]};
}
export function publish(s,data){
 const title=clean(data.title,50),from=clean(data.from,40),to=clean(data.to,40),price=Number(data.price),minutes=Number(data.minutes);
 if(!title||!from||!to)throw Error('请填写任务标题、出发地点和送达地点');
 if(!Number.isFinite(price)||price<0||price>200)throw Error('感谢金请填写 0～200 元');
 if(!Number.isFinite(minutes)||minutes<10||minutes>1440)throw Error('时限请设置为 10～1440 分钟');
 if(!TYPES.includes(data.type))throw Error('请选择任务分类');
 const now=Date.now(),t={id:uid(),title,from,to,price,type:data.type,area:['北校区','中心区','南校区'].includes(data.area)?data.area:'中心区',description:clean(data.description,300),owner:'me',name:'我',ownerCredit:credit(s),runner:null,status:'open',deadline:now+minutes*60000,created:now,history:[{text:'我发布了任务',time:now}]};
 s.tasks.unshift(t);message(s,'发布成功',`「${title}」已进入任务大厅。`,t.id);return t;
}
export function message(s,title,text,taskId){s.messages.unshift({id:uid(),title,text,taskId,time:Date.now(),read:false});s.messages=s.messages.slice(0,100)}
export function transition(s,id,action,actor,data={}){
 const t=s.tasks.find(t=>t.id===id);if(!t)throw Error('任务不存在');let text;
 if(action==='accept'){
  if(t.status!=='open')throw Error('这个任务已经被接走或结束了');if(t.deadline<=Date.now())throw Error('任务已超时，请选择其他任务');if(actor===t.owner)throw Error('请选择其他同学发布的任务');
  t.status='accepted';t.runner=actor;text=actor==='me'?'我接下了任务':'演示同学接下了任务';
 }else if(action==='deliver'){
  if(t.status!=='accepted'||actor!==t.runner)throw Error('仅接单人可在进行中标记送达');t.status='delivered';text='接单人标记送达，等待发布者确认';
 }else if(action==='confirm'){
  if(t.status!=='delivered'||actor!==t.owner)throw Error('仅发布者可确认已送达任务');t.status='completed';text='发布者确认完成';
  if(t.runner==='me')s.ledger.unshift({id:t.id+'-complete',text:'完成任务 · '+t.title,points:3,time:Date.now()});
 }else if(action==='review'){
  if(t.status!=='completed'||actor!==t.owner)throw Error('完成确认后，由发布者评价');const rating=Number(data.rating);if(!Number.isInteger(rating)||rating<1||rating>5)throw Error('请选择 1～5 星评价');
  t.rating=rating;t.comment=clean(data.comment,200);t.status='reviewed';text=`发布者给出 ${rating} 星评价`;
  if(t.runner==='me'&&rating>=4)s.ledger.unshift({id:t.id+'-review',text:'收到好评 · '+t.title,points:2,time:Date.now()});
 }else if(action==='cancel'){
  if(t.status!=='open'||actor!==t.owner)throw Error('仅可撤销自己尚未被接单的任务');t.status='cancelled';text='发布者撤销任务';
 }else throw Error('未知操作');
 t.history.push({text,time:Date.now()});message(s,text,`「${t.title}」${STATUS[t.status]}。`,t.id);return t;
}
export function credit(s){return Math.min(100,Math.max(0,80+s.ledger.reduce((sum,e)=>sum+e.points,0)))}
export function selectTasks(s,f={}){
 let a=s.tasks.filter(t=>t.status==='open');if(f.type&&f.type!=='全部')a=a.filter(t=>t.type===f.type);
 if(f.area&&f.area!=='全部校区')a=a.filter(t=>t.area===f.area);
 const q=String(f.query||'').trim().toLowerCase();if(q)a=a.filter(t=>(t.title+t.from+t.to+t.description).toLowerCase().includes(q));
 if(f.favorites)a=a.filter(t=>s.favorites.includes(t.id));
 if(f.sort==='price')a.sort((a,b)=>b.price-a.price);else if(f.sort==='deadline')a.sort((a,b)=>a.deadline-b.deadline);else a.sort((a,b)=>b.created-a.created);return a;
}
export function restore(raw){try{const s=JSON.parse(raw);if(s?.version!==2||!Array.isArray(s.tasks)||!Array.isArray(s.ledger)||!Array.isArray(s.messages)||!Array.isArray(s.notes)||!Array.isArray(s.favorites))throw Error();if(s.tasks.some(t=>!t||typeof t.id!=='string'||typeof t.name!=='string'||typeof t.owner!=='string'||typeof t.description!=='string'||typeof t.title!=='string'||typeof t.from!=='string'||typeof t.to!=='string'||!TYPES.includes(t.type)||!STATUS[t.status]||!Number.isFinite(t.price)||!Number.isFinite(t.deadline)||!Array.isArray(t.history)))throw Error();if(s.ledger.some(e=>!e||!Number.isFinite(e.points)))throw Error();if(s.messages.some(m=>!m||typeof m.title!=='string'||typeof m.text!=='string')||s.notes.some(n=>!n||typeof n.text!=='string')||s.tasks.some(t=>t.history.some(h=>!h||typeof h.text!=='string')))throw Error();return s}catch{return createState()}}
export function migrate(raw){const s=createState();try{const old=JSON.parse(raw);if(!Array.isArray(old)||!old.length)return s;const valid=old.filter(t=>t&&typeof t.title==='string'&&typeof t.from==='string'&&typeof t.to==='string'&&TYPES.includes(t.type)&&Number.isFinite(Number(t.price)));if(valid.length)s.tasks=valid.map((t,i)=>({id:'legacy-'+i,title:t.title.slice(0,50),from:t.from.slice(0,40),to:t.to.slice(0,40),type:t.type,price:Number(t.price),owner:t.name==='我发布的'?'me':'legacy-owner-'+i,name:t.name||'同学',ownerCredit:90,runner:t.status?'me':null,status:t.status==='done'?'completed':t.status==='accepted'?'accepted':'open',area:'中心区',description:'从首版原型保留的任务。',deadline:Date.now()+3600000,created:Date.now()-i*60000,history:[{text:'从首版导入任务',time:Date.now()}]}));}catch{}return s}

