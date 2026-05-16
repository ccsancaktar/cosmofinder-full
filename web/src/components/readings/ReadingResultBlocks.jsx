import { parseReadingSections } from "../../utils/readingParser";

export default function ReadingResultBlocks({ content, fallbackTitle = "Yorum" }) {
  const sections = parseReadingSections(content);

  if (!sections.length) {
    return (
      <div className="glass rounded-2xl border border-white/10 p-6">
        <p className="text-gray-300 whitespace-pre-line">{content || "Yorum bulunamadı."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {sections.map((section, index) => (
        <div
          key={`${section.title || "overview"}-${index}`}
          className="glass rounded-2xl border border-white/10 p-6 hover:border-primary/30 transition"
        >
          <h3 className="text-xl font-bold text-primary mb-4">
            {section.title || fallbackTitle}
          </h3>
          <div className="space-y-3">
            {section.body.map((paragraph, paragraphIndex) => (
              <p key={paragraphIndex} className="text-gray-200 leading-8 whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
