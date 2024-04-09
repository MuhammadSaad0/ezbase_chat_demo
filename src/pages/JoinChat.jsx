import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ezbase from 'ezbase-ts';
import './JoinChat.css'; // Import the CSS file

const JoinChat = () => {
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState('');
    const [username, setUsername] = useState(''); // State to hold the username
    const navigate = useNavigate();
    const eb = new ezbase(`http://localhost:3690`, `http://localhost:3691`);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const chats = await eb.db.listRecords('chats', {}, {});
                setChats(chats);
            } catch (error) {
                console.error('Error fetching chats:', error);
            }
        };

        fetchChats();
    }, []);

    const joinChat = () => {
        console.log('Selected chat', selectedChat);
        navigate(`/room`, { state: { chatId: selectedChat, username } }); // Pass chat ID and username as state
    };

    const createRandomChat = async () => {
        try {
            const randomChatId = Math.floor(Math.random() * 1000000);
            const insert = await eb.db.createRecord('chats', { id: randomChatId });
            console.log('Create chat resp', insert);
            console.log('Chat array manip', [...chats, insert])
            setChats(prevChats => [...prevChats, insert]);
            navigate(`/room`, { state: { chatId: randomChatId, username } }); // Pass chat ID and username as state
        } catch (error) {
            console.error('Error creating random chat:', error);
        }
    };

    return (
        <div className="join-chat-container"> {/* Apply the CSS class */}
            <h1>Chat Page</h1>
            <div>
                <input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)} // Update username state
                />
            </div>
            <div>
                <select onChange={(e) => setSelectedChat(e.target.value)}>
                    <option value="">Select a chat</option>
                    {chats.map((chat, index) => (
                        <option key={index} value={chat.id}>{chat.id}</option>
                    ))}
                </select>
                <button disabled={!selectedChat} onClick={joinChat}>Join Chat</button>
            </div>
            <div>
                <button onClick={createRandomChat}>Create Random Chat</button>
            </div>
        </div>
    );
};

export default JoinChat;
