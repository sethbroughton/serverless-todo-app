export default ChatAPI = {
    subscribeToFriendStatus,
    unsubscribeToFriendStatus
}

const subscribeToFriendStatus = (friendID, handleStatusChange) => {
    console.log('subscribe')
}

const unsubscribeToFriendStatus = (friendID, handleStatusChange) => {
    console.log('unsubscribe')
}