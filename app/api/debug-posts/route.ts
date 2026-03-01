import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cwd = process.cwd();
  const envPosts = process.env.POSTS_DIR ?? '(not set)';

  const dirsToCheck = [
    envPosts,
    path.join(cwd, 'content', 'posts'),
    '/app/content/posts',
    path.join(cwd, '..', 'content', 'posts'),
  ];

  const results: Record<string, string[]|string> = {
    cwd,
    POSTS_DIR_env: envPosts,
  };

  for (const dir of dirsToCheck) {
    try {
      if (fs.existsSync(dir)) {
        results[dir] = fs.readdirSync(dir);
      } else {
        results[dir] = 'NOT FOUND';
      }
    } catch (e: unknown) {
      results[dir] = `ERROR: ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  return NextResponse.json(results);
}
