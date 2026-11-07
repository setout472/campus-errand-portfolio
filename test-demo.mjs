import assert from 'node:assert/strict';
import {renewDemoTasks} from './dist/demo.mjs';
const sample={id:'seed-0',owner:'student-0',runner:null,status:'open',deadline:0,history:[]};
const s={tasks:[sample,{...sample,id:'mine',owner:'me'},{...sample,id:'seed-1',status:'accepted',runner:'me'},{...sample,id:'seed-2',status:'reviewed'},{...sample,id:'seed-3',deadline:Date.now()+600000}]};
assert.equal(renewDemoTasks(s),1);assert.ok(sample.deadline>Date.now());assert.equal(s.tasks[1].deadline,0);assert.equal(s.tasks[2].deadline,0);assert.equal(s.tasks[3].deadline,0);assert.equal(renewDemoTasks(s),0);
console.log('DEMO PASS: only expired unclaimed samples renewed; user tasks and history retained');
