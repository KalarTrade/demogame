'use client'

import { useEffect, useState } from 'react';

// Define the card lists
const ekkiCards = ['A', '3', '5', '7', '9', 'J', 'K'];
const bekkiCards = ['2', '4', '6', '8', '10', 'Q'];

// Define all possible cards
const allCards = [...ekkiCards, ...bekkiCards];

// Predefined bet amounts
const betOptions = [10, 20, 30, 40, 50, 100];

const AkiBeki = () => {
    const [balance, setBalance] = useState<number>(100); // Player's balance
    const [currentCard, setCurrentCard] = useState<string>(''); // Random card display
    const [resultMessage, setResultMessage] = useState<string>(''); // Result message (Win or Lose)
    const [timeLeft, setTimeLeft] = useState<number>(10); // Timer countdown (10 seconds)
    const [betAmount, setBetAmount] = useState<number | null>(null); // Player's bet amount
    const [playerGuess, setPlayerGuess] = useState<'ekki' | 'bekki' | null>(null); // Stores player's guess
    const [isTimerActive, setIsTimerActive] = useState<boolean>(false); // Is the timer active?

    // Effect to handle timer countdown
    useEffect(() => {
        if (isTimerActive && timeLeft > 0) {
            const timer = setTimeout(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
            return () => clearTimeout(timer); // Cleanup timer on component unmount
        } else if (timeLeft === 0) {
            evaluateResult(); // Evaluate result when timer ends
        }
    }, [timeLeft, isTimerActive]);

    // Start a new round
    const startNewRound = () => {
        setCurrentCard(getRandomCard()); // Display a new card
        setTimeLeft(10); // Reset the timer
        setPlayerGuess(null); // Clear the player's guess
        setIsTimerActive(true); // Enable timer
        setBetAmount(null); // Reset bet amount
        setResultMessage(''); // Clear the result message
    };

    // Function to get a random card
    function getRandomCard() {
        const randomIndex = Math.floor(Math.random() * allCards.length);
        return allCards[randomIndex];
    }

    // Function to evaluate the result after the timer ends
    const evaluateResult = () => {
        setIsTimerActive(false); // Disable timer
        if (playerGuess === null) {
            setResultMessage(`Time's up! The card was ${currentCard}. No guess made.`);
            resetRound(); // Reset for the next round
            return; // Ensure a guess was made
        }

        const isEkki = ekkiCards.includes(currentCard);
        const isBekki = bekkiCards.includes(currentCard);

        if ((playerGuess === 'ekki' && isEkki) || (playerGuess === 'bekki' && isBekki)) {
            setBalance((prev) => Math.min(prev + (betAmount as number), 9999)); // Add bet amount on correct guess
            setResultMessage(`You Win! The card was ${currentCard}. You earned ${betAmount}.`);
        } else {
            setBalance((prev) => Math.max(prev - (betAmount as number), 0)); // Deduct bet amount on incorrect guess
            setResultMessage(`You Lose! The card was ${currentCard}. You lost ${betAmount}.`);
        }

        // Check if balance is zero and prompt for deposit
        if (balance <= 0) {
            alert('Your balance is zero. Please deposit to continue playing.');
        }

        resetRound(); // Start a new round after evaluation
    };

    // Reset the round after guess or timer expiration
    const resetRound = () => {
        setTimeout(() => {
            startNewRound(); // Start a new round
        }, 1000); // 1-second delay before resetting the round
    };

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
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold mb-6">Ekki & Bekki</h1>
            <h2 className="text-2xl mb-4 text-gray-800">Balance: {balance}</h2>

            <div className="text-xl font-bold mb-4">
                <h3>{resultMessage || 'Make your guess!'}</h3>
            </div>

            <div className="text-2xl mb-4 text-gray-700">Time Left: {timeLeft} seconds</div>

            <div className="flex space-x-4 mb-4">
                {betOptions.map((option) => (
                    <button
                        key={option}
                        className={`bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-300 ${betAmount === option ? 'bg-gray-500 text-white' : 'hover:bg-gray-400'
                            }`}
                        onClick={() => setBetAmount(option)}
                    >
                        {option}
                    </button>
                ))}
            </div>

            <div className="flex space-x-6 mb-4">
                <button
                    className={`bg-red-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-red-600 transition duration-300 ${(!isTimerActive || balance === 0 || betAmount === null) &&
                        'opacity-50 cursor-not-allowed'
                        }`}
                    onClick={() => handleGuess('ekki')}
                    disabled={!isTimerActive || balance === 0 || betAmount === null}
                >
                    Ekki
                </button>
                <button
                    className={`bg-blue-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-blue-600 transition duration-300 ${(!isTimerActive || balance === 0 || betAmount === null) &&
                        'opacity-50 cursor-not-allowed'
                        }`}
                    onClick={() => handleGuess('bekki')}
                    disabled={!isTimerActive || balance === 0 || betAmount === null}
                >
                    Bekki
                </button>
            </div>
        </div>
    );
};

export default AkiBeki;

