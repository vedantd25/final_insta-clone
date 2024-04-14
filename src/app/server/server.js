const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors'); 
const { addDoc, collection, getFirestore, onSnapshot } = require('firebase/firestore');
const { app } = require('./firebase');
const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000', // Change this to your client's origin
    methods: ['GET', 'POST'],
  },
});

// Store likes count in a map (postId -> likesCount)
const likesCountMap = new Map();

  io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('like', (postId, hasLiked) => {
    console.log('Received "like" event with postId:', postId, 'and hasLiked:', hasLiked);
    // Update likes count map based on 'hasLiked' parameter
    likesCountMap.set(postId, hasLiked ? (likesCountMap.get(postId) || 0) + 1 : Math.max((likesCountMap.get(postId) || 0) - 1, 0));

    // Emit updated likes count to all clients
    io.emit('likeUpdated', { postId, likesCount: likesCountMap.get(postId) });
    console.log('Emitting "likeUpdated" event with postId:', postId, 'and likesCount:', likesCountMap.get(postId));
  });

  socket.on('getLikesCount', (postId) => {
    console.log('Received "getLikesCount" event with postId:', postId);
    // Send initial likes count to client
    socket.emit('likeUpdated', { postId, likesCount: likesCountMap.get(postId) || 0 });
    console.log('Sending initial likes count to client:', likesCountMap.get(postId) || 0);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

  // Listen for 'addComment' event from client
  useEffect(() => {
    // Create a new socket instance and connect to the server
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    // Listen for 'commentCountUpdated' event from server
    newSocket.on('commentCountUpdated', ({ postId, count }) => {
      // Update comment count when event received from server
      if (postId === id) {
        setCommentCount(count);
      }
    });

    return () => {
      // Disconnect from the server when the component unmounts
      newSocket.disconnect();
    };
  }, [id]);

  useEffect(() => {
    // Fetch initial comment count from Firestore
    const unsubscribe = onSnapshot(collection(db, 'posts', id, 'comments'), (snapshot) => {
      setCommentCount(snapshot.size);
    });

    return () => {
      // Unsubscribe from Firestore listener when component unmounts
      unsubscribe();
    };
  }, [db, id]);

httpServer.listen(3001, () => {
  console.log('Socket.IO server running on port 3001');
});
