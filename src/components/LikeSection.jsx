import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { HiOutlineHeart, HiHeart } from 'react-icons/hi';

export default function LikeSection({ id }) {
  const [likesCount, setLikesCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const { data: session } = useSession();
  const [hasLiked, setHasLiked] = useState(false); // Initialize hasLiked state

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

    useEffect(() => {
      if (session) {
        // Fetch the user's liked status for the post from Firestore
        const fetchUserLikedStatus = async () => {
          try {
            const docRef = doc(db, 'likes', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const data = docSnap.data();
              const userLiked = data[session.user.id] || false;
              setHasLiked(userLiked);
            }
          } catch (error) {
            console.error('Error fetching user liked status:', error);
          }
        };
  
        fetchUserLikedStatus();
      }
    }, [session, id]);
  
    const likePost = async () => {
      // Toggle hasLiked state
      setHasLiked(!hasLiked);
  
      // Update likes count in Firestore
      try {
        const docRef = doc(db, 'likes', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const newLikesCount = hasLiked ? likesCount - 1 : likesCount + 1;
          await updateDoc(docRef, {
            [session.user.id]: !hasLiked,
            likesCount: newLikesCount,
          });
          setLikesCount(newLikesCount);
  
          // Emit like event to server
          if (socket) {
            socket.emit('like', id, !hasLiked);
          }
        }
      } catch (error) {
        console.error('Error updating likes count:', error);
      }
    };

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

  const likePost = () => {
    // Toggle hasLiked state
    setHasLiked(!hasLiked);

    // Emit like event to server
    if (socket) {
      socket.emit('like', id, !hasLiked);
    }
  };

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
            {/* Display likes count */}
            <p className='text-gray-500'>{likesCount} {likesCount === 1 ? 'like' : 'likes'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
