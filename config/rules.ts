
import { DropSource } from '../types';

export const EQUIPMENT_TIER_MAX = 9;

export const DROP_RATES: Record<string, number> = {
  [DropSource.QUEST_NOVICE]: 25,
  [DropSource.QUEST_INTERMEDIATE]: 50,
  [DropSource.QUEST_EXPERIENCED]: 75,
  [DropSource.QUEST_MASTER]: 95,
  [DropSource.QUEST_GRANDMASTER]: 100,
  [DropSource.CA_EASY]: 10,
  [DropSource.CA_MEDIUM]: 20,
  [DropSource.CA_HARD]: 35,
  [DropSource.CA_ELITE]: 50,
  [DropSource.CA_MASTER]: 75,
  [DropSource.CA_GRANDMASTER]: 100,
  [DropSource.COLLECTION_LOG]: 20,
  [DropSource.DIARY_EASY]: 33,
  [DropSource.DIARY_MEDIUM]: 66,
  [DropSource.DIARY_HARD]: 99,
  [DropSource.DIARY_ELITE]: 100,
  [DropSource.SLAYER_EASY]: 5,
  [DropSource.SLAYER_MEDIUM]: 15,
  [DropSource.SLAYER_HARD]: 30,
  [DropSource.SLAYER_BOSS]: 50,
  [DropSource.CLUE_BEGINNER]: 5,
  [DropSource.CLUE_EASY]: 10,
  [DropSource.CLUE_MEDIUM]: 20,
  [DropSource.CLUE_HARD]: 35,
  [DropSource.CLUE_ELITE]: 65,
  [DropSource.CLUE_MASTER]: 80,
  [DropSource.CUSTOM]: 50,
};