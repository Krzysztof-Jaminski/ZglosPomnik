// Utility functions for parsing and formatting tree descriptions
// This ensures consistency between form creation and display

export interface ParsedDescription {
  treeName: string;
  userDescription: string;
  stories: string;
  detailedHealth: string[];
  hasStructuredFormat: boolean;
}

/**
 * Parse a tree description that was created using the TreeReportForm format
 * Format: "Nazwa drzewa: [name]\n\n[description]\n\nHistorie i legendy drzewa:\n[stories]"
 */
export const parseTreeDescription = (description: string): ParsedDescription => {
  const result: ParsedDescription = {
    treeName: '',
    userDescription: '',
    stories: '',
    detailedHealth: [],
    hasStructuredFormat: false
  };
  
  if (!description || !description.trim()) {
    return result;
  }
  
  // Extract tree name
  let nameMatch = description.match(/Nazwa drzewa:\s*(.+?)(?:\n|$)/);
  if (!nameMatch) {
    nameMatch = description.match(/Nazwa drzewa:\s*(.+?)(?:\r\n|\r|\n|$)/);
  }
  if (!nameMatch) {
    nameMatch = description.match(/Nazwa drzewa:\s*(.+?)(?:\s|$)/);
  }
  
  if (nameMatch) {
    result.treeName = nameMatch[1].trim();
    result.hasStructuredFormat = true;
  }
  
  // Split description into sections
  const sections = description.split(/\n\s*\n/);
  let currentSection = '';
  
  for (const section of sections) {
    if (section.startsWith('Nazwa drzewa:')) {
      // Skip tree name section
      continue;
    } else if (section.startsWith('Stany zdrowia drzewa:')) {
      // Parse health conditions
      const healthText = section.replace('Stany zdrowia drzewa:', '').trim();
      if (healthText) {
        result.detailedHealth = healthText.split(',').map(item => item.trim()).filter(item => item);
      }
    } else if (section.startsWith('Historie i legendy drzewa:')) {
      // Parse stories
      result.stories = section.replace('Historie i legendy drzewa:', '').trim();
    } else if (section.trim() && !currentSection) {
      // This is the user description (first non-empty section that's not a special section)
      currentSection = section.trim();
    }
  }
  
  // Clean user description from tree name if it exists
  if (currentSection && nameMatch) {
    const namePattern = `Nazwa drzewa: ${result.treeName}`;
    if (currentSection.startsWith(namePattern)) {
      result.userDescription = currentSection.substring(namePattern.length).trim();
    } else {
      result.userDescription = currentSection;
    }
  } else {
    result.userDescription = currentSection;
  }
  
  return result;
};

/**
 * Create a tree description in the format used by TreeReportForm
 * This ensures consistency between form creation and display
 */
export const createTreeDescription = (
  treeName: string,
  userDescription: string,
  stories: string,
  detailedHealth: string[] = []
): string => {
  let combinedDescription = '';
  
  // Add tree name at the beginning if provided
  if (treeName.trim()) {
    combinedDescription = `Nazwa drzewa: ${treeName.trim()}`;
  }
  
  // Add user description if provided
  if (userDescription.trim()) {
    combinedDescription += combinedDescription ? `\n\n${userDescription.trim()}` : userDescription.trim();
  }
  
  // Add detailed health conditions if provided
  if (detailedHealth.length > 0) {
    const healthSection = 'Stany zdrowia drzewa:\n' + detailedHealth.join(', ');
    combinedDescription += combinedDescription ? `\n\n${healthSection}` : healthSection;
  }
  
  // Add tree stories if provided
  if (stories.trim()) {
    const storiesSection = 'Historie i legendy drzewa:\n' + stories.trim();
    combinedDescription += combinedDescription ? `\n\n${storiesSection}` : storiesSection;
  }
  
  return combinedDescription;
};
