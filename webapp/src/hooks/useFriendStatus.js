import { useState, useEffect } from "react";
import ChatAPI from '../components/Chat';

function useFriendStatus(friendID) {
    const [isOnline, setIsOnline] = useState(null);

    useEffect(() => {
        function handleStatusChange(status) {
            setIsOnline(status.isOnline);
        }
    ChatAPI.subscribeToFriendStatus(friendID, handleStatusChange);
    return () => {
        ChatAPI.unsubscribeToFriendStatus(friendID, handleStatusChange);
    };
})

return isOnline;
}