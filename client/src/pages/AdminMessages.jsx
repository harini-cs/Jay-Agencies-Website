import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminMessages.css";

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [replies, setReplies] = useState({});
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [sortOrder, setSortOrder] = useState("newest");
  const [filterType, setFilterType] = useState("all");
  const [isSendingReply, setIsSendingReply] = useState(false);  // New state for loading reply

  const fetchMessages = React.useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const { data } = await axios.get("http://localhost:5000/api/messages", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(sortMessages(data, sortOrder));
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      showNotification("error", "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [sortOrder]);

  const sortMessages = (messagesArray, order) => {
    return [...messagesArray].sort((a, b) =>
      order === "newest"
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    );
  };

  const filteredMessages = messages.filter((msg) => {
    if (filterType === "replied") return msg.reply;
    if (filterType === "not_replied") return !msg.reply;
    return true;
  });

  const handleSortChange = (e) => {
    const order = e.target.value;
    setSortOrder(order);
    setMessages(sortMessages(messages, order));
  };

  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
  };

  const handleReplyChange = (id, value) => {
    setReplies((prev) => ({ ...prev, [id]: value }));
  };

  const sendReply = async (id) => {
    if (!replies[id]?.trim()) {
      showNotification("error", "Reply cannot be empty");
      return;
    }
    setIsSendingReply(true);  // Start loading state
    const token = localStorage.getItem("token");
    try {
      const response = await axios.put(
        `http://localhost:5000/api/messages/reply/${id}`,
        { reply: replies[id] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.message === "Reply sent and email delivered") {
        showNotification("success", "Reply sent successfully and email delivered!");
      } else {
        showNotification("success", "Reply sent successfully!");
      }
      fetchMessages();
      setReplies((prev) => ({ ...prev, [id]: "" }));
    } catch (err) {
      console.error("Reply failed:", err);
      showNotification("error", "Failed to send reply");
    } finally {
      setIsSendingReply(false);  // End loading state
    }
  };
  

  const deleteMessage = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:5000/api/messages/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showNotification("success", "Message deleted successfully");
      setConfirmDelete(null);
      fetchMessages();
    } catch (err) {
      console.error("Delete failed:", err);
      showNotification("error", "Failed to delete message");
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "", message: "" });
    }, 3000);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return (
    <div className="admin-messages-container">
      <header className="admin-header">
        <h1>Customer Messages</h1>
        <div className="admin-controls">
          <div className="sort-dropdown">
            <label>Sort:</label>
            <select value={sortOrder} onChange={handleSortChange}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
          <div className="filter-dropdown">
            <label>Filter:</label>
            <select value={filterType} onChange={handleFilterChange}>
              <option value="all">All</option>
              <option value="replied">Replied</option>
              <option value="not_replied">Not Replied</option>
            </select>
          </div>
        </div>
      </header>

      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading messages...</p>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="no-messages">
          <i className="icon-inbox"></i>
          <p>No messages to display.</p>
        </div>
      ) : (
        <div className="messages-list">
          {filteredMessages.map((msg) => (
            <div key={msg._id} className="message-card">
              {confirmDelete === msg._id ? (
                <div className="delete-confirmation">
                  <p>Are you sure you want to delete this message?</p>
                  <div className="delete-actions">
                    <button onClick={() => deleteMessage(msg._id)}>Yes</button>
                    <button onClick={() => setConfirmDelete(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="message-header">
                    <div className="sender">
                      <h3>{msg.name}</h3>
                      <p className="email">{msg.email}</p>
                    </div>
                    <div className="header-right">
                      <span className={`status-badge ${msg.reply ? 'replied' : 'not-replied'}`}>
                        {msg.reply ? 'Replied' : 'Pending'}
                      </span>
                      <button className="delete-btn" onClick={() => setConfirmDelete(msg._id)}>
                        🗑
                      </button>
                    </div>
                  </div>
                  <div className="subject">Subject: {msg.subject}</div>
                  <div className="message-body">Message: {msg.message}</div>
                  <div className="timestamp">Received: {formatDate(msg.createdAt)}</div>

                  {msg.reply ? (
                    <div className="reply-box replied">
                      <h4>Your Reply</h4>
                      <p>{msg.reply}</p>
                      <div className="timestamp">Sent: {formatDate(msg.repliedAt)}</div>
                    </div>
                  ) : (
                    <div className="reply-box">
                      <textarea
                        placeholder="Type your reply..."
                        value={replies[msg._id] || ""}
                        onChange={(e) => handleReplyChange(msg._id, e.target.value)}
                      />
                      <button
                        onClick={() => sendReply(msg._id)}
                        disabled={isSendingReply}  // Disable button while sending reply
                      >
                        {isSendingReply ? "Sending..." : "Send Reply"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
