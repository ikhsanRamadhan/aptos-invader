"use client";
import React, { useEffect, useState } from 'react';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { useAppContext } from '../context/AppContext';
import { useUserContext } from '../context/UserContext';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#c9cdd3', // Dark mode primary color
        },
        background: {
            default: '#121212', // Dark mode background color
            paper: '#1d1d1d', // Dark mode paper color
        },
        text: {
            primary: '#ffffff', // Dark mode text color
        },
    },
    components: {
        MuiPagination: {
            styleOverrides: {
                root: {
                    color: '#ffffff', // Pagination color in dark mode
                },
                ul: {
                    '& .MuiPaginationItem-root': {
                        borderColor: '#ffffff', // Border color in dark mode
                        color: '#ffffff', // Text color in dark mode
                    },
                    '& .Mui-selected': {
                        backgroundColor: '#90caf9', // Selected page background color in dark mode
                        color: '#000000', // Selected page text color in dark mode
                    },
                },
            },
        },
    },
});

const Leaderboard = () => {
    const { userAddress } = useUserContext();
    const { adminAddress, allUserStats, fetchAllUserStats } = useAppContext();
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [myPosition, setMyPosition] = useState<number>(0);
    const usersPerPage = 20;

    useEffect(() => {
        const fetchDataUsers = async () => {
            if (adminAddress) {
                await fetchAllUserStats(adminAddress);
            }
        };

        fetchDataUsers();
    }, [adminAddress]);

    // Calculate the total number of pages
    const totalPages = Math.ceil(allUserStats.length / usersPerPage);

    // Calculate the start and end index of the users to display on the current page
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const currentUsers = allUserStats.slice(startIndex, endIndex);

    // Handler to change page
    const handlePageChange = (event: React.ChangeEvent<unknown>, page: any) => {
        setCurrentPage(page);
    };

    useEffect(() => {
        const index = allUserStats.findIndex(user => user.addr === userAddress?.toString());

        // If the user is found, update the position
        if (index !== -1) {
            setMyPosition(index + 1);
        } else {
            setMyPosition(0);
        }
    }, [allUserStats, userAddress]);
    

    return (
        <ThemeProvider theme={darkTheme}>
        <div style={{minHeight: '75vh'}} className='w-full sm:p-14 p-5 text-white flex flex-col'>
            <h1 className='text-center text-4xl'>Leaderboard</h1>
            <div className='flex flex-col place-content-center'>
                <h1 className='text-xl md:text-2xl font-semibold text-center mt-8'>Your Position</h1>
                <div className='flex px-4 py-1 rounded-full bg-white max-w-max self-center place-content-center mt-2'>
                    <h2 className='text-center text-4xl font-semibold text-black'>{myPosition}</h2>
                </div>
                <div className='flex flex-col gap-y-4 mx-5 sm:mx-20 lg:mx-28 py-10 items-center'>
                    <h1 className='text-xl md:text-2xl font-semibold text-center'>All Users</h1>
                    <div className='w-9/12 overflow-x-auto'>
                        <table className='w-full border-collapse'>
                            <thead>
                                <tr className='bg-gray-300 dark:bg-gray-700'>
                                    <th className='p-2 text-left font-bold'>Rank</th>
                                    <th className='p-2 text-left font-bold'>User Address</th>
                                    <th className='p-2 text-right font-bold'>Score</th>
                                    <th className='p-2 text-right font-bold'>Games Played</th>
                                    <th className='p-2 text-left font-bold'>Spaceship</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentUsers.map((user, index) => (
                                    <tr key={index} className={`border-b last:border-b-0 ${user.addr === userAddress?.toString() ? 'bg-gray-200 dark:bg-gray-600' : ''}`}>
                                        <td className='p-2 text-left font-semibold'>{index + 1}</td>
                                        <td className='p-2 text-left font-mono'>{`0x${user.addr.substring(2, 6)}...${user.addr.substring(user.addr.length - 5)}`}</td>
                                        <td className='p-2 text-right'>{user.best_score.toLocaleString()}</td>
                                        <td className='p-2 text-right'>{user.games_played.toLocaleString()}</td>
                                        <td className='p-2 text-left'>{user.spaceship}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Stack spacing={2} className='mt-4 self-center'>
                        <Pagination
                            count={totalPages}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                            shape="rounded"
                        />
                    </Stack>
                </div>
            </div>
        </div>
        </ThemeProvider>
    );
};

export default Leaderboard;