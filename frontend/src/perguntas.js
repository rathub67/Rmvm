export const perguntas = [
  {
    id: "q1",
    numero: 1,
    titulo: "Você está vivendo ou já vivenciou alguma situação de violência?",
    tipo: "radio",
    opcoes: [
      "Sim, atualmente",
      "Sim, no passado",
      "Não tenho certeza",
      "Não",
    ],
  },
  {
    id: "q2",
    numero: 2,
    titulo:
      "Qual tipo de violência você acredita estar sofrendo ou ter sofrido?",
    subtitulo: "(Marque todas as opções que se aplicam)",
    tipo: "checkbox",
    opcoes: [
      "Violência física (agressões, empurrões, tapas, socos, chutes)",
      "Violência psicológica (ameaças, humilhações, insultos, intimidação)",
      "Violência moral (calúnias, difamações, ofensas à reputação)",
      "Violência sexual (qualquer ato sexual sem consentimento)",
      "Violência patrimonial (controle ou destruição de bens, dinheiro ou documentos)",
      "Violência digital (perseguição, exposição de imagens, invasão de privacidade)",
      "Outro",
      "Não sei identificar",
    ],
  },
  {
    id: "q3",
    numero: 3,
    titulo: "Quem pratica ou praticou a violência?",
    tipo: "radio",
    opcoes: [
      "Companheiro ou marido",
      "Ex-companheiro ou ex-marido",
      "Namorado",
      "Ex-namorado",
      "Familiar",
      "Conhecido",
      "Pessoa desconhecida",
    ],
  },
  {
    id: "q4",
    numero: 4,
    titulo: "A situação ocorre com qual frequência?",
    tipo: "radio",
    opcoes: [
      "Aconteceu apenas uma vez",
      "Ocorre raramente",
      "Ocorre frequentemente",
      "Ocorre diariamente",
    ],
  },
  {
    id: "q5",
    numero: 5,
    titulo: "Você já procurou ajuda anteriormente?",
    tipo: "radio",
    opcoes: ["Sim", "Não"],
  },
  {
    id: "q6",
    numero: 6,
    titulo: "Caso tenha procurado ajuda, onde?",
    tipo: "checkbox",
    opcoes: [
      "Delegacia",
      "Defensoria Pública",
      "Advogado(a)",
      "Centro de apoio à mulher",
      "Serviço de saúde",
      "Outro",
      "Não procurei ajuda",
    ],
  },
  {
    id: "q7",
    numero: 7,
    titulo:
      "Você possui medidas de proteção ou algum processo relacionado ao caso?",
    tipo: "radio",
    opcoes: ["Sim", "Não", "Não sei informar"],
  },
  {
    id: "q8",
    numero: 8,
    titulo:
      "Você sente que sua segurança ou a de seus filhos/dependentes está em risco?",
    tipo: "radio",
    opcoes: ["Sim", "Não", "Não tenho certeza"],
  },
  {
    id: "q9",
    numero: 9,
    titulo: "Você deseja receber orientação jurídica sobre sua situação?",
    tipo: "radio",
    opcoes: ["Sim", "Não"],
  },
  {
    id: "q10",
    numero: 10,
    titulo: "Qual é a principal ajuda jurídica que você procura?",
    tipo: "radio",
    opcoes: [
      "Informações sobre meus direitos",
      "Medida protetiva",
      "Orientação sobre denúncia",
      "Separação ou divórcio",
      "Guarda dos filhos",
      "Pensão alimentícia",
    ],
  },
  {
    id: "q11",
    numero: 11,
    titulo: "Você gostaria de receber apoio psicológico?",
    tipo: "radio",
    opcoes: [
      "Sim, gostaria de receber apoio psicológico.",
      "Não, neste momento não desejo apoio psicológico.",
    ],
  },
];

export const CAMPOS_OBRIGATORIOS = [
  "q1",
  "q2",
  "q3",
  "q4",
  "q5",
  "q7",
  "q8",
  "q9",
  "q11",
];

export function respostaTexto(valor) {
  if (Array.isArray(valor)) {
    return valor.join(" • ");
  }

  return valor || "—";
}
