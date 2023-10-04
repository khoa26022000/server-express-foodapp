const Socket = (io) => {
  let order = [];
  const addOrder = (orderId, socketId) => {
    let index = order.findIndex((x) => x.orderId === orderId);
    if (index === -1) {
      order.push({
        online: true,
        orderId,
        socketId,
        createdAt: new Date().toISOString(),
      });
    } else {
      users[index].online = true;
      users[index].socketId = socketId;
    }
  };
  const removeUser = (socketId) => {
    let index = users.findIndex((x) => x.socketId === socketId);
    if (index >= 0) {
      users[index].online = false;
      users[index].createdAt = new Date().toISOString();
    }
  };
  const getUser = (userId) => {
    return users.find((x) => x.userId === userId);
  };
  io.on("connection", (socket) => {
    console.log("user connect: ", socket.id);

    socket.on("addUser", (userId) => {
      addUser(userId, socket.id);
      io.emit("receiveUsers", users);
    });

    socket.on("getUser", (userId) => {
      socket.to(socket.id).emit("receiveUser", getUser(userId));
    });

    socket.on("sendMessage", (data, room, userId) => {
      socket.to(room).emit("receiveMessage", data, userId);
    });

    socket.on("join-room", (room) => {
      console.log(socket.id, ", room: ", room);
      socket.join(room);
    });

    socket.on("disconnect", () => {
      removeUser(socket.id);
      console.log("user disconnect");
    });
  });
};

module.exports = Socket;
