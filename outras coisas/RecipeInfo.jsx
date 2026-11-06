export default function RecipeInfo({
  title, summary, cover, prepMinutes, cookMinutes
}) {

  const totalMinutes = (prepMinutes || 0) + (cookMinutes || 0)
  return (
    <section className="space-y-6 sm:space-y-8">
      <img
        src={cover || "http://placehold.co/800x450?text=No+Image"}
        alt={title}
        className="aspect-video w-full rounded-lg object-cover sm:rounded-xl"
      />

      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-3xl font-bold leading-tight break-words text-stone-800 sm:text-4xl">{title}</h1>
        <p className="text-base leading-relaxed text-stone-600 md:text-lg">{summary}</p>
      </div>

      <div className="rounded-lg bg-rose-50 p-4 sm:rounded-xl sm:p-6">
        <h3 className="mb-3 text-lg font-semibold text-rose-800 sm:mb-4 sm:text-xl">Preparation time</h3>
        <ul className="list-disc space-y-2 pl-5 text-stone-600 maker:text-rose-800 sm:pl-6">
          <li>
            <strong className="text-stone-700">Total</strong>: Approximately {totalMinutes} minutes
          </li>
          <li>
            <strong className="text-stone-700">Preparation</strong>: {prepMinutes} minutes
          </li>
          <li>
            <strong className="text-stone-700">Cooking</strong>: {cookMinutes} minutes
          </li>
        </ul>
      </div>
    </section>
  );
}