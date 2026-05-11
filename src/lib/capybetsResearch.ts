import { marked } from 'marked';

const REPO_OWNER = 'CapyStudio';
const REPO_NAME = 'CapyBets';
const TREE_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/trees/main?recursive=1`;
const CONTENTS_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents`;

export type DigestEntry = {
  topic: string;
  date: string;
  path: string;
};

export type ResearchTopic = {
  topic: string;
  label: string;
  count: number;
  latest: string;
};

type GitHubTreeItem = {
  path: string;
  type: string;
};

function getGitHubHeaders(): HeadersInit {
  const token = process.env.CAPYBETS_GITHUB_TOKEN ?? process.env.GITHUB_TOKEN;

  return {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function fetchGitHubJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: getGitHubHeaders() });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `GitHub request failed: ${res.status} ${res.statusText} for ${url}. ${body}`,
    );
  }

  return res.json() as Promise<T>;
}

function parseDigestPath(path: string): DigestEntry | null {
  const match = path.match(/^daily-digests\/([^/]+)\/(.+)-(\d{4}-\d{2}-\d{2})\.md$/);
  if (!match) return null;

  const [, topic, , date] = match;
  return { topic, date, path };
}

export function labelForTopic(topic: string): string {
  return topic.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
}

export async function listDigestEntries(): Promise<DigestEntry[]> {
  const data = await fetchGitHubJson<{ tree?: GitHubTreeItem[] }>(TREE_URL);

  return (data.tree ?? [])
    .filter((file) => file.type === 'blob')
    .map((file) => parseDigestPath(file.path))
    .filter((entry): entry is DigestEntry => entry !== null);
}

export async function listResearchTopics(): Promise<ResearchTopic[]> {
  const topicMap: Record<string, string[]> = {};

  for (const entry of await listDigestEntries()) {
    if (!topicMap[entry.topic]) topicMap[entry.topic] = [];
    topicMap[entry.topic].push(entry.date);
  }

  return Object.entries(topicMap)
    .map(([topic, dates]) => {
      const sorted = [...dates].sort().reverse();
      return {
        topic,
        label: labelForTopic(topic),
        count: dates.length,
        latest: sorted[0],
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}

export async function listDigestsForTopic(topic: string): Promise<DigestEntry[]> {
  return (await listDigestEntries())
    .filter((entry) => entry.topic === topic)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function renderDigestHtml(topic: string, date: string): Promise<string | null> {
  const filePath = (await listDigestEntries()).find(
    (entry) => entry.topic === topic && entry.date === date,
  )?.path;

  if (!filePath) return null;

  const fileData = await fetchGitHubJson<{ content?: string }>(`${CONTENTS_BASE}/${filePath}`);
  if (!fileData.content) return null;

  const raw = Buffer.from(fileData.content, 'base64').toString('utf-8');
  return marked(raw);
}
