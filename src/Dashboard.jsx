import React, { useState, useEffect } from 'react';
import './dashboard.css';

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedBookingIndex, setSelectedBookingIndex] = useState(0);
  const [currentDateBookings, setCurrentDateBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1));
  const [sortConfig, setSortConfig] = useState({ key: 'rid', direction: 'asc' });
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [highlightedRow, setHighlightedRow] = useState(null);
  const [activeStatusFilters, setActiveStatusFilters] = useState({
    confirmed: true,
    pending: true,
    rejected: true
  });

  // Column visibility state (persisted to localStorage)
  const [columns, setColumns] = useState(() => {
    const saved = localStorage.getItem('columnPreferences');
    return saved ? JSON.parse(saved) : {
      rid: true,
      property: true,
      operator: true,
      stock: true,
      status: true,
      checkIn: true,
      checkOut: true,
      revenue: true,
      commission: true,
      paymentStatus: true,
      actions: true
    };
  });

  // Save column preferences to localStorage
  useEffect(() => {
    localStorage.setItem('columnPreferences', JSON.stringify(columns));
  }, [columns]);

  // Sample booking data - linked to calendar dates
  const bookings = [
    { 
      rid: 28, 
      property: 'Santubong Homestay', 
      operator: 'John Properties',
      stock: 'Deluxe Room',
      name: 'Alice Johnson', 
      checkIn: '2026-03-23', 
      checkOut: '2026-03-25', 
      status: 'confirmed',
      paymentStatus: 'Paid',
      account: '***4567', 
      revenue: 653.40, 
      commission: 98.01, 
      roomType: 'Deluxe',
      quantity: 2,
      guest: 'Alice Johnson'
    },
    { 
      rid: 29, 
      property: 'Santubong Homestay', 
      operator: 'John Properties',
      stock: 'Garden View',
      name: 'Bob Smith', 
      checkIn: '2026-03-23', 
      checkOut: '2026-03-26', 
      status: 'confirmed',
      paymentStatus: 'Paid',
      account: '***7890', 
      revenue: 326.70, 
      commission: 49.00, 
      roomType: 'Garden',
      quantity: 1,
      guest: 'Bob Smith'
    },
    { 
      rid: 30, 
      property: 'Sematan Homestay', 
      operator: 'Beach Properties',
      stock: 'Ocean View',
      name: 'Carol White', 
      checkIn: '2026-03-23', 
      checkOut: '2026-03-24', 
      status: 'confirmed',
      paymentStatus: 'Paid',
      account: '***2345', 
      revenue: 297.00, 
      commission: 44.55, 
      roomType: 'Ocean',
      quantity: 1,
      guest: 'Carol White'
    },
    { 
      rid: 31, 
      property: 'Santubong Homestay', 
      operator: 'John Properties',
      stock: 'Deluxe Room',
      name: 'David Brown', 
      checkIn: '2026-03-24', 
      checkOut: '2026-03-26', 
      status: 'confirmed',
      paymentStatus: 'Paid',
      account: '***6789', 
      revenue: 490.50, 
      commission: 73.58, 
      roomType: 'Deluxe',
      quantity: 2,
      guest: 'David Brown'
    },
    { 
      rid: 32, 
      property: 'Santubong Homestay', 
      operator: 'John Properties',
      stock: 'Garden View',
      name: 'Eva Green', 
      checkIn: '2026-03-25', 
      checkOut: '2026-03-27', 
      status: 'pending',
      paymentStatus: 'Pending',
      account: '***3456', 
      revenue: 245.25, 
      commission: 36.79, 
      roomType: 'Garden',
      quantity: 1,
      guest: 'Eva Green'
    },
    { 
      rid: 33, 
      property: 'Sematan Homestay', 
      operator: 'Beach Properties',
      stock: 'Ocean View',
      name: 'Frank Miller', 
      checkIn: '2026-03-27', 
      checkOut: '2026-03-29', 
      status: 'rejected',
      paymentStatus: 'Canceled',
      account: '***8901', 
      revenue: 356.40, 
      commission: 0, 
      roomType: 'Ocean',
      quantity: 1,
      guest: 'Frank Miller'
    },
    { 
      rid: 34, 
      property: 'Santubong Homestay', 
      operator: 'John Properties',
      stock: 'Deluxe Room',
      name: 'Grace Lee', 
      checkIn: '2026-03-29', 
      checkOut: '2026-03-31', 
      status: 'confirmed',
      paymentStatus: 'Paid',
      account: '***4567', 
      revenue: 653.40, 
      commission: 98.01, 
      roomType: 'Deluxe',
      quantity: 2,
      guest: 'Grace Lee'
    },
    { 
      rid: 35, 
      property: 'Santubong Homestay', 
      operator: 'John Properties',
      stock: 'Garden View',
      name: 'Henry Wilson', 
      checkIn: '2026-03-29', 
      checkOut: '2026-03-30', 
      status: 'confirmed',
      paymentStatus: 'Paid',
      account: '***5678', 
      revenue: 326.70, 
      commission: 49.00, 
      roomType: 'Garden',
      quantity: 1,
      guest: 'Henry Wilson'
    },
    { 
      rid: 36, 
      property: 'Sematan Homestay', 
      operator: 'Beach Properties',
      stock: 'Ocean View',
      name: 'Ivy Chen', 
      checkIn: '2026-03-29', 
      checkOut: '2026-03-31', 
      status: 'confirmed',
      paymentStatus: 'Paid',
      account: '***6789', 
      revenue: 297.00, 
      commission: 44.55, 
      roomType: 'Ocean',
      quantity: 1,
      guest: 'Ivy Chen'
    }
  ];

  // Get bookings for a specific date
  const getBookingsForDate = (year, month, day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookings.filter(booking => booking.checkIn === dateStr);
  };

  // Generate calendar days for the current month
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Adjust for Monday as first day (0 = Monday, 6 = Sunday)
    const startOffset = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    
    const days = [];
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        month: month - 1,
        year: month === 0 ? year - 1 : year,
        isCurrentMonth: false
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        month: month,
        year: year,
        isCurrentMonth: true
      });
    }
    
    // Next month days (to complete 6 rows = 42 cells)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        month: month + 1,
        year: month === 11 ? year + 1 : year,
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  const calendarDays = getCalendarDays();

  const handleDateClick = (day, month, year) => {
    const dateBookings = getBookingsForDate(year, month, day);
    if (dateBookings.length > 0) {
      setSelectedDate({ day, month, year });
      setCurrentDateBookings(dateBookings);
      setSelectedBookingIndex(0);
      setSelectedBooking(dateBookings[0]);
    }
  };

  const handleBookingClick = (booking) => {
    setSelectedBooking(booking);
    // Find and highlight the date in calendar
    const [year, month, day] = booking.checkIn.split('-').map(Number);
    setSelectedDate({ day, month: month - 1, year });
    
    // Find index of this booking in the date's bookings
    const dateBookings = getBookingsForDate(year, month - 1, day);
    setCurrentDateBookings(dateBookings);
    const index = dateBookings.findIndex(b => b.rid === booking.rid);
    setSelectedBookingIndex(index >= 0 ? index : 0);
  };

  const handleNextBooking = (direction) => {
    if (!currentDateBookings.length) return;
    
    let newIndex = selectedBookingIndex + direction;
    
    if (newIndex >= 0 && newIndex < currentDateBookings.length) {
      setSelectedBookingIndex(newIndex);
      setSelectedBooking(currentDateBookings[newIndex]);
    }
  };

  const handleHighlightInTable = () => {
    if (selectedBooking) {
      setHighlightedRow(selectedBooking.rid);
      // Scroll to table
      document.querySelector('.table-section').scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleJumpToCalendar = (booking) => {
    const [year, month, day] = booking.checkIn.split('-').map(Number);
    setSelectedDate({ day, month: month - 1, year });
    // Scroll to calendar
    document.querySelector('.calendar-section').scrollIntoView({ behavior: 'smooth' });
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedBookings = () => {
    let filtered = [...bookings];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(booking => 
        booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.rid.toString().includes(searchTerm) ||
        booking.guest.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by status
    filtered = filtered.filter(booking => 
      (booking.status === 'confirmed' && activeStatusFilters.confirmed) ||
      (booking.status === 'pending' && activeStatusFilters.pending) ||
      (booking.status === 'rejected' && activeStatusFilters.rejected)
    );
    
    // Sort
    return filtered.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const toggleColumn = (columnKey) => {
    setColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  const toggleStatusFilter = (status) => {
    setActiveStatusFilters(prev => ({
      ...prev,
      [status]: !prev[status]
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const changeMonth = (delta) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  };

  const filteredBookings = getSortedBookings();

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="dashboard">
      {/* KPI row + quick filters */}
      <div className="kpi-row">
        <div className="kpi-cards">
          <div className="kpi-card">
            <div className="label">TOTAL REVENUE (MAR)</div>
            <div className="value">$3,646.35</div>
            <div className="sub">↑ 12% vs Feb</div>
          </div>
          <div className="kpi-card">
            <div className="label">TOTAL COMMISSIONS</div>
            <div className="value">$493.49</div>
            <div className="sub">15% avg</div>
          </div>
        </div>

        <div className="quick-filters">
          <div className="filter-pill">
            <span>📅</span> 16 Mar – 31 Mar
          </div>
          <div className="filter-pill">
            <span>🏠</span> All properties
          </div>
          <div className="filter-pill">
            <span>👤</span> Any operator
          </div>
          <div className="status-toggles">
            <div 
              className={`status-toggle-item ${activeStatusFilters.confirmed ? 'active' : ''}`}
              onClick={() => toggleStatusFilter('confirmed')}
            >
              <span className="status-dot dot-green"></span>
              <span>Confirmed</span>
            </div>
            <div 
              className={`status-toggle-item ${activeStatusFilters.pending ? 'active' : ''}`}
              onClick={() => toggleStatusFilter('pending')}
            >
              <span className="status-dot dot-yellow"></span>
              <span>Pending</span>
            </div>
            <div 
              className={`status-toggle-item ${activeStatusFilters.rejected ? 'active' : ''}`}
              onClick={() => toggleStatusFilter('rejected')}
            >
              <span className="status-dot dot-red"></span>
              <span>Rejected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Calendar and Side Panel */}
      <div className="main-content">
        {/* Calendar Section */}
        <div className="calendar-section">
          <div className="calendar-header">
            <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
            <div className="calendar-controls">
              <div className="month-nav">
                <span onClick={() => changeMonth(-1)}>←</span>
                <span className="active-month">{monthNames[currentDate.getMonth()]}</span>
                <span onClick={() => changeMonth(1)}>→</span>
              </div>
              <select 
                className="calendar-filter" 
                value={currentDate.getFullYear()}
                onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value), currentDate.getMonth(), 1))}
              >
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>
              <select 
                className="calendar-filter"
                value={currentDate.getMonth()}
                onChange={(e) => setCurrentDate(new Date(currentDate.getFullYear(), parseInt(e.target.value), 1))}
              >
                {monthNames.map((month, index) => (
                  <option key={month} value={index}>{month}</option>
                ))}
              </select>
              <select className="calendar-filter" defaultValue="all">
                <option value="all">All properties</option>
                <option value="santubong">Santubong Homestay</option>
                <option value="sematan">Sematan Homestay</option>
              </select>
            </div>
          </div>

          <div className="weekdays">
            <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
          </div>

          <div className="calendar-grid">
            {calendarDays.map((cell, index) => {
              const dateBookings = getBookingsForDate(cell.year, cell.month, cell.day);
              const isSelected = selectedDate && 
                selectedDate.day === cell.day && 
                selectedDate.month === cell.month && 
                selectedDate.year === cell.year;
              
              return (
                <div 
                  key={index}
                  className={`cal-cell ${!cell.isCurrentMonth ? 'other-month' : ''} ${isSelected ? 'today' : ''}`}
                  onClick={() => handleDateClick(cell.day, cell.month, cell.year)}
                >
                  <div className="cell-header">
                    <span className="day-number">{cell.day}</span>
                    {dateBookings.length > 0 && (
                      <span className="booking-count">{dateBookings.length}</span>
                    )}
                  </div>
                  
                  {dateBookings.length > 0 && (
                    <div className="booking-indicators">
                      {dateBookings.slice(0, 2).map((booking, idx) => (
                        <div key={idx} className="booking-indicator-item">
                          <span className={`indicator-dot ${booking.status === 'confirmed' ? 'green' : booking.status === 'pending' ? 'yellow' : 'red'}`}></span>
                          <span>${booking.revenue}</span>
                        </div>
                      ))}
                      {dateBookings.length > 2 && (
                        <div className="booking-indicator-item">
                          <span>+{dateBookings.length - 2} more</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Side Panel with Navigation */}
        {selectedBooking ? (
          <div className="side-panel">
            <div className="panel-header">
              <div className="panel-title-section">
                <h3>Booking Details - #{selectedBooking.rid}</h3>
                {currentDateBookings.length > 1 && (
                  <div className="panel-navigation">
                    <button 
                      className="panel-nav-arrow"
                      onClick={() => handleNextBooking(-1)}
                      disabled={selectedBookingIndex === 0}
                    >←</button>
                    <span className="panel-booking-counter">
                      {selectedBookingIndex + 1} of {currentDateBookings.length}
                    </span>
                    <button 
                      className="panel-nav-arrow"
                      onClick={() => handleNextBooking(1)}
                      disabled={selectedBookingIndex === currentDateBookings.length - 1}
                    >→</button>
                  </div>
                )}
              </div>
              <button className="close-btn" onClick={() => setSelectedBooking(null)}>×</button>
            </div>
            
            {selectedDate && (
              <div className="panel-date-info">
                <span>📅</span> {selectedDate.day} {monthNames[selectedDate.month]} {selectedDate.year} · {currentDateBookings.length} bookings on this date
              </div>
            )}
            
            <div className="panel-detail-grid">
              <div className="detail-row">
                <div className="detail-item">
                  <span className="detail-label">PROPERTY</span>
                  <span className="detail-value">{selectedBooking.property}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">GUEST</span>
                  <span className="detail-value">{selectedBooking.guest}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">ROOM TYPE</span>
                  <span className="detail-value">{selectedBooking.roomType}</span>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-item">
                  <span className="detail-label">QUANTITY</span>
                  <span className="detail-value">{selectedBooking.quantity}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">CHECK-IN</span>
                  <span className="detail-value">{formatDate(selectedBooking.checkIn)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">CHECK-OUT</span>
                  <span className="detail-value">{formatDate(selectedBooking.checkOut)}</span>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-item">
                  <span className="detail-label">REVENUE</span>
                  <span className="detail-value">${selectedBooking.revenue.toFixed(2)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">COMMISSION</span>
                  <span className="detail-value">${selectedBooking.commission.toFixed(2)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">OPERATOR</span>
                  <span className="detail-value">{selectedBooking.operator}</span>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-item">
                  <span className="detail-label">STATUS</span>
                  <div className="status-indicator">
                    <span className={`status-dot dot-${selectedBooking.status === 'confirmed' ? 'green' : selectedBooking.status === 'pending' ? 'yellow' : 'red'}`}></span>
                    <span className="detail-value">{selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">PAYMENT</span>
                  <span className="detail-value">{selectedBooking.paymentStatus}</span>
                </div>
              </div>

              <div className="panel-actions">
                <button className="highlight-btn" onClick={handleHighlightInTable}>
                  🔍 Highlight in table
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="side-panel">
            <div className="panel-header">
              <h3>Booking Details</h3>
              <button className="close-btn" onClick={() => setSelectedBooking(null)}>×</button>
            </div>
            <div style={{textAlign: 'center', color: '#55748f', padding: '40px 0'}}>
              Click on any date with bookings to view details
            </div>
          </div>
        )}
      </div>

      {/* Booking Table */}
      <div className="table-section">
        <div className="table-toolbar">
          <div className="left-actions">
            <div className="search-box">
              <span>🔍</span>
              <input 
                type="text" 
                placeholder="Search bookings..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="column-visibility">
              <div className="visibility-btn" onClick={() => setShowColumnDropdown(!showColumnDropdown)}>
                Columns <span>▼</span>
              </div>
              {showColumnDropdown && (
                <div className="visibility-dropdown">
                  {Object.keys(columns).map(key => (
                    <div key={key} className="visibility-item" onClick={() => toggleColumn(key)}>
                      <input type="checkbox" checked={columns[key]} readOnly />
                      <span>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <span className="pagination-info">Showing {filteredBookings.length} bookings</span>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                {columns.rid && <th onClick={() => handleSort('rid')} className={sortConfig.key === 'rid' ? `sort-${sortConfig.direction}` : ''}>Booking ID</th>}
                {columns.property && <th onClick={() => handleSort('property')} className={sortConfig.key === 'property' ? `sort-${sortConfig.direction}` : ''}>Property</th>}
                {columns.operator && <th onClick={() => handleSort('operator')} className={sortConfig.key === 'operator' ? `sort-${sortConfig.direction}` : ''}>Operator</th>}
                {columns.stock && <th onClick={() => handleSort('stock')} className={sortConfig.key === 'stock' ? `sort-${sortConfig.direction}` : ''}>Stock/Room</th>}
                {columns.status && <th onClick={() => handleSort('status')} className={sortConfig.key === 'status' ? `sort-${sortConfig.direction}` : ''}>Status</th>}
                {columns.checkIn && <th onClick={() => handleSort('checkIn')} className={sortConfig.key === 'checkIn' ? `sort-${sortConfig.direction}` : ''}>Check-in</th>}
                {columns.checkOut && <th onClick={() => handleSort('checkOut')} className={sortConfig.key === 'checkOut' ? `sort-${sortConfig.direction}` : ''}>Check-out</th>}
                {columns.revenue && <th onClick={() => handleSort('revenue')} className={sortConfig.key === 'revenue' ? `sort-${sortConfig.direction}` : ''}>Revenue</th>}
                {columns.commission && <th onClick={() => handleSort('commission')} className={sortConfig.key === 'commission' ? `sort-${sortConfig.direction}` : ''}>Commission</th>}
                {columns.paymentStatus && <th onClick={() => handleSort('paymentStatus')} className={sortConfig.key === 'paymentStatus' ? `sort-${sortConfig.direction}` : ''}>Payment Status</th>}
                {columns.actions && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr 
                  key={booking.rid} 
                  className={highlightedRow === booking.rid ? 'highlighted' : ''}
                  onClick={() => handleBookingClick(booking)}
                  style={{cursor: 'pointer'}}
                >
                  {columns.rid && <td>#{booking.rid}</td>}
                  {columns.property && <td>{booking.property}</td>}
                  {columns.operator && <td>{booking.operator}</td>}
                  {columns.stock && <td>{booking.stock}</td>}
                  {columns.status && (
                    <td>
                      <span className={`status-badge ${booking.status}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                  )}
                  {columns.checkIn && <td>{formatDate(booking.checkIn)}</td>}
                  {columns.checkOut && <td>{formatDate(booking.checkOut)}</td>}
                  {columns.revenue && <td>${booking.revenue.toFixed(2)}</td>}
                  {columns.commission && <td>${booking.commission.toFixed(2)}</td>}
                  {columns.paymentStatus && (
                    <td>
                      <span className={`status-badge ${booking.paymentStatus.toLowerCase()}`}>
                        {booking.paymentStatus}
                      </span>
                    </td>
                  )}
                  {columns.actions && (
                    <td>
                      <span className="jump-link" onClick={(e) => {
                        e.stopPropagation();
                        handleJumpToCalendar(booking);
                      }}>
                        📍 Jump to calendar
                      </span>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;