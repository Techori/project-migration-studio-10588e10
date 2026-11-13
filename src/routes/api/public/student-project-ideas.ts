import {createFileRoute} from '@tanstack/react-router';
export const Route=createFileRoute('/api/public/student-project-ideas')({
  staticData: { sitemap: false },server:{handlers:{POST:async({request})=>{
  const {studentProjectIdeas}=await import('@/lib/student-project-ideas.server');
  return studentProjectIdeas(request);
}}}});