import classico from "@/assets/product-classico.jpg";
import pistacio from "@/assets/product-pistacio.jpg";
import caramelo from "@/assets/product-caramelo.jpg";
import coco from "@/assets/product-coco.jpg";

export type Product = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  longDescription: string;
  price: number; // EUR per unit
  image: string;
  category: "Brigadeiros";
  ingredients: string[];
  allergens: string[];
  badge?: string;
};

export const products: Product[] = [
  {
    slug: "brigadeiro-classico",
    name: "Brigadeiro Clássico",
    tagline: "Chocolate belga e granulado fino",
    description:
      "A receita original, em ponto certo, com chocolate belga e cobertura de granulado artesanal.",
    longDescription:
      "Cozinhado em panela de cobre até atingir o ponto perfeito. Usamos chocolate belga 53%, leite condensado premium e manteiga sem sal. Cada unidade é enrolada à mão e finalizada com granulado fino de chocolate.",
    price: 1.5,
    image: classico,
    category: "Brigadeiros",
    ingredients: ["Leite condensado", "Cacau belga 53%", "Manteiga", "Granulado de chocolate"],
    allergens: ["Lactose", "Soja (vestígios)"],
    badge: "Mais vendido",
  },
  {
    slug: "brigadeiro-pistacio",
    name: "Brigadeiro de Pistácio",
    tagline: "Pistácio siciliano torrado",
    description:
      "Pasta pura de pistácio siciliano coberta com pistácio torrado moído na hora.",
    longDescription:
      "Uma releitura mediterrânica do clássico. Pasta 100% de pistácio siciliano, sem corantes nem aromas. Notas amanteigadas e um final ligeiramente salgado.",
    price: 2.2,
    image: pistacio,
    category: "Brigadeiros",
    ingredients: ["Leite condensado", "Pasta de pistácio", "Manteiga", "Pistácio torrado"],
    allergens: ["Lactose", "Frutos de casca rija"],
  },
  {
    slug: "brigadeiro-caramelo-salgado",
    name: "Caramelo Salgado",
    tagline: "Caramelo dourado e flor de sal",
    description:
      "Caramelo dourado feito devagar, terminado com flor de sal de Castro Marim e folha de ouro.",
    longDescription:
      "O açúcar é levado lentamente até ao caramelo âmbar, depois envolvido em natas e manteiga. A flor de sal portuguesa equilibra o doce e a folha de ouro 23k assina cada peça.",
    price: 2.0,
    image: caramelo,
    category: "Brigadeiros",
    ingredients: ["Açúcar", "Natas", "Manteiga", "Flor de sal", "Folha de ouro"],
    allergens: ["Lactose"],
    badge: "Edição limitada",
  },
  {
    slug: "beijinho-de-coco",
    name: "Beijinho de Coco",
    tagline: "Coco fresco ralado",
    description:
      "O irmão branco do brigadeiro. Coco fresco ralado e um cravinho como assinatura.",
    longDescription:
      "Preparado apenas com leite condensado, manteiga e coco fresco ralado no próprio dia. Cada unidade é finalizada com um cravinho da Índia, à maneira tradicional.",
    price: 1.5,
    image: coco,
    category: "Brigadeiros",
    ingredients: ["Leite condensado", "Coco fresco ralado", "Manteiga"],
    allergens: ["Lactose"],
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}
