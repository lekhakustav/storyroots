import { redirect } from 'next/navigation';
export default async function InterviewPage({ params }: { params: Promise<{ projectId: string; sessionId: string }> }) { redirect(`/projects/${(await params).projectId}`); }
