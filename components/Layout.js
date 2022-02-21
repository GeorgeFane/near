import React from 'react';

import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';

import PermanentDrawerLeft from './PermanentDrawerLeft';
import theme from './theme';

export default function Layout({ children }) {

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <PermanentDrawerLeft />
                <Box
                    display="flex"
                    alignItems="center"
                    p={2}
                    sx={{
                        width: '100%',
                        minWidth: -240,
                        minHeight: "100vh",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        bgcolor: 'paper.background'
                    }}>
                    {children}
                </Box>
            </Box>
        </ThemeProvider>
    );
}