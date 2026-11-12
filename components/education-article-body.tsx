import { ReactNode } from "react";

const inlinePattern = /!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)|\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)|\*\*(.+?)\*\*|\*(.+?)\*/g;

function imageDetails(alt: string) {
  const match = alt.match(/^(.*)\|(\d{1,3})%$/);
  const width = match ? Math.min(100, Math.max(20, Number(match[2]))) : 100;
  return { alt: match ? match[1] : alt, width };
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;
  inlinePattern.lastIndex = 0;
  while ((match = inlinePattern.exec(text))) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));
    if (match[1] !== undefined) {
      const image = imageDetails(match[1]);
      nodes.push(<img key={`${keyPrefix}-${match.index}`} src={match[2]} alt={image.alt} style={{ width: `${image.width}%` }} className="my-4 h-auto max-h-[640px] max-w-full rounded-xl object-contain" loading="lazy" />);
    } else if (match[3] !== undefined) {
      nodes.push(<a key={`${keyPrefix}-${match.index}`} href={match[4]} target="_blank" rel="noreferrer" className="font-semibold text-teal-700 underline">{match[3]}</a>);
    } else if (match[5] !== undefined) {
      nodes.push(<strong key={`${keyPrefix}-${match.index}`}>{match[5]}</strong>);
    } else if (match[6] !== undefined) {
      nodes.push(<em key={`${keyPrefix}-${match.index}`}>{match[6]}</em>);
    }
    cursor = inlinePattern.lastIndex;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

export function EducationArticleBody({ body }: { body: string }) {
  const lines = body.replace(/\r/g, "").split("\n");
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  let listType: "ul" | "ol" | null = null;
  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(<p key={`p-${blocks.length}`} className="mb-4 leading-8">{paragraph.map((line, index) => <span key={index}>{index > 0 && <br />}{renderInline(line, `p-${blocks.length}-${index}`)}</span>)}</p>);
    paragraph = [];
  };
  const flushList = () => {
    if (!list.length || !listType) return;
    const List = listType;
    blocks.push(<List key={`list-${blocks.length}`} className={`${List === "ul" ? "list-disc" : "list-decimal"} mb-4 space-y-1 pl-6 leading-7`}>{list.map((item, index) => <li key={index}>{renderInline(item, `list-${blocks.length}-${index}`)}</li>)}</List>);
    list = [];
    listType = null;
  };

  for (const line of lines) {
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    const unordered = line.match(/^\s*[-*]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    const image = line.match(/^!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)$/);
    if (heading || unordered || ordered || image || !line.trim()) {
      flushParagraph();
      if (!unordered && !ordered) flushList();
      if (heading) {
        const level = heading[1].length;
        const className = level === 1 ? "mb-3 mt-7 text-2xl font-black" : level === 2 ? "mb-3 mt-6 text-xl font-black" : "mb-2 mt-5 text-lg font-bold";
        const Heading = `h${level}` as "h1" | "h2" | "h3";
        blocks.push(<Heading key={`h-${blocks.length}`} className={className}>{renderInline(heading[2], `h-${blocks.length}`)}</Heading>);
      } else if (image) {
        const details = imageDetails(image[1]);
        blocks.push(<img key={`img-${blocks.length}`} src={image[2]} alt={details.alt} style={{ width: `${details.width}%` }} className="my-5 h-auto max-h-[640px] max-w-full rounded-xl object-contain" loading="lazy" />);
      } else if (unordered || ordered) {
        const nextType = unordered ? "ul" : "ol";
        if (listType && listType !== nextType) flushList();
        listType = nextType;
        list.push((unordered ?? ordered)![1]);
      }
      continue;
    }
    paragraph.push(line);
  }
  flushParagraph();
  flushList();
  return <div className="break-words text-slate-700">{blocks.length ? blocks : <p className="whitespace-pre-wrap leading-8">{body}</p>}</div>;
}
