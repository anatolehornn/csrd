import axios from 'axios';
import { Answer, TaxonomyNode, Topic } from '../../shared/src/types/taxonomy';

const API_BASE_URL = 'http://localhost:3001/api';

export const api = {
  async getTaxonomy(): Promise<TaxonomyNode[]> {
    const response = await axios.get(`${API_BASE_URL}/taxonomy`);
    return response.data;
  },

  async getTopics(): Promise<Topic[]> {
    const response = await axios.get(`${API_BASE_URL}/topics`);
    return response.data;
  },

  async saveAnswers(answer: Answer): Promise<void> {
    const response = await axios.post(`${API_BASE_URL}/answers`, answer);
    return response.data;
  }
}; 