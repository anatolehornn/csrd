import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { apiLimiter } from './middleware/rateLimit';
import { errorHandler } from './middleware/errorHandler';
import { TaxonomyService } from './services/taxonomyService';
import path from 'path';
import { Answer } from '../../shared/src/types/taxonomy';
import { TopicService } from './services/topicService';
import { config } from './config/env';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use('/api', apiLimiter);

// API endpoint to get the taxonomy tree
app.get(
  '/api/taxonomy',
  async (_req, res, next) => {
    try {
      const taxonomyService = TaxonomyService.getInstance();
      const filePath = path.join(__dirname, '../../shared/src/data/taxonomy.csv');
      const taxonomyTree = await taxonomyService.getTaxonomyTree(filePath);
      
      res.json({
        status: 'success',
        data: taxonomyTree
      });
    } catch (error) {
      next(error);
    }
  }
);

// API endpoint to get unique topics and their subtopics
app.get('/api/topics', 
  async (_req, res, next) => {
  try {
    const topicService = TopicService.getInstance();
    const csvFilePath = path.join(__dirname, '../../shared/src/data/taxonomy.csv');
    const topics = await topicService.getTopics(csvFilePath);
    
    res.json(topics);
  } catch (error) {
    next(error);
  }
});

// Endpoint to save answers
app.post('/api/answers', (req, res) => {
  const { nodeId, value }: Answer = req.body; // Assuming the request body contains nodeId and value

  if (!nodeId || value === undefined) {
    return res.status(400).json({ error: 'nodeId and value are required' });
  }

  // Save the answer
  const topicService = TopicService.getInstance();
  topicService.saveAnswer(nodeId, value);

  res.status(201).json({ message: 'Answer saved successfully', nodeId, value });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Error handling middleware (should be last)
app.use(errorHandler);

app.listen(config.PORT, () => {
  console.log(`Server is running on port ${config.PORT}`);
}); 
