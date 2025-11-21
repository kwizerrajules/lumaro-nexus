const cache: Record<string, HTMLImageElement> = {};

export function loadImage(url: string): Promise<HTMLImageElement> {
  if (cache[url]) return Promise.resolve(cache[url]);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;

    img.onload = () => {
      cache[url] = img;
      resolve(img);
    };

    img.onerror = reject;
  });
}

export function getImage(url: string) {
  return cache[url];
}
