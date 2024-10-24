'use client';

import { useEffect, useState } from 'react';

// Define the card lists
const ekkiCards = ['A', '3', '5', '7', '9', 'J', 'K'];
const bekkiCards = ['2', '4', '6', '8', '10', 'Q'];

// Predefined bet amounts
const betOptions = [10, 20, 30, 40, 50];

const AkiBeki = () => {
    const [balance, setBalance] = useState<number>(100); // Player's balance
    const [currentCard, setCurrentCard] = useState<string>(''); // Current card drawn
    const [resultMessage, setResultMessage] = useState<string>(''); // Result message
    const [timeLeft, setTimeLeft] = useState<number>(10); // Timer countdown
    const [gameActive, setGameActive] = useState<boolean>(true); // Is the game active?
    const [betAmount, setBetAmount] = useState<number | null>(null); // Bet amount
    const [playerGuess, setPlayerGuess] = useState<'ekki' | 'bekki' | null>(null); // Player's guess

    // Function to get a random card
    const getRandomCard = () => {
        const allCards = [...ekkiCards, ...bekkiCards];
        const randomIndex = Math.floor(Math.random() * allCards.length);
        return allCards[randomIndex];
    };

    // Function to evaluate the result after the timer ends
    const evaluateResult = () => {
        if (playerGuess === null || betAmount === null) return;

        const isEkki = ekkiCards.includes(currentCard);
        const isBekki = bekkiCards.includes(currentCard);

        if (playerGuess === 'ekki' && isEkki) {
            setBalance((prev) => Math.min(prev + betAmount, 9999)); // Win
            setResultMessage(`You Win! The card was ${currentCard}. You earned ${betAmount}.`);
        } else if (playerGuess === 'bekki' && isBekki) {
            setBalance((prev) => Math.min(prev + betAmount, 9999)); // Win
            setResultMessage(`You Win! The card was ${currentCard}. You earned ${betAmount}.`);
        } else {
            setBalance((prev) => Math.max(prev - betAmount, 0)); // Lose
            setResultMessage(`You Lose! The card was ${currentCard}. You lost ${betAmount}.`);
        }

        // Reset for the next round
        resetRound();
    };

    // Reset the game round
    const resetRound = () => {
        setCurrentCard(getRandomCard()); // Draw a new card
        setTimeLeft(10); // Reset timer
        setPlayerGuess(null); // Clear player's guess
        setBetAmount(null); // Reset bet amount
        setResultMessage(''); // Clear result message
        setGameActive(true); // Start the new round
    };

    // Timer logic
    useEffect(() => {
        if (timeLeft === 0) {
            evaluateResult(); // Evaluate result when time runs out
            setGameActive(false); // Stop the game for this round
        } else if (gameActive) {
            const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
            return () => clearTimeout(timer); // Cleanup
        }
    }, [timeLeft, gameActive]);

    // Start the game on component mount
    useEffect(() => {
        resetRound(); // Initialize the first round
    }, []);

    // Handle player's guess
    const handleGuess = (guess: 'ekki' | 'bekki') => {
        if (betAmount === null) {
            setResultMessage('Please select a bet amount.');
            return;
        }

        if (betAmount > balance) {
            setResultMessage('Insufficient balance to place the bet.');
            return;
        }

        setPlayerGuess(guess); // Store player's guess
        setGameActive(false); // Stop guessing once a bet is placed
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold mb-6">Aki Beki Game</h1>
            <h2 className="text-2xl mb-4">Balance: {balance}</h2>
            <h3 className="text-xl mb-4">{resultMessage || 'Make your guess!'}</h3>
            <div className="text-2xl mb-4">Time Left: {timeLeft} seconds</div>

            <div className="flex space-x-4 mb-4">
                {betOptions.map((option) => (
                    <button
                        key={option}
                        className={`bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-300 ${betAmount === option ? 'bg-gray-500 text-white' : 'hover:bg-gray-400'
                            }`}
                        onClick={() => setBetAmount(option)}
                        disabled={!gameActive} // Disable bet selection if not active
                    >
                        {option}
                    </button>
                ))}
            </div>

            <div className="flex space-x-6">
                <button
                    className={`bg-red-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-red-600 transition duration-300 ${!gameActive && 'opacity-50 cursor-not-allowed'}`}
                    onClick={() => handleGuess('ekki')}
                    disabled={!gameActive || balance === 0}
                >
                    Ekki
                </button>
                <button
                    className={`bg-blue-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-blue-600 transition duration-300 ${!gameActive && 'opacity-50 cursor-not-allowed'}`}
                    onClick={() => handleGuess('bekki')}
                    disabled={!gameActive || balance === 0}
                >
                    Bekki
                </button>
            </div>

            <button
                className="mt-10 bg-green-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-green-600 transition duration-300"
                onClick={resetRound}
                disabled={balance === 0} // Disable reset if balance is zero
            >
                Reset Game
            </button>
        </div>
    );
};

export default AkiBeki;
