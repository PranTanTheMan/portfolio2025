export default function Link({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline underline-offset-4 decoration-zinc-300 decoration-2 hover:decoration-gray-600 transition-all duration-200 ease-in-out"
    >
      {children}
    </a>
  );
}
