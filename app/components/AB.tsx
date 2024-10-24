'use client';

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
    const [gameActive, setGameActive] = useState<boolean>(false); // Is the game currently active?

    // Load the game state from localStorage on component mount
    useEffect(() => {
        const savedState = localStorage.getItem('akibeki-game-state');
        if (savedState) {
            const gameState = JSON.parse(savedState);
            setBalance(gameState.balance);
        }
    }, []);

    // Save the game state to localStorage whenever it changes
    useEffect(() => {
        const gameState = { balance };
        localStorage.setItem('akibeki-game-state', JSON.stringify(gameState));
    }, [balance]);

    // Function to get a random card
    const getRandomCard = () => {
        const randomIndex = Math.floor(Math.random() * allCards.length);
        return allCards[randomIndex];
    };

    // Function to start a new round
    const startNewRound = () => {
        setCurrentCard(getRandomCard()); // Display a new card
        setTimeLeft(10); // Reset the timer
        setResultMessage(''); // Clear the result message
        setPlayerGuess(null); // Clear the player's guess
        setBetAmount(null); // Reset bet amount for the new round
        setGameActive(true); // Start the game
    };

    // Function to evaluate the result after the timer ends
    const evaluateResult = () => {
        if (playerGuess === null) {
            setResultMessage(`Time's up! The card was ${currentCard}. No guess made.`);
            // Resetting state directly instead of calling a non-existent function
            resetGameState();
            return; // Ensure a guess was made
        }

        const isEkki = ekkiCards.includes(currentCard);
        const isBekki = bekkiCards.includes(currentCard);

        // Update balance based on player's guess
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

        resetGameState(); // Start a new round after evaluation
    };

    // Function to reset the game state for the next round
    const resetGameState = () => {
        setCurrentCard(''); // Clear the current card
        setTimeLeft(10); // Reset the timer for the next round
        setResultMessage(''); // Clear the result message
        setPlayerGuess(null); // Clear the player's guess
        setBetAmount(null); // Reset the bet amount
        setGameActive(true); // Set game active for new round
    };

    // Timer countdown logic using useEffect
    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (gameActive && timeLeft > 0) {
            timer = setTimeout(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        }

        if (timeLeft === 0) {
            evaluateResult(); // Evaluate result when time is up
        }

        return () => clearTimeout(timer); // Cleanup timer on component unmount
    }, [timeLeft, gameActive]);

    // Function to handle the player's guess
    const handleGuess = (guess: 'ekki' | 'bekki') => {
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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold mb-6">Ekki & Bekki</h1>
            <h2 className="text-2xl mb-4 text-gray-800">Balance: {balance}</h2>

            <div className="text-xl font-bold mb-4">
                <h3>{resultMessage ? resultMessage : 'Make your guess!'}</h3>
            </div>

            <div className="text-2xl mb-4 text-gray-700">Time Left: {timeLeft} seconds</div>

            <div className="flex space-x-4 mb-4">
                {betOptions.map((option) => (
                    <button
                        key={option}
                        className={`bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-300 ${betAmount === option ? 'bg-gray-500 text-white' : 'hover:bg-gray-400'}`}
                        onClick={() => setBetAmount(option)}
                        disabled={playerGuess !== null || balance <= 0} // Disable betting if a guess is made or balance is zero
                    >
                        {option}
                    </button>
                ))}
            </div>

            <div className="flex space-x-6 mb-4">
                <button
                    className={`bg-red-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-red-600 transition duration-300 ${(!gameActive || balance === 0 || betAmount === null) && 'opacity-50 cursor-not-allowed'}`}
                    onClick={() => handleGuess('ekki')}
                    disabled={!gameActive || balance === 0 || betAmount === null || playerGuess !== null} // Disable if a guess is made
                >
                    Ekki
                </button>
                <button
                    className={`bg-blue-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-blue-600 transition duration-300 ${(!gameActive || balance === 0 || betAmount === null) && 'opacity-50 cursor-not-allowed'}`}
                    onClick={() => handleGuess('bekki')}
                    disabled={!gameActive || balance === 0 || betAmount === null || playerGuess !== null} // Disable if a guess is made
                >
                    Bekki
                </button>
            </div>

            <button
                className="mt-10 bg-green-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-green-600 transition duration-300"
                onClick={startNewRound}
                disabled={balance === 0} // Disable starting a new round if balance is zero
            >
                Start New Round
            </button>
        </div>
    );
};

export default AkiBeki;
