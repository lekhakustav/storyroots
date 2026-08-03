import { AppShell } from '@/components/app-shell';
import { StoryList } from '@/components/story-list';
import { getCurrentUser } from '@/lib/auth';
import { listProjects } from '@/lib/store';

export default async function StoriesPage() {
  const projects = listProjects(await getCurrentUser());
  return <AppShell><StoryList projects={projects} /></AppShell>;
}
