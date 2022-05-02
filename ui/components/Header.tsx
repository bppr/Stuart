import React from 'react';
import * as sdk from '../sdk';

import { formatTime } from '../clock';

import { Stack, Typography, IconButton, Box } from '@mui/material';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { ClockState } from '../../common/ClockState';
import { CameraState } from '../../common/CameraState';
import CameraControls from './CameraControls';

/**
 * Header shows information about the session as a whole and allows for some control over the camera and session state.
 * 
 * Features: (not all implemented yet)
 * - Session state including
 *   - elapsed time
 *   - session type (practice, qualifying, warm up, race, etc)
 *   - status (gridding, starting, racing, caution, finished, etc.)
 *   - flags (green, caution, etc. Probably considered part of "status")
 * - Replay camera controls
 *   - play/pause
 *   - jump to live
 *   - current camera time
 *   - currently viewed driver
 */
export default function Header(props: {
    camera: CameraState,
}) {

    return <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={2}>
        <Typography variant="h3">👮 Stuart</Typography>
      
            <CameraControls camState={props.camera} />
       
    </Stack>
}