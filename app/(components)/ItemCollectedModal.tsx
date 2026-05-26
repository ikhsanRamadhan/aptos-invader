"use client";
import { FC } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';
import { IconButton } from '@mui/material';

import { CollectedItem, useAppContext } from '../context/AppContext';
import { useUserContext } from '../context/UserContext';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    p: 4,
};

interface ItemCollectedModalProps {
    open: boolean;
    collectedItems: CollectedItem[];
    selectedItems: CollectedItem[];
    currentItems: CollectedItem[];
    scores: number;
    totalPages: number;
    clickedItems: { [key: string]: boolean };
    handleClose: () => void;
    handleChangePage: (newPage: number) => void;
    handleSelectItem: (id: number, name: string) => void;
    ship: any;
}

const ItemCollectedModal: FC<ItemCollectedModalProps> = ({
    open,
    collectedItems,
    selectedItems,
    currentItems,
    scores,
    totalPages,
    clickedItems,
    handleClose,
    handleChangePage,
    handleSelectItem,
    ship,
}) => {
    const { adminAddress, ownedItems, handleMintItems, handleNewGameSession } = useAppContext();
    const { userAddress } = useUserContext();

    const handleMintItem = async () => {
        if (!adminAddress || !userAddress) {
            console.error("adminAddress or userAddress is not available");
            return;
        }

        try {
            for (const item of selectedItems) {
                await handleMintItems(adminAddress, userAddress, item);
            }
        } catch (error) {
            console.error("An error occurred while minting items:", error);
        }
    };

    const handleSubmitNewGameSession = async () => {
        if (!adminAddress || !userAddress) {
            console.error("adminAddress or userAddress is not available");
            return;
        }

        try {
            await handleNewGameSession(adminAddress, userAddress, scores, ship.name);
        } catch (error) {
            console.error("An error occurred while submitting game session:", error);
        }
    };

    const rarityColorMap: Record<string, string> = {
        Common: 'text-white',
        Uncommon: 'text-green-500',
        Rare: 'text-blue-500',
        Epic: 'text-purple-500',
        Legendary: 'text-red-500',
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="parent-modal-title"
            aria-describedby="parent-modal-description"
        >
            <Box sx={style}>
                <div className="flex flex-col items-center p-2 max-w-xl">
                    <div className="text-3xl font-bold text-white">GAME OVER</div>
                    <div className="text-xl font-bold text-white mb-3">Your Score: {scores}</div>
                    <div className="text-xl font-bold text-white">Collected Items:</div>
                    <div className='flex flex-row flex-wrap items-center justify-items-center justify-center my-4'>
                        {currentItems.map((item, index) => (
                            <IconButton
                                key={index}
                                id={`item-${item.id}`}
                                disabled={ownedItems.map((o: any) => o.name).includes(item.name)}
                                onClick={() => handleSelectItem(item.id, item.name)}
                                className={`grid text-xl font-bold text-white items-center justify-items-center p-2 min-w-max rounded-md justify-self-center self-center ${
                                    clickedItems[item.id] ? 'shadow-[0_0_10px_#25fff2] m-4' : ''
                                }`}
                            >
                                <img src={item.image.src} className='size-16' />
                                <div>{item.name}</div>
                                <div className={rarityColorMap[item.rarity] ?? 'text-white'}>{item.rarity}</div>
                            </IconButton>
                        ))}
                    </div>
                    <div className='flex justify-center my-4 text-white'>
                        {collectedItems.length > 0 && (
                            <Pagination
                                count={totalPages}
                                variant="outlined"
                                shape="rounded"
                                color='secondary'
                                onChange={(_, newPage) => handleChangePage(newPage)}
                                sx={{
                                    '& .MuiPaginationItem-root': {
                                        color: 'white',
                                        fontWeight: 'bold',
                                    },
                                }}
                            />
                        )}
                    </div>
                    <div className='flex flex-row gap-2'>
                        <button
                            disabled={selectedItems.length === 0}
                            onClick={handleMintItem}
                            className="bg-white rounded-md my-2 px-4 py-2 text-black hover:bg-transparent hover:text-white hover:border hover:border-white"
                        >
                            Mint your items
                        </button>
                        <button
                            onClick={handleSubmitNewGameSession}
                            className="bg-white rounded-md my-2 px-4 py-2 text-black hover:bg-transparent hover:text-white hover:border hover:border-white"
                        >
                            Submit Game Session
                        </button>
                        <button
                            onClick={handleClose}
                            className="bg-white rounded-md my-2 px-4 py-2 text-black hover:bg-transparent hover:text-white hover:border hover:border-white"
                        >
                            Back To Home
                        </button>
                    </div>
                </div>
            </Box>
        </Modal>
    );
};

export default ItemCollectedModal;