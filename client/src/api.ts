import axios from 'axios';
import { Answer, TaxonomyNode, Topic } from '../../shared/src/types/taxonomy';

const API_BASE_URL = 'http://localhost:3001/api';

export const api = {
  async getTaxonomy(): Promise<TaxonomyNode[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/taxonomy`);
      if (response.status === 200) {
        return response.data.data;
      }
      throw new Error(`Failed to fetch taxonomy: ${response.status}`);
    } catch (error) {
      console.error('Error fetching taxonomy:', error);
      throw error;
    }
  },

  async getTopics(): Promise<Topic[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/topics`);
      if (response.status === 200) {
        return response.data;
      }
      throw new Error(`Failed to fetch topics: ${response.status}`);
    } catch (error) {
      console.error('Error fetching topics:', error);
      throw error;
    }
  },

  async saveAnswers(answer: Answer): Promise<void> {
    try {
      const response = await axios.post(`${API_BASE_URL}/answers`, answer);
      if (response.status !== 200 && response.status !== 201) {
        throw new Error(`Failed to save answers: ${response.status}`);
      }
      return response.data;
    } catch (error) {
      console.error('Error saving answers:', error);
      throw error;
    }
  }
}; 