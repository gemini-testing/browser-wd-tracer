import { linkifyText, type TextPart } from '@/lib/console';
import type { MessageSegment } from '@/lib/console';

interface SegmentWithLinksProps {
  segment: MessageSegment;
  singleLine?: boolean;
}

export function SegmentWithLinks({ segment, singleLine }: SegmentWithLinksProps) {
  const raw = segment.text ?? '';
  const text = singleLine ? (raw.split('\n')[0] ?? '') : raw;
  const parts: TextPart[] = linkifyText(text);

  return (
    <span style={segment.style}>
      {parts.map((part, i) =>
        part.href ? (
          <a key={i} href={part.href} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
            {part.text}
          </a>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </span>
  );
}
