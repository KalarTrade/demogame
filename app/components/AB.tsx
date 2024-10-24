'use client'

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Define the card lists
const ekkiCards = ['A', '3', '5', '7', '9', 'J', 'K'];
const bekkiCards = ['2', '4', '6', '8', '10', 'Q'];

// Define all possible cards
const allCards = [...ekkiCards, ...bekkiCards];

// Predefined bet amounts
const betOptions = [10, 20, 30, 40, 50];

const AkiBeki = () => {
    const [balance, setBalance] = useState<number>(100); // Player's balance
    const [currentCard, setCurrentCard] = useState<string>(getRandomCard()); // Random card display
    const [resultMessage, setResultMessage] = useState<string>(''); // Result message (Win or Lose)
    const [timeLeft, setTimeLeft] = useState<number>(30); // Timer countdown (30 seconds)
    const [betAmount, setBetAmount] = useState<number | null>(null); // Player's bet amount
    const [playerGuess, setPlayerGuess] = useState<'ekki' | 'bekki' | null>(null); // Stores player's guess
    const [gameActive, setGameActive] = useState<boolean>(true); // Is the game still active?
    const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state for result evaluation

    // Load the game state from localStorage on component mount
    useEffect(() => {
        const savedState = localStorage.getItem('akibeki-game-state');
        if (savedState) {
            const gameState = JSON.parse(savedState);
            setBalance(gameState.balance);
            setCurrentCard(gameState.currentCard);
            setTimeLeft(gameState.timeLeft);
            setGameActive(gameState.gameActive);
            setBetAmount(gameState.betAmount);
            setPlayerGuess(gameState.playerGuess);
            setResultMessage(gameState.resultMessage);
        }
    }, []);

    // Save the game state to localStorage whenever it changes
    useEffect(() => {
        const gameState = {
            balance,
            currentCard,
            timeLeft,
            gameActive,
            betAmount,
            playerGuess,
            resultMessage,
        };
        localStorage.setItem('akibeki-game-state', JSON.stringify(gameState));
    }, [balance, currentCard, timeLeft, gameActive, betAmount, playerGuess, resultMessage]);

    // Function to get a random card
    function getRandomCard() {
        const randomIndex = Math.floor(Math.random() * allCards.length);
        return allCards[randomIndex];
    }

    // Function to evaluate the result after the timer ends
    const evaluateResult = () => {
        setIsLoading(true); // Show loading spinner
        setTimeout(() => {
            if (playerGuess === null) {
                setResultMessage(`Time's up! ${currentCard}`);
                setIsLoading(false);
                resetRound();
                return; // Ensure a guess was made
            }

            const isEkki = ekkiCards.includes(currentCard);
            const isBekki = bekkiCards.includes(currentCard);

            if ((playerGuess === 'ekki' && isEkki) || (playerGuess === 'bekki' && isBekki)) {
                setBalance((prev) => Math.min(prev + (betAmount as number), 9999)); // Add bet amount on correct guess
                setResultMessage(`You Win! ${currentCard}. +${betAmount}.`);
            } else {
                setBalance((prev) => Math.max(prev - (betAmount as number), 0)); // Deduct bet amount on incorrect guess
                setResultMessage(`You Lose! ${currentCard}. -${betAmount}.`);
            }

            // Check if balance is zero and prompt for deposit
            if (balance <= 0) {
                alert('Your balance is zero. Please deposit to continue playing.');
            }

            resetRound(); // Start a new round after evaluation
            setIsLoading(false); // Hide loading spinner
        }, 1000); // Simulate processing time
    };

    // Reset the round after guess or timer expiration
    const resetRound = () => {
        setTimeout(() => {
            setCurrentCard(getRandomCard()); // Display a new card
            setTimeLeft(30); // Reset the timer
            setPlayerGuess(null); // Clear the player's guess
            setGameActive(true); // Enable guessing for the new round
            setResultMessage(''); // Clear the result message
            setBetAmount(null); // Reset bet amount after round
        }, 1000); // 1-second delay before resetting the round
    };

    // Timer countdown logic using useEffect
    useEffect(() => {
        const timer = setInterval(() => {
            if (timeLeft > 0) {
                setTimeLeft((prev) => prev - 1);
            } else {
                clearInterval(timer);
                evaluateResult(); // Evaluate the result once the timer reaches 0
            }
        }, 1000);

        return () => clearInterval(timer); // Cleanup timer on component unmount
    }, [timeLeft]);

    // Function to handle the player's guess
    const handleGuess = (guess: 'ekki' | 'bekki') => {
        // Check if bet amount is valid and player has enough balance
        if (betAmount === null) {
            setResultMessage('Please select a bet amount.');
            return;
        }

        if (betAmount > balance) {
            setResultMessage('Insufficient balance to place the bet.');
            return;
        }

        setPlayerGuess(guess); // Store the player's guess
        setGameActive(false); // Disable further guessing until the round ends
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-5xl font-bold mb-6 text-blue-600 animate-bounce">Ekki & Bekki</h1>
            <h2 className="text-3xl mb-4 text-gray-200">Balance: ${balance}</h2>

            <div className="text-xl font-bold mb-4">
                <h3>{resultMessage ? resultMessage : 'Make your guess!'}</h3>
            </div>

            <div className="text-2xl mb-4 text-gray-100">
                Time Left: {timeLeft} seconds
            </div>

            {isLoading && (
                <motion.div
                    className="flex items-center justify-center mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="loader border-4 border-t-transparent border-gray-500 rounded-full w-12 h-12 animate-spin"></div>
                </motion.div>
            )}

            <div className="flex space-x-4 mb-4">
                {betOptions.map((option) => (
                    <motion.button
                        key={option}
                        className={`bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-300 ${betAmount === option ? 'bg-gray-500 text-white' : 'hover:bg-gray-400'
                            }`}
                        onClick={() => setBetAmount(option)}
                        disabled={playerGuess !== null} // Disable betting if option has been selected
                    >
                        {option}
                    </motion.button>
                ))}
            </div>

            <div className="flex space-x-6">
                <motion.button
                    className={`bg-red-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-red-600 transition duration-300 ${(!gameActive || balance === 0 || betAmount === null) &&
                        'opacity-50 cursor-not-allowed'
                        }`}
                    onClick={() => handleGuess('ekki')}
                    disabled={!gameActive || balance === 0 || betAmount === null || playerGuess !== null} // Disable if guess has been made
                >
                    Ekki
                </motion.button>
                <motion.button
                    className={`bg-blue-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-blue-600 transition duration-300 ${(!gameActive || balance === 0 || betAmount === null) &&
                        'opacity-50 cursor-not-allowed'
                        }`}
                    onClick={() => handleGuess('bekki')}
                    disabled={!gameActive || balance === 0 || betAmount === null || playerGuess !== null} // Disable if guess has been made
                >
                    Bekki
                </motion.button>
            </div>

            <motion.button
                className="mt-10 bg-green-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-green-600 transition duration-300"
                onClick={resetRound}
                disabled={balance === 0} // Disable reset if balance is zero
            >
                Reset Game
            </motion.button>
        </div>
    );
};

// Helper function to get a random card
function getRandomCard() {
    const randomIndex = Math.floor(Math.random() * allCards.length);
    return allCards[randomIndex];
}

export default AkiBeki;
