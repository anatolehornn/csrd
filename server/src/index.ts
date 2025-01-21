import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { apiLimiter } from './middleware/rateLimit';
import { errorHandler } from './middleware/errorHandler';
import { validateRequest } from './middleware/validation';
import { TaxonomyController } from './controllers/taxonomyController';
import { TaxonomyService } from './services/taxonomyService';
import { z } from 'zod';
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

// Request validation schemas
// const QuerySchema = z.object({
//   query: z.object({
//     limit: z.string().optional().transform(Number).pipe(z.number().min(1).max(100)).optional(),
//     page: z.string().optional().transform(Number).pipe(z.number().min(1)).optional()
//   })
// });


// Routes
// API endpoint to get the taxonomy tree
app.get('/api/taxonomy', TaxonomyController.getTaxonomy); 

// API endpoint to get unique topics and their subtopics
app.get('/api/topics', TaxonomyController.getTopics); 

// API endpoint to get unique topics and their subtopics
app.post('/api/answers', TaxonomyController.saveAnswer);

// API endpoint get answer 
app.get('/api/answers/:nodeId', TaxonomyController.getAnswer);

// API endpoint to get answers for multiple nodes
app.get('/api/answers', TaxonomyController.getAnswers);

// API endpoint to save multiple answers
app.post('/api/answers/bulk', TaxonomyController.saveAnswers);


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
