export enum Category {
  Essentials = 'Essentials',
  GeneralTravelEssentials = 'General Travel Essentials',
  Clothing = 'Clothing',
  ElectronicsGear = 'Electronics & Gear',
  Toiletries = 'Toiletries',
  HealthMedicine = 'Health & Medicine',
  Accessories = 'Accessories',
  Skincare = 'Skincare',
  Makeup = 'Makeup',
  HairCare = 'Hair Care',
  Sports = 'Sports',
  Other = 'Other'
}

export enum TripType {
  Beach = 'Beach',
  Business = 'Business',
  Camping = 'Camping',
  Diving = 'Diving',
  Hiking = 'Hiking',
  Leisure = 'Leisure',
  RoadTrip = 'Road Trip',
  Skiing = 'Skiing',
  Other = 'Other'
}

export enum TransportationType {
  Flight = 'Flight',
  Car = 'Car',
  Train = 'Train',
  Bus = 'Bus',
  Cruise = 'Cruise',
  Motorcycle = 'Motorcycle',
  Other = 'Other'
}

export interface InventoryItem {
  id: string;
  name: string;
  category: Category;
  isMaster?: boolean;
  quantity?: number;
}

export interface PackingItem {
  id: string;
  name: string;
  category: Category;
  isPacked: boolean;
  quantity?: number;
  medicineName?: string;
  cameraType?: string;
  lensDetails?: string;
  cableType?: string;
  gamingConsoleType?: string;
}

export interface Trip {
  id: string;
  name: string;
  tripType: TripType | string;
  transportationType?: TransportationType | string;
  duration: string; // Keep for backwards compatibility
  startDate?: string;
  endDate?: string;
  items: PackingItem[];
  createdAt: number;
  imageUrl?: string;
  uid?: string;
}

export interface CustomList {
  id: string;
  name: string;
  items: { name: string; category: Category }[];
}

export interface UserProfile {
  uid: string;
  name: string;
  email?: string;
  joinedAt: number;
  mustBringItems?: { id: string; name: string; category: Category }[];
  avatarUrl?: string;
  language?: 'en-GB' | 'zh-CN';
}

