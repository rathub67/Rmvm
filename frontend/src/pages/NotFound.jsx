import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="flex min-h-[55vh] flex-col items-center justify-center gap-4 bg-[#F4E7F6] px-6 py-16 text-center text-[#360E53]">
      <span className="text-6xl font-bold text-[#8048A9]">404</span>
      <h1 className="text-2xl font-semibold">Página não encontrada</h1>
      <p className="max-w-md text-base leading-7 text-[#6f5a7c]">
        O endereço que você tentou acessar não existe ou foi movido.
      </p>
      <Link
        to="/"
        className="rounded-lg bg-[#360E53] px-5 py-2.5 text-base font-semibold text-white transition-colors hover:bg-[#4B057E]"
      >
        Voltar para a página inicial
      </Link>
    </section>
  );
}
