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
app.get('/api/taxonomy', TaxonomyController.getTaxonomy); 
app.get('/api/topics', TaxonomyController.getTopics); 
app.post('/api/answers', TaxonomyController.saveAnswer);
app.get('/api/answers/:nodeId', TaxonomyController.getAnswer);
app.get('/api/answers', TaxonomyController.getAnswers);
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
