'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GameState, Player, Round } from '@/types/quiz';
import { allRounds } from '@/data/questions';

export default function QuizGame() {
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    rounds: allRounds,
    currentRound: 0,
    currentQuestion: 0,
    gamePhase: 'setup',
    answers: {}
  });

  const [newPlayerName, setNewPlayerName] = useState('');

  const addPlayer = () => {
    if (newPlayerName.trim()) {
      const newPlayer: Player = {
        id: Date.now().toString(),
        name: newPlayerName.trim(),
        score: 0
      };
      setGameState(prev => ({
        ...prev,
        players: [...prev.players, newPlayer]
      }));
      setNewPlayerName('');
    }
  };

  const startGame = () => {
    if (gameState.players.length > 0) {
      setGameState(prev => ({
        ...prev,
        gamePhase: 'playing'
      }));
    }
  };

  const selectAnswer = (answerIndex: number) => {
    const currentQuestion = gameState.rounds[gameState.currentRound]?.questions[gameState.currentQuestion];
    if (!currentQuestion) return;

    setGameState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [currentQuestion.id]: answerIndex
      }
    }));
  };

  const nextQuestion = () => {
    const currentRound = gameState.rounds[gameState.currentRound];
    const currentQuestion = currentRound.questions[gameState.currentQuestion];
    
    // Update scores for all players based on their answers
    const updatedPlayers = gameState.players.map(player => {
      const playerAnswer = gameState.answers[currentQuestion.id];
      if (playerAnswer === currentQuestion.correctAnswer) {
        return { ...player, score: player.score + 10 };
      }
      return player;
    });

    if (gameState.currentQuestion < currentRound.questions.length - 1) {
      setGameState(prev => ({
        ...prev,
        players: updatedPlayers,
        currentQuestion: prev.currentQuestion + 1,
        gamePhase: 'results'
      }));
    } else if (gameState.currentRound < gameState.rounds.length - 1) {
      setGameState(prev => ({
        ...prev,
        players: updatedPlayers,
        currentRound: prev.currentRound + 1,
        currentQuestion: 0,
        gamePhase: 'results'
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        players: updatedPlayers,
        gamePhase: 'finished'
      }));
    }
  };

  const continueToNextQuestion = () => {
    setGameState(prev => ({
      ...prev,
      gamePhase: 'playing'
    }));
  };

  const resetGame = () => {
    setGameState({
      players: [],
      rounds: allRounds,
      currentRound: 0,
      currentQuestion: 0,
      gamePhase: 'setup',
      answers: {}
    });
  };

  if (gameState.gamePhase === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-800">Family Quiz Game</CardTitle>
            <p className="text-gray-600">Add players to start the quiz</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Enter player name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
              />
              <Button onClick={addPlayer}>Add Player</Button>
            </div>
            
            {gameState.players.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Players:</h3>
                <div className="flex flex-wrap gap-2">
                  {gameState.players.map((player) => (
                    <Badge key={player.id} variant="secondary" className="text-sm px-3 py-1">
                      {player.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold mb-3">Game Rounds:</h3>
              <div className="space-y-2">
                {gameState.rounds.map((round, index) => (
                  <div key={round.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{round.name}</span>
                    <Badge variant="outline">
                      {round.questions.length} questions
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              onClick={startGame} 
              className="w-full" 
              size="lg"
              disabled={gameState.players.length === 0}
            >
              Start Quiz Game
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameState.gamePhase === 'playing') {
    const currentRound = gameState.rounds[gameState.currentRound];
    const currentQuestion = currentRound?.questions[gameState.currentQuestion];
    const totalQuestions = gameState.rounds.reduce((sum, round) => sum + round.questions.length, 0);
    const currentQuestionNumber = gameState.rounds.slice(0, gameState.currentRound).reduce((sum, round) => sum + round.questions.length, 0) + gameState.currentQuestion + 1;
    const progress = (currentQuestionNumber / totalQuestions) * 100;

    if (!currentQuestion) {
      return <div>Loading...</div>;
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl">{currentRound.name}</CardTitle>
                <Badge variant="outline">
                  Question {gameState.currentQuestion + 1} of {currentRound.questions.length}
                </Badge>
              </div>
              <Progress value={progress} className="w-full" />
            </CardHeader>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6 text-center">
                {currentQuestion.question}
              </h2>
              
              {currentQuestion.type === 'logo' && currentQuestion.mediaUrl && (
                <div className="flex justify-center mb-6">
                  <div className="w-48 h-48 bg-gray-50 rounded-lg flex items-center justify-center text-8xl">
                    {currentQuestion.mediaUrl}
                  </div>
                </div>
              )}

              {currentQuestion.type === 'sound' && currentQuestion.mediaUrl && (
                <div className="flex justify-center mb-6">
                  <div className="w-48 h-48 bg-gray-50 rounded-lg flex items-center justify-center text-8xl">
                    {currentQuestion.mediaUrl}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={gameState.answers[currentQuestion.id] === index ? "default" : "outline"}
                    className="p-6 text-lg h-auto"
                    onClick={() => selectAnswer(index)}
                  >
                    {String.fromCharCode(65 + index)}. {option}
                  </Button>
                ))}
              </div>

              <div className="flex justify-center mt-8">
                <Button 
                  onClick={nextQuestion}
                  size="lg"
                  disabled={gameState.answers[currentQuestion.id] === undefined}
                >
                  {gameState.currentQuestion < currentRound.questions.length - 1 ? 'Next Question' :
                   gameState.currentRound < gameState.rounds.length - 1 ? 'Next Round' : 'Finish Game'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Players</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {gameState.players.map((player) => (
                  <div key={player.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{player.name}</span>
                    <Badge>{player.score} pts</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (gameState.gamePhase === 'results') {
    const currentRound = gameState.rounds[gameState.currentRound];
    const currentQuestion = currentRound?.questions[gameState.currentQuestion - 1] || 
                          gameState.rounds[gameState.currentRound - 1]?.questions[gameState.rounds[gameState.currentRound - 1].questions.length - 1];
    
    if (!currentQuestion) return null;

    const correctAnswer = currentQuestion.options[currentQuestion.correctAnswer];
    const userAnswer = gameState.answers[currentQuestion.id];
    const isCorrect = userAnswer === currentQuestion.correctAnswer;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Question Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">{currentQuestion.question}</h3>
              {currentQuestion.mediaUrl && (
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-24 bg-gray-50 rounded-lg flex items-center justify-center text-4xl">
                    {currentQuestion.mediaUrl}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'} border`}>
                <div className="text-center">
                  <div className="text-4xl mb-2">{isCorrect ? '✅' : '❌'}</div>
                  <div className="font-semibold">
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </div>
                  {!isCorrect && (
                    <div className="text-sm mt-2">
                      Your answer: {userAnswer !== undefined ? currentQuestion.options[userAnswer] : 'No answer'}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-100 border border-blue-300 p-4 rounded-lg">
                <div className="text-center">
                  <div className="font-semibold text-blue-800">Correct Answer:</div>
                  <div className="text-blue-700">{correctAnswer}</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Current Scores:</h4>
                <div className="space-y-2">
                  {gameState.players
                    .sort((a, b) => b.score - a.score)
                    .map((player, index) => (
                      <div key={player.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span>{index + 1}. {player.name}</span>
                        <Badge>{player.score} pts</Badge>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <Button onClick={continueToNextQuestion} className="w-full" size="lg">
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameState.gamePhase === 'finished') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Quiz Complete!</CardTitle>
            <p className="text-gray-600">Thanks for playing</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Final Scores:</h3>
              <div className="space-y-2">
                {gameState.players
                  .sort((a, b) => b.score - a.score)
                  .map((player, index) => (
                    <div key={player.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">
                        {index === 0 ? '🏆' : `${index + 1}.`} {player.name}
                      </span>
                      <Badge variant={index === 0 ? "default" : "secondary"}>
                        {player.score} pts
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
            
            <Button onClick={resetGame} className="w-full" size="lg">
              Play Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}