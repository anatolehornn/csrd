import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Paper,
  Button,
  SelectChangeEvent,
  Snackbar,
  Alert,
} from '@mui/material';
import { TaxonomyNode, Topic } from '../../shared/src/types/taxonomy';
import { api } from './api';

function App() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedSubtopic, setSelectedSubtopic] = useState('');
  const [taxonomy, setTaxonomy] = useState<TaxonomyNode[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ text: string; severity: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [topicsData, taxonomyData] = await Promise.all([
        api.getTopics(),
        api.getTaxonomy(),
      ]);
      setTopics(topicsData);
      setTaxonomy(taxonomyData);
    };
    fetchData();
  }, []);

  const handleTopicChange = (event: SelectChangeEvent) => {
    setSelectedTopic(event.target.value);
    setSelectedSubtopic('');
  };

  const handleSubtopicChange = async (event: SelectChangeEvent) => {
    setSelectedSubtopic(event.target.value);
    const currentQuestions = taxonomy.filter(
      node => node.topic === selectedTopic && node.subtopic === event.target.value
    );
    await loadAnswers(currentQuestions);
  };

  const handleAnswerChange = (nodeId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [nodeId]: value,
    }));
  };

  const getCurrentQuestions = () => {
    if (!selectedTopic || !selectedSubtopic) return [];
    return taxonomy.filter(
      node => node.topic === selectedTopic && node.subtopic === selectedSubtopic
    );
  };

  const loadAnswers = async (questions: TaxonomyNode[]) => {
    const loadedAnswers: Record<string, string> = {};
    
    const loadAnswersRecursive = async (nodes: TaxonomyNode[]) => {
      for (const node of nodes) {
        try {
          const answer = await api.getAnswer(node.id);
          if (answer !== undefined) {
            loadedAnswers[node.id] = answer;
          }
        } catch (error) {
          console.error(`Error loading answer for node ${node.id}:`, error);
        }
        if (node.children.length > 0) {
          await loadAnswersRecursive(node.children);
        }
      }
    };
  
    await loadAnswersRecursive(questions);
    setAnswers(loadedAnswers);
  };

  const renderQuestions = (nodes: TaxonomyNode[], level = 0) => {
    return nodes.map(node => (
      <Box key={node.id} sx={{ ml: level * 3, mb: 2 }}>
        <Typography variant="body1" sx={{ mb: 1 }}>
          {node.questionLabel}
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          value={answers[node.id] || ''}
          onChange={(e) => handleAnswerChange(node.id, e.target.value)}
          placeholder="Enter your answer here..."
        />
        {node.children.length > 0 && (
          <Box sx={{ mt: 2 }}>
            {renderQuestions(node.children, level + 1)}
          </Box>
        )}
      </Box>
    ));
  };

  const selectedTopicData = topics.find(t => t.id === selectedTopic);

  const saveAnswers = async () => {
    try {
      await Promise.all(
        Object.entries(answers).map(([nodeId, value]) => 
          api.saveAnswers({ nodeId, value })
        )
      );
      setMessage({ text: 'All answers saved successfully', severity: 'success' });
    } catch (error: any) {
      setMessage({ text: 'Error saving answers: ' + error.message, severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setMessage(null);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          ESG Reporting Tool
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Topic</InputLabel>
              <Select
                value={selectedTopic}
                label="Topic"
                onChange={handleTopicChange}
              >
                {topics.map((topic) => (
                  <MenuItem key={topic.id} value={topic.id}>
                    {topic.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Subtopic</InputLabel>
              <Select
                value={selectedSubtopic}
                label="Subtopic"
                onChange={handleSubtopicChange}
                disabled={!selectedTopic}
              >
                {selectedTopicData?.subtopics.map((subtopic) => (
                  <MenuItem key={subtopic.id} value={subtopic.id}>
                    {subtopic.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {selectedTopic && selectedSubtopic && (
          <Paper sx={{ p: 3 }}>
            {renderQuestions(getCurrentQuestions())}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={saveAnswers}
              >
                Save Answers
              </Button>
            </Box>
          </Paper>
        )}

        {message && (
          <Snackbar open={true} autoHideDuration={6000} onClose={handleCloseSnackbar}>
            <Alert onClose={handleCloseSnackbar} severity={message.severity} sx={{ width: '100%' }}>
              {message.text}
            </Alert>
          </Snackbar>
        )}
      </Box>
    </Container>
  );
}

export default App;