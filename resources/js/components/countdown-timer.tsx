import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";

interface CountdownTimerProps {
    startTime: string;
    endTime: string;
    onTimeUp?: () => void;
}

function CountdownTimer({ startTime, endTime, onTimeUp }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState<number>(() => {
        const now = new Date(startTime).getTime();
        const end = new Date(endTime).getTime();
        return Math.max(0, Math.floor((end - now) / 1000));
    });

    const hasSubmittedRef = useRef<boolean>(false); // Prevent multiple calls

    useEffect(() => {
        if (timeLeft === 0 && onTimeUp && !hasSubmittedRef.current) {
            hasSubmittedRef.current = true; // Mark as submitted
            onTimeUp();
            return;
        }

        const interval = setInterval(() => {
            setTimeLeft((prevTimeLeft) => {
                if (prevTimeLeft <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prevTimeLeft - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft, onTimeUp]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <Card className="my-card !border-[1.5px] w-full h-20 p-3 space-y-1 text-center">
            <h3 className="font-medium text-xl">Waktu Tersisa</h3>
            <div className="flex flex-row items-center justify-center gap-2 font-bold text-blue-600 text-xl">
                <p>{String(minutes).padStart(2, "0")}</p>
                <span className="text-black">:</span>
                <p>{String(seconds).padStart(2, "0")}</p>
            </div>
        </Card>
    );
}

export default CountdownTimer;
