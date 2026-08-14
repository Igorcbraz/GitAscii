export interface TechItem {
  id: string
  name: string
  category: 'languages' | 'frontend' | 'backend' | 'devops'
}

export const TECH_CATALOG: TechItem[] = [
  { id: 'js', name: 'JavaScript', category: 'languages' },
  { id: 'ts', name: 'TypeScript', category: 'languages' },
  { id: 'html', name: 'HTML5', category: 'languages' },
  { id: 'css', name: 'CSS3', category: 'languages' },
  { id: 'py', name: 'Python', category: 'languages' },
  { id: 'rust', name: 'Rust', category: 'languages' },
  { id: 'go', name: 'Go', category: 'languages' },
  { id: 'cpp', name: 'C++', category: 'languages' },
  { id: 'cs', name: 'C#', category: 'languages' },
  { id: 'c', name: 'C', category: 'languages' },
  { id: 'java', name: 'Java', category: 'languages' },
  { id: 'php', name: 'PHP', category: 'languages' },
  { id: 'ruby', name: 'Ruby', category: 'languages' },
  { id: 'kotlin', name: 'Kotlin', category: 'languages' },
  { id: 'swift', name: 'Swift', category: 'languages' },
  { id: 'dart', name: 'Dart', category: 'languages' },
  { id: 'bash', name: 'Bash', category: 'languages' },
  { id: 'graphql', name: 'GraphQL', category: 'languages' },
  { id: 'r', name: 'R', category: 'languages' },
  { id: 'elixir', name: 'Elixir', category: 'languages' },
  { id: 'solidity', name: 'Solidity', category: 'languages' },
  { id: 'haskell', name: 'Haskell', category: 'languages' },

  { id: 'react', name: 'React', category: 'frontend' },
  { id: 'nextjs', name: 'Next.js', category: 'frontend' },
  { id: 'vue', name: 'Vue.js', category: 'frontend' },
  { id: 'nuxt', name: 'Nuxt', category: 'frontend' },
  { id: 'angular', name: 'Angular', category: 'frontend' },
  { id: 'svelte', name: 'Svelte', category: 'frontend' },
  { id: 'tailwind', name: 'Tailwind', category: 'frontend' },
  { id: 'bootstrap', name: 'Bootstrap', category: 'frontend' },
  { id: 'sass', name: 'Sass', category: 'frontend' },
  { id: 'flutter', name: 'Flutter', category: 'frontend' },
  { id: 'reactnative', name: 'React Native', category: 'frontend' },
  { id: 'redux', name: 'Redux', category: 'frontend' },
  { id: 'threejs', name: 'Three.js', category: 'frontend' },
  { id: 'vite', name: 'Vite', category: 'frontend' },
  { id: 'astro', name: 'Astro', category: 'frontend' },
  { id: 'solidjs', name: 'SolidJS', category: 'frontend' },
  { id: 'remix', name: 'Remix', category: 'frontend' },
  { id: 'recoil', name: 'Recoil', category: 'frontend' },
  { id: 'zustand', name: 'Zustand', category: 'frontend' },

  { id: 'nodejs', name: 'Node.js', category: 'backend' },
  { id: 'express', name: 'Express', category: 'backend' },
  { id: 'nest', name: 'NestJS', category: 'backend' },
  { id: 'django', name: 'Django', category: 'backend' },
  { id: 'fastapi', name: 'FastAPI', category: 'backend' },
  { id: 'flask', name: 'Flask', category: 'backend' },
  { id: 'spring', name: 'Spring', category: 'backend' },
  { id: 'laravel', name: 'Laravel', category: 'backend' },
  { id: 'postgres', name: 'PostgreSQL', category: 'backend' },
  { id: 'mongodb', name: 'MongoDB', category: 'backend' },
  { id: 'mysql', name: 'MySQL', category: 'backend' },
  { id: 'redis', name: 'Redis', category: 'backend' },
  { id: 'supabase', name: 'Supabase', category: 'backend' },
  { id: 'firebase', name: 'Firebase', category: 'backend' },
  { id: 'prisma', name: 'Prisma', category: 'backend' },
  { id: 'bun', name: 'Bun', category: 'backend' },
  { id: 'deno', name: 'Deno', category: 'backend' },
  { id: 'sqlite', name: 'SQLite', category: 'backend' },

  { id: 'git', name: 'Git', category: 'devops' },
  { id: 'github', name: 'GitHub', category: 'devops' },
  { id: 'gitlab', name: 'GitLab', category: 'devops' },
  { id: 'docker', name: 'Docker', category: 'devops' },
  { id: 'kubernetes', name: 'Kubernetes', category: 'devops' },
  { id: 'aws', name: 'AWS', category: 'devops' },
  { id: 'gcp', name: 'GCP', category: 'devops' },
  { id: 'azure', name: 'Azure', category: 'devops' },
  { id: 'vercel', name: 'Vercel', category: 'devops' },
  { id: 'netlify', name: 'Netlify', category: 'devops' },
  { id: 'linux', name: 'Linux', category: 'devops' },
  { id: 'figma', name: 'Figma', category: 'devops' },
  { id: 'postman', name: 'Postman', category: 'devops' },
  { id: 'vscode', name: 'VS Code', category: 'devops' },
  { id: 'terraform', name: 'Terraform', category: 'devops' },
  { id: 'githubactions', name: 'GitHub Actions', category: 'devops' },
  { id: 'jest', name: 'Jest', category: 'devops' },
  { id: 'vitest', name: 'Vitest', category: 'devops' },
]

export function getTechInfo(key: string): { id: string; name: string } {
  const normalized = key.toLowerCase().trim()
  const found = TECH_CATALOG.find(
    (t) => t.id.toLowerCase() === normalized || t.name.toLowerCase() === normalized
  )
  if (found) {
    return { id: found.id, name: found.name }
  }
  return {
    id: normalized.replace(/[^a-z0-9]/g, ''),
    name: key,
  }
}
