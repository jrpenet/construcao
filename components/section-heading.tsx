export function SectionHeading({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      <h2 className="text-balance text-3xl font-extrabold tracking-tight md:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-pretty text-lg text-muted-foreground">
        {description}
      </p>
    </div>
  )
}
