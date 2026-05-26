"use client";
import { FC, useState } from 'react';
import Link from "next/link";
import CircularProgress from '@mui/material/CircularProgress';
import Pagination from '@mui/material/Pagination';

import { useAppContext } from '../context/AppContext';
import { useUserContext } from '../context/UserContext';

type Props = {
    isLoading: boolean;
    currentItems: any[];
    totalPages: number;
    handleChangePage: (newPage: number) => void;
};

const getRarityColor = (rarity: string): string => {
    switch (rarity) {
        case 'Common': return 'text-white';
        case 'Uncommon': return 'text-green-500';
        case 'Rare': return 'text-blue-500';
        case 'Epic': return 'text-purple-500';
        case 'Legendary': return 'text-red-500';
        default: return 'text-white';
    }
};

const ListedItems: FC<Props> = ({ isLoading, currentItems, totalPages, handleChangePage }) => {
    const { adminAddress, listedNfts, handlePurchaseItem, } = useAppContext();
    const { userAddress } = useUserContext();
    const [ buttonLoading, setButtonLoading ] = useState(false);

    const handleBuy = async (item: any) => {
        setButtonLoading(true);
        if (adminAddress && userAddress) {
            await handlePurchaseItem(adminAddress, userAddress, item);
            setButtonLoading(false);
        }
        setButtonLoading(false);
    };

    return (
        <div className='flex flex-col flex-wrap'>
            <div className='flex flex-row gap-4 mx-10 mt-4 flex-wrap items-center justify-center'>
                {isLoading ? (
                    <CircularProgress color="secondary" size={50}/>
                ) : (
                    listedNfts?.map((item, i) => (
                        <div
                            className='
                                flex flex-col flex-wrap gap-2 p-2
                                border border-gray-300 rounded-lg
                                place-content-center items-center
                                hover:bg-black hover:shadow-[0_0_10px_#ffffff] hover:text-white
                                transition duration-500 cursor-pointer
                            '
                            key={i}
                        >
                            <div className='w-24 h-24 p-2 mt-2'>
                                <img src={item.image} alt={item.name} className='w-full h-full object-cover' />
                            </div>
                            <h3 className='text-center text-lg font-bold'>{item.name}</h3>
                            <p className={`${getRarityColor(item.attributes)} text-md font-semibold`}>{item.attributes}</p>
                            <Link
                                href={`https://explorer.aptoslabs.com/object/${item.nftAddress}?network=testnet`}
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                <p className='text-sm'>View on Aptos Explorer</p>
                            </Link>
                            <p>{item.price} APT</p>
                            {!buttonLoading ? (
                                <button 
                                    className='bg-white rounded-md my-2 px-2 py-1 text-black hover:bg-transparent hover:text-white hover:border hover:border-white max-w-max'
                                    onClick={() => handleBuy(item)}
                                >
                                    Buy Now
                                </button>
                            ) : (
                                <CircularProgress color="secondary" size={20}/>
                            )}
                        </div>
                    ))
                )}
            </div>
            <div className='flex justify-center my-4 text-white'>
                {(currentItems?.length ?? 0) > 0 ? (
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
                ) : null}
            </div>
        </div>
    );
};

export default ListedItems;