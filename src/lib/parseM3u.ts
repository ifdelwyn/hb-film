export interface Channel {
  id: string;        // tvg-id hoặc slug từ tên
  name: string;
  group: string;
  streamUrl: string; // URL gốc, chưa proxy
  logo?: string;
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function parseM3u(content: string): Channel[] {
  const lines = content.split('\n');
  const channels: Channel[] = [];
  let currentInfo: {
    tvgId?: string;
    tvgName?: string;
    tvgLogo?: string;
    groupTitle?: string;
    displayName?: string;
  } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF:')) {
      // Parse EXTINF line
      const tvgIdMatch = line.match(/tvg-id="([^"]*)"/) || line.match(/tvg-id='([^']*)'/);
      const tvgNameMatch = line.match(/tvg-name="([^"]*)"/) || line.match(/tvg-name='([^']*)'/);
      const tvgLogoMatch = line.match(/tvg-logo="([^"]*)"/) || line.match(/tvg-logo='([^']*)'/);
      const groupTitleMatch = line.match(/group-title="([^"]*)"/) || line.match(/group-title='([^']*)'/);

      // Extract display name (text after the last comma)
      const commaIndex = line.lastIndexOf(',');
      let displayName = '';
      if (commaIndex !== -1) {
        displayName = line.substring(commaIndex + 1).trim();
      } else {
        displayName = tvgNameMatch ? tvgNameMatch[1] : 'Kênh truyền hình';
      }

      currentInfo = {
        tvgId: tvgIdMatch ? tvgIdMatch[1] : undefined,
        tvgName: tvgNameMatch ? tvgNameMatch[1] : undefined,
        tvgLogo: tvgLogoMatch ? tvgLogoMatch[1] : undefined,
        groupTitle: groupTitleMatch ? groupTitleMatch[1] : undefined,
        displayName: displayName,
      };
    } else if (line.startsWith('http://') || line.startsWith('https://')) {
      // This is the stream URL
      if (currentInfo) {
        const name = currentInfo.displayName || currentInfo.tvgName || 'Kênh truyền hình';
        const id = currentInfo.tvgId || slugify(name) || `channel-${channels.length + 1}`;
        const group = currentInfo.groupTitle || 'Khác';
        
        channels.push({
          id,
          name,
          group,
          streamUrl: line,
          logo: currentInfo.tvgLogo || undefined,
        });
        currentInfo = null;
      }
    }
  }

  return channels;
}
