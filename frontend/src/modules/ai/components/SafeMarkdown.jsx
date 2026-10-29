import { memo, useContext, useMemo } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { safeAnswerUrl, segmentText } from "../text";
import { RevealContext } from "./revealContext";

// Parse complete Markdown once. Only text leaves reveal; syntax/tables/links never
// become malformed half-Markdown, and no untrusted HTML is executed.
function annotateText() {
  return (tree) => {
    let offset = 0;
    function visit(node) {
      if (!node.children) return;
      node.children = node.children.map((child) => {
        if (child.type !== "text") { visit(child); return child; }
        const start = offset;
        offset += segmentText(child.value).length;
        return { type: "element", tagName: "span", properties: { dataAiStart: start }, children: [child] };
      });
    }
    visit(tree);
  };
}

function RevealSpan({ node, children }) {
  const limit = useContext(RevealContext);
  const text = typeof children === "string" ? children : String(children ?? "");
  const points = useMemo(() => segmentText(text), [text]);
  const start = node.properties.dataAiStart;
  if (typeof start !== "number") return <span>{children}</span>;
  return <span>{limit === Infinity ? text : points.slice(0, Math.max(0, limit - start)).join("")}</span>;
}

const components = {
  span: RevealSpan,
  a: ({ href, children }) => href
    ? <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
    : <span>{children}</span>,
  img: ({ alt }) => <span>{alt}</span>, // No remote image requests/tracking.
  table: ({ children }) => <div className="markdown-table"><table>{children}</table></div>,
};
const remarkPlugins = [remarkGfm];
const rehypePlugins = [annotateText];

const SafeMarkdown = memo(function SafeMarkdown({ text }) {
  return <div className="ai-markdown"><Markdown skipHtml urlTransform={safeAnswerUrl}
    remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins} components={components}>{text}</Markdown></div>;
});
export default SafeMarkdown;
