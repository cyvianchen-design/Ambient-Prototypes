import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { PlaceholderConfigPopup, PlaceholderType } from "./PlaceholderConfigPopup";

export type TokenStyle = "link" | "chip" | "field";
export type TokenType = "text" | "dropdown" | "number";

// inline-block prevents token from wrapping mid-word; leading-[2] gives clearance for the box height
// background/border live in tokens.css (with :hover) — inline styles can't be overridden by :hover
const TOKEN_CSS: Record<TokenStyle, string> = {
  link: "color:var(--foreground-semantic-success);text-decoration:underline;text-decoration-color:var(--foreground-semantic-success);cursor:pointer;",
  chip: "display:inline-block;color:var(--accent);border-radius:6px;padding:0 5px 1px;margin:0 1px;line-height:20px;cursor:pointer;user-select:none;vertical-align:middle;",
  field: "display:inline-block;color:var(--accent);border-radius:6px;padding:0 5px 1px;margin:0 1px;line-height:20px;cursor:pointer;user-select:none;vertical-align:middle;",
};

// For dropdown tokens stored as "opt1/opt2/opt3", show "opt1 + N more" when > 2 options.
// Falls back to using "/" presence as a heuristic for tokens loaded from saved content.
function tokenDisplayText(name: string, type: TokenType | "text" = "text"): string {
  const isDropdown = type === "dropdown" || name.includes("/");
  if (!isDropdown) return name;
  const opts = name.split("/");
  if (opts.length <= 2) return name;
  return `${opts[0]} + ${opts.length - 1} more`;
}

function toHTML(content: string, style: TokenStyle): string {
  const css = TOKEN_CSS[style];
  return content
    .split("\n")
    .map((line) =>
      line
        .split(/(\[[^\]]+\])/g)
        .map((part) => {
          const m = part.match(/^\[([^\]]+)\]$/);
          if (m) {
            const name = m[1].replace(/"/g, "&quot;");
            return `<span contenteditable="false" data-token data-tokenstyle="${style}" data-name="${name}" data-type="text" style="${css}">${tokenDisplayText(m[1])}</span>`;
          }
          return part.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        })
        .join("")
    )
    .join("<br>");
}

function fromHTML(el: HTMLElement): string {
  let result = "";
  el.childNodes.forEach((node) => {
    if (node.nodeName === "BR") {
      result += "\n";
    } else if (node.nodeType === Node.TEXT_NODE) {
      result += node.textContent ?? "";
    } else if (node instanceof HTMLElement) {
      if (node.dataset.token !== undefined) {
        result += `[${node.dataset.name}]`;
      } else if (node.nodeName === "DIV" || node.nodeName === "P") {
        result += "\n" + fromHTML(node);
      } else {
        result += fromHTML(node);
      }
    }
  });
  return result;
}

export interface MacroContentEditorHandle {
  insertToken: (tokenName: string, type?: TokenType) => void;
}

type Props = {
  value: string;
  onChange: (v: string) => void;
  tokenStyle: TokenStyle;
  placeholder?: string;
  onSlashTrigger: (pos: { top: number; left: number }) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
};

export const MacroContentEditor = forwardRef<MacroContentEditorHandle, Props>(
  ({ value, onChange, tokenStyle, placeholder, onSlashTrigger, onKeyDown }, ref) => {
    const divRef = useRef<HTMLDivElement>(null);
    const slashRangeRef = useRef<Range | null>(null);
    const [editingToken, setEditingToken] = useState<HTMLElement | null>(null);
    const [isEmpty, setIsEmpty] = useState(!value);

    useEffect(() => {
      if (!divRef.current) return;
      divRef.current.innerHTML = toHTML(value, tokenStyle);
      setIsEmpty(!value);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
      if (!divRef.current) return;
      if (divRef.current.contains(document.activeElement)) return;
      divRef.current.innerHTML = toHTML(value, tokenStyle);
    }, [tokenStyle]); // eslint-disable-line react-hooks/exhaustive-deps

    useImperativeHandle(ref, () => ({
      insertToken(tokenName: string, type: TokenType = "text") {
        const range = slashRangeRef.current;
        if (!range || !divRef.current) return;

        const span = document.createElement("span");
        span.setAttribute("contenteditable", "false");
        span.setAttribute("data-token", "");
        span.setAttribute("data-tokenstyle", tokenStyle);
        span.setAttribute("data-name", tokenName);
        span.setAttribute("data-type", type);
        span.setAttribute("style", TOKEN_CSS[tokenStyle]);
        span.textContent = tokenDisplayText(tokenName, type);

        range.deleteContents();
        range.insertNode(span);

        // Auto-insert a space between the token and a following word character
        const nextNode = span.nextSibling;
        if (nextNode?.nodeType === Node.TEXT_NODE) {
          const text = nextNode.textContent ?? "";
          if (text.length > 0 && /[a-zA-Z]/.test(text[0])) {
            nextNode.textContent = " " + text;
          }
        }

        const newRange = document.createRange();
        newRange.setStartAfter(span);
        newRange.collapse(true);
        window.getSelection()?.removeAllRanges();
        window.getSelection()?.addRange(newRange);

        slashRangeRef.current = null;
        onChange(fromHTML(divRef.current));
        setIsEmpty(false);
      },
    }));

    const handleInput = () => {
      if (!divRef.current) return;
      const content = fromHTML(divRef.current);
      onChange(content);
      setIsEmpty(!content);

      const sel = window.getSelection();
      if (!sel?.rangeCount) return;
      const range = sel.getRangeAt(0);
      const node = range.startContainer;
      if (node.nodeType !== Node.TEXT_NODE || !node.textContent) return;
      const offset = range.startOffset;
      const charBefore = node.textContent[offset - 1];
      if (charBefore === "/") {
        const slashRange = range.cloneRange();
        slashRange.setStart(node, offset - 1);
        slashRange.setEnd(node, offset);
        slashRangeRef.current = slashRange;
        const rect = range.getBoundingClientRect();
        onSlashTrigger({ top: rect.bottom + 4, left: rect.left });
      }
    };

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      if (target.dataset?.token !== undefined) {
        e.preventDefault();
        setEditingToken(target);
      }
    };

    return (
      <>
        <div className="relative">
          <div
            ref={divRef}
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            onInput={handleInput}
            onClick={handleClick}
            onKeyDown={onKeyDown}
            className="w-full px-[12px] py-[8px] t-body-md leading-[1.6] text-[var(--foreground-primary)] bg-transparent outline-none"
            style={{ fontFamily: "Lato, sans-serif", minHeight: "105px", wordBreak: "break-word" }}
          />
          {isEmpty && (
            <div
              className="absolute top-0 left-0 px-[12px] py-[8px] t-body-md leading-[2] text-[var(--foreground-tertiary)] pointer-events-none select-none"
              style={{ fontFamily: "Lato, sans-serif" }}
            >
              {placeholder}
            </div>
          )}
        </div>

        {editingToken && (
          <PlaceholderConfigPopup
            type={(editingToken.dataset.type as PlaceholderType) ?? "text"}
            isEditing
            initialDefaultValue={editingToken.dataset.name ?? ""}
            onClose={() => setEditingToken(null)}
            onAdd={(token, type) => {
              const name = token.slice(1, -1);
              editingToken.setAttribute("data-name", name);
              editingToken.setAttribute("data-type", type);
              editingToken.setAttribute("data-tokenstyle", tokenStyle);
              editingToken.textContent = tokenDisplayText(name, type);
              editingToken.setAttribute("style", TOKEN_CSS[tokenStyle]);
              setEditingToken(null);
              if (divRef.current) onChange(fromHTML(divRef.current));
            }}
            onDelete={() => {
              editingToken.remove();
              setEditingToken(null);
              if (divRef.current) {
                const content = fromHTML(divRef.current);
                onChange(content);
                setIsEmpty(!content);
              }
            }}
            onConvertToPlainText={() => {
              const textNode = document.createTextNode(editingToken.dataset.name ?? "");
              editingToken.replaceWith(textNode);
              setEditingToken(null);
              if (divRef.current) onChange(fromHTML(divRef.current));
            }}
          />
        )}
      </>
    );
  }
);

MacroContentEditor.displayName = "MacroContentEditor";
