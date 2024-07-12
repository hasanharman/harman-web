async function getData(url: string) {
  const res = await fetch(url, {
    method: "GET",
  });
  if (!res.ok) {
    throw new Error(`Error fetching data from Unsplash: ${res.statusText}`);
  }
  return await res.json();
}

export async function getStats() {
  const base_url = "https://api.unsplash.com/users/haskup/statistics";
  const url = `${base_url}?client_id=${process.env.UNSPLASH_ACCESS_KEY}`;
  return await getData(url);
}

export async function getPhotos(per_page = 50) {
  const base_url = "https://api.unsplash.com/users/haskup/photos";
  const url = `${base_url}?per_page=${per_page}&client_id=${process.env.UNSPLASH_ACCESS_KEY}`;
  return await getData(url);
}
