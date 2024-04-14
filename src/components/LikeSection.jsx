'use client';

import {
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';
import { io } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { HiOutlineHeart, HiHeart } from 'react-icons/hi';
import { app } from '../firebase';

export default function LikeSection({ id }) {
  const { data: session } = useSession();
  const [hasLiked, setHasLiked] = useState(false);
  const [likes, setLikes] = useState([]);
  const db = getFirestore(app);

  
  const [likesCount, setLikesCount] = useState(0);
  const [socket, setSocket] = useState(null);
  
  useEffect(() => {
    // Create a new socket instance and connect to the server
    const newSocket = io('http://localhost:3001', { transports: ['websocket'] });
    setSocket(newSocket);

    return () => {
      // Disconnect from the server when the component unmounts
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      // Send request to get initial likes count when component mounts
      socket.emit('getLikesCount', id);

      // Listen for likeUpdated event from server
      socket.on('likeUpdated', ({ postId, likesCount }) => {
        // Update likes count when received from server
        if (postId === id) {
          setLikesCount(likesCount);
        }
      });
    }

    return () => {
      // Remove all event listeners when component unmounts
      if (socket) {
        socket.off();
      }
    };
  }, [id, socket]);

  useEffect(() => {
    // Update hasLiked state based on whether the user has already liked the post
    if (session) {
      // Check if the user has already liked the post
      // You may need to fetch this information from your backend or from local storage
      const userLiked = false; // Change this to fetch the user's liked status for the post
      setHasLiked(userLiked);
    }
  }, [session]); // Update hasLiked when session changes


  useEffect(() => {
    onSnapshot(collection(db, 'posts', id, 'likes'), (snapshot) => {
      setLikes(snapshot.docs);
    });
  }, [db]);

  useEffect(() => {
    if (likes.findIndex((like) => like.id === session?.user?.uid) !== -1) {
      setHasLiked(true);
    } else {
      setHasLiked(false);
    }
  }, [likes]);

  async function likePost() {
    console.log(db, id, 'likes', session?.user?.uid);
    if (hasLiked) {
      await deleteDoc(doc(db, 'posts', id, 'likes', session?.user?.uid));
    } else {
      await setDoc(doc(db, 'posts', id, 'likes', session?.user?.uid), {
        username: session?.user?.username,
      });
    }
  }



  return (
    <div>
      {session && (
        <div className='flex border-t border-gray-100 px-4 pt-4'>
          <div className='flex items-center gap-2'>
            {hasLiked ? (
              <HiHeart
                onClick={likePost}
                className='text-red-500 cursor-pointer text-3xl  hover:scale-125 transition-transform duration-200 ease-out'
              />
            ) : (
              <HiOutlineHeart
                onClick={likePost}
                className='cursor-pointer text-3xl  hover:scale-125 transition-transform duration-200 ease-out'
              />
            )}
            {likes.length > 0 && (
              <p className='text-gray-500'>
                {likes.length} {likes.length === 1 ? 'like' : 'likes'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}