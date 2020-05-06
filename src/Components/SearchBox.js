import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';

import { makeStyles } from '@material-ui/core/styles';

import SearchResult from "./SearchResult";
import {db} from '../fire';

function sleep(delay = 0) {
    return new Promise((resolve) => {
        setTimeout(resolve, delay);
    });
}

const useStyles = makeStyles({
    option: {
        backgroundColor: "#FFF !important",
        cursor: "default"
    }
});

const SearchBox = props => {
    const [open, setOpen] = React.useState(false);
    const [input, setInput] = React.useState("");
    const [rawInput, setRawInput] = React.useState("");
    const [options, setOptions] = React.useState([]);
    const [results, setResults] = React.useState(false)
    const loading = open && options.length === 0 && !results;
    const [secondary, setSecondary] = React.useState(false);

    const classes = useStyles();

    React.useEffect(() => {
        let active = true;

        if (!loading) {
            return undefined;
        }

        (async () => {
            const response = await db.collection("users").where("searchableIndex.".concat(input.toLowerCase()), "==", true)
                .get()
                .then(function(querySnapshot) {
                    let searchResults = [];
                    querySnapshot.forEach(function(doc) {
                        let data = doc.data();
                        data['following'] = (data.followers||[]).includes(props.user_id)
                        if (doc.id !== props.user_id){
                            searchResults.push({ ...data, ...{'id': doc.id}})
                        }
                    });
                    return searchResults
                })
                .catch(function(error) {
                    return []
                });
            await sleep(1e2); // For demo purposes.
            if (active) {
                setOptions(response);
                setResults(true);
            }
        })();

        return () => {
            active = false;
        };
    }, [loading]);

    React.useEffect(() => {
        if (!open) {
            setOptions([]);
        }
    }, [open]);

    return (
        <Autocomplete
            id="asynchronous-demo"
            style={{ width: "80%" , marginTop: "5%", alignSelf: "center", justifySelf: "center"}}
            classes={{
                option: classes.option,
            }}
            open={open}
            getOptionLabel={(option) => option.spotify_display_name}
            getOptionSelected={(option, value) => option.spotify_display_name === value.spotify_display_name}
            options={options}
            loading={loading}
            disableCloseOnSelect={true}
            openOnFocus={true}
            value={null}
            inputValue={rawInput}
            freeSolo={true}
            clearOnBlur
            onInputChange={(event, input, reason) => {
                if (input.length===1){
                    setResults(false);
                    setOpen(true);
                    setInput(input);
                }
                if (input.length===0){
                    setOpen(false);
                    setOptions([]);
                    setRawInput("")
                }
                if(reason==="input"){
                    setRawInput(input)
                }
            }}
            onChange={(event, newValue) => {
                setRawInput(rawInput);
            }}
            onClose={() => {
                setOpen(false);
            }}
            renderOption={(option, { selected }) => (
                <React.Fragment>
                    <SearchResult
                        spotify_display_name={option.spotify_display_name}
                        spotify_profile_picture={option.spotify_profile_picture}
                        loading_ids={props.loading_ids}
                        id={option.id}
                        following={option.following}
                        toggleFollow={props.toggleFollow}
                        switchFollow={()=>option.following=!option.following}
                    />
                </React.Fragment>
            )}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Find users"
                    variant="outlined"
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                    }}
                />
            )}
        />
    );
}

export default SearchBox
