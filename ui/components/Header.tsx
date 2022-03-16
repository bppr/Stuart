import React from 'react';
import * as sdk from '../sdk';

import { formatTime } from '../clock';

import { Stack, Typography, IconButton } from '@mui/material';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { ClockState } from '../../common/ClockState';

export default function Header(props: {
    time: ClockState
}) {

    const togglePlayPause = () => {
        if (props.time.camSpeed == 0) {
            sdk.playReplay();
        } else {
            sdk.pauseReplay();
        }
    };

    return <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={2}>
        <Typography variant="h3">👮 Stuart</Typography>
        <IconButton title={props.time.camSpeed == 0 ? "Unpause Replay" : "Pause Replay"} sx={{ width: 64, height: 64 }}
            onClick={togglePlayPause} >
            {props.time.camSpeed == 0 ? <PlayArrowIcon /> : <PauseIcon />}
        </IconButton>
        <IconButton title="Jump to Live" sx={{ width: 64, height: 64 }}
            onClick={sdk.liveReplay}>
            <SkipNextIcon />
        </IconButton>
        <Stack sx={{ width: 300 }} spacing={0}>
            <Typography variant="h5">Live: S{props.time.live.num} {formatTime(props.time.live.time)}</Typography>
            <Typography variant="h6">Replay: S{props.time.replay.num} {formatTime(props.time.replay.time)}</Typography>
            <Typography variant="subtitle1">Driver: #{props.time.camCar.number} {props.time.camCar.driverName}</Typography>
        </Stack>
    </Stack>
}