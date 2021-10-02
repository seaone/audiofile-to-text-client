import { ChangeEvent, SyntheticEvent, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  FormHelperText,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Snackbar,
  SnackbarCloseReason,
  TextField,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { uploadFile } from "./api";

type Keyword = [string, number];

const useStyles = makeStyles({
  container: {
    paddingTop: "4rem",
  },
  formBox: {
    display: "flex",
    alignItems: "flex-end",
    gap: "1rem",
    marginBottom: "2rem",
  },
  paper: {
    padding: "2rem",
  },
  button: { height: "40px" },
  inputWrapper: {
    flexGrow: 1,
  },
  box: {
    marginBottom: "2rem",
  },
  loader: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: "-12px",
    marginLeft: "-12px",
  },
  audio: {
    width: "100%",
  },
});

function App() {
  const [recognizedText, setRecognizedText] = useState("");
  const [keywords, setKeywords] = useState("");
  const [audioSrc, setAudioSrc] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isFileSelected, setIsFileSelected] = useState(false);
  const [language, setLanguage] = useState("");
  const [error, setError] = useState("");
  const [isErrorDisplayed, setIsErrorDisplayed] = useState(false);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const fileInput: HTMLInputElement | null = event.currentTarget;
    setFile(null);
    setLanguage("");
    setIsFileSelected(false);

    if (fileInput?.files && fileInput?.files.length > 0) {
      const file = fileInput.files[0];
      setFile(file);
      setIsFileSelected(true);
    }
  };

  const handleSelectChange = (event: SelectChangeEvent) => {
    setLanguage(event.target.value);
  };

  const handleProcessButtonClick = async () => {
    setIsProcessing(true);
    clear();

    if (file != null) {
      const fileSrc = `${process.env.REACT_APP_BACKEND_ENDPOINT}/files/${
        file.name
      }?updated=${Date.now()}`;

      try {
        const json = await uploadFile({
          file: file,
          lang: language,
        });

        setAudioSrc(fileSrc);
        setRecognizedText(json.text);
        setKeywords(
          json.keywords.map((keyword: Keyword) => keyword[0]).join(", ")
        );
      } catch (error) {
        setError("Something went worng :(");
        setIsErrorDisplayed(true);
        clear();

        console.error(error);
      }
    }

    setIsProcessing(false);
  };

  const handleSnackbarClose = (
    event: SyntheticEvent,
    reason: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setIsErrorDisplayed(false);
  };

  const isUploadButtonEnabled = !isProcessing;

  const isTextInputEnabled = !isProcessing;

  const isLanguageSelectEnabled = !isProcessing && isFileSelected;

  const isProcessButtonEnabled =
    !isProcessing && isFileSelected && language !== "";

  const clear = () => {
    setAudioSrc("");
    setRecognizedText("");
    setKeywords("");
  };

  const classes = useStyles();

  return (
    <div className="App">
      <Container className={classes.container} maxWidth="md">
        <Typography variant="h1" component="h1" gutterBottom>
          Audiofile to text
        </Typography>

        <Box className={classes.formBox}>
          <FormControl>
            <FormHelperText>Select file</FormHelperText>

            <Button
              component="label"
              variant="outlined"
              disabled={!isUploadButtonEnabled}
              className={classes.button}
            >
              Upload File (.wav)
              <input
                type="file"
                accept="audio/wav"
                hidden
                onChange={handleInputChange}
              />
            </Button>
          </FormControl>

          <FormControl className={classes.inputWrapper}>
            <TextField
              size="small"
              variant="standard"
              disabled={!isTextInputEnabled}
              InputProps={{
                readOnly: true,
              }}
              value={file !== null ? file.name : ""}
            />
          </FormControl>

          <FormControl sx={{ minWidth: "100px" }}>
            <FormHelperText>Choose Language</FormHelperText>

            <Select
              size="small"
              displayEmpty
              value={language}
              disabled={!isLanguageSelectEnabled}
              onChange={handleSelectChange}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value={"en"}>En</MenuItem>
              <MenuItem value={"ru"}>Ru</MenuItem>
            </Select>
          </FormControl>

          <FormControl>
            <Button
              variant={"contained"}
              disabled={!isProcessButtonEnabled}
              onClick={handleProcessButtonClick}
              className={classes.button}
            >
              Process
            </Button>

            {isProcessing && (
              <CircularProgress size={24} className={classes.loader} />
            )}
          </FormControl>
        </Box>

        {recognizedText !== "" && (
          <Paper variant="outlined" className={classes.paper}>
            <Box className={classes.box}>
              <audio controls src={audioSrc} className={classes.audio} />
            </Box>

            <Box className={classes.box}>
              <Typography variant="body1" gutterBottom>
                <strong>Text:</strong> {recognizedText}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2">
                <strong>Keywords:</strong> {keywords}
              </Typography>
            </Box>
          </Paper>
        )}

        <Snackbar
          open={isErrorDisplayed}
          message={error}
          onClose={handleSnackbarClose}
          autoHideDuration={3000}
        />
      </Container>
    </div>
  );
}

export default App;
