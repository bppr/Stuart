import React from 'react';
import { ReplayTime } from '../../common/index'
import * as sdk from '../sdk';

import { Stack, Typography, IconButton } from '@mui/material';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

function formatTime(seconds: number) {
    seconds = Math.round(seconds);
    let hours = (seconds / (60 * 60)) | 0;
    seconds -= hours * 60 * 60;
    let minutes = (seconds / 60) | 0;
    seconds -= minutes * 60;

    return hours + ":" +
        minutes.toString().padStart(2, '0') + ":" +
        seconds.toString().padStart(2, '0');
}


export default function Header(props: {
    time: ReplayTime
}) {

    const togglePlayPause = () => {
        if (props.time.camPaused) {
            sdk.playReplay();
        } else {
            sdk.pauseReplay();
        }
    };

    return <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={2}>
        <Typography variant="h3">👮 Stuart</Typography>
        <IconButton title={props.time.camPaused ? "Unpause Replay" : "Pause Replay"} sx={{ width: 64, height: 64 }}
            onClick={togglePlayPause} >
            {props.time.camPaused ? <PlayArrowIcon /> : <PauseIcon />}
        </IconButton>
        <IconButton title="Jump to Live" sx={{ width: 64, height: 64 }}
            onClick={sdk.liveReplay}>
            <SkipNextIcon />
        </IconButton>
        <Stack sx={{ width: 300 }} spacing={0}>
            <Typography variant="h5">Live: S{props.time.liveSessionNum} {formatTime(props.time.liveSessionTime)}</Typography>
            <Typography variant="h6">Replay: S{props.time.camSessionNum} {formatTime(props.time.camSessionTime)}</Typography>
            <Typography variant="subtitle1">Driver: #{props.time.camCarNumber} {props.time.camDriverName}</Typography>
        </Stack>
    </Stack>
}