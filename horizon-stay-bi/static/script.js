document.addEventListener('DOMContentLoaded', () => {
    // Select all nav links to add active class on click
    const navLinks = document.querySelectorAll('.nav-item');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Initialize Chart.js Revenue Chart
    const ctx = document.getElementById('revenueChart').getContext('2d');
    
    // Gradient for the line chart
    const gradientBlue = ctx.createLinearGradient(0, 0, 0, 400);
    gradientBlue.addColorStop(0, 'rgba(0, 242, 254, 0.5)');
    gradientBlue.addColorStop(1, 'rgba(0, 242, 254, 0.0)');

    const gradientPurple = ctx.createLinearGradient(0, 0, 0, 400);
    gradientPurple.addColorStop(0, 'rgba(179, 56, 255, 0.5)');
    gradientPurple.addColorStop(1, 'rgba(179, 56, 255, 0.0)');

    // Chart Data
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct'];
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Ingresos 2023 ($)',
                    data: [65000, 72000, 68000, 85000, 92000, 88000, 105000, 110000, 95000, 124563],
                    borderColor: '#00f2fe',
                    backgroundColor: gradientBlue,
                    borderWidth: 3,
                    pointBackgroundColor: '#0a0e17',
                    pointBorderColor: '#00f2fe',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Ingresos 2022 ($)',
                    data: [55000, 60000, 58000, 70000, 75000, 72000, 85000, 90000, 82000, 95000],
                    borderColor: '#b338ff',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointBackgroundColor: '#0a0e17',
                    pointBorderColor: '#b338ff',
                    pointBorderWidth: 2,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    fill: false,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    align: 'end',
                    labels: {
                        color: '#94a3b8',
                        font: {
                            family: "'Outfit', sans-serif",
                            size: 12
                        },
                        usePointStyle: true,
                        boxWidth: 8
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(10, 14, 23, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#94a3b8',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    titleFont: {
                        family: "'Outfit', sans-serif",
                        size: 14
                    },
                    bodyFont: {
                        family: "'Outfit', sans-serif",
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        color: '#64748b',
                        font: {
                            family: "'Outfit', sans-serif",
                            size: 12
                        }
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false,
                        borderDash: [5, 5]
                    },
                    ticks: {
                        color: '#64748b',
                        font: {
                            family: "'Outfit', sans-serif",
                            size: 12
                        },
                        callback: function(value) {
                            return '$' + value / 1000 + 'k';
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index',
            },
        }
    });

    // Add slight hover animation to table rows manually (optional, css handles this already)
    const tableRows = document.querySelectorAll('.data-table tbody tr');
    tableRows.forEach(row => {
        row.addEventListener('mouseenter', () => {
            row.style.transform = 'translateY(-2px)';
        });
        row.addEventListener('mouseleave', () => {
            row.style.transform = 'translateY(0)';
        });
    });
});
