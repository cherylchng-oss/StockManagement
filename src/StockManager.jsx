import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchReservation } from '../../../../../Api/api';
import Filter from '../../../../Component/Filter/Filter';
import Modal from '../../../../Component/Modal/Modal';
import SearchBar from '../../../../Component/SearchBar/SearchBar';
import PaginatedTable from '../../../../Component/PaginatedTable/StockManager_PaginatedTable';
import Loader from '../../../../Component/Loader/Loader';
import Status from '../../../../Component/Status/Status';
import StockManagerRoomPlannerCalendar from '../../../../Component/Room_Planner_Calender/StockManager_Room_Planner_Calendar';
import '../../../../Component/MainContent/MainContent.css';
import '../../../../Component/Modal/Modal.css';
import '../../../../Component/Filter/Filter.css';
import './StockManager.css';

const StockManager = () => {
    const [searchKey, setSearchKey] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [appliedFilters, setAppliedFilters] = useState({ status: 'All' });
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [calendarHighlight, setCalendarHighlight] = useState(null);
    const [summaryFilterType, setSummaryFilterType] = useState('month'); 
    const [summaryMonth, setSummaryMonth] = useState(new Date().toISOString().slice(0, 7)); 
    const [summaryStartDate, setSummaryStartDate] = useState(''); 
    const [summaryEndDate, setSummaryEndDate] = useState('');
    const [tableHighlightReservationId, setTableHighlightReservationId] = useState(null);
    const [tableCurrentPage, setTableCurrentPage] = useState(1);
    const tableRowsPerPage = 5;

    useEffect(() => {
        const username = localStorage.getItem('username');
        const userid = localStorage.getItem('userid');
        const userGroup = localStorage.getItem('userGroup');

        console.log('Current user loaded:', { username, userid, userGroup });
    }, []);

    const { data: reservationsData = [], isLoading: reservationsLoading } = useQuery({
        queryKey: ['reservations'],
        queryFn: async () => {
            try {
                const reservationData = await fetchReservation();
                if (Array.isArray(reservationData)) {
                    return reservationData.map(reservation => {
                        const reservationblocktime = new Date(reservation.reservationblocktime).getTime();
                        const currentDateTime = Date.now() + 8 * 60 * 60 * 1000;

                        if (reservation.reservationstatus === 'Pending' && currentDateTime > reservationblocktime) {
                            return { ...reservation, reservationstatus: 'expired' };
                        }
                        return reservation;
                    });
                } else {
                    console.error("Invalid data format received:", reservationData);
                    return [];
                }
            } catch (error) {
                console.error('Failed to fetch reservation details:', error);
                throw error;
            }
        },
        staleTime: 30 * 60 * 1000,
        refetchInterval: 1000,
    });

    const handleApplyFilters = () => {
        setAppliedFilters({ status: selectedStatus });
    };

    const filters = [
        {
            name: 'status',
            label: 'Status',
            value: selectedStatus,
            onChange: setSelectedStatus,
            options: [
                { value: 'All', label: 'All Statuses' },
                { value: 'Pending', label: 'Pending' },
                { value: 'Accepted', label: 'Accepted' },
                { value: 'Rejected', label: 'Rejected' },
                { value: 'Canceled', label: 'Canceled' },
                { value: 'Paid', label: 'Paid' },
                { value: 'Expired', label: 'Expired' },
                { value: 'Suggested', label: 'Suggested' },
                { value: 'Published', label: 'Published' },
            ],
        },
    ];

    const displayLabels = {
        reservationid: "Reservation ID",
        propertyaddress: "Property Name",
        checkindatetime: "Check-In Date Time",
        checkoutdatetime: "Check-Out Date Time",
        name: "Customer Name",
        request: "Request",
        totalprice: "Total Price",
        reservationstatus: "Status",
        images: "Images",
    };

    const formatDate = (datetime) => {
        if (!datetime) return '';
        const date = new Date(datetime);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const isWithinSummaryRange = (reservation) => { 
        if (!reservation.checkindatetime) return false; 

        const reservationDate = new Date(reservation.checkindatetime); 
        if (Number.isNaN(reservationDate.getTime())) return false; 

        if (summaryFilterType === 'month') { 
            const reservationMonth = `${reservationDate.getFullYear()}-${String(reservationDate.getMonth() + 1).padStart(2, '0')}`; 
            return reservationMonth === summaryMonth; 
        } 

        if (summaryFilterType === 'date') { 
            if (!summaryStartDate || !summaryEndDate) return true; 
            const start = new Date(summaryStartDate); 
            const end = new Date(summaryEndDate); 
            end.setHours(23, 59, 59, 999); 
            return reservationDate >= start && reservationDate <= end; 
        } 

        return true; 
    }; 

    const summaryReservations = Array.isArray(reservationsData)
        ? reservationsData.filter(reservation =>
            isWithinSummaryRange(reservation) &&
            ['paid', 'accepted'].includes((reservation.reservationstatus || '').toLowerCase())
        )
        : [];

    const totalRevenue = summaryReservations.reduce((sum, reservation) => {
        return sum + (parseFloat(reservation.totalprice) || 0);
    }, 0); 

    const totalCommission = summaryReservations.reduce((sum, reservation) => {
        return sum + (parseFloat(reservation.commission ?? reservation.commissionamount) || 0);
    }, 0); 

    const formatCurrency = (amount) => { 
        return `RM ${amount.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }; 

    const filteredReservations = Array.isArray(reservationsData)
        ? reservationsData.filter(
            (reservation) =>
                (appliedFilters.status === 'All' || (reservation.reservationstatus ?? 'Pending').toLowerCase() === appliedFilters.status.toLowerCase()) &&
                (
                    (reservation.reservationid?.toString().toLowerCase().includes(searchKey.toLowerCase()) || '') ||
                    (reservation.propertyaddress?.toString().toLowerCase().includes(searchKey.toLowerCase()) || '') ||
                    (reservation.totalprice?.toString().toLowerCase().includes(searchKey.toLowerCase()) || '') ||
                    (reservation.request?.toLowerCase().includes(searchKey.toLowerCase()) || '') ||
                    (reservation.reservationstatus?.toLowerCase().includes(searchKey.toLowerCase()) || '') ||
                    (formatDate(reservation.checkindatetime).includes(searchKey)) ||
                    (formatDate(reservation.checkoutdatetime).includes(searchKey)) ||
                    (reservation.rcfirstname?.toLowerCase().includes(searchKey.toLowerCase()) || '') ||
                    (reservation.rclastname?.toLowerCase().includes(searchKey.toLowerCase()) || '')
                )
        )
        : [];

    const handleRowClick = (reservation) => {
        const essentialFields = {
            reservationid: reservation.reservationid || 'N/A',
            propertyaddress: reservation.propertyaddress || 'N/A',
            checkindatetime: formatDate(reservation.checkindatetime) || 'N/A',
            checkoutdatetime: formatDate(reservation.checkoutdatetime) || 'N/A',
            request: reservation.request || 'N/A',
            totalprice: reservation.totalprice || 'N/A',
            name: `${reservation.rcfirstname || ''} ${reservation.rclastname || ''}`.trim() || 'N/A',
            reservationstatus: reservation.reservationstatus || 'N/A',
            images: reservation.propertyimage || [],
        };
        setSelectedReservation(essentialFields);
    };

    const handleJumpToCalendar = (reservation) => {
        setCalendarHighlight({ 
            checkin: reservation.checkindatetime, 
            checkout: reservation.checkoutdatetime, 
            property: reservation.propertyaddress 
        }); 
        document.querySelector('.room-planner-container')?.scrollIntoView({ behavior: 'smooth' }); 
    };

    const handleJumpToTable = (reservation) => { 
        const sortedReservations = [...filteredReservations].sort((a, b) => { 
            return (a?.reservationid < b?.reservationid ? -1 : 1) * -1; 
        }); 

        const targetIndex = sortedReservations.findIndex( 
            (item) => item.reservationid === reservation.reservationid 
        ); 

        if (targetIndex === -1) return; 

        const targetPage = Math.floor(targetIndex / tableRowsPerPage) + 1; 
        setTableCurrentPage(targetPage); 
        setTableHighlightReservationId(reservation.reservationid); 

        setTimeout(() => { 
            document.querySelector(`[data-row-key="${reservation.reservationid}"]`)?.scrollIntoView({
                behavior: 'smooth', 
                block: 'center', 
            }); 
        }, 150); 
    }; 

    const columns = [
        {
            header: 'BID',
            accessor: 'reservationid',
        },
        {
            header: 'Image',
            accessor: 'propertyimage',
            render: (reservation) =>
                reservation.propertyimage && reservation.propertyimage.length > 0 ? (
                    <img
                        src={`data:image/jpeg;base64,${reservation.propertyimage[0]}`}
                        alt={`Property ${reservation.propertyaddress}`}
                        style={{ width: 80, height: 80 }}
                    />
                ) : (
                    <span>No Image</span>
                ),
        },
        {   header: 'Property Name', accessor: 'propertyaddress' },
        {
            header: 'Operator',
            accessor: 'operator',
            render: (reservation) => (
                reservation.property_owner_username || 'N/A'
            ),
        },
        {
            header: 'Room',
            accessor: 'room',
            render: (reservation) => (
                reservation.request || 'N/A'
            ),
        },
        {
            header: 'Check-in Date',
            accessor: 'checkindatetime',
            render: (reservation) => {
                const date = new Date(reservation.checkindatetime);
                return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
            },
        },
        {
            header: 'Check-out Date',
            accessor: 'checkoutdatetime',
            render: (reservation) => {
                const date = new Date(reservation.checkoutdatetime);
                return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
            },
        },
        {
            header: 'Revenue',
            accessor: 'totalprice',
            render: (reservation) => `RM ${reservation.totalprice ?? '0.00'}`,
        },
        {
            header: 'Commission',
            accessor: 'commission',
            render: (reservation) => (
                reservation.commission ?? reservation.commissionamount ?? 'N/A'
            ),
        },
        {
            header: 'Status',
            accessor: 'reservationstatus',
            render: (reservation) => (
                <Status value={reservation.reservationstatus} />
            ),
        },
        {
            header: 'Actions',
            accessor: 'actions',
            render: (reservation) => (
                <button
                    onClick={(e) => {
                        e.stopPropagation(); 
                        handleJumpToCalendar(reservation);
                    }}
                    style={{
                        padding: '6px 10px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Jump to Calendar
                </button>
            ),
        },
    ];

    return (
        <div>
            <div className="header-container">
                <h1 className="dashboard-page-title">Stock Management</h1>
                <SearchBar value={searchKey} onChange={(newValue) => setSearchKey(newValue)} placeholder="Search reservations..." />
            </div>

            <div className="stock-summary-section"> {/* NEW */}
                <div className="stock-summary-filter-bar"> {/* NEW */}
                    <div className="stock-summary-filter-group"> {/* NEW */}
                        <label className="stock-summary-label">View By</label> {/* NEW */}
                        <select
                            className="stock-summary-input"
                            value={summaryFilterType}
                            onChange={(e) => setSummaryFilterType(e.target.value)}
                        >
                            <option value="month">Month</option>
                            <option value="date">Date Range</option>
                        </select>
                    </div>

                    {summaryFilterType === 'month' ? (
                        <div className="stock-summary-filter-group"> {/* NEW */}
                            <label className="stock-summary-label">Month</label> {/* NEW */}
                            <input
                                type="month"
                                className="stock-summary-input"
                                value={summaryMonth}
                                onChange={(e) => setSummaryMonth(e.target.value)}
                            />
                        </div>
                    ) : (
                        <>
                            <div className="stock-summary-filter-group"> {/* NEW */}
                                <label className="stock-summary-label">Start Date</label> {/* NEW */}
                                <input
                                    type="date"
                                    className="stock-summary-input"
                                    value={summaryStartDate}
                                    onChange={(e) => setSummaryStartDate(e.target.value)}
                                />
                            </div>

                            <div className="stock-summary-filter-group"> {/* NEW */}
                                <label className="stock-summary-label">End Date</label> {/* NEW */}
                                <input
                                    type="date"
                                    className="stock-summary-input"
                                    value={summaryEndDate}
                                    onChange={(e) => setSummaryEndDate(e.target.value)}
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="stock-summary-cards"> {/* NEW */}
                    <div className="stock-summary-card"> {/* NEW */}
                        <div className="stock-summary-card-title">Total Revenue</div> {/* NEW */}
                        <div className="stock-summary-card-value">{formatCurrency(totalRevenue)}</div> {/* NEW */}
                        <div className="stock-summary-card-subtitle">
                            {summaryFilterType === 'month' ? summaryMonth : 'Selected date range'}
                        </div>
                    </div>

                    <div className="stock-summary-card"> {/* NEW */}
                        <div className="stock-summary-card-title">Total Commission</div> {/* NEW */}
                        <div className="stock-summary-card-value">{formatCurrency(totalCommission)}</div> {/* NEW */}
                        <div className="stock-summary-card-subtitle">
                            {summaryFilterType === 'month' ? summaryMonth : 'Selected date range'}
                        </div>
                    </div>
                </div>
            </div>

            <Filter filters={filters} onApplyFilters={handleApplyFilters} />

            <div className="room-planner-container">
                <StockManagerRoomPlannerCalendar
                    highlightBooking={calendarHighlight}
                    onJumpToTable={handleJumpToTable}
                />
            </div> 

            {reservationsLoading ? (
                <div className="loader-box">
                    <Loader />
                </div>
            ) : (
                <PaginatedTable
                    data={filteredReservations}
                    columns={columns}
                    rowKey="reservationid"
                    enableCheckbox={false}
                    onRowClick={handleRowClick}
                    highlightedRowKey={tableHighlightReservationId}
                    currentPage={tableCurrentPage}
                    onPageChange={setTableCurrentPage} 
                    rowsPerPage={tableRowsPerPage}
                />
            )}

            <Modal
                isOpen={!!selectedReservation}
                title={'Reservation Details'}
                data={selectedReservation || {}}
                labels={displayLabels}
                onClose={() => setSelectedReservation(null)}
            />
        </div>
    );
};

export default StockManager;