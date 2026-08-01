import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { TimelineReview } from '@/components/specialized';
import { getCurrentUser } from '@/lib/auth';
import { getProject } from '@/lib/store';
export default async function TimelinePage({ params }: { params: Promise<{ projectId: string }> }) { const user = await getCurrentUser(); const { projectId } = await params; const project = getProject(user, projectId); if (!project) notFound(); return <AppShell user={user} title="Timeline"><div className="content"><Link className="muted" href={`/projects/${project.id}`}><ArrowLeft size={16} style={{ verticalAlign: 'middle' }} /> Back to {project.title}</Link><div className="page-heading" style={{ marginTop: 28 }}><div><div className="eyebrow">Evidence review</div><h1>Timeline & people</h1><p className="muted">Confirm only what the storyteller truly said.</p></div></div><TimelineReview project={project} /></div></AppShell>; }
