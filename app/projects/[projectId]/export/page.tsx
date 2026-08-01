import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { ExportPanel } from '@/components/specialized';
import { getCurrentUser } from '@/lib/auth';
import { getProject } from '@/lib/store';
export default async function ExportPage({ params }: { params: Promise<{ projectId: string }> }) { const user = await getCurrentUser(); const { projectId } = await params; const project = getProject(user, projectId); if (!project) notFound(); return <AppShell user={user} title="Export"><div className="content"><Link className="muted" href={`/projects/${project.id}`}><ArrowLeft size={16} style={{ verticalAlign: 'middle' }} /> Back to {project.title}</Link><div className="page-heading" style={{ marginTop: 28 }}><div><div className="eyebrow">Private keepsake</div><h1>Export your story</h1><p className="muted">Make a PDF when the chapter feels right.</p></div></div><div style={{ maxWidth: 700 }}><ExportPanel project={project} /></div></div></AppShell>; }
