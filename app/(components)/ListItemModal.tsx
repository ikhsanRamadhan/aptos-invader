"use client";
import { FC, useState, FormEvent, ChangeEvent } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';

import { useAppContext } from '../context/AppContext';
import { useUserContext } from '../context/UserContext';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    p: 4,
};

interface ListItemModalProps {
    open: boolean,
    item: any,
    handleClose: () => void,
};

const ListItemModal: FC<ListItemModalProps> = ({ open, item, handleClose }) => {
    const { adminAddress, handleListItem } = useAppContext();
    const { userAddress } = useUserContext();
    const [price, setPrice] = useState<string>('');

    let rarityColor;
    switch (item?.rarity) {
    case 'Common':
        rarityColor = 'text-white';
        break;
    case 'Uncommon':
        rarityColor = 'text-green-500';
        break;
    case 'Rare':
        rarityColor = 'text-blue-500';
        break;
    case 'Epic':
        rarityColor = 'text-purple-500';
        break;
    case 'Legendary':
        rarityColor = 'text-red-500';
        break;
    default:
        rarityColor = 'text-white';
    };

    const handleInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
        setPrice(e.target.value);
    }

    const handleList = async (e: FormEvent) => {
        e.preventDefault();
        console.log("Listing item:", item);
        if (price && adminAddress && userAddress) {
            await handleListItem(adminAddress, userAddress, item, price);
            handleClose();
        }
    };


    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="parent-modal-title"
            aria-describedby="parent-modal-description"
            >
            <Box sx={style}>
                <form className="flex flex-col items-center p-2 max-w-xl border border-gray-200 rounded-lg bg-black" onSubmit={handleList}>
                    <div className="flex flex-col items-center p-2 max-w-xl">
                        <h3 className='text-center font-semibold'>{item?.name}</h3>
                        <p className={`text-center mt-2 font-semibold ${rarityColor}`}>{item?.rarity}</p>
                        <img src={item?.image} className='w-24 h-24' />
                    </div>
                    <label className='block mb-2 text-sm font-medium'>Price</label>
                    <input 
                        type="number" 
                        min="0.001"
                        step="0.001"
                        name='price'
                        id='price'
                        className='mb-2 p-2 text-black max-w-min rounded-md text-center'
                        onChange={handleInputChange}
                    />
                    <div className='flex flex-row gap-2'>
                        <button className="bg-white rounded-md my-2 px-4 py-2 text-black hover:bg-transparent hover:text-white hover:border hover:border-white">List your items</button>
                    </div>
                </form>
            </Box>
        </Modal>
    )
    }

export default ListItemModal;