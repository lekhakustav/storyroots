import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { ProjectFlow } from '@/components/project-flow';
import { getCurrentUser } from '@/lib/auth';
import { getProject } from '@/lib/store';

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) { const user = await getCurrentUser(); const { projectId } = await params; const project = getProject(user, projectId); if (!project) notFound(); return <AppShell user={user} title={project.title}><div className="content"><Link className="muted" href="/dashboard"><ArrowLeft size={16} style={{ verticalAlign: 'middle' }} /> All stories</Link><div className="page-heading" style={{ marginTop: 25 }}><div><div className="eyebrow">{project.storytellerRelationship} · {project.storytellerName}</div><h1>{project.title}</h1><p className="muted">Your family story, one memory at a time.</p></div><div className="action-row"><Link className="button secondary small" href={`/projects/${project.id}/timeline`}>Open timeline <ExternalLink size={14} /></Link></div></div><ProjectFlow initialProject={project} /></div></AppShell>; }
