import React from "react";
import { Typography, Switch } from "@material-tailwind/react";

// Shared "Interview Mode" section with the Real-time Avatar Interview slider,
// reused across every schedule-interview form. When `disabled`, the slider is
// shown but locked off (used for Written Skills, which has no spoken avatar
// mode) and `disabledReason` explains why.
export default function AvatarModeToggle({ enabled, setEnabled, disabled = false, disabledReason }) {
    const on = enabled && !disabled;
    return (
        <>
            <hr className="my-6 border-gray-200" />
            <Typography variant="small" className="text-gray-400 font-semibold text-xs uppercase tracking-wider mb-4">Interview Mode</Typography>
            <div className={`flex items-center justify-between gap-4 p-4 rounded-lg border transition-colors
                ${disabled ? 'border-gray-200 bg-gray-100 opacity-70'
                    : on ? 'border-[#2c6031] bg-[#2c6031]/5' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex flex-col pr-4">
                    <Typography variant="small" className="font-semibold text-gray-800">Real-time Avatar Interview</Typography>
                    <Typography variant="small" className="text-gray-500 text-xs mt-0.5">
                        {disabled
                            ? (disabledReason || "Not available for this interview type.")
                            : "When enabled, assigned students take this interview with an AI avatar interviewer (asks questions aloud, listens to spoken answers). When off, it's the standard text interview."}
                    </Typography>
                </div>
                <Switch
                    checked={on}
                    onChange={(e) => setEnabled(e.target.checked)}
                    color="green"
                    disabled={disabled}
                    crossOrigin=""
                />
            </div>
        </>
    );
}
