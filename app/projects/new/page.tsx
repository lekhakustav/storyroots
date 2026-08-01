import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { NewProjectForm } from '@/components/new-project-form';
import { getCurrentUser } from '@/lib/auth';
export default async function NewProjectPage() { const user = await getCurrentUser(); return <AppShell user={user} title="New story"><div className="content"><Link className="muted" href="/dashboard"><ArrowLeft size={16} style={{ verticalAlign: 'middle' }} /> Back to stories</Link><div className="page-heading" style={{ marginTop: 28 }}><div><div className="eyebrow">A gentle beginning</div><h1>Create a story project</h1><p className="muted">You can change any of this later. The storyteller stays in control.</p></div></div><div style={{ maxWidth: 620 }}><NewProjectForm /></div></div></AppShell>; }
