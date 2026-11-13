import {describe,it,expect} from 'vitest';
import {projectIdeasSchema} from './student-project-ideas';
const valid={schoolClass:8,interests:'Gardening',skills:'Cardboard models',materials:'Bottles and string',consent:true};
describe('student project ideas',()=>{
 it('requires all three descriptions',()=>{expect(projectIdeasSchema.safeParse({...valid,materials:''}).success).toBe(false);expect(projectIdeasSchema.parse(valid).materials).toBe('Bottles and string');});
 it('requires guardian approval',()=>{expect(projectIdeasSchema.safeParse({...valid,consent:false}).success).toBe(false);});
 it('limits students to Classes 6–12',()=>{expect(projectIdeasSchema.safeParse({...valid,schoolClass:5}).success).toBe(false);expect(projectIdeasSchema.safeParse({...valid,schoolClass:13}).success).toBe(false);});
 it('rejects contact details before sending to AI',()=>{expect(projectIdeasSchema.safeParse({...valid,interests:'Email me at test@example.com'}).success).toBe(false);expect(projectIdeasSchema.safeParse({...valid,skills:'Call 9876543210'}).success).toBe(false);});
});