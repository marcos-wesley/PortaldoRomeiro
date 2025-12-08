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
  { id: "1", title: "Historia", icon: "book-open", screen: "Historia", color: "#4169E1" },
  { id: "2", title: "TV Ao Vivo", icon: "tv", screen: "TVAoVivo", color: "#EF4444" },
  { id: "3", title: "Roteiros", icon: "map-pin", screen: "Roteiros", color: "#10B981" },
  { id: "4", title: "Info", icon: "info", screen: "Info", color: "#8B5CF6" },
  { id: "5", title: "Hospedagem", icon: "home", screen: "Hospedagem", color: "#F97316" },
  { id: "6", title: "Servicos", icon: "grid", screen: "Servicos", color: "#06B6D4" },
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
