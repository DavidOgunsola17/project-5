import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import { Card } from './Card';
import { sounds } from '../lib/sounds';

const PULSE_QUESTIONS = [
  {
    question: 'How well do you know each other?',
    options: ['Just met', 'Somewhat', 'Pretty well', 'Very well'],
  },
  {
    question: 'How comfortable do you feel speaking up?',
    options: ['Nervous', 'Cautious', 'Comfortable', 'Confident'],
  },
  {
    question: 'Are you more competitive or collaborative?',
    options: ['Very competitive', 'Competitive', 'Collaborative', 'Very collaborative'],
  },
];

export function GroupPulse({ onComplete, gameSync, userId }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [aggregateResults, setAggregateResults] = useState(null);

  const handleAnswer = (optionIndex) => {
    sounds.tap();
    setSelectedOption(optionIndex);
  };

  const handleNext = async () => {
    if (selectedOption === null) return;

    sounds.success();
    
    // Save answer to backend
    if (gameSync && userId) {
      await gameSync.submitGroupPulseAnswer(currentQuestion, selectedOption);
    }
    
    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);
    setSelectedOption(null);

    if (currentQuestion < PULSE_QUESTIONS.length - 1) {
      setTimeout(() => {
        sounds.transition();
        setCurrentQuestion(currentQuestion + 1);
      }, 300);
    } else {
      // Load aggregate results
      if (gameSync) {
        const { data } = await gameSync.getGroupPulseResults();
        if (data) {
          // Calculate aggregate results
          const results = PULSE_QUESTIONS.map((q, qIdx) => {
            const questionAnswers = data.filter(a => a.question_index === qIdx);
            const counts = [0, 0, 0, 0];
            questionAnswers.forEach(a => {
              if (a.answer_index >= 0 && a.answer_index < 4) {
                counts[a.answer_index]++;
              }
            });
            return counts;
          });
          setAggregateResults(results);
        }
      }
      setTimeout(() => {
        setShowResults(true);
      }, 300);
    }
  };

  const handleComplete = () => {
    sounds.success();
    onComplete(answers);
  };

  if (showResults) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen flex items-center justify-center p-6 bg-slate-50"
      >
        <Card className="max-w-2xl w-full text-center" variant="purple">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-6xl mb-6"
          >
            ✓
          </motion.div>
          <h2 className="text-4xl font-black mb-4 tracking-tight">Pulse captured</h2>
          <p className="text-gray-700 text-lg font-medium mb-8">
            Let's see how this changes.
          </p>

          <div className="space-y-4 mb-8">
            {PULSE_QUESTIONS.map((q, idx) => {
              const counts = aggregateResults?.[idx] || [0, 0, 0, 0];
              const total = counts.reduce((a, b) => a + b, 0);
              const maxCount = Math.max(...counts);
              
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className="bg-white rounded-xl p-4"
                >
                  <p className="font-bold text-gray-900 text-sm mb-2">{q.question}</p>
                  <div className="flex gap-2">
                    {q.options.map((option, optIdx) => {
                      const percentage = total > 0 ? (counts[optIdx] / total) * 100 : 0;
                      const isMax = counts[optIdx] === maxCount && maxCount > 0;
                      return (
                        <div
                          key={optIdx}
                          className={`flex-1 h-2 rounded-full transition-all ${
                            isMax ? 'bg-gray-900' : 'bg-gray-300'
                          }`}
                          style={{
                            height: `${Math.max(8, percentage / 10)}px`,
                          }}
                          title={`${counts[optIdx]} responses`}
                        />
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-600 mt-2 font-medium">
                    {total} {total === 1 ? 'response' : 'responses'} aggregated
                  </p>
                </motion.div>
              );
            })}
          </div>

          <Button size="lg" onClick={handleComplete} className="w-full">
            Start Playing
          </Button>
        </Card>
      </motion.div>
    );
  }

  const question = PULSE_QUESTIONS[currentQuestion];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center p-6 bg-slate-50"
    >
      <Card className="max-w-2xl w-full">
        <div className="mb-6">
          <div className="flex gap-2 mb-8">
            {PULSE_QUESTIONS.map((_, idx) => (
              <div
                key={idx}
                className={`flex-1 h-1 rounded-full transition-colors ${
                  idx === currentQuestion
                    ? 'bg-gray-900'
                    : idx < currentQuestion
                    ? 'bg-gray-400'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          <p className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">
            Group Pulse · Question {currentQuestion + 1} of {PULSE_QUESTIONS.length}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-3xl font-black mb-8 tracking-tight text-center">
              {question.question}
            </h2>

            <div className="grid grid-cols-1 gap-3 mb-8">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className={`p-4 rounded-xl font-bold transition-all ${
                    selectedOption === idx
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            <p className="text-center text-sm text-gray-600 font-medium mb-6">
              Your answer is private
            </p>

            <Button
              size="lg"
              onClick={handleNext}
              disabled={selectedOption === null}
              className="w-full"
            >
              {currentQuestion < PULSE_QUESTIONS.length - 1 ? 'Next Question' : 'See Results'}
            </Button>
          </motion.div>
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
