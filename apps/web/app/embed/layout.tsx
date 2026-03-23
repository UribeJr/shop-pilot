export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main style={{ margin: 0, padding: 0, minHeight: "100%" }}>{children}</main>;
}
