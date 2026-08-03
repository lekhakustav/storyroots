import { redirect } from 'next/navigation';
export default async function ConsentPage({ params }: { params: Promise<{ projectId: string }> }) { redirect(`/projects/${(await params).projectId}`); }
