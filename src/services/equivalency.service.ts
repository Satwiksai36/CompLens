import { HeuristicResult } from "../types";

export class EquivalencyService {
  /**
   * Infers the standardized level and calculates a confidence score based on designation and years of experience.
   */
  static inferLevel(params: {
    designation: string;
    yearsOfExperience: number;
  }): HeuristicResult {
    const { designation, yearsOfExperience } = params;

    // A. YOE Banding
    // 0–2 Years: Entry
    // 2–5 Years: Mid
    // 5–9 Years: Senior
    // 9–13 Years: Staff
    // 13–15 Years: Principal
    // 15+ Years: Director+
    let yoeLevel = 'Entry';
    if (yearsOfExperience <= 2) {
      yoeLevel = 'Entry';
    } else if (yearsOfExperience <= 5) {
      yoeLevel = 'Mid';
    } else if (yearsOfExperience <= 9) {
      yoeLevel = 'Senior';
    } else if (yearsOfExperience <= 13) {
      yoeLevel = 'Staff';
    } else if (yearsOfExperience <= 15) {
      yoeLevel = 'Principal';
    } else {
      yoeLevel = 'Director+';
    }

    // B. Keyword Parsing
    const cleanDesignation = designation.toLowerCase().trim();

    // Group keywords. Ordered by priority/specificity
    const keywordGroups = [
      {
        levelName: 'Director+',
        keywords: ['director', 'vp', 'chief', 'head', 'cto', 'founder', 'partner', 'fellow'],
      },
      {
        levelName: 'Principal',
        keywords: ['principal', 'distinguished', 'senior manager', 'sde iv', 'sde 4'],
      },
      {
        levelName: 'Staff',
        keywords: ['staff', 'architect', 'technical manager', 'manager', 'lead mts', 'principal mts'],
      },
      {
        levelName: 'Senior',
        keywords: ['senior', 'sr', 'tech lead', 'lead', 'sde iii', 'sde 3', 'mts iii', 'mts 3', 'senior mts'],
      },
      {
        levelName: 'Entry',
        keywords: ['junior', 'jr', 'associate', 'intern', 'grad', 'trainee', 'sde i', 'sde 1', 'amts'],
      },
      {
        levelName: 'Mid',
        keywords: ['sde ii', 'sde 2', 'analyst', 'developer', 'engineer', 'mts', 'mts ii', 'mts 2'],
      },
    ];

    let matchedKeywordLevel: string | null = null;
    
    // Find the first matching keyword group
    for (const group of keywordGroups) {
      const hasMatch = group.keywords.some((kw) => {
        if (kw.length <= 3) {
          const regex = new RegExp(`\\b${kw}\\b`, 'i');
          return regex.test(cleanDesignation);
        }
        return cleanDesignation.includes(kw);
      });

      if (hasMatch) {
        matchedKeywordLevel = group.levelName;
        break;
      }
    }

    // C. Reconciliation & Confidence Scoring
    let targetLevel = yoeLevel;
    let confidenceScore = 0.5;

    if (matchedKeywordLevel) {
      targetLevel = matchedKeywordLevel;
      if (matchedKeywordLevel === yoeLevel) {
        // Alignment Bonus
        confidenceScore = 0.75;
      } else {
        // Conflict Penalty
        confidenceScore = 0.40;
      }
    } else {
      // Fallback (no keywords matched)
      targetLevel = yoeLevel;
      confidenceScore = 0.50;
    }

    return {
      normalizedLevel: targetLevel,
      confidenceScore,
      mappingType: 'estimated',
    };
  }
}
