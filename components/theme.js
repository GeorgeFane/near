import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        drawer: {
            background: '#1D1D1D'
        },
        paper: {
            background: '#000000'
        }
    },
});

export default darkTheme;
