const SLIDE_HEADER_RE = /^###\s+(\d+)\.\s+(.+?)\s*$/;
const LAYOUT_HINT_RE = /^\*\*Layout hint:\*\*\s*(\S+)/;

export function parseStory(md) {
  const lines = md.split(/\r?\n/);
  const slides = [];
  let current = null;

  for (const line of lines) {
    const header = line.match(SLIDE_HEADER_RE);
    if (header) {
      if (current) slides.push(current);
      const titleRaw = header[2].trim();
      const isCover = /^cover$/i.test(titleRaw);
      current = {
        index: parseInt(header[1], 10),
        title: titleRaw.replace(/\*\*/g, ''),
        layoutHint: isCover ? 'cover' : null,
        contentTags: [],
        brief: ''
      };
      continue;
    }
    if (!current) continue;
    const hint = line.match(LAYOUT_HINT_RE);
    if (hint) {
      current.layoutHint = hint[1].trim();
      continue;
    }
    current.brief += line + '\n';
  }
  if (current) slides.push(current);
  return slides;
}
