import React, { useState } from 'react';
import axios from 'axios';

const FeedbackForm = () => {
  const [type, setType] = useState('suggestion');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    setError('');
    try {
      const res = await axios.post('/api/feedback', { type, message, email });
      if (res.data.success) {
        setStatus('Thank you for your feedback!');
        setMessage('');
        setEmail('');
        setType('suggestion');
      } else {
        setError(res.data.message || 'Failed to submit feedback');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '2rem auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Submit Feedback</h2>
      <label>
        Type:
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="suggestion">Suggestion</option>
          <option value="bug">Bug</option>
          <option value="question">Question</option>
          <option value="other">Other</option>
        </select>
      </label>
      <br /><br />
      <label>
        Your Email (optional):<br />
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
      </label>
      <br /><br />
      <label>
        Message:<br />
        <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={4} style={{ width: '100%' }} />
      </label>
      <br />
      <button type="submit">Submit</button>
      {status && <div style={{ color: 'green', marginTop: 10 }}>{status}</div>}
      {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
    </form>
  );
};

export default FeedbackForm; 