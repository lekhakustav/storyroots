import { redirect } from 'next/navigation';
export default async function ChapterPage({ params }: { params: Promise<{ projectId: string; chapterId: string }> }) { redirect(`/projects/${(await params).projectId}`); }
