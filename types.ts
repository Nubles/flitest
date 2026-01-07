
export enum DropSource {
  QUEST_NOVICE = 'Quest (Novice)',
  QUEST_INTERMEDIATE = 'Quest (Intermediate)',
  QUEST_EXPERIENCED = 'Quest (Experienced)',
  QUEST_MASTER = 'Quest (Master)',
  QUEST_GRANDMASTER = 'Quest (Grandmaster)',
  CA_EASY = 'Combat Achievement (Easy)',
  CA_MEDIUM = 'Combat Achievement (Medium)',
  CA_HARD = 'Combat Achievement (Hard)',
  CA_ELITE = 'Combat Achievement (Elite)',
  CA_MASTER = 'Combat Achievement (Master)',
  CA_GRANDMASTER = 'Combat Achievement (Grandmaster)',
  LEVEL_UP = 'Level Up',
  COLLECTION_LOG = 'Collection Log',
  DIARY_EASY = 'Diary (Easy)',
  DIARY_MEDIUM = 'Diary (Medium)',
  DIARY_HARD = 'Diary (Hard)',
  DIARY_ELITE = 'Diary (Elite)',
  SLAYER_EASY = 'Slayer (Turael/Spria/Mazchna)',
  SLAYER_MEDIUM = 'Slayer (Vannaka/Chaeldar/Krystilia)',
  SLAYER_HARD = 'Slayer (Nieve/Duradel/Konar)',
  SLAYER_BOSS = 'Slayer (Boss Task)',
  CLUE_BEGINNER = 'Clue Scroll (Beginner)',
  CLUE_EASY = 'Clue Scroll (Easy)',
  CLUE_MEDIUM = 'Clue Scroll (Medium)',
  CLUE_HARD = 'Clue Scroll (Hard)',
  CLUE_ELITE = 'Clue Scroll (Elite)',
  CLUE_MASTER = 'Clue Scroll (Master)',
  CUSTOM = 'Custom',
}

export enum TableType {
  EQUIPMENT = 'Equipment',
  SKILLS = 'Skills',
  REGIONS = 'Regions',
  MOBILITY = 'Mobility',
  ARCANA = 'Arcana',
  POH = 'Housing',
  MERCHANTS = 'Merchants',
  MINIGAMES = 'Minigames',
  BOSSES = 'Bosses',
  STORAGE = 'Storage',
  GUILDS = 'Guilds',
  FARMING_LAYERS = 'Farming Patches',
  AGILITY_COURSES = 'Agility Courses',
  QUESTS = 'Quests',
  DIARIES = 'Diaries',
  COMBAT_ACHIEVEMENTS = 'Combat Achievements',
}

export interface LogEntry {
  id: string;
  timestamp: number;
  type: 'ROLL' | 'UNLOCK' | 'PITY' | 'ALTAR' | 'ROLL_SUCCESS' | 'ROLL_FAIL' | 'ROLL_OMNI' | 'LEVEL_UP';
  source?: string;
  result?: 'SUCCESS' | 'FAIL';
  rollValue?: number;
  threshold?: number;
  message: string;
  details?: string;
  meta?: any;
}

export interface UnlockState {
  equipment: Record<string, number>; // Store Tier level (0-9)
  skills: Record<string, number>; // Name -> Tier (1-10)
  levels: Record<string, number>; // Name -> Current Level (1-99)
  regions: string[];
  mobility: string[];
  arcana: string[];
  housing: string[];
  merchants: string[];
  minigames: string[];
  bosses: string[];
  storage: string[];
  guilds: string[];
  farming: string[];
  quests: string[]; // List of completed Quest IDs
  diaries: string[]; // List of completed Diary IDs (e.g. "Ardougne Easy")
  cas: string[]; // List of completed CA tiers (e.g. "Easy")
  completedTasks: string[]; // Individual Task IDs
  collectionLog: Record<number, number>; // ItemID -> Count
}

export interface GameState {
  version?: number;
  keys: number;
  specialKeys: number;
  chaosKeys: number;
  fatePoints: number;
  activeBuff: 'NONE' | 'LUCK' | 'GREED';
  unlocks: UnlockState;
  history: LogEntry[];
  animationsEnabled?: boolean;
  hasSeenOnboarding?: boolean;
  pinnedGoals: string[]; // IDs from STRATEGY_DATABASE
  userNotes: Record<string, string>; // ID -> Note Content
}
