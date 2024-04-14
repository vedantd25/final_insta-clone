'use client';
import { blue } from '@mui/material/colors';
import { Button } from '@mui/material';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function MiniProfile() {
  const { data: session } = useSession();
  return (
    <div className='flex items-center justify-between mt-14 ml-10 w-full'>
      <img
        src={session?.user?.image || '/800px-Instagram_logo_2016.webp'}
        alt='user-profile-pic or instagram logo'
        className='w-16 h-16 rounded-full border p-[2px]'
      />
      <div className='flex-1 ml-4'>
        <h2 className='font-bold'>{session?.user?.username}</h2>
        <h3 className='text-sm text-gray-400'>Welcome to Instagram</h3>
      </div>
      {session ? (
        
        <Button variant="text" size="small" style={{ color: blue[500], fontWeight: 'bold' }} onClick={signOut}>Log Out</Button>
      ) : (
        

        <Button variant="text" size="small" style={{ color: blue[500], fontWeight: 'bold' }} onClick={signIn}>Sign In</Button>
      )}
    </div>
  );
}
