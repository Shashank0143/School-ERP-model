import { common } from "./common";
import { homepage } from "./homepage";
import { mentorTranslations } from "./mentor";
import { examTranslations } from "./exam";
import { newSectionsTranslations } from "./newSections";
import { curriculumTranslations } from "./curriculum";

export const translations = {
  en: {
    ...common.en,
    ...homepage.en,
    ...mentorTranslations.en,
    ...examTranslations.en,
    ...newSectionsTranslations.en,
    ...curriculumTranslations.en,
  },
  hi: {
    ...common.hi,
    ...homepage.hi,
    ...mentorTranslations.hi,
    ...examTranslations.hi,
    ...newSectionsTranslations.hi,
    ...curriculumTranslations.hi,
  }
};
