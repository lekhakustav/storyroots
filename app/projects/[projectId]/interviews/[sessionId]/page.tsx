import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { InterviewRoom } from '@/components/specialized';
import { getCurrentUser } from '@/lib/auth';
import { getInterview } from '@/lib/store';
export default async function InterviewPage({ params }: { params: Promise<{ projectId: string; sessionId: string }> }) { const user = await getCurrentUser(); const { projectId, sessionId } = await params; const found = getInterview(user, sessionId); if (!found || found.project.id !== projectId) notFound(); return <AppShell user={user} title={found.interview.title}><div className="content"><Link className="muted" href={`/projects/${projectId}/interviews`}><ArrowLeft size={16} style={{ verticalAlign: 'middle' }} /> All interviews</Link><div className="page-heading" style={{ marginTop: 28 }}><div><div className="eyebrow">{found.project.storytellerName} · 5–15 minutes</div><h1>{found.interview.title}</h1><p className="muted">One question at a time. Stop whenever the story feels complete for today.</p></div></div><InterviewRoom project={found.project} session={found.interview} /></div></AppShell>; }
