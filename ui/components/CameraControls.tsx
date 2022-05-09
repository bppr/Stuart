import React, { useState } from 'react';

import { Avatar, Box, Fab, FormControl, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import { CameraState } from "../../common/CameraState";
import FastRewindIcon from "@mui/icons-material/FastRewind";
import FastForwardIcon from "@mui/icons-material/FastForward";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import GoToLiveIcon from "@mui/icons-material/LastPage";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import sdk from '../sdk';

function formatTime(time: number) {

    let millis = (time * 1000) | 0;
    const hours = (millis / (1000 * 60 * 60)) | 0;
    millis -= hours * 60 * 60 * 1000;
    const minutes = (millis / (1000 * 60)) | 0;
    millis -= minutes * 1000 * 60;
    const seconds = (millis / 1000) | 0;
    millis -= seconds * 1000;

    return hours + ':' + ("" + minutes).padStart(2, '0') + ':' + ("" + seconds).padStart(2, '0') + '.' + ("" + millis).padStart(3, '0');
}


export default function CameraControls(props: { camState: CameraState }) {

    let sortedCars = [...props.camState.cars];
    sortedCars.sort((a, b) => parseInt(a.number) - parseInt(b.number));

    function rewind() {
        const speed = props.camState.current.speed;
        if (speed > -1) {
            sdk.replaySpeed(-1);
        } else {
            sdk.replaySpeed((speed | 0) * 2);
        }
    }

    function fastForward() {
        const speed = props.camState.current.speed;
        if (speed < 1) {
            sdk.replaySpeed(1);
        } else {
            sdk.replaySpeed((speed | 0) * 2);
        }
    }


    const isPaused = props.camState.current.speed == 0;

    const camCar = props.camState.cars.find((car) => car.idx == props.camState.current.carIdx);

    return <Box sx={{ display: "flex", flexDirection: "column", width: "800px", gap: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-around", alignItems: "center", gap: 2 }}>
            <Fab size="small" variant="extended"
                onClick={() => sdk.replaySearch("PrevSession")}>
                <ChevronLeftIcon />
                Session
            </Fab>
            <Fab size="small" variant="extended"
                onClick={() => sdk.replaySearch("PrevLap")}>
                <ChevronLeftIcon />
                Lap
            </Fab>
            <Fab size="medium" onClick={rewind}
                disabled={props.camState.current.speed <= -16}>
                <FastRewindIcon />
            </Fab>
            <Fab size="large"
                onClick={() => {
                    if (isPaused) {
                        sdk.playReplay();
                    } else {
                        sdk.pauseReplay();
                    }
                }}>
                {
                    isPaused ? <PlayArrowIcon /> : <PauseIcon />
                }
            </Fab>
            <Fab size="medium" onClick={fastForward} disabled={props.camState.current.speed >= 16}>
                <FastForwardIcon />
            </Fab>
            <Fab size="medium" variant="extended"
                onClick={() => sdk.replaySearch("ToEnd")}
            >
                Live
                <GoToLiveIcon />
            </Fab>
            <Fab size="small" variant="extended" onClick={() => sdk.replaySearch("NextLap")}>
                Lap
                <ChevronRightIcon />
            </Fab>
            <Fab size="small" variant="extended" onClick={() => sdk.replaySearch("NextSession")}>
                Session
                <ChevronRightIcon />
            </Fab>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-around" }}>
            <FormControl sx={{ height: 45 }}>
                <InputLabel>Car</InputLabel>
                <Select value={camCar?.number} sx={{ width: "320px", height:"100%" }} label="Car" size="small" onChange={(ev) => {
                    sdk.focusCamera(ev.target.value, props.camState.current.cameraGroupNum);
                }}>
                    {
                        sortedCars.map((car) => <MenuItem value={car.number} key={car.idx}>
                            <Box sx={{
                                display: "flex",
                                flexWrap: "nowrap",
                                gap: 1,
                                alignItems: "center"
                            }}>
                                <Avatar sx={{ width: 24, height: 24, fontSize: 12, bgcolor: car.class.color, color: "black" }} variant="rounded">
                                    {car.number}
                                </Avatar>
                                <Typography noWrap variant="subtitle1" sx={{ flexGrow: 1 }}>{car.driverName}</Typography>
                            </Box>
                        </MenuItem>)
                    }
                </Select>
            </FormControl> 
            <FormControl sx={{ height: 45 }}>
                <InputLabel>Camera</InputLabel>
                <Select value={props.camState.current.cameraGroupNum} sx={{ width: "320px", height: "100%" }} label="Camera" size="small"
                    onChange={(ev) => {
                        const camGroup = parseInt("" + ev.target.value);
                        if (camCar) {
                            sdk.focusCamera(camCar.number, camGroup);
                        }
                    }}>
                    {
                        props.camState.cameraGroups.map((group) => <MenuItem value={group.num} key={group.num}>{group.name}</MenuItem>)
                    }
                </Select></FormControl>
        </Box>
    </Box>
}