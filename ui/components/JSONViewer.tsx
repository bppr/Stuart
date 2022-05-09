import React, {useState} from 'react';
import ReactJson from 'react-json-view';
import JsonPath from 'jsonpath';
import { IconButton, Stack, TextField } from '@mui/material';
import PlayArrow from '@mui/icons-material/PlayArrow';
import Pause from '@mui/icons-material/Pause';

/**
 * Renders an object as json in a browseable form, with json path support
 */
export default function JSONViewer(props: {
    sourceJson: any
}) {
    
    // the viewer can be "paused", in which case it will not update based on the props, but will be based on this object.
    // So, if this is null:
    // - use the sourceJson property as the item to display
    // - show a button that will let the user "pause" the feed
    // if it is not null:
    // - display this item instead of the sourceJson property
    // - show a button that lets the user "resume" the feed
    const [paused, setPaused] = useState(false);
    const [json, setJson] = useState({});
    const [path, setPath] = useState("");

    // display a text box for the JSON query, and a "play/pause" button for whether to save the current object or to use the object from the props

    const handlePlayPause = (ev: React.MouseEvent) => {
        ev.preventDefault();
        if(!paused) {
            setJson(props.sourceJson);
            setPaused(true);
        } else {
            setPaused(false);
        }
    }

    const handleTextChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
        const p = ev.target.value;
        if(!p || p.trim() == "") {
            setPath("");
        } else {
            setPath(ev.target.value);
        }
    }

    const baseJson = (paused) ? json : props.sourceJson; 
    let pathJson = baseJson;
    let pathIsValid = true;
    try {
        if(path != "") {
            pathJson = JsonPath.query(baseJson, path);
        }
    } catch (err) {
        pathIsValid = false;
    }

    return <Stack>
        <Stack direction="row">
            <TextField label="JSONPath Expression" variant="outlined" onChange={handleTextChange} error={!pathIsValid} />
            <IconButton edge="end" onClick={handlePlayPause}>
                { paused ? <PlayArrow /> : <Pause /> }
            </IconButton>
        </Stack>
        <ReactJson src={pathJson} name={false} collapsed={true} sortKeys />
    </Stack>


}