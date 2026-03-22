/**
 * InlineText.jsx — Body text with inline ALL-CAPS emphasis (WEB)
 *
 * Now accepts `style` and `emStyle` as inline style objects
 * instead of Tailwind class strings, to work correctly inside
 * Units.jsx which uses inline styles throughout.
 *
 * ALL-CAPS sequences of 3+ letters are wrapped in emStyle.
 * Mixed-case text uses the base style.
 */

const InlineText = ({ text, style = {}, emStyle = {} }) => {
  const parts = text.split(/(\b[A-Z]{3,}(?:\s[A-Z]{3,})*\b)/g);

  return (
    <p style={style}>
      {parts.map((part, i) =>
        /^[A-Z]{3,}/.test(part) && !/[a-z]/.test(part)
          ? <strong key={i} style={emStyle}>{part}</strong>
          : part
      )}
    </p>
  );
};

export default InlineText;