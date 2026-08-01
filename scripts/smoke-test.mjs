const base = process.env.APP_URL || 'http://127.0.0.1:3000';
const checks = ['/api/health', '/api/projects'];
for (const path of checks) { const response = await fetch(`${base}${path}`); if (!response.ok) throw new Error(`${path} returned ${response.status}`); console.log(`PASS ${path}`); }
const projectBody = await (await fetch(`${base}/api/projects`)).json();
if (!Array.isArray(projectBody.projects) || projectBody.projects.length === 0) throw new Error('No seeded development project returned');
const project = projectBody.projects[0];
const page = await fetch(`${base}/projects/${project.id}`); if (!page.ok) throw new Error(`project page returned ${page.status}`);
const html = await page.text(); for (const text of ['Your family story', 'Generate PDF', 'Privacy note']) if (!html.includes(text)) throw new Error(`missing page text: ${text}`);
console.log('PASS project page and core controls');
