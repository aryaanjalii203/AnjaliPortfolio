/** A masked line of text that slides up when its parent (or itself) gets `.in`. */
export default function Line({ children, d = 0, className = '', as: Tag = 'span' }) {
  return (
    <Tag className={`rv-line ${className}`} style={{ '--d': `${d}s` }}>
      <span>{children}</span>
    </Tag>
  );
}
