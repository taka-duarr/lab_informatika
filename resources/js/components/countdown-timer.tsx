import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";

interface CountdownTimerProps {
    startTime: string;
    endTime: string;
    onTimeUp?: () => void;
}

function CountdownTimer({ startTime, endTime, onTimeUp }: CountdownTimerProps) {
    const localEndTimeRef = useRef<number>(0);
    const onTimeUpRef = useRef(onTimeUp);
    const hasSubmittedRef = useRef<boolean>(false); // Prevent multiple calls

    useEffect(() => {
        onTimeUpRef.current = onTimeUp;
    }, [onTimeUp]);

    if (localEndTimeRef.current === 0) {
        const serverNow = new Date(startTime).getTime();
        const serverEnd = new Date(endTime).getTime();
        localEndTimeRef.current = Date.now() + (serverEnd - serverNow);
    }

    const [timeLeft, setTimeLeft] = useState<number>(() => {
        return Math.max(0, Math.floor((localEndTimeRef.current - Date.now()) / 1000));
    });

    useEffect(() => {
        const interval = setInterval(() => {
            const remainingLocal = localEndTimeRef.current - Date.now();
            const newTimeLeft = Math.max(0, Math.floor(remainingLocal / 1000));
            setTimeLeft(newTimeLeft);

            if (newTimeLeft <= 0) {
                clearInterval(interval);
                if (onTimeUpRef.current && !hasSubmittedRef.current) {
                    hasSubmittedRef.current = true;
                    onTimeUpRef.current();
                }
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (timeLeft <= 0 && onTimeUpRef.current && !hasSubmittedRef.current) {
            hasSubmittedRef.current = true;
            onTimeUpRef.current();
        }
    }, [timeLeft]);

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
