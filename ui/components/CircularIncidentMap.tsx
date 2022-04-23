import React from "react";

import { Avatar, Box, CircularProgress, SvgIcon, SxProps } from "@mui/material"

export type IncidentIcon = {
    /** A unique ID for the incident */
    incidentId: number,
    /** An emoji, or other text, to be used as the icon's main content. May be null if {icon} is defined. */
    emoji?: string,
    /** An Icon to use as the icon's main content. May be null if {emoji} is defined */
    icon?: typeof SvgIcon,
    /** The position (from 0 to 1) around the circle that the incident icon should be placed */
    trackPositionPct: number,
    /** True if the icon should be emphasized */
    highlighted?: boolean,
}

/**
 * CircularIncidentMap displays a "track map" in the form of a circle, with icons
 * @param props 
 * @returns 
 */
export function CircularIncidentMap(props: {
    size: number,
    icons: IncidentIcon[],
    color?: string
}) {

    // separate icons into highlighted and non-highlighted. Draw highlighted ones second
    const regularIcons: IncidentIcon[] = [];
    const highlightedIcons: IncidentIcon[] = [];
    props.icons.forEach(icon => {
        if(icon.highlighted) {
            highlightedIcons.push(icon);
        } else {
            regularIcons.push(icon);
        }
    });

    const color = props.color ?? "#808080";

    return <Box sx={{
        width: props.size,
        height: props.size,
        position: "relative"
    }}>
        <CircularProgress sx={{
            position: "absolute",
            top: 22,
            left: 22,
            color,
        }} size={props.size-44} value={100} thickness={1} variant="determinate" />
        { /* draw start/finish line */ }
        <Box sx={{
            position: "absolute",
            width: 4,
            height:32,
            left: "50%",
            top: 24,
            bgcolor: color,
            transform: "translateX(-50%) translateY(-50%)"
        }} />
        { /* draw individual icons */
            regularIcons.map(icon => <Avatar key={`inc-${icon.incidentId}`}
                sx={{
                position: "absolute",
                width: 18,
                height:  18,
                fontSize: 9,
                top: "50%",
                left: "50%",
                transform: `translateX(-50%) translateY(-50%) `+
                    `rotate(${icon.trackPositionPct}turn) `+
                    `translateX(${(props.size-48)/2}px) `+
                    `rotate(-${icon.trackPositionPct}turn)`,
            }}>
                {icon.emoji ?? icon.icon}
            </Avatar>)
        }
        { /* draw highlighted icons over regular ones */
            highlightedIcons.map(icon => <Avatar key={`inc-${icon.incidentId}`}
                sx={{
                position: "absolute",
                width: 32,
                height:  32,
                fontSize:16,
                top: "50%",
                left: "50%",
                transform: `translateX(-50%) translateY(-50%) `+
                    `rotate(${icon.trackPositionPct}turn) `+
                    `translateX(${(props.size-48)/2}px) `+
                    `rotate(-${icon.trackPositionPct}turn)`,
            }}>
                {icon.emoji ?? icon.icon}
            </Avatar>)
        }
    </Box>
}

