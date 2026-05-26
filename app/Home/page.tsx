"use client";
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { IconButton } from '@mui/material';

import { useUserContext } from '../context/UserContext';
import { CollectedItem, useAppContext } from '../context/AppContext';
import ItemCollectedModal from '../(components)/ItemCollectedModal';
import Canvas from '../Games/Canvas';
import spaceships from '../utils/spaceships';
import items from '../utils/items';
import { aliens } from '../utils/enemy';
import { bosses } from '../utils/enemy';

const Homepage = () => {
    const router = useRouter();
    const { userAddress } = useUserContext();
    const { adminAddress, mySpaceships, allUserStats, fetchAllUserStats } = useAppContext();
    const [hp, setHp] = useState<number>();
    const [scores, setScores] = useState(0);
    const [ship, setShip] = useState();
    const [collectedItems, setCollectedItems] = useState<CollectedItem[]>([]);
    const [startGame, setStartGame] = useState(false);
    const [open, setOpen] = useState(false);
    const [clickedItems, setClickedItems] = useState<{ [key: string]: boolean }>({});
    const [selectedItems, setSelectedItems] = useState<CollectedItem[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const selectedItemsRef = useRef(selectedItems);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = collectedItems.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(collectedItems.length / itemsPerPage);

    useEffect(() => {
        selectedItemsRef.current = selectedItems;
    }, [selectedItems]);

    const handleStartGame = (ship: any) => {
        setShip(ship);
        setStartGame(true);
        setOpen(false);
    };

    const handleChangePage = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const handleClose = () => {
        setOpen(false);
        setStartGame(false);
    };

    const handleSelectItem = useCallback((id: number, name: string) => {
        setCollectedItems(prevItems => {
            if (!prevItems) return [];
            
            const isCurrentlyCollected = prevItems.some(item => item.id === id && item.collected);
            const shouldCollect = !isCurrentlyCollected;
            
            // Update collection status for all items with the same name
            const updatedItems = prevItems.map(item =>
                item.name === name ? { ...item, collected: shouldCollect } : item
            );
            
            setSelectedItems(prev => {
                if (shouldCollect) {
                    // Add only one item with the same name
                    const itemToAdd = updatedItems.find(item => item.name === name && item.collected);
                    return itemToAdd ? [...prev.filter(item => item.name !== name), itemToAdd] : prev;
                } else {
                    // Remove all items with the same name
                    return prev.filter(item => item.name !== name);
                }
            });
            
            return updatedItems;
        });
        
        setClickedItems(prev => {
            const newClickedItems: Record<number, boolean> = { ...prev };
            
            currentItems.forEach(item => {
                if (item.name === name) {
                    newClickedItems[item.id] = !prev[id]; // Toggle the clicked state
                }
            });
            
            return newClickedItems;
        });
    }, [currentItems]);

    const handleHome = () => {
        setStartGame(false);
    };
    
    useEffect(() => {
        if (hp === 0) {
            setOpen(true);
        }
    }, [hp]);

    useEffect(() => {
        const fetchAllUserData = async () => {
            if (adminAddress) {
                await fetchAllUserStats(adminAddress);
            }
        };

        fetchAllUserData();
    }, [adminAddress]);

    useEffect(() => {
        console.log(allUserStats);
    },[allUserStats]);

    const getTop10Leaderboard = useCallback(() => {
        if (!allUserStats) return [];
    
        return Object.entries(allUserStats)
            .map(([ index, {addr, best_score, games_played, spaceship }]) => ({
                addr,
                best_score,
                games_played,
                spaceship,
            }))
            .sort((a, b) => b.best_score - a.best_score)
            .slice(0, 10);
    }, [allUserStats]);

    const handleLeaderboard = () => {
        router.push('/Leaderboard');
    };

    return (
        <div style={{minHeight: '75vh'}} className='flex flex-col gap-4 items-center justify-center mt-20'>
            {userAddress ? (
                <div className='flex flex-col items-center min-w-full min-h-full'>
                    {!startGame ? (
                        <div className='flex flex-col'>
                            <div className='flex flex-col gap-y-4 mx-5 sm:mx-20 lg:mx-28 py-10'>
                                <h1 className='text-xl md:text-2xl font-bold text-center'>🚀 Welcome to, Aptos Invader!</h1>
                            </div>
                            <div className='flex flex-col items-center gap-12 max-w-screen w-full px-8'>
                                <h1 className='text-center text-3xl font-bold'>Choose your Spaceship</h1>
                                <div className='flex flex-col p-6 max-w-max'>
                                    <h2 className='w-full text-2xl text-center'>Free Spaceships</h2>
                                    <div className='grid grid-flow-col auto-cols-auto gap-8 justify-center p-8'>
                                        <IconButton onClick={() => handleStartGame(spaceships[0])}>
                                            <div className='rounded-md bg-transparent hover:scale-150 hover:shadow-[0_0_10px_#25fff2] hover:m-4 transition duration-500'>
                                                <img src={spaceships[0].icon} className='size-32 hover:scale-x-105'/>
                                            </div>
                                        </IconButton>
                                    </div>

                                    <h2 className='w-full text-2xl text-center mt-4'>Purchased Spaceship</h2>
                                    <div className='grid grid-flow-col auto-cols-auto gap-8 justify-center p-8'>
                                        {mySpaceships.map((myShip: any, index: number) => (
                                            <IconButton onClick={() => handleStartGame(myShip)} key={index}>
                                                <div className='rounded-md bg-transparent hover:scale-150 hover:shadow-[0_0_10px_#25fff2] hover:m-4 transition duration-500'>
                                                    <img src={myShip.icon} className='size-32 hover:scale-x-105'/>
                                                </div>
                                            </IconButton>
                                        ))}
                                    </div>

                                    <div className="text-3xl font-bold text-center text-white mb-3">How To Play:</div>
                                    <div className="text-2xl font-bold text-center text-white">Press the &quot;x&quot; button to shoot, Left Control (CTRL) to shoot laser, and arrows to move left or right!</div>
                                </div>
                                <div className='flex flex-col p-6 w-full max-w-4xl border-t-2 items-center'>
                                    <div className='xl:w-full max-w-6xl flex flex-col items-center gap-y-9 mx-5 sm:mx-8 md:mx-9 xl:mx-auto pt-14 pb-20 md:pb-10 lg:pb-32 xl:pb-20'>
                                        <div className='flex sm:flex-row flex-col items-center gap-y-2 px-2 sm:px-0 w-full'>
                                            <h2 className='w-full text-2xl text-center font-bold'>Leaderboard</h2>
                                            <a onClick={handleLeaderboard} className='flex items-center justify-between font-semibold ml-auto border border-grayscale-2 rounded-lg px-4 py-2 w-full sm:w-auto hover:bg-black cursor-pointer'>
                                                <span>Leaderboard</span>
                                                <img src='arrowright.svg' className='ml-2 mr-4 w-6 h-6' alt="Arrow right" />
                                            </a>
                                        </div>
                                        <div className='w-full overflow-x-auto'>
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
                                                    {getTop10Leaderboard().map((user, index) => (
                                                        <tr key={index} className={`border-b last:border-b-0 ${user.addr === userAddress.toString() ? 'bg-gray-200 dark:bg-gray-600' : ''}`}>
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
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className='flex flex-col items-center mt-10'>
                            <Canvas
                                setScores={setScores}
                                ship={ship}
                                aliens={aliens}
                                bosses={bosses}
                                items={items}
                                setHp={setHp}
                                setCollectedItems={setCollectedItems}
                            />
                            <div>
                                <button onClick={handleHome} className='bg-white rounded-md px-4 py-2 mt-4 text-black hover:bg-transparent hover:text-white hover:border hover:border-white'>Back to home</button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <h1 className='w-full text-center text-3xl'>Please connect your wallet</h1>
            )}

            <ItemCollectedModal 
                open={open} 
                collectedItems={collectedItems} 
                selectedItems={selectedItems} 
                currentItems={currentItems} 
                scores={scores} 
                totalPages={totalPages} 
                clickedItems={clickedItems} 
                handleClose={handleClose} 
                handleChangePage={handleChangePage} 
                handleSelectItem={handleSelectItem} 
                ship={ship}
                />
        </div>
    )
}

export default Homepage;
