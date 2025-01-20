import { TaxonomyCSVRow } from '../../../shared/src/types/taxonomy';
import { parseCSVFile } from '../utils/csvParser';

export class TopicService {
  private static instance: TopicService;  
  private answersStore: Record<string, string> = {}; // In-memory storage for answers (for demonstration purposes)

  private constructor() {}

  public static getInstance(): TopicService {
    if (!TopicService.instance) {
      TopicService.instance = new TopicService();
    }
    return TopicService.instance;
  }

  async getTopics(csvFilePath: string) {
    const rows = await parseCSVFile<TaxonomyCSVRow>(csvFilePath);
    const topicsMap = new Map<string, Set<string>>();

    rows.forEach((row: { topic: string; subtopic: string; }) => {
      if (!topicsMap.has(row.topic)) {
        topicsMap.set(row.topic, new Set());
      }
      topicsMap.get(row.topic)?.add(row.subtopic);
    });

    return Array.from(topicsMap.entries()).map(([name, subtopics]) => ({
      id: Buffer.from(name).toString('base64'),
      name,
      subtopics: Array.from(subtopics).map(subtopic => ({
        id: Buffer.from(`${subtopic}`).toString('base64'),
        name: subtopic
      }))
    }));
  }

  saveAnswer(nodeId: string, value: string): void {
    this.answersStore[nodeId] = value;
  }

  getAnswer(nodeId: string): string | undefined {
    return this.answersStore[nodeId];
  }
}