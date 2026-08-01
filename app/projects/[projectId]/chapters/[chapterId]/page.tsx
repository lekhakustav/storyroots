import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { ChapterEditor } from '@/components/specialized';
import { getCurrentUser } from '@/lib/auth';
import { getProject } from '@/lib/store';
export default async function ChapterPage({ params }: { params: Promise<{ projectId: string; chapterId: string }> }) { const user = await getCurrentUser(); const { projectId, chapterId } = await params; const project = getProject(user, projectId); if (!project || !project.chapters.some((chapter) => chapter.id === chapterId)) notFound(); return <AppShell user={user} title="Chapter editor"><div className="content"><Link className="muted" href={`/projects/${projectId}/chapters`}><ArrowLeft size={16} style={{ verticalAlign: 'middle' }} /> All chapters</Link><div className="page-heading" style={{ marginTop: 28 }}><div><div className="eyebrow">{project.title}</div><h1>Chapter editor</h1><p className="muted">Your edits are saved before approval.</p></div></div><ChapterEditor project={project} /></div></AppShell>; }
