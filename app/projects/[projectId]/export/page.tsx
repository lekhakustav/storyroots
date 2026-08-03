import { redirect } from 'next/navigation';
export default async function ExportPage({ params }: { params: Promise<{ projectId: string }> }) { redirect(`/projects/${(await params).projectId}`); }
