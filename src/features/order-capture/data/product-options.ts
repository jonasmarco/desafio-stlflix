export const PRODUCT_OPTIONS = [
  {
    id: "stlflix-assinatura",
    label: "Assinatura STLFLIX",
    description: "Acesso aos modelos 3D e lançamentos da plataforma.",
  },
  {
    id: "filamento-pla",
    label: "Filamento PLA",
    description: "Produto físico para impressão 3D.",
  },
  {
    id: "impressora-3d",
    label: "Impressora 3D",
    description: "Equipamento para makers e pequenas produções.",
  },
  {
    id: "curso-stlacademy",
    label: "Curso STLACADEMY",
    description: "Treinamento para modelagem, impressão e acabamento.",
  },
] as const;

export const PRODUCT_IDS = PRODUCT_OPTIONS.map((product) => product.id) as [
  (typeof PRODUCT_OPTIONS)[number]["id"],
  ...(typeof PRODUCT_OPTIONS)[number]["id"][],
];
