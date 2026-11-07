export function renewDemoTasks(s){
 let count=0;const now=Date.now();
 for(const t of s.tasks){
  if(/^seed-[0-5]$/.test(t.id)&&t.owner!=='me'&&!t.runner&&t.status==='open'&&t.deadline<=now){
   t.deadline=now+60*60000;
   t.history.push({text:'演示时限已刷新，原任务内容保留',time:now});count++;
  }
 }
 return count;
}
