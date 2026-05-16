export const cleanLine = (line = "") =>
  String(line)
    .replace(/\*\*/g, "")
    .replace(/^#+\s*/, "")
    .replace(/^[-•]\s*/, "")
    .trim();

export const parseReadingSections = (content = "") => {
  if (!content) return [];

  const sections = [];
  let current = null;

  content.split("\n").forEach((rawLine) => {
    const line = cleanLine(rawLine);
    if (!line) return;

    const headingMatch = line.match(/^([^\w\s]|[\u2190-\u2BFF\uD83C-\uDBFF\uDC00-\uDFFF].*)\s+(.+)$/u);
    const isLikelyHeading =
      /^(👼|⚡|🔮|✨|❤️|🗣️|🌗|🔢|🌙|💼)/u.test(line) ||
      /^[A-ZÇĞİÖŞÜ\s]{6,}$/u.test(line) ||
      /^[A-ZÄÖÜẞ\s]{6,}$/u.test(line);

    if (isLikelyHeading && line.length < 90) {
      if (current) sections.push(current);
      current = { title: line, body: [] };
      return;
    }

    if (!current) {
      current = { title: "", body: [] };
    }
    current.body.push(line);
  });

  if (current) sections.push(current);
  return sections.filter((section) => section.title || section.body.length > 0);
};
