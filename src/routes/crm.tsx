import { createFileRoute } from '@tanstack/react-router';
import { CrmWorkspace } from '@/components/crm/workspace';
export const Route=createFileRoute('/crm')({
 staticData:{sitemap:false},
 head:()=>({meta:[{title:'RILOYD CRM | Sales, Support & Team Targets'},{name:'description',content:'Private RILOYD employee workspace for sales leads, support tickets, team targets and follow-ups.'},{property:'og:title',content:'RILOYD CRM | Sales, Support & Team Targets'},{property:'og:description',content:'Private employee workspace for sales, customer support and team performance.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'},{name:'robots',content:'noindex'}]}),
 component:CrmWorkspace,
});