export const MODELS_LIBRARY = [
  { id: 1, name: "Рыцарский меч", eng: "Knight Sword", polygons: "2.4K", format: "OBJ", engine: "Roblox", category: "weapon", color: "#00e5ff" },
  { id: 2, name: "Боевой дракон", eng: "Battle Dragon", polygons: "18.2K", format: "FBX", engine: "Unity", category: "creature", color: "#a855f7" },
  { id: 3, name: "Средневековый замок", eng: "Medieval Castle", polygons: "45K", format: "GLB", engine: "Unreal", category: "building", color: "#39ff14" },
  { id: 4, name: "Магический посох", eng: "Magic Staff", polygons: "1.8K", format: "OBJ", engine: "Roblox", category: "weapon", color: "#ff6b35" },
  { id: 5, name: "Космический корабль", eng: "Spaceship", polygons: "12.5K", format: "FBX", engine: "Unity", category: "vehicle", color: "#00e5ff" },
  { id: 6, name: "Дуб лесной", eng: "Oak Tree", polygons: "3.2K", format: "GLB", engine: "Unreal", category: "nature", color: "#39ff14" },
];

export const ENGINES = [
  { id: "roblox", name: "Roblox Studio", icon: "Gamepad2", format: "OBJ / FBX", color: "#ff6b35", desc: "Авто-интеграция через HttpService" },
  { id: "unity", name: "Unity", icon: "Box", format: "FBX / GLB", color: "#00e5ff", desc: "Готовые пакеты для импорта" },
  { id: "unreal", name: "Unreal Engine", icon: "Cpu", format: "FBX / OBJ", color: "#a855f7", desc: "Высокополигональные модели" },
];

export const BATCH_EXAMPLES = [
  "Рыцарский меч с гравировкой",
  "Деревянный щит с металлическим ободом",
  "Волшебная палочка со звездой",
  "Боевой топор орка",
];

export type Tab = "generator" | "library" | "export" | "batch";

export type ModelItem = typeof MODELS_LIBRARY[0];

export type GeneratedModel = { name: string; polygons: string; time: string };
