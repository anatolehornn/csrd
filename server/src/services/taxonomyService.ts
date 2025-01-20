import { TaxonomyCSVRow, TaxonomyNode } from '../../../shared/src/types/taxonomy';
import { parseCSVFile } from '../utils/csvParser';

export class TaxonomyService {
  private static instance: TaxonomyService;
  private cache: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): TaxonomyService {
    if (!TaxonomyService.instance) {
      TaxonomyService.instance = new TaxonomyService();
    }
    return TaxonomyService.instance;
  }

  async getTaxonomyTree(filePath: string): Promise<TaxonomyNode[]> {
    const cacheKey = `taxonomy-${filePath}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const rows = await parseCSVFile<TaxonomyCSVRow>(filePath);
    const tree = this.buildTaxonomyTree(rows);
    
    this.cache.set(cacheKey, tree);
    return tree;
  }

  // Function to generate a unique ID for each node
  private generateNodeId = (topic: string, subtopic: string, label: string): string => {
    return Buffer.from(`${topic}-${subtopic}-${label}`).toString('base64');
  };
  
  private buildTaxonomyTree(rows: TaxonomyCSVRow[]): TaxonomyNode[] {
    if (!Array.isArray(rows) || rows.length === 0) {
        throw new Error('Invalid or empty input data');
    }
    
    const tree: TaxonomyNode[] = [];
    const nodeMap = new Map<string, TaxonomyNode>();
    
    rows.forEach((row) => {
        const level = parseInt(row.level);
        const node: TaxonomyNode = {
        id: this.generateNodeId(row.topic, row.subtopic, row['questionLabel']),
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
}