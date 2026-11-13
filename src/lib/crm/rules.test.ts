import { describe,it,expect } from 'vitest';
import { visibleOwner, progress, stages } from './rules';
const members=[{user_id:'bde',role:'BDE',manager_id:'bdm',active:true},{user_id:'bdm',role:'BDM',manager_id:null,active:true},{user_id:'other',role:'BDE',manager_id:'other-bdm',active:true}];
describe('CRM access rules',()=>{
  it('BDE sees own work but never another employee',()=>{expect(visibleOwner('bde','BDE','bde',members)).toBe(true);expect(visibleOwner('bde','BDE','other',members)).toBe(false);});
  it('BDM sees assigned team but not another team',()=>{expect(visibleOwner('bdm','BDM','bde',members)).toBe(true);expect(visibleOwner('bdm','BDM','other',members)).toBe(false);});
  it('inactive staff loses own access',()=>expect(visibleOwner('bde','BDE','bde',members.map(m=>({...m,active:false})))).toBe(false));
  it('admin sees all employees',()=>expect(visibleOwner('admin','admin','other',members)).toBe(true));
  it('targets track concrete achievements without dividing by zero',()=>{expect(progress(25,100)).toBe(25);expect(progress(120,100)).toBe(100);expect(progress(5,0)).toBe(0);});
  it('pipeline includes won and lost outcomes',()=>{expect(stages).toEqual(['new','contacted','qualified','proposal','won','lost']);});
});