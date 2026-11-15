export function Section({
  title,
  count,
  children,
}: {
  title: string
  count?: number
  children: React.ReactNode
}) {
  return (
    <section className="mt-10 first:mt-0">
      <h2 className="mb-3 flex items-baseline gap-2 font-title text-2xl">
        {title}
        {count !== undefined && <span className="text-lg text-muted-foreground tabular">{count}</span>}
      </h2>
      {children}
    </section>
  )
}
