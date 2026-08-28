export async function fetcher(url: string) {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    (error as any).status = res.status;
    throw error;
  }

  return res.json();
}
