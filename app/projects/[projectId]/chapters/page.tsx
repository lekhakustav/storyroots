import { redirect } from 'next/navigation';
export default async function ChaptersPage({ params }: { params: Promise<{ projectId: string }> }) { redirect(`/projects/${(await params).projectId}`); }
