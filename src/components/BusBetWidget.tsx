"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { getRandomBusToStopETA } from "@/lib/passiogo/get_eta";
import { useBetContext } from "./BusMap";
import { useToast } from "@/hooks/use-toast";

interface BetResult {
  success: boolean;
  won: boolean;
  betCount: number;
  remaining: number;
  canBet: boolean;
  pointsAwarded: number;
  bet?: {
    id: string;
    busName: string;
    stopName: string;
    expectedETA: string;
    actualETA: string;
    betChoice: "over" | "under";
    won: boolean;
    createdAt: string;
  };
}

export default function BusBetWidget() {
  const { user, setUser } = useAuth();
  const { etaInfo, setEtaInfo } = useBetContext();
  const { toast } = useToast();
  const [timeRemaining, setTimeRemaining] = useState<number>(15);
  const [isLoading, setIsLoading] = useState(false);
  const [isBetting, setIsBetting] = useState(false);
  const [hasPlacedBet, setHasPlacedBet] = useState(false);
  const [betChoice, setBetChoice] = useState<"over" | "under" | null>(null);
  const [betResult, setBetResult] = useState<BetResult | null>(null);
  const [remainingBets, setRemainingBets] = useState(5);
  const [actualArrivalTime, setActualArrivalTime] = useState<string | null>(
    null
  );
  const [fakeETA, setFakeETA] = useState<string | null>(null);
  const [todaysBets, setTodaysBets] = useState<any[]>([]);

  const fetchRandomETA = useCallback(async () => {
    setIsLoading(true);
    setFakeETA(null);
    setBetResult(null);
    setActualArrivalTime(null);
    setBetChoice(null);
    setHasPlacedBet(false);
    setIsBetting(false);

    // Add timeout to prevent infinite loading
    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), 15000)
    );

    try {
      const etaPromise = getRandomBusToStopETA(3994);
      const eta = await Promise.race([etaPromise, timeoutPromise]);

      if (eta) {
        setEtaInfo(eta);
        setTimeRemaining(15);
        setIsBetting(true);

        // generate fake ETA when starting bet
        const actualMinutes = parseInt(eta.duration.split(" ")[0]);

        const fakeShouldBeOver = Math.random() >= 0.5;
        const fakeDuration = fakeShouldBeOver
          ? `${actualMinutes + 1} mins`
          : `${Math.max(1, actualMinutes - 1)} mins`;

        console.log(
          "Actual minutes:",
          actualMinutes,
          "Fake:",
          fakeDuration,
          "Should be over:",
          fakeShouldBeOver
        );
        setFakeETA(fakeDuration);
      } else {
        // If no eta was returned but no error was thrown
        console.error("No valid ETA data received");
        toast({
          title: "Error",
          description: "Could not get bus data. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error getting ETA:", error);

      toast({
        title: "Error",
        description: "Failed to get bus data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [setEtaInfo, toast]);

  // check user's remaining bets for today
  const checkRemainingBets = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/bets?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setRemainingBets(data.remaining);
        setTodaysBets(data.bets || []);
      }
    } catch (error) {
      console.error("Error checking remaining bets:", error);
    }
  }, [user]);

  // initial check for remaining bets
  useEffect(() => {
    checkRemainingBets();
  }, [checkRemainingBets]);

  // countdown timer
  useEffect(() => {
    if (!isBetting || hasPlacedBet || timeRemaining <= 0) return;

    const timer = setTimeout(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);

    if (timeRemaining === 0) {
      setIsBetting(false);
    }

    return () => clearTimeout(timer);
  }, [timeRemaining, isBetting, hasPlacedBet]);

  const simulateActualArrival = useCallback(() => {
    if (!etaInfo || !fakeETA) return;

    // google maps eta is the actual arrival time
    const actualMinutes = parseInt(etaInfo.duration.split(" ")[0]);
    const fakeMinutes = parseInt(fakeETA.split(" ")[0]);

    setActualArrivalTime(`${actualMinutes} mins`);

    // - If actual < fake: actual is UNDER fake
    // - If actual > fake: actual is OVER fake
    const actualIsUnder = actualMinutes < fakeMinutes;

    // User wins if their bet matches the reality
    const userWon =
      (betChoice === "under" && actualIsUnder) ||
      (betChoice === "over" && !actualIsUnder);

    console.log(
      "Bet check - Actual:",
      actualMinutes,
      "Fake:",
      fakeMinutes,
      "actualIsUnder:",
      actualIsUnder,
      "userBet:",
      betChoice,
      "userWon:",
      userWon
    );

    return {
      actualTime: `${actualMinutes} mins`,
      fakeETA: fakeETA,
      wasOver: !actualIsUnder,
      userWon,
    };
  }, [etaInfo, fakeETA, betChoice]);

  const placeBet = async (choice: "over" | "under") => {
    if (!user || !etaInfo || hasPlacedBet || !fakeETA) return;

    setBetChoice(choice);
    setHasPlacedBet(true);

    const actualMinutes = parseInt(etaInfo.duration.split(" ")[0], 10);
    const fakeMinutes = parseInt(fakeETA.split(" ")[0], 10);

    setActualArrivalTime(`${actualMinutes} mins`);

    const actualIsUnder = actualMinutes < fakeMinutes;
    const userWon =
      (actualIsUnder && choice === "under") ||
      (!actualIsUnder && choice === "over");

    const result = {
      actualTime: `${actualMinutes} mins`,
      fakeETA,
      wasOver: !actualIsUnder,
      userWon,
    };

    try {
      // get token from localStorage
      const token = localStorage.getItem("token");

      const response = await fetch("/api/bets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          busName: etaInfo.vehicleName,
          stopName: etaInfo.stopName,
          expectedETA: result.fakeETA,
          actualETA: result.actualTime,
          betChoice: choice,
          won: result.userWon,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setBetResult(data);
        setRemainingBets(data.remaining);

        // Update user points in the header if bet was won
        if (data.won && data.pointsAwarded > 0) {
          const updatedPoints = user.points + data.pointsAwarded;
          setUser({
            ...user,
            points: updatedPoints,
          });

          // Also update localStorage
          try {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
              const userData = JSON.parse(storedUser);
              userData.points = updatedPoints;
              localStorage.setItem("user", JSON.stringify(userData));
            }
          } catch (error) {
            console.error("Error updating user points in localStorage:", error);
          }
        }
      } else {
        console.error("Bet failed:", await response.text());
      }
    } catch (error) {
      console.error("Error placing bet:", error);
    }
  };

  if (!user) {
    return (
      <div className="bg-black/70 p-6 rounded-lg border-2 border-white text-white h-full flex flex-col justify-center">
        <h2 className="text-2xl font-bold text-center mb-4">
          Bus Betting Game
        </h2>
        <p className="text-center">
          Please log in to place bets on bus arrival times!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-black/70 p-6 rounded-lg border-2 border-white text-white h-full flex flex-col overflow-y-auto">
      <h2 className="text-2xl font-bold text-center mb-4">Bus Betting Game</h2>

      {!isBetting && !hasPlacedBet && (
        <div className="text-center">
          <p className="mb-4">You have {remainingBets} bets remaining today.</p>

          {todaysBets.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xl font-bold mb-2">Today's Bets</h3>
              <div className="overflow-y-auto max-h-56 custom-scrollbar pr-2">
                {todaysBets.map((bet: any) => (
                  <div
                    key={bet._id}
                    className={`p-3 mb-2 rounded border border-opacity-20 ${
                      bet.won
                        ? "bg-green-900/30 border-green-400"
                        : "bg-red-900/30 border-red-400"
                    } transition-all hover:border-opacity-80`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-bold">
                        {bet.busName}{" "}
                        <span className="font-normal opacity-70">to</span>{" "}
                        {bet.stopName}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          bet.betChoice === "under"
                            ? "bg-green-800/50 text-green-300"
                            : "bg-red-800/50 text-red-300"
                        }`}
                      >
                        {bet.betChoice.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm">
                        <span className="opacity-70">ETA:</span>{" "}
                        {bet.expectedETA} →{" "}
                        <span className="font-medium">{bet.actualETA}</span>
                      </p>
                      {bet.won ? (
                        <span className="text-sm font-bold text-green-400">
                          +{bet.pointsAwarded}
                        </span>
                      ) : (
                        <span className="text-sm font-bold text-red-400">
                          LOST
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {remainingBets > 0 ? (
            <button
              onClick={fetchRandomETA}
              disabled={isLoading}
              className="px-6 py-3 bg-yellow-500 text-black font-bold rounded-full hover:bg-yellow-400 disabled:bg-gray-500 disabled:text-gray-300"
            >
              {isLoading ? "Loading..." : "Start New Bet"}
            </button>
          ) : (
            <p className="text-amber-400">
              You've reached your daily limit of 5 bets. Come back tomorrow!
            </p>
          )}
        </div>
      )}

      {isBetting && etaInfo && (
        <div className="text-center">
          <div className="mb-6">
            <h3 className="text-xl mb-2">Bus: {etaInfo.vehicleName}</h3>
            <h3 className="text-xl mb-2">Stop: {etaInfo.stopName}</h3>
            <p className="text-3xl font-bold text-amber-400 mb-2">
              ETA: {fakeETA}
            </p>
            <p className="text-lg mb-4">Distance: {etaInfo.distance}</p>

            {!hasPlacedBet ? (
              <>
                <p className="text-lg mb-2">
                  Will the bus arrive faster or slower than the estimated time?
                </p>
                <p className="text-amber-400 mb-4">
                  Time to bet: {timeRemaining}s
                </p>

                {timeRemaining > 0 ? (
                  <div className="flex justify-center gap-4 mt-4">
                    <button
                      onClick={() => placeBet("under")}
                      className="px-6 py-3 bg-green-600 text-white font-bold rounded-full hover:bg-green-500"
                    >
                      UNDER
                    </button>
                    <button
                      onClick={() => placeBet("over")}
                      className="px-6 py-3 bg-red-600 text-white font-bold rounded-full hover:bg-red-500"
                    >
                      OVER
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="mb-4">Time's up!</p>
                    <button
                      onClick={fetchRandomETA}
                      disabled={isLoading}
                      className="px-6 py-3 bg-yellow-500 text-black font-bold rounded-full hover:bg-yellow-400 disabled:bg-gray-500 disabled:text-gray-300"
                    >
                      {isLoading ? "Loading..." : "Start New Bet"}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="mt-4">
                <p className="text-xl font-bold mb-2">
                  You bet:{" "}
                  <span
                    className={
                      betChoice === "under" ? "text-green-400" : "text-red-400"
                    }
                  >
                    {betChoice === "under" ? "UNDER" : "OVER"}
                  </span>
                </p>

                {actualArrivalTime && (
                  <p className="text-xl mb-4">
                    Actual arrival:{" "}
                    <span className="font-bold">{actualArrivalTime}</span>
                    <span className="ml-2">
                      (
                      {parseInt(actualArrivalTime.split(" ")[0]) <
                      parseInt(fakeETA?.split(" ")[0] || "0")
                        ? "UNDER"
                        : "OVER"}
                      )
                    </span>
                  </p>
                )}

                {betResult && (
                  <div className="mt-4">
                    <p className="text-2xl font-bold mb-2">
                      {betResult.won ? (
                        <span className="text-green-400">
                          YOU WON +100 POINTS!
                        </span>
                      ) : (
                        <span className="text-red-400">
                          You lost. Try again!
                        </span>
                      )}
                    </p>
                    <p className="mt-2">
                      You have {betResult.remaining} bets remaining today.
                    </p>

                    <button
                      onClick={fetchRandomETA}
                      disabled={betResult.remaining <= 0 || isLoading}
                      className="mt-4 px-6 py-3 bg-yellow-500 text-black font-bold rounded-full hover:bg-yellow-400 disabled:bg-gray-500 disabled:text-gray-300"
                    >
                      {isLoading ? "Loading..." : "Bet Again"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
