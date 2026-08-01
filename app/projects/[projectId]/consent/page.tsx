import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { ConsentForm } from '@/components/specialized';
import { getCurrentUser } from '@/lib/auth';
import { getProject } from '@/lib/store';
export default async function ConsentPage({ params }: { params: Promise<{ projectId: string }> }) { const user = await getCurrentUser(); const { projectId } = await params; const project = getProject(user, projectId); if (!project) notFound(); return <AppShell user={user} title="Consent"><div className="content"><Link className="muted" href={`/projects/${project.id}`}><ArrowLeft size={16} style={{ verticalAlign: 'middle' }} /> Back to {project.title}</Link><div className="page-heading" style={{ marginTop: 28 }}><div><div className="eyebrow">Before the first recording</div><h1>A clear yes, together</h1><p className="muted">Explain what will happen to {project.storytellerName}'s voice and words.</p></div></div><div style={{ maxWidth: 700 }}><ConsentForm project={project} /></div></div></AppShell>; }
