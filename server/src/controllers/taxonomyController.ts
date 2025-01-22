import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { TaxonomyService } from '../services/taxonomyService';
import { TopicService } from '../services/topicService';
import { Answer } from '../../../shared/src/types/taxonomy';

export class TaxonomyController {
  static async getTaxonomy(_req: Request, res: Response, next: NextFunction) {
    try {
      const taxonomyService = TaxonomyService.getInstance();
      const filePath = path.join(__dirname, '../../../shared/src/data/taxonomy.csv');
      const taxonomyTree = await taxonomyService.getTaxonomyTree(filePath);
      
      res.json({
        status: 'success',
        data: taxonomyTree
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTopics(_req: Request, res: Response, next: NextFunction) {
    try {
      const topicService = TopicService.getInstance();
      const csvFilePath = path.join(__dirname, '../../../shared/src/data/taxonomy.csv');
      const topics = await topicService.getTopics(csvFilePath);
      
      res.json(topics);
    } catch (error) {
      next(error);
    }
  }

  static saveAnswer(req: Request, res: Response) {
    const { nodeId, value }: Answer = req.body; // Assuming the request body contains nodeId and value

    if (!nodeId || value === undefined) {
      return res.status(400).json({ error: 'nodeId and value are required' });
    }

    const topicService = TopicService.getInstance();
    topicService.saveAnswer(nodeId, value);

    res.status(201).json({ message: 'Answer saved successfully', nodeId, value });
  }

  static getAnswer(req: Request, res: Response) {
    const { nodeId } = req.params;

    if (!nodeId) {
      return res.status(400).json({ error: 'nodeId is required' });
    }

    const topicService = TopicService.getInstance();
    const answer = topicService.getAnswer(nodeId);

    if (answer === undefined) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    res.json({ nodeId, value: answer });
  }

  static async getAnswers(req: Request, res: Response) {
    const nodeIds = req.query.nodeIds as string;
  
    if (!nodeIds) {
      return res.status(400).json({ error: 'nodeIds query parameter is required' });
    }
  
    const nodeIdArray = nodeIds.split(',');
    const topicService = TopicService.getInstance();
    const answers: Record<string, string> = {};
  
    nodeIdArray.forEach(nodeId => {
      const answer = topicService.getAnswer(nodeId);
      if (answer !== undefined) {
        answers[nodeId] = answer;
      }
    });
  
    res.json(answers);
  }
  
  static async saveAnswers(req: Request, res: Response) {
    const { answers } = req.body;
    console.log('hi');
  
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'answers object is required' });
    }
  
    const topicService = TopicService.getInstance();
    try {
      Object.entries(answers).forEach(([nodeId, value]) => {
        topicService.saveAnswer(nodeId, value as string);
      });

      res.status(201).json({
        message: 'Answers saved successfully', 
        count: Object.keys(answers).length 
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to save answers', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }
  

}