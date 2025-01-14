import express from 'express';
import cors from 'cors';
import { parse } from 'csv-parse';
import fs from 'fs';
import path from 'path';
import { TaxonomyNode, TaxonomyCSVRow, Answer } from '../../shared/src/types/taxonomy';
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Function to generate a unique ID for each node
const generateNodeId = (topic: string, subtopic: string, label: string): string => {
  return Buffer.from(`${topic}-${subtopic}-${label}`).toString('base64');
};

// Function to build the taxonomy tree
const buildTaxonomyTree = (rows: TaxonomyCSVRow[]): TaxonomyNode[] => {
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
app.get('/api/taxonomy', async (req, res) => {
  try {
    const csvFilePath = path.join(__dirname, '../../shared/src/data/taxonomy.csv');
    const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
    
    parse(fileContent, {
      columns: true,
      delimiter: ',', // Ensure this matches your CSV delimiter
      trim: true,
      relax_quotes: true, // Allow for more lenient quoting
      skip_empty_lines: true, // Skip empty lines,
      cast: (value, context) => {
        if (typeof value === 'string') {
          return value.replace(/"/g, ""); // Replace " with noting
        }
        return value;
      }
    }, (err, rows: TaxonomyCSVRow[]) => {
      if (err) {
        console.error('Error parsing CSV:', err);
        return res.status(500).json({ error: 'Failed to parse CSV' });
      }
      const taxonomyTree = buildTaxonomyTree(rows);
      res.json(taxonomyTree);
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load taxonomy' });
  }
});

// API endpoint to get unique topics and their subtopics
app.get('/api/topics', async (req, res) => {
  try {
    const csvFilePath = path.join(__dirname, '../../shared/src/data/taxonomy.csv');
    const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
    
    parse(fileContent, {
      columns: true,
      delimiter: ',',
    }, (err, rows: TaxonomyCSVRow[]) => {
      if (err) throw err;
      
      const topicsMap = new Map<string, Set<string>>();
      
      rows.forEach((row) => {
        if (!topicsMap.has(row.topic)) {
          topicsMap.set(row.topic, new Set());
        }
        topicsMap.get(row.topic)?.add(row.subtopic);
      });
      
      const topics = Array.from(topicsMap.entries()).map(([name, subtopics]) => ({
        id: Buffer.from(name).toString('base64'),
        name,
        subtopics: Array.from(subtopics).map(subtopic => ({
          id: Buffer.from(`${subtopic}`).toString('base64'),
          // id: Buffer.from(`${name}-${subtopic}`).toString('base64'),
          name: subtopic
        }))
      }));
      
      res.json(topics);
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load topics' });
  }
});

// In-memory storage for answers (for demonstration purposes)
const answersStore: Record<string, string> = {};

// Endpoint to save answers
app.post('/api/answers', (req, res) => {
  const { nodeId, value }: Answer = req.body; // Assuming the request body contains nodeId and value

  if (!nodeId || value === undefined) {
    return res.status(400).json({ error: 'nodeId and value are required' });
  }

  // Save the answer
  answersStore[nodeId] = value;

  res.status(201).json({ message: 'Answer saved successfully', nodeId, value });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 