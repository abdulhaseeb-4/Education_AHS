import { MCQ } from './types';

export const parseMCQs = (text: string): MCQ[] => {
  const blocks = text.split(/Subject:\s*/).filter(block => block.trim() !== '');
  const allMCQs: MCQ[] = [];
  let globalIdCounter = 0;

  blocks.forEach(block => {
      // Extract subject and term
      const subjectTermMatch = block.match(/^(.*?)\s*\|\s*Term:\s*(.*?)\s*\|\s*/);
      if (!subjectTermMatch) return;
      
      const subject = subjectTermMatch[1].trim();
      const term = subjectTermMatch[2].trim();
      const subjectLine = subjectTermMatch[0];
      
      // The rest of the block after subject/term
      let questionsPart = block.substring(subjectLine.length).trim();
      
      // Split into individual questions
      const questionSections = questionsPart.split(/\|\s*Question:\s*/).filter(q => q.trim() !== '');
      
      questionSections.forEach(qSection => {
          // Extract question components
          // Using a more robust regex to handle multi-line content if needed
          const qMatch = qSection.match(/(.*?)\s*\|\s*Options:\s*(.*?)\s*\|\s*Correct Answer:\s*(.*?)\s*\|\s*Explanation:\s*(.*?)(?:\s*\||$)/s);
          
          if (!qMatch) return;
          
          const questionText = qMatch[1].trim();
          const optionsText = qMatch[2].trim();
          const correctAnswer = qMatch[3].trim().toUpperCase(); // Ensure uppercase A,B,C,D
          const explanation = qMatch[4].trim();
          
          // Parse options
          const options: Record<string, string> = {};
          const optionRegex = /([A-D])\)\s*(.*?)(?=\s*[A-D]\)|$)/g;
          let match;
          
          while ((match = optionRegex.exec(optionsText)) !== null) {
              options[match[1].toUpperCase()] = match[2].trim();
          }
          
          // Fallback if regex fails (simple split for simple formats)
          if (Object.keys(options).length === 0) {
              // Try splitting by " A) ", " B) " etc manually if the regex didn't catch specific formatting
              // But for the provided file, the regex is tuned to the example.
          }

          globalIdCounter++;
          
          allMCQs.push({
              id: `${subject}-${term}-${globalIdCounter}`,
              subject,
              term,
              question: questionText,
              options,
              answer: correctAnswer,
              explanation
          });
      });
  });

  return allMCQs;
};

export const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};
