export interface Answer {
  nodeId: string;
  value: string;
}

export interface Subtopic {
  id: string;
  name: string;
}

export interface Topic {
  id: string;
  name: string;
  subtopics: Subtopic[];
}

export interface Question {
  id: string;
  questionLabel: string;
  topic: string;
  subtopic: string;
  children: Question[];
}

export interface TaxonomyNode {
  id: string;
  level: number;
  questionLabel: string;
  topic: string;
  subtopic: string;
  children: TaxonomyNode[];
} 

export interface TaxonomyCSVRow {
  level: string;
  topic: string;
  subtopic: string;
  questionLabel: string;
}
