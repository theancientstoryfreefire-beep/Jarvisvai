import { BaseSkill, SkillContext, SkillResult } from "../skill-system";

/**
 * Calculator Skill - Performs mathematical calculations
 * Handles basic arithmetic and some advanced operations
 */
export class CalculatorSkill extends BaseSkill {
  name = "Calculator";
  description = "Performs mathematical calculations";
  keywords = [
    "calculate",
    "math",
    "plus",
    "minus",
    "multiply",
    "divide",
    "what is",
    "equals",
  ];
  language: "en" | "hi" | "bn" = "en";

  canHandle(message: string): boolean {
    // Check for mathematical expressions
    const mathPattern = /(\d+\s*[\+\-\*\/]\s*\d+)|(\d+\s*percent)/i;
    return this.hasKeywords(message, this.keywords) || mathPattern.test(message);
  }

  async execute(context: SkillContext): Promise<SkillResult> {
    try {
      const result = this.calculateExpression(context.userMessage);

      if (result !== null) {
        const responseText = this.formatResponse(context.language, result);

        return {
          handled: true,
          response: responseText,
        };
      }

      return {
        handled: false,
        requiresAI: true,
      };
    } catch (error) {
      console.error("Error in calculation:", error);
      return {
        handled: false,
        requiresAI: true,
      };
    }
  }

  private calculateExpression(message: string): number | null {
    try {
      // Extract mathematical expression
      const expression = this.extractExpression(message);

      if (!expression) {
        return null;
      }

      // Use Function constructor for safe evaluation
      // Only allow numbers and basic operators
      if (!/^[\d+\-*/.().\s]+$/.test(expression)) {
        return null;
      }

      // Evaluate the expression
      const result = Function('"use strict"; return (' + expression + ")")();

      // Return rounded result
      return Math.round(result * 100) / 100;
    } catch (error) {
      console.error("Error calculating expression:", error);
      return null;
    }
  }

  private extractExpression(message: string): string | null {
    // Replace text operators with symbols
    let expression = message
      .toLowerCase()
      .replace(/plus/g, "+")
      .replace(/minus/g, "-")
      .replace(/multiply|times/g, "*")
      .replace(/divide|divided by/g, "/")
      .replace(/percent/g, "/100");

    // Extract numbers and operators
    const match = expression.match(/[\d+\-*/.().\s]+/);

    return match ? match[0].trim() : null;
  }

  private formatResponse(
    language: "en" | "hi" | "bn",
    result: number
  ): string {
    const responses = {
      en: `The result is ${result}.`,
      hi: `परिणाम ${result} है।`,
      bn: `ফলাফল হল ${result}।`,
    };

    return responses[language];
  }
}
