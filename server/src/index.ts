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
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use('/api', apiLimiter);

const PORT = process.env.PORT || 3001;

// Function to generate a unique ID for each node
const generateNodeId = (topic: string, subtopic: string, label: string): string => {
  return Buffer.from(`${topic}-${subtopic}-${label}`).toString('base64');
};

// Common CSV parsing options
const CSV_PARSE_OPTIONS = {
  columns: true,
  delimiter: ',', // Ensure this matches your CSV delimiter
  trim: true,
  relax_quotes: true, // Allow for more lenient quoting
  skip_empty_lines: true, // Skip empty lines,
  cast: (value: string | any, context: any) => {
    if (typeof value === 'string') {
      return value.replace(/"/g, ""); // Replace " with noting
    }
    return value;
  }
};

// Utility function to read and parse CSV
const parseCSVFile = async (filePath: string): Promise<TaxonomyCSVRow[]> => {
  try {
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');
    return new Promise((resolve, reject) => {
      parse(fileContent, CSV_PARSE_OPTIONS, (err, rows: TaxonomyCSVRow[]) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  } catch (error) {
    console.error('Error reading or parsing CSV:', error);
    throw new Error('Failed to process CSV file');
  }
};

// Function to build the taxonomy tree
const buildTaxonomyTree = (rows: TaxonomyCSVRow[]): TaxonomyNode[] => {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error('Invalid or empty input data');
  }

  const tree: TaxonomyNode[] = [];
  const nodeMap = new Map<string, TaxonomyNode>();
  
  rows.forEach((row) => {
    const level = parseInt(row.level);
    const node: TaxonomyNode = {
      id: generateNodeId(row.topic, row.subtopic, row['questionLabel']),
      level,
      topic: Buffer.from(row.topic).toString('base64'),
      subtopic: Buffer.from(row.subtopic).toString('base64'),
      questionLabel: row['questionLabel'],
      children: [],
    };
    
    nodeMap.set(node.id, node);
    
    if (level === 1) {
      tree.push(node);
    } else {
      // Find parent node
      const parentNode = [...nodeMap.values()].find(
        (n) => n.topic === node.topic &&
        n.subtopic === node.subtopic &&
        n.level === level - 1
      );
      if (parentNode) {
        parentNode.children.push(node);
      }
    }
  });
  
  return tree;
};

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
// Error handling middleware (should be last)
app.use(errorHandler);

app.listen(config.PORT, () => {
  console.log(`Server is running on port ${config.PORT}`);
}); 
