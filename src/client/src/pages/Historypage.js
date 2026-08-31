import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Historypage.css';
import Header from "../components/Header"; // Ensure the Header component is imported


const HistoryPage = () => {
    const [viewOption, setViewOption] = useState('individual');
    const [history, setHistory] = useState([]);
    const [filters, setFilters] = useState({ subject: '', teacher: '', weather: '', stress_category: '' });
    const [sortOrder, setSortOrder] = useState('latest');
    const [showFilters, setShowFilters] = useState(false);
    const [weeklyResults, setWeeklyResults] = useState([]);

    const fetchHistory = async (option, filters, sortOrder) => {
        const endpoint = option === 'individual' ? 'http://localhost:5000/history' : 'http://localhost:5000/combined-results';
        try {
            const response = await axios.get(endpoint, { params: { ...filters, sort_order: sortOrder } });
            if (option === 'individual') {
                setHistory(response.data);
            } else {
                setWeeklyResults(response.data);
            }
        } catch (error) {
            console.error("Error fetching history:", error);
        }
    };

    useEffect(() => {
        fetchHistory(viewOption, filters, sortOrder);
    }, [viewOption, filters, sortOrder]);

    const handleViewChange = (event) => {
        setViewOption(event.target.value);
    };

    const handleFilterChange = (event) => {
        const { name, value } = event.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value
        }));
    };

    const handleSortChange = (event) => {
        setSortOrder(event.target.value);
    };

    const toggleFilters = () => {
        setShowFilters(prevShowFilters => !prevShowFilters);
    };


    return (
        <div className="history-page">
            <Header />
            <header className="history-header">
                <h1 className="logo">Analysis History</h1>
                <div className="view-options">
                    <label>
                        <input
                            type="radio"
                            value="individual"
                            checked={viewOption === 'individual'}
                            onChange={handleViewChange}
                        />
                        Individual Sessions
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="combined"
                            checked={viewOption === 'combined'}
                            onChange={handleViewChange}
                        />
                        Combined Results
                    </label>
                </div>
                <button onClick={toggleFilters}>
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
                {showFilters && (
                    <div className="filters">
                        {viewOption === 'individual' ? (
                            <>
                                <label>
                                    Subject:
                                    <input
                                        type="text"
                                        name="subject"
                                        value={filters.subject}
                                        onChange={handleFilterChange}
                                    />
                                </label>
                                <label>
                                    Teacher:
                                    <input
                                        type="text"
                                        name="teacher"
                                        value={filters.teacher}
                                        onChange={handleFilterChange}
                                    />
                                </label>
                                <label>
                                    Weather:
                                    <input
                                        type="text"
                                        name="weather"
                                        value={filters.weather}
                                        onChange={handleFilterChange}
                                    />
                                </label>
                            </>
                        ) : (
                            <label>
                                Stress Category:
                                <select name="stress_category" value={filters.stress_category} onChange={handleFilterChange}>
                                    <option value="">All</option>
                                    <option value="Normal">Normal</option>
                                    <option value="Mild">Mild</option>
                                    <option value="Moderate">Moderate</option>
                                    <option value="Severe">Severe</option>
                                    <option value="Extremely Severe">Extremely Severe</option>
                                </select>
                            </label>
                        )}
                        <label>
                            Sort by:
                            <select name="sortOrder" value={sortOrder} onChange={handleSortChange}>
                                <option value="latest">Latest to Earliest</option>
                                <option value="earliest">Earliest to Latest</option>
                            </select>
                        </label>
                    </div>
                )}
            
            <div className="history-grid">
                {viewOption === 'individual' && history.length > 0 ? (
                    history.map((entry, index) => (
                        <div key={index} className="history-entry">
                            <h3>Session ID: {entry.session_id}</h3>
                            <h3>Subject: {entry.subject}</h3>
                            <h3>Session {entry.session}</h3>
                            <p>Date: {entry.date}</p>
                            <p>Weather: {entry.weather}</p>
                            <p>Teacher: {entry.teacher}</p>
                            <p>Start Time: {entry.startTime}</p>
                            <p>End Time: {entry.endTime}</p>
                        </div>
                    ))
                ) : viewOption === 'combined' && weeklyResults.length > 0 ? (
                    weeklyResults.map((result, index) => (
                        <div key={index} className="weekly-result-detail">
                            <h3>Week: {result.week}</h3>
                            <p>Average Stress: {result.average_stress.toFixed(2)}%</p>
                            <p>Stress Category: {result.stress_category}</p>
                            <p>Sessions Count: {result.sessions_count}</p>
                            <p>Zenlens Response: {result.openai_response}</p>
                        </div>
                    ))
                ) : (
                    <p>No analysis history found.</p>
                )}
            </div>
            </header>
        </div>
    );
};

export default HistoryPage;
