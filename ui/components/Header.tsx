import React from 'react';

import { Typography, Box, Fab, Tooltip } from '@mui/material';

import { CameraState } from '../../common/CameraState';
import { Flag } from '@mui/icons-material';
import DenseCameraControls from './DenseCameraControls';

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

    return <Box sx={{
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: 2
    }} >
        <Typography variant="h3">👮 Stuart</Typography>

        <DenseCameraControls camState={props.camera} />
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title="Throw Yellow">
            <Fab size='large' sx={{
                ":hover": {
                    backgroundColor: "#EEEE00"
                },
                backgroundColor: "#FFFF00",
                width: "64px",
                height: "64px",
            }}>
                <Flag />
            </Fab>
        </Tooltip>

    </Box>
}