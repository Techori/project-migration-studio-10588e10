import {useEffect,useState} from 'react';
import {supabase} from '@/integrations/supabase/client';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';

export function AccountProfileAdmin(){
 const [name,setName]=useState('');const [avatar,setAvatar]=useState('');const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);
 useEffect(()=>{void(async()=>{const {data}=await supabase.auth.getUser();if(!data.user)return;const {data:profile}=await supabase.from('profiles').select('display_name,avatar_url').eq('id',data.user.id).single();if(profile){setName(profile.display_name);setAvatar(profile.avatar_url);}})();},[]);
 async function save(e:React.FormEvent){e.preventDefault();setBusy(true);try{if(avatar&&!/^https:\/\//.test(avatar))throw new Error('Avatar link must use https.');const {data}=await supabase.auth.getUser();if(!data.user)throw new Error('Sign in first.');const {error}=await supabase.from('profiles').update({display_name:name,avatar_url:avatar}).eq('id',data.user.id);if(error)throw error;setMessage('Profile saved.');}catch{setMessage('Profile could not be saved. Check the avatar link and try again.');}finally{setBusy(false);}}
 return <section className="mt-8"><h2 className="text-2xl font-black uppercase">My account</h2><form onSubmit={e=>void save(e)} className="mt-6 grid max-w-lg gap-4"><Label htmlFor="profile-name">Display name</Label><Input id="profile-name" maxLength={120} value={name} onChange={e=>setName(e.target.value)}/><Label htmlFor="profile-avatar">Avatar link</Label><Input id="profile-avatar" type="url" maxLength={500} value={avatar} onChange={e=>setAvatar(e.target.value)}/><Button disabled={busy}>Save profile</Button>{message&&<p role="status" className="text-sm">{message}</p>}</form></section>;
}