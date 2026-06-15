import { SkillManager } from "./skill-system";
import { GreetingSkill, TimeSkill, DateSkill, JokeSkill } from "./skill-system";
import { WebSearchSkill } from "./skills/web-search-skill";
import { WeatherSkill } from "./skills/weather-skill";
import { NewsSkill } from "./skills/news-skill";
import { CalculatorSkill } from "./skills/calculator-skill";
import { ReminderSkill } from "./skills/reminder-skill";

/**
 * Extended Skill Manager with all available skills
 * This module initializes and manages all skills for Jarvis
 */
export class ExtendedSkillManager extends SkillManager {
  constructor() {
    super();

    // Register additional skills
    this.registerSkill(new WebSearchSkill());
    this.registerSkill(new WeatherSkill());
    this.registerSkill(new NewsSkill());
    this.registerSkill(new CalculatorSkill());
    this.registerSkill(new ReminderSkill());
  }
}

// Export singleton instance with all skills
export const extendedSkillManager = new ExtendedSkillManager();

/**
 * Get all available skills information
 */
export function getAvailableSkills() {
  return extendedSkillManager.getSkills().map((skill) => ({
    name: skill.name,
    description: skill.description,
    keywords: skill.keywords,
  }));
}

/**
 * Get skill help information
 */
export function getSkillHelp() {
  const skills = extendedSkillManager.getSkills();

  return skills
    .map(
      (skill) =>
        `${skill.name}: ${skill.description}\nKeywords: ${skill.keywords.join(", ")}`
    )
    .join("\n\n");
}
