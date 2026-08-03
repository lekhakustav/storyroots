import { notFound } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { StoryFlow } from '@/components/story-flow';
import { getCurrentUser } from '@/lib/auth';
import { getProject } from '@/lib/store';

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const user = await getCurrentUser();
  const project = getProject(user, (await params).projectId);
  if (!project) notFound();
  return <AppShell><StoryFlow initialProject={project} /></AppShell>;
}
