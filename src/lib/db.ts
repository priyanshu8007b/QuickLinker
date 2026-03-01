export type Link = {
  id: string;
  shortCode: string;
  originalUrl: string;
  createdAt: string;
  expireAt?: string;
  totalClicks: number;
};

export type Click = {
  id: string;
  linkId: string;
  clickedAt: string;
  referrer: string;
  deviceType: 'Mobile' | 'Desktop' | 'Tablet';
  ipHash: string;
};

// In-memory simulation of a DB for demo purposes
// In a real app, this would be Prisma/Postgres + Redis
const LINKS_KEY = 'quicklinker_links';
const CLICKS_KEY = 'quicklinker_clicks';

const getStorage = () => {
  if (typeof window === 'undefined') return { links: [], clicks: [] };
  const links = JSON.parse(localStorage.getItem(LINKS_KEY) || '[]');
  const clicks = JSON.parse(localStorage.getItem(CLICKS_KEY) || '[]');
  return { links, clicks };
};

const saveStorage = (links: Link[], clicks: Click[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LINKS_KEY, JSON.stringify(links));
  localStorage.setItem(CLICKS_KEY, JSON.stringify(clicks));
};

export function createLink(originalUrl: string, customAlias?: string, expireAt?: string): Link {
  const { links, clicks } = getStorage();
  
  const id = Math.random().toString(36).substring(2, 11);
  const shortCode = customAlias || generateShortCode(links.length + 1000);

  if (links.find((l: Link) => l.shortCode === shortCode)) {
    throw new Error('Short code already exists');
  }

  const newLink: Link = {
    id,
    shortCode,
    originalUrl: canonicalizeUrl(originalUrl),
    createdAt: new Date().toISOString(),
    expireAt,
    totalClicks: 0,
  };

  saveStorage([...links, newLink], clicks);
  return newLink;
}

export function getLinkByCode(shortCode: string): Link | undefined {
  const { links } = getStorage();
  return links.find((l: Link) => l.shortCode === shortCode);
}

export function recordClick(linkId: string, userAgent: string, referrer: string) {
  const { links, clicks } = getStorage();
  const linkIndex = links.findIndex((l: Link) => l.id === linkId);
  
  if (linkIndex === -1) return;

  const deviceType = userAgent.includes('Mobi') ? 'Mobile' : userAgent.includes('Tablet') ? 'Tablet' : 'Desktop';
  
  const newClick: Click = {
    id: Math.random().toString(36).substring(2, 11),
    linkId,
    clickedAt: new Date().toISOString(),
    referrer: referrer || 'Direct',
    deviceType,
    ipHash: 'anon_hash',
  };

  links[linkIndex].totalClicks += 1;
  saveStorage(links, [...clicks, newClick]);
}

export function getAnalytics(shortCode: string) {
  const { links, clicks } = getStorage();
  const link = links.find((l: Link) => l.shortCode === shortCode);
  if (!link) return null;

  const linkClicks = clicks.filter((c: Click) => c.linkId === link.id);
  
  // Aggregate daily clicks
  const dailyMap: Record<string, number> = {};
  linkClicks.forEach((c: Click) => {
    const date = c.clickedAt.split('T')[0];
    dailyMap[date] = (dailyMap[date] || 0) + 1;
  });

  const dailyClicks = Object.entries(dailyMap).map(([date, count]) => ({ date, clicks: count }));

  // Aggregate referrers
  const referrerMap: Record<string, number> = {};
  linkClicks.forEach((c: Click) => {
    referrerMap[c.referrer] = (referrerMap[c.referrer] || 0) + 1;
  });
  const referrers = Object.entries(referrerMap).map(([name, count]) => ({ name, count }));

  // Aggregate device types
  const deviceMap: Record<string, number> = {};
  linkClicks.forEach((c: Click) => {
    deviceMap[c.deviceType] = (deviceMap[c.deviceType] || 0) + 1;
  });
  const deviceTypes = Object.entries(deviceMap).map(([name, count]) => ({ name, count }));

  return {
    link,
    totalClicks: link.totalClicks,
    dailyClicks,
    referrers,
    deviceTypes
  };
}

export function getAllLinks(): Link[] {
  return getStorage().links;
}

function generateShortCode(num: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let str = "";
  while (num > 0) {
    str = chars[num % 62] + str;
    num = Math.floor(num / 62);
  }
  return str.padStart(6, '0');
}

function canonicalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.toString();
  } catch {
    return url.startsWith('http') ? url : `https://${url}`;
  }
}