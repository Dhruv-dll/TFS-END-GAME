const GITHUB_OWNER = process.env.GITHUB_OWNER || "Dhruv-dll";
const GITHUB_REPO = process.env.GITHUB_REPO || "TFS_Final_3";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.warn(
    "GITHUB_TOKEN is not set - automatic commits to GitHub will be disabled",
  );
}

async function getFileSha(path: string): Promise<string | null> {
  if (!GITHUB_TOKEN) return null;
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodeURIComponent(
    path,
  )}?ref=${encodeURIComponent(GITHUB_BRANCH)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
    },
  });
  if (res.status === 200) {
    const json = await res.json();
    return json.sha;
  }
  return null;
}

export async function commitFileToGitHub(
  path: string,
  content: string,
  message: string,
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!GITHUB_TOKEN)
    return { success: false, error: "GITHUB_TOKEN not configured" };

  const existingSha = await getFileSha(path);

  const body: any = {
    message,
    content: Buffer.from(content).toString("base64"),
    branch: GITHUB_BRANCH,
  };
  if (existingSha) body.sha = existingSha;

  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodeURIComponent(
    path,
  )}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github+json",
    },
    body: JSON.stringify(body),
  });

  if (res.ok) {
    const json = await res.json();
    return { success: true, url: json.content?.html_url };
  }

  const text = await res.text();
  return { success: false, error: `GitHub API error: ${res.status} ${text}` };
}

export default commitFileToGitHub;
