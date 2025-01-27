import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { chatSession } from './AiModelAnalyze';
import { CheckCircle, AlertCircle, Lightbulb } from 'lucide-react'; // Icons from lucide
import { LoadingSpinner } from '../../components';

const QuizAnalyze = () => {
  const { questionAnswers } = useSelector((state) => state.quizzes);
  const [analysisResult, setAnalysisResult] = useState(null);

  const Prompt = `
    I am providing answers from a student’s recent quiz. After reviewing the responses, please return a JSON object that includes:
    points_forts: Highlights where the student performed well.
    domaines_d_amélioration: Identifies areas where the student can improve.
    recommandations: Provides actionable suggestions for improvement, such as study resources or exercises.
    The feedback should be in French and concise enough for a student to easily understand and use for improvement.
    Student Responses :${JSON.stringify(questionAnswers, null, 2)}
  `;

  const Aianalyze = async () => {
    try {
      const AiAnalyzeResponse = await chatSession.sendMessage(Prompt);
      setAnalysisResult(AiAnalyzeResponse?.response?.text());
    } catch (error) {
      console.error('Error fetching AI analysis:', error);
    }
  };

  useEffect(() => {
    Aianalyze();
  }, [questionAnswers]);

  if (!analysisResult) {
    return <LoadingSpinner />;
  }

  // Assuming the response structure is in this format:
  const { points_forts, domaines_d_amélioration, recommandations } = JSON.parse(analysisResult);
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-semibold text-center text-primary">Feedback sur le quiz</h2>

      <div className="space-y-4">
        {points_forts?.length > 0 && (
          <div className="card bg-green-100 shadow-lg p-4 rounded-lg">
            <h3 className="flex items-center text-lg font-semibold text-green-700">
              <CheckCircle className="mr-2" size={24} />
              Points forts
            </h3>
            <p className="text-green-800">{points_forts}</p>
          </div>
        )}

        {domaines_d_amélioration?.length > 0 && (
          <div className="card bg-red-100 shadow-lg p-4 rounded-lg">
            <h3 className="flex items-center text-lg font-semibold text-red-700">
              <AlertCircle className="mr-2" size={24} />
              Domaines d'Amélioration
            </h3>
            <p className="text-red-800">{domaines_d_amélioration}</p>
          </div>
        )}

        {recommandations?.length > 0 && (
          <div className="card bg-yellow-100 shadow-lg p-4 rounded-lg">
            <h3 className="flex items-center text-lg font-semibold text-yellow-700">
              <Lightbulb className="mr-2" size={24} />
              Recommandations
            </h3>
            <p className="text-yellow-800">{recommandations}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizAnalyze;
