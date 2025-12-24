export interface News {
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  imageUrl: string;
  date: string;
  content: string;
  featured: boolean;
}

export interface Video {
  id: string;
  title: string;
  thumbnailUrl: string;
  duration: string;
  date: string;
  description: string;
}

export interface QuickAction {
  id: string;
  title: string;
  icon: string;
  screen: string;
  color: string;
}

export interface Accommodation {
  id: string;
  name: string;
  imageUrl: string;
  rating: number;
  reviews: number;
  price: string;
  location: string;
  amenities: string[];
  description: string;
}

export interface Service {
  id: string;
  name: string;
  icon: string;
  description: string;
  phone?: string;
  address?: string;
}

export interface Route {
  id: string;
  name: string;
  distance: string;
  duration: string;
  difficulty: string;
  imageUrl: string;
  description: string;
  points: string[];
}

export interface HistoryEvent {
  id: string;
  year: string;
  title: string;
  description: string;
  imageUrl?: string;
}

export const quickActions: QuickAction[] = [
  { id: "1", title: "Historia", icon: "book-open", screen: "Historia", color: "#3B82F6" },
  { id: "2", title: "TV Ao Vivo", icon: "tv", screen: "TVAoVivo", color: "#F87171" },
  { id: "3", title: "Roteiros", icon: "map-pin", screen: "Roteiros", color: "#34D399" },
  { id: "4", title: "Info", icon: "info", screen: "Info", color: "#60A5FA" },
  { id: "5", title: "Hospedagem", icon: "home", screen: "Hospedagem", color: "#FBBF24" },
  { id: "6", title: "Servicos", icon: "truck", screen: "Servicos", color: "#A78BFA" },
];

export const newsData: News[] = [
  {
    id: "1",
    title: "Festa do Divino Pai Eterno reune multidao de fieis",
    category: "Destaque",
    categoryColor: "#EF4444",
    imageUrl: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800",
    date: "Hoje, 10:30",
    content: "A tradicional Festa do Divino Pai Eterno reuniu milhares de fieis em Trindade. O evento religioso, um dos maiores do Brasil, contou com celebracoes, procissoes e momentos de fe que emocionaram os participantes.",
    featured: true,
  },
  {
    id: "2",
    title: "Novos horarios de missa para o fim de semana",
    category: "Santuario",
    categoryColor: "#4169E1",
    imageUrl: "https://images.unsplash.com/photo-1438032005730-c779502df39b?w=800",
    date: "Ontem, 18:45",
    content: "O Santuario Basilica anunciou novos horarios de celebracoes para o fim de semana, visando atender melhor os romeiros que visitam a cidade.",
    featured: false,
  },
  {
    id: "3",
    title: "Turismo religioso cresce 20% na regiao",
    category: "Cidade",
    categoryColor: "#10B981",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
    date: "12 Dez, 14:20",
    content: "O turismo religioso na regiao de Trindade registrou crescimento de 20% em comparacao ao ano anterior, impulsionando a economia local.",
    featured: false,
  },
  {
    id: "4",
    title: "Nova area de alimentacao inaugurada no santuario",
    category: "Infraestrutura",
    categoryColor: "#F97316",
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
    date: "10 Dez, 09:15",
    content: "Uma nova praca de alimentacao foi inaugurada para melhor atender os visitantes do santuario.",
    featured: false,
  },
];

export const videosData: Video[] = [
  {
    id: "1",
    title: "Missa Solene de Domingo - Completa",
    thumbnailUrl: "https://images.unsplash.com/photo-1438032005730-c779502df39b?w=800",
    duration: "1:15:30",
    date: "Hoje",
    description: "Transmissao completa da missa solene de domingo celebrada no Santuario Basilica.",
  },
  {
    id: "2",
    title: "Documentario: Caminho da Fe",
    thumbnailUrl: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800",
    duration: "45:22",
    date: "Ontem",
    description: "Documentario sobre a historia e tradicao do caminho da fe percorrido pelos romeiros.",
  },
  {
    id: "3",
    title: "Entrevista com o Reitor do Santuario",
    thumbnailUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
    duration: "28:45",
    date: "3 dias atras",
    description: "Entrevista exclusiva sobre os preparativos para as festividades.",
  },
  {
    id: "4",
    title: "Coral do Santuario - Apresentacao Especial",
    thumbnailUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800",
    duration: "52:10",
    date: "1 semana atras",
    description: "Apresentacao especial do coral do santuario com canticos tradicionais.",
  },
];

export const accommodationsData: Accommodation[] = [
  {
    id: "1",
    name: "Hotel Divino Pai Eterno",
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    rating: 4.8,
    reviews: 234,
    price: "R$ 180",
    location: "Centro - 500m do Santuario",
    amenities: ["Wi-Fi", "Cafe da manha", "Ar condicionado", "Estacionamento"],
    description: "Hotel confortavel proximo ao santuario com excelente atendimento.",
  },
  {
    id: "2",
    name: "Pousada do Romeiro",
    imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
    rating: 4.5,
    reviews: 156,
    price: "R$ 120",
    location: "Centro - 300m do Santuario",
    amenities: ["Wi-Fi", "Cafe da manha", "Ar condicionado"],
    description: "Pousada acolhedora com otima localizacao para romeiros.",
  },
  {
    id: "3",
    name: "Hotel Basilica",
    imageUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
    rating: 4.6,
    reviews: 189,
    price: "R$ 220",
    location: "Centro - 200m do Santuario",
    amenities: ["Wi-Fi", "Cafe da manha", "Ar condicionado", "Piscina", "Restaurante"],
    description: "Hotel premium com todas as comodidades para sua estadia.",
  },
  {
    id: "4",
    name: "Hospedaria Santa Fe",
    imageUrl: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800",
    rating: 4.3,
    reviews: 98,
    price: "R$ 95",
    location: "Centro - 800m do Santuario",
    amenities: ["Wi-Fi", "Cafe da manha"],
    description: "Opcao economica e confortavel para grupos de romeiros.",
  },
];

export const servicesData: Service[] = [
  { id: "1", name: "Taxi e Transporte", icon: "truck", description: "Servicos de transporte para romeiros", phone: "(62) 3333-1111" },
  { id: "2", name: "Restaurantes", icon: "coffee", description: "Opcoes de alimentacao na regiao", address: "Centro de Trindade" },
  { id: "3", name: "Farmacia 24h", icon: "plus-circle", description: "Farmacias de plantao", phone: "(62) 3333-2222" },
  { id: "4", name: "Bancos e Caixas", icon: "credit-card", description: "Servicos bancarios disponiveis", address: "Rua Principal, Centro" },
  { id: "5", name: "Posto de Saude", icon: "heart", description: "Atendimento medico de emergencia", phone: "(62) 3333-3333" },
  { id: "6", name: "Informacoes Turisticas", icon: "map", description: "Centro de apoio ao turista", address: "Praca do Santuario" },
  { id: "7", name: "Guias Turisticos", icon: "users", description: "Guias credenciados", phone: "(62) 3333-4444" },
  { id: "8", name: "Lembrancinhas", icon: "gift", description: "Lojas de artigos religiosos", address: "Rua dos Romeiros" },
];

export const routesData: Route[] = [
  {
    id: "1",
    name: "Caminho da Fe - Rota Principal",
    distance: "18 km",
    duration: "5-6 horas",
    difficulty: "Moderado",
    imageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800",
    description: "O caminho tradicional percorrido pelos romeiros ate o santuario.",
    points: ["Ponto de partida", "Capela do Meio", "Mirante", "Santuario"],
  },
  {
    id: "2",
    name: "Trilha dos Devotos",
    distance: "8 km",
    duration: "2-3 horas",
    difficulty: "Facil",
    imageUrl: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800",
    description: "Caminho mais curto, ideal para familias e iniciantes.",
    points: ["Centro de Trindade", "Parque das Aguas", "Santuario"],
  },
  {
    id: "3",
    name: "Rota Historica",
    distance: "25 km",
    duration: "8-10 horas",
    difficulty: "Dificil",
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
    description: "Percurso historico passando por marcos importantes da regiao.",
    points: ["Igreja Matriz", "Fazenda Historica", "Rio Dourado", "Cruz do Romeiro", "Santuario"],
  },
];

export const historyData: HistoryEvent[] = [
  {
    id: "1",
    year: "1840",
    title: "Descoberta do Medalhao",
    description: "O medalhao do Divino Pai Eterno foi encontrado por um casal de lavradores durante o trabalho no campo.",
    imageUrl: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800",
  },
  {
    id: "2",
    year: "1912",
    title: "Construcao da Primeira Igreja",
    description: "Inicio da construcao do primeiro templo dedicado ao Divino Pai Eterno no local.",
  },
  {
    id: "3",
    year: "1943",
    title: "Chegada dos Redentoristas",
    description: "Os missionarios redentoristas assumem a administracao do santuario.",
  },
  {
    id: "4",
    year: "2006",
    title: "Elevacao a Basilica",
    description: "O santuario recebe o titulo de Basilica Menor concedido pelo Vaticano.",
    imageUrl: "https://images.unsplash.com/photo-1438032005730-c779502df39b?w=800",
  },
];

export const guideCategories = [
  { id: "1", title: "Oracoes", icon: "book", count: 15 },
  { id: "2", title: "Santos", icon: "star", count: 24 },
  { id: "3", title: "Novenas", icon: "calendar", count: 9 },
  { id: "4", title: "Canticos", icon: "music", count: 32 },
  { id: "5", title: "Liturgia", icon: "bookmark", count: 12 },
  { id: "6", title: "Reflexoes", icon: "sun", count: 18 },
];

export interface Prayer {
  id: string;
  title: string;
  content: string;
  category: string;
}

export const prayersData: Prayer[] = [
  {
    id: "1",
    title: "Oracao ao Divino Pai Eterno",
    content: "Pai Eterno, eu vos adoro e vos amo. Guardai-me sob vossa protecao. Derramai sobre mim as vossas bencaos. Dai-me a graca de amar-Vos cada dia mais. Amem.",
    category: "Oracoes",
  },
  {
    id: "2",
    title: "Ave Maria",
    content: "Ave Maria, cheia de graca, o Senhor e convosco. Bendita sois vos entre as mulheres e bendito e o fruto do vosso ventre, Jesus. Santa Maria, Mae de Deus, rogai por nos, pecadores, agora e na hora de nossa morte. Amem.",
    category: "Oracoes",
  },
  {
    id: "3",
    title: "Pai Nosso",
    content: "Pai nosso que estais no ceu, santificado seja o Vosso nome, venha a nos o Vosso reino, seja feita a Vossa vontade assim na terra como no ceu. O pao nosso de cada dia nos dai hoje, perdoai-nos as nossas ofensas assim como nos perdoamos a quem nos tem ofendido. E nao nos deixeis cair em tentacao, mas livrai-nos do mal. Amem.",
    category: "Oracoes",
  },
  {
    id: "4",
    title: "Novena ao Divino Pai Eterno - Dia 1",
    content: "Primeiro dia da novena. Pai Eterno, vos sois infinitamente bom e misericordioso. Fazei-nos dignos de vossas gracas e bencaos. Amem.",
    category: "Novenas",
  },
  {
    id: "5",
    title: "Oracao da Manha",
    content: "Senhor, no silencio deste dia que amanhece, venho pedir-Vos paz, sabedoria e forca. Quero olhar o mundo com olhos cheios de amor. Amem.",
    category: "Oracoes",
  },
  {
    id: "6",
    title: "Oracao da Noite",
    content: "Obrigado, Senhor, por este dia que passou. Perdoai as minhas falhas e dai-me um sono tranquilo. Protegei a minha familia. Amem.",
    category: "Oracoes",
  },
];

export interface BusinessCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Business {
  id: string;
  name: string;
  category: string;
  categoryId: string;
  logoUrl: string;
  coverUrl?: string;
  description: string;
  shortDescription?: string;
  address: string;
  neighborhood: string;
  city: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  hours?: string;
  priceRange?: string;
  rating?: number;
  reviews?: number;
  featured: boolean;
  gallery?: string[];
  latitude?: number;
  longitude?: number;
  delivery?: boolean;
  deliveryUrl?: string;
}

export const businessCategories: BusinessCategory[] = [
  { id: "onde-comer", name: "Onde Comer", icon: "coffee", color: "#F97316" },
  { id: "onde-comprar", name: "Onde Comprar", icon: "shopping-bag", color: "#10B981" },
  { id: "construcao", name: "Construcao e Reforma", icon: "tool", color: "#8B5CF6" },
  { id: "diversao", name: "Diversao e Lazer", icon: "smile", color: "#EC4899" },
  { id: "carro", name: "Para seu Carro", icon: "truck", color: "#06B6D4" },
  { id: "moto", name: "Para sua Moto", icon: "wind", color: "#EF4444" },
];

export const businessesData: Business[] = [
  {
    id: "1",
    name: "Restaurante Sabor da Fe",
    category: "Restaurante",
    categoryId: "onde-comer",
    logoUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
    coverUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
    description: "O Restaurante Sabor da Fe oferece a melhor culinaria goiana com ingredientes frescos e receitas tradicionais. Ambiente familiar e acolhedor, perfeito para refeicoes em grupo. Temos opcoes de buffet e pratos a la carte.",
    shortDescription: "Culinaria goiana tradicional com ambiente familiar",
    address: "Rua dos Romeiros, 123",
    neighborhood: "Centro",
    city: "Trindade",
    phone: "(62) 3333-1234",
    whatsapp: "5562999991234",
    website: "https://sabordafe.com.br",
    instagram: "@sabordafe",
    hours: "Seg-Dom: 11h-22h",
    priceRange: "$$",
    rating: 4.7,
    reviews: 234,
    featured: true,
    gallery: [
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
    ],
    latitude: -16.6499,
    longitude: -49.4897,
    delivery: true,
    deliveryUrl: "https://ifood.com.br/sabordafe",
  },
  {
    id: "2",
    name: "Pousada Bencao Divina",
    category: "Pousada",
    categoryId: "onde-ficar",
    logoUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400",
    coverUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
    description: "Pousada aconchegante a poucos metros do Santuario. Quartos confortaveis com ar condicionado, Wi-Fi, TV e cafe da manha incluso. Ideal para romeiros e turistas.",
    shortDescription: "Hospedagem proxima ao Santuario",
    address: "Av. Santuario, 456",
    neighborhood: "Centro",
    city: "Trindade",
    phone: "(62) 3333-5678",
    whatsapp: "5562999995678",
    hours: "Recepcao 24h",
    priceRange: "$$$",
    rating: 4.8,
    reviews: 189,
    featured: true,
    gallery: [
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    ],
    latitude: -16.6501,
    longitude: -49.4889,
  },
  {
    id: "3",
    name: "Loja Artigos Religiosos Fe Viva",
    category: "Loja",
    categoryId: "onde-comprar",
    logoUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400",
    description: "A maior variedade de artigos religiosos de Trindade. Tercos, imagens, medalhas, livros e lembrancinhas para levar a bencao do Divino Pai Eterno.",
    shortDescription: "Artigos religiosos e lembrancinhas",
    address: "Rua da Basilica, 78",
    neighborhood: "Centro",
    city: "Trindade",
    phone: "(62) 3333-7890",
    whatsapp: "5562999997890",
    instagram: "@feviva.artigos",
    hours: "Seg-Sab: 8h-18h | Dom: 8h-14h",
    rating: 4.5,
    reviews: 156,
    featured: false,
    latitude: -16.6495,
    longitude: -49.4901,
  },
  {
    id: "4",
    name: "Pizzaria Divina Massa",
    category: "Pizzaria",
    categoryId: "onde-comer",
    logoUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400",
    coverUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800",
    description: "As melhores pizzas artesanais de Trindade. Massa fresca, ingredientes selecionados e forno a lenha. Ambiente agradavel para toda familia.",
    shortDescription: "Pizzas artesanais com forno a lenha",
    address: "Rua Goias, 234",
    neighborhood: "Jardim America",
    city: "Trindade",
    phone: "(62) 3333-4567",
    whatsapp: "5562999994567",
    hours: "Ter-Dom: 18h-23h",
    priceRange: "$$",
    rating: 4.6,
    reviews: 312,
    featured: true,
    delivery: true,
    latitude: -16.6510,
    longitude: -49.4875,
  },
  {
    id: "5",
    name: "Auto Center Trindade",
    category: "Mecanica",
    categoryId: "carro",
    logoUrl: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400",
    description: "Servicos completos para seu veiculo: mecanica geral, alinhamento, balanceamento, troca de oleo e revisao. Profissionais qualificados e pecas de qualidade.",
    shortDescription: "Mecanica geral e servicos automotivos",
    address: "Av. Brasil, 1500",
    neighborhood: "Setor Industrial",
    city: "Trindade",
    phone: "(62) 3333-8901",
    whatsapp: "5562999998901",
    hours: "Seg-Sex: 8h-18h | Sab: 8h-12h",
    rating: 4.4,
    reviews: 87,
    featured: false,
    latitude: -16.6520,
    longitude: -49.4830,
  },
  {
    id: "6",
    name: "Casa de Materiais Construir",
    category: "Material de Construcao",
    categoryId: "construcao",
    logoUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400",
    description: "Materiais de construcao e acabamento para sua obra. Cimento, tijolos, telhas, tintas, pisos e muito mais. Entrega em toda regiao.",
    shortDescription: "Materiais de construcao e acabamento",
    address: "Av. Goias, 2000",
    neighborhood: "Setor Norte",
    city: "Trindade",
    phone: "(62) 3333-2345",
    whatsapp: "5562999992345",
    hours: "Seg-Sex: 7h-18h | Sab: 7h-14h",
    rating: 4.3,
    reviews: 95,
    featured: false,
    latitude: -16.6480,
    longitude: -49.4920,
  },
  {
    id: "7",
    name: "Moto Pecas Trindade",
    category: "Moto Pecas",
    categoryId: "moto",
    logoUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    description: "Pecas e acessorios para motos de todas as marcas. Servicos de manutencao e instalacao. Qualidade e preco justo.",
    shortDescription: "Pecas e acessorios para motos",
    address: "Rua das Oficinas, 45",
    neighborhood: "Centro",
    city: "Trindade",
    phone: "(62) 3333-6789",
    whatsapp: "5562999996789",
    hours: "Seg-Sex: 8h-18h | Sab: 8h-13h",
    rating: 4.2,
    reviews: 64,
    featured: false,
    latitude: -16.6505,
    longitude: -49.4910,
  },
  {
    id: "8",
    name: "Lanchonete do Romeiro",
    category: "Lanchonete",
    categoryId: "onde-comer",
    logoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
    description: "Lanches rapidos e saborosos. Sucos naturais, sanduiches, pasteis e acai. Ponto de parada perfeito para os romeiros.",
    shortDescription: "Lanches rapidos e sucos naturais",
    address: "Praca do Santuario, 12",
    neighborhood: "Centro",
    city: "Trindade",
    phone: "(62) 3333-1111",
    whatsapp: "5562999991111",
    hours: "Todos os dias: 6h-22h",
    priceRange: "$",
    rating: 4.4,
    reviews: 278,
    featured: false,
    latitude: -16.6498,
    longitude: -49.4895,
  },
  {
    id: "9",
    name: "Hotel Basilica Palace",
    category: "Hotel",
    categoryId: "onde-ficar",
    logoUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400",
    coverUrl: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800",
    description: "O hotel mais completo de Trindade. Piscina, restaurante, salao de eventos, spa e academia. Quartos luxuosos com vista para o Santuario. Experiencia premium para sua estadia.",
    shortDescription: "Hotel premium com vista para o Santuario",
    address: "Av. Santuario, 1000",
    neighborhood: "Centro",
    city: "Trindade",
    phone: "(62) 3333-9999",
    whatsapp: "5562999999999",
    website: "https://basilicapalace.com.br",
    instagram: "@basilicapalace",
    facebook: "basilicapalacehotel",
    hours: "Recepcao 24h",
    priceRange: "$$$$",
    rating: 4.9,
    reviews: 456,
    featured: true,
    gallery: [
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    ],
    latitude: -16.6502,
    longitude: -49.4885,
  },
  {
    id: "10",
    name: "Parque Aquatico Splash",
    category: "Parque Aquatico",
    categoryId: "diversao",
    logoUrl: "https://images.unsplash.com/photo-1582653291997-079a1c04e5a1?w=400",
    coverUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    description: "Diversao garantida para toda familia! Toboaguas, piscinas, area infantil e muito mais. Restaurante e lanchonete no local.",
    shortDescription: "Diversao aquatica para toda familia",
    address: "Rodovia GO-060, Km 5",
    neighborhood: "Zona Rural",
    city: "Trindade",
    phone: "(62) 3333-5555",
    whatsapp: "5562999995555",
    website: "https://splashtrindade.com.br",
    instagram: "@splashtrindade",
    hours: "Sab-Dom: 9h-17h | Feriados: 9h-17h",
    priceRange: "$$",
    rating: 4.5,
    reviews: 567,
    featured: true,
    latitude: -16.6600,
    longitude: -49.5000,
  },
];

// Dicas do Romeiro Data

export interface TipCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface Tip {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  icon: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  icon: string;
}

export interface EmergencyPhone {
  id: string;
  name: string;
  phone: string;
  icon: string;
}

export const tipCategories: TipCategory[] = [
  { id: "seguranca", name: "Seguranca", icon: "shield", color: "#EF4444", description: "Dicas para sua protecao" },
  { id: "saude", name: "Saude e Bem-estar", icon: "heart", color: "#10B981", description: "Cuide do seu corpo" },
  { id: "transito", name: "Transito e Mobilidade", icon: "navigation", color: "#F97316", description: "Como se locomover" },
  { id: "hidratacao", name: "Hidratacao e Alimentacao", icon: "droplet", color: "#06B6D4", description: "Mantenha-se nutrido" },
  { id: "espiritualidade", name: "Espiritualidade", icon: "sun", color: "#8B5CF6", description: "Fortaleça sua fe" },
  { id: "descanso", name: "Onde Descansar", icon: "moon", color: "#4169E1", description: "Pontos de apoio" },
];

export const essentialTips: Tip[] = [
  { id: "1", categoryId: "geral", title: "Use roupas leves e confortaveis", description: "Prefira tecidos que permitam a transpiracao e roupas claras para evitar o calor excessivo.", icon: "sun" },
  { id: "2", categoryId: "hidratacao", title: "Hidrate-se constantemente", description: "Beba agua antes, durante e depois da caminhada. Leve uma garrafa reutilizavel.", icon: "droplet" },
  { id: "3", categoryId: "seguranca", title: "Evite caminhar sozinho a noite", description: "Durante a madrugada, prefira andar em grupos e use locais bem iluminados.", icon: "moon" },
  { id: "4", categoryId: "saude", title: "Use protetor solar", description: "Aplique protetor solar a cada 2 horas e use bone ou chapeu para proteger a cabeca.", icon: "sun" },
  { id: "5", categoryId: "transito", title: "Caminhe pelo acostamento", description: "Sempre caminhe pelo acostamento ou areas sinalizadas para romeiros.", icon: "alert-triangle" },
  { id: "6", categoryId: "seguranca", title: "Guarde documentos em local seguro", description: "Mantenha seus documentos pessoais em bolsos internos ou pochetes.", icon: "folder" },
];

export const safetyTips: Tip[] = [
  { id: "s1", categoryId: "seguranca", title: "Evite portar grandes quantias", description: "Leve apenas o dinheiro necessario para gastos basicos.", icon: "dollar-sign" },
  { id: "s2", categoryId: "seguranca", title: "Fique atento aos pertences", description: "Mantenha bolsas e mochilas sempre a vista e fechadas.", icon: "eye" },
  { id: "s3", categoryId: "seguranca", title: "Prefira andar em grupos", description: "Ha mais seguranca e ajuda mutua quando caminhamos juntos.", icon: "users" },
  { id: "s4", categoryId: "seguranca", title: "Use locais oficiais de apoio", description: "Procure os pontos de apoio oficiais da Romaria.", icon: "home" },
  { id: "s5", categoryId: "seguranca", title: "Telefones de emergencia", description: "Em caso de emergencia, ligue para os numeros oficiais.", icon: "phone" },
];

export const healthTips: Tip[] = [
  { id: "h1", categoryId: "saude", title: "Alimentacao leve", description: "Prefira frutas, sucos e alimentos de facil digestao antes da caminhada.", icon: "apple" },
  { id: "h2", categoryId: "saude", title: "Hidratacao constante", description: "Beba pelo menos 2 litros de agua por dia durante a romaria.", icon: "droplet" },
  { id: "h3", categoryId: "saude", title: "Cuidados com o sol", description: "Use protetor solar, bone e evite exposicao entre 10h e 16h.", icon: "sun" },
  { id: "h4", categoryId: "saude", title: "Alongue-se", description: "Faca alongamentos antes e depois da caminhada para evitar lesoes.", icon: "activity" },
  { id: "h5", categoryId: "saude", title: "Sinais de alerta", description: "Atencao a tontura, dores, caimbras. Pare e procure ajuda medica.", icon: "alert-circle" },
];

export const spiritualTips: Tip[] = [
  { id: "sp1", categoryId: "espiritualidade", title: "Reze durante o caminho", description: "Aproveite a caminhada para momentos de oracao e meditacao.", icon: "book" },
  { id: "sp2", categoryId: "espiritualidade", title: "Dedique intencoes", description: "Ofereca sua peregrinacao por intencoes especiais.", icon: "heart" },
  { id: "sp3", categoryId: "espiritualidade", title: "Momentos de silencio", description: "Aproveite trechos em silencio para reflexao interior.", icon: "volume-x" },
  { id: "sp4", categoryId: "espiritualidade", title: "Gesto de gratidao", description: "A Romaria e tambem um momento de agradecer as gracas recebidas.", icon: "gift" },
  { id: "sp5", categoryId: "espiritualidade", title: "Respeite seu ritmo", description: "Respeite o ritmo do seu corpo e o momento de cada peregrino.", icon: "clock" },
];

export const pilgrimChecklist: ChecklistItem[] = [
  { id: "c1", label: "Agua", icon: "droplet" },
  { id: "c2", label: "Protetor solar", icon: "sun" },
  { id: "c3", label: "Bone ou chapeu", icon: "umbrella" },
  { id: "c4", label: "Documentos", icon: "credit-card" },
  { id: "c5", label: "Medicamentos pessoais", icon: "plus-circle" },
  { id: "c6", label: "Mochila leve", icon: "package" },
  { id: "c7", label: "Tenis confortavel", icon: "target" },
  { id: "c8", label: "Dinheiro trocado", icon: "dollar-sign" },
  { id: "c9", label: "Lanterna", icon: "flashlight" },
  { id: "c10", label: "Lanche leve", icon: "coffee" },
];

export const emergencyPhones: EmergencyPhone[] = [
  { id: "e1", name: "SAMU", phone: "192", icon: "activity" },
  { id: "e2", name: "Bombeiros", phone: "193", icon: "alert-triangle" },
  { id: "e3", name: "Policia Militar", phone: "190", icon: "shield" },
  { id: "e4", name: "Defesa Civil", phone: "199", icon: "alert-circle" },
  { id: "e5", name: "Central de Apoio ao Romeiro", phone: "(62) 3505-1000", icon: "phone" },
];

// Telefones Uteis Data

export interface PhoneCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface PhoneContact {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  phone: string;
  icon: string;
  isEmergency?: boolean;
}

export const phoneCategories: PhoneCategory[] = [
  { id: "emergencia", name: "Emergencia", icon: "alert-circle", color: "#EF4444" },
  { id: "saude", name: "Saude", icon: "heart", color: "#10B981" },
  { id: "seguranca", name: "Seguranca Publica", icon: "shield", color: "#3B82F6" },
  { id: "transporte", name: "Transporte", icon: "truck", color: "#F97316" },
  { id: "municipal", name: "Servicos Municipais", icon: "home", color: "#8B5CF6" },
  { id: "santuario", name: "Santuario / Igreja", icon: "sun", color: "#4169E1" },
  { id: "apoio", name: "Apoio ao Romeiro", icon: "users", color: "#06B6D4" },
];

export const phoneContacts: PhoneContact[] = [
  { id: "p1", categoryId: "emergencia", name: "SAMU", description: "Servico de Atendimento Movel de Urgencia", phone: "192", icon: "activity", isEmergency: true },
  { id: "p2", categoryId: "emergencia", name: "Bombeiros", description: "Corpo de Bombeiros Militar", phone: "193", icon: "alert-triangle", isEmergency: true },
  { id: "p3", categoryId: "emergencia", name: "Policia Militar", description: "Emergencias policiais", phone: "190", icon: "shield", isEmergency: true },
  { id: "p4", categoryId: "emergencia", name: "Defesa Civil", description: "Desastres e emergencias", phone: "199", icon: "alert-circle", isEmergency: true },
  { id: "p5", categoryId: "saude", name: "UPA Municipal", description: "Unidade de Pronto Atendimento", phone: "(62) 3505-1234", icon: "plus-circle", isEmergency: true },
  { id: "p6", categoryId: "saude", name: "Hospital Municipal", description: "Atendimento 24h", phone: "(62) 3505-2000", icon: "plus-square" },
  { id: "p7", categoryId: "saude", name: "Farmacia Central", description: "Plantao 24h", phone: "(62) 3505-3000", icon: "package" },
  { id: "p8", categoryId: "seguranca", name: "Delegacia de Policia", description: "Policia Civil", phone: "(62) 3505-4000", icon: "briefcase" },
  { id: "p9", categoryId: "seguranca", name: "Guarda Municipal", description: "Seguranca publica local", phone: "(62) 3505-4500", icon: "user" },
  { id: "p10", categoryId: "transporte", name: "Rodoviaria", description: "Terminal rodoviario", phone: "(62) 3505-5000", icon: "map-pin" },
  { id: "p11", categoryId: "transporte", name: "Taxi Trindade", description: "Ponto de taxi central", phone: "(62) 3505-5500", icon: "navigation" },
  { id: "p12", categoryId: "municipal", name: "Prefeitura", description: "Atendimento ao cidadao", phone: "(62) 3505-6000", icon: "home" },
  { id: "p13", categoryId: "municipal", name: "SANEAGO", description: "Agua e saneamento", phone: "0800 645 0115", icon: "droplet" },
  { id: "p14", categoryId: "municipal", name: "CELG", description: "Energia eletrica", phone: "0800 062 0196", icon: "zap" },
  { id: "p15", categoryId: "santuario", name: "Santuario Basilica", description: "Informacoes e missas", phone: "(62) 3505-1000", icon: "sun", isEmergency: true },
  { id: "p16", categoryId: "santuario", name: "Secretaria Paroquial", description: "Documentos e certidoes", phone: "(62) 3505-1100", icon: "file-text" },
  { id: "p17", categoryId: "apoio", name: "Central de Apoio ao Romeiro", description: "Suporte aos peregrinos", phone: "(62) 3505-7000", icon: "phone" },
  { id: "p18", categoryId: "apoio", name: "Ponto de Apoio 1", description: "Entrada da cidade", phone: "(62) 3505-7100", icon: "flag" },
];
