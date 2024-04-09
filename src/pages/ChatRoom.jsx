import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ezbase from 'ezbase-ts';
import './ChatRoom.css';
import eb from '../globals';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null); // State to hold the selected file
    const { state } = useLocation();
    const { chatId, username } = state;
    console.log('chatId', chatId, 'username', username);

    useEffect(() => {
        let subscribed = false;

        const fetchDataAndSubscribe = async () => {
            try {
                const messages = await eb.db.listRecords('messages', { 'chatId': chatId }, { 'sort': { ['createdAt']: 1 } });
                setMessages(messages);

                if (!subscribed) {
                    eb.rts.subscribe('messages', { 'chatId': chatId }, (data) => {
                        setMessages(prevMessages => [...prevMessages, data.record]);
                        if (data.record.author != username) {
                            const notif = new Notification('You have unread messages', {
                                body: `${username} someone messaged you!`,
                            })
                        }
                    });
                    subscribed = true;
                }
            } catch (error) {
                console.error('Error fetching or subscribing:', error);
            }
        };

        fetchDataAndSubscribe();

        return () => {
            eb.rts.unsubscribe('messages');
        };
    }, []);

    const sendMessage = async () => {
        try {
            await eb.db.createRecord('messages', { content: newMessage, author: username, chatId, type: 'message' });
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    // Function to handle file selection
    const handleFileSelect = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    // Function to handle file upload
    const handleFileUpload = async () => {
        console.log('Selected file', selectedFile);
        try {
            // Check if selected file type is allowed
            const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
            if (!allowedTypes.includes(selectedFile.type)) {
                alert('Please select a PNG, JPG, or JPEG file.');
                return;
            }

            // Assuming you have a function to upload files to the database
            const resp = await eb.files.uploadFile(selectedFile);
            const meta = await eb.files.getFileMetaData(resp.data.data);
            await eb.db.createRecord('messages', { content: resp.data, author: username, chatId, type: 'file', link: meta.data.data.link });
            // Clear the selected file after upload
            setSelectedFile(null);
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    // Add event listener for beforeunload to unsubscribe when the page is refreshed or closed
    useEffect(() => {
        const handleBeforeUnload = () => {
            eb.rts.unsubscribe('messages');
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    return (
        <div className="chat-container">
            <h2>Chat</h2>
            <h3>Room Number: {chatId}</h3>
            <h3>Chatting as: {username}</h3>
            <div className="messages-container">
                <div className="messages-wrapper">
                    {messages.map((message, index) => (
                        <div key={index} className={`message${message.author !== username ? ' other-author' : ''}`}>
                            <span className='author'>{message.author}</span>
                            {message.type === 'file' ? (
                                <img className='file' src={message.link} alt="File" />
                            ) : (
                                <p>{message.content}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <div className="input-container">
                <input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                <button onClick={sendMessage}>Send</button>
            </div>
            <div className="file-upload-container">
                <input type="file" accept=".png,.jpg,.jpeg" onSelect={handleFileSelect} onChange={handleFileSelect} />
                <button onClick={handleFileUpload}>Upload File</button>
            </div>
        </div>
    );
};

export default Chat;
