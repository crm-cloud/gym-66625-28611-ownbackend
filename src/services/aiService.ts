const API_BASE_URL = '/api/ai';

interface AIGeneratePlanParams {
  planType: 'diet' | 'workout';
  duration: number;
  preferences: {
    dietaryRestrictions?: string[];
    fitnessLevel?: string;
    goals?: string[];
    targetCalories?: number;
    workoutSplit?: string;
    availableEquipment?: string[];
    allergies?: string[];
    cuisinePreferences?: string[];
  };
  userData?: {
    age?: number;
    gender?: string;
    weight?: number;
    height?: number;
    activityLevel?: string;
  };
}

export const aiService = {
  async generatePlan(params: AIGeneratePlanParams) {
    try {
      const response = await fetch(`${API_BASE_URL}/generate-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error generating plan:', error);
      throw error;
    }
  },

  async getAIProviders() {
    try {
      const response = await fetch(`${API_BASE_URL}/providers`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching AI providers:', error);
      throw error;
    }
  },

  async updateAISettings(settings: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating AI settings:', error);
      throw error;
    }
  },

  async getExerciseSuggestions(query: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/exercises/suggest?query=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting exercise suggestions:', error);
      throw error;
    }
  },

  async getFoodSuggestions(query: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/food/suggest?query=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting food suggestions:', error);
      throw error;
    }
  }
};
