// Script para Sistema BI - Lógica Avanzada SaaS & Charts

document.addEventListener('DOMContentLoaded', () => {
    // ======== 1. FETCH API (Datos Dinámicos Mantenidos) ========
    const fecthMetrics = async () => {
        try {
            const res = await fetch('/api/metrics');
            if(!res.ok) throw new Error("Network Fetch Failed");
            const data = await res.json();
            
            // Función auxiliar para animar números
            const animateValue = (id, endVal, isCurrency=false, addStr="") => {
                const el = document.getElementById(id);
                if(!el) return;
                
                let start = 0;
                let duration = 800; // ms
                let startTime = null;
                
                const step = (timestamp) => {
                    if(!startTime) startTime = timestamp;
                    const progress = Math.min((timestamp - startTime) / duration, 1);
                    const current = Math.floor(progress * endVal);
                    
                    if(isCurrency) {
                        el.textContent = "$" + current.toLocaleString() + addStr;
                    } else {
                        el.textContent = current.toLocaleString() + addStr;
                    }
                    
                    if(progress < 1) {
                        window.requestAnimationFrame(step);
                    } else {
                        el.textContent = isCurrency ? "$" + endVal.toLocaleString() + addStr : endVal.toLocaleString() + addStr;
                    }
                };
                window.requestAnimationFrame(step);
            };

            animateValue('metric-ingresos', data.ingresos, true);
            animateValue('metric-clientes', data.clientes, false);
            animateValue('metric-reservas', data.reservas, false);
            animateValue('fin-ingresos', data.ingresos, true);
            animateValue('fin-pagos', data.pagos_realizados, false);
            
            const sAvg = document.getElementById('satis-avg');
            if(sAvg) sAvg.textContent = `${data.satisfaccion_avg}/5`;
            
            animateValue('maint-cost', data.costo_mantenimiento, true);
            
        } catch (err) {
            console.error("Error Obteniendo Métricas DB", err);
            document.querySelectorAll('.kpi-value').forEach(el => {
                if(el.textContent === "--") el.textContent = "Err";
            });
        }
    };
    fecthMetrics();

    // ======== 2. CHART.JS CONFIGURATION ========
    // Overrides globales
    if (typeof Chart !== 'undefined') {
        Chart.defaults.color = '#a3a3a3';
        Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
    }

    let charts = {};

    function initMainChart() {
        if(charts['main']) charts['main'].destroy();
        const ctx = document.getElementById('mainChart');
        if(!ctx) return;
        
        const grad1 = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
        grad1.addColorStop(0, 'rgba(0, 102, 255, 0.5)');
        grad1.addColorStop(1, 'rgba(0, 102, 255, 0)');

        const grad2 = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
        grad2.addColorStop(0, 'rgba(0, 255, 102, 0.5)');
        grad2.addColorStop(1, 'rgba(0, 255, 102, 0)');

        charts['main'] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar'],
                datasets: [
                    {
                        label: 'Reservas Trimestrales',
                        data: [120, 190, 150, 220, 250, 310],
                        borderColor: '#0066ff',
                        backgroundColor: grad1,
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#0066ff',
                        pointBorderColor: '#fff',
                        pointRadius: 6,
                        pointHoverRadius: 9
                    },
                    {
                        label: 'Proyección Analytica',
                        data: [130, 160, 200, 240, 270, 320],
                        borderColor: '#00ff66',
                        backgroundColor: grad2,
                        borderWidth: 3,
                        borderDash: [5, 5],
                        tension: 0.4,
                        fill: false,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'top', labels: { color: '#fff', font: { weight: '800' } } } },
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, border: { dash: [4, 4] } },
                    x: { grid: { color: 'rgba(255,255,255,0.05)' } }
                }
            }
        });
    }

    function initFinChart() {
        if(charts['fin']) charts['fin'].destroy();
        const ctx = document.getElementById('finChart');
        if(!ctx) return;
        
        const g1 = ctx.getContext('2d').createLinearGradient(0,0,0,400);
        g1.addColorStop(0, '#00b09b'); g1.addColorStop(1, '#96c93d');
        const g2 = ctx.getContext('2d').createLinearGradient(0,0,0,400);
        g2.addColorStop(0, '#ff0844'); g2.addColorStop(1, '#ffb199');

        charts['fin'] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                datasets: [
                    {
                        label: 'Recibido Net ($)',
                        data: [45000, 62000, 89000, 125000],
                        backgroundColor: g1,
                        borderRadius: 12
                    },
                    {
                        label: 'Obligaciones ($)',
                        data: [30000, 35000, 42000, 50000],
                        backgroundColor: g2,
                        borderRadius: 12
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#fff', font:{weight:'bold'} } } },
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    function initOpChart() {
        if(charts['op']) charts['op'].destroy();
        const ctx = document.getElementById('opChart');
        if(!ctx) return;
        
        charts['op'] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Ocupado', 'Libre', 'Reservado', 'Bloqueado'],
                datasets: [{
                    data: [65, 20, 10, 5],
                    backgroundColor: ['#00c6ff', '#0ba360', '#8E2DE2', '#f12711'],
                    borderWidth: 0,
                    hoverOffset: 12
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                cutout: '70%',
                plugins: { legend: { position: 'bottom', labels: { color: '#fff', font:{size: 14, weight:'bold'} } } }
            }
        });
    }

    function initSatChart() {
        if(charts['sat']) charts['sat'].destroy();
        const ctx = document.getElementById('satChart');
        if(!ctx) return;
        
        charts['sat'] = new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: ['Confort', 'Limpieza', 'Personal', 'Comida', 'WiFi'],
                datasets: [{
                    label: 'Ratings',
                    data: [9.5, 8.0, 9.8, 7.5, 6.0],
                    backgroundColor: [
                        'rgba(142, 45, 226, 0.7)',
                        'rgba(11, 163, 96, 0.7)',
                        'rgba(0, 198, 255, 0.7)',
                        'rgba(241, 39, 17, 0.7)',
                        'rgba(255, 65, 108, 0.7)'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: { 
                    r: { ticks: { backdropColor: 'transparent', color: '#fff', font:{weight:'bold'} }, grid: { color: 'rgba(255,255,255,0.1)' }, angleLines: { color: 'rgba(255,255,255,0.1)' } } 
                },
                plugins: { legend: { position: 'right', labels: { color: '#fff', font:{weight:'bold'} } } }
            }
        });
    }

    function initMaintChart() {
        if(charts['maint']) charts['maint'].destroy();
        const ctx = document.getElementById('maintChart');
        if(!ctx) return;
        
        const grad = ctx.getContext('2d').createLinearGradient(0,0,600,0);
        grad.addColorStop(0, '#00c6ff');
        grad.addColorStop(1, '#0072ff');

        charts['maint'] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Aire Acondicionado', 'Fontanería', 'Ascensores', 'Pintura', 'Cableado'],
                datasets: [{
                    label: 'Costo Anual USD Estimado',
                    data: [12000, 8500, 5000, 3200, 1500],
                    backgroundColor: grad,
                    borderRadius: 6
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { color: 'rgba(255,255,255,0.05)' } },
                    y: { grid: { display: false }, ticks: { color: '#fff', font: { weight: 'bold' } } }
                }
            }
        });
    }

    function triggerChartRender(tabId) {
        if (typeof Chart === 'undefined') return;
        if(tabId === 'dash-main') setTimeout(initMainChart, 350);
        if(tabId === 'dash-financiero') setTimeout(initFinChart, 350);
        if(tabId === 'dash-operativo') setTimeout(initOpChart, 350);
        if(tabId === 'dash-satisfaccion') setTimeout(initSatChart, 350);
        if(tabId === 'dash-mantenimiento') setTimeout(initMaintChart, 350);
    }

    // Arrancar Chart 1 al cargar
    setTimeout(initMainChart, 500);

    // ======== 3. NAVEGACIÓN SPA VÍA TABS ========
    const navLinks = document.querySelectorAll('.js-nav-tab');
    const sections = document.querySelectorAll('.dashboard-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); 
            
            navLinks.forEach(n => n.classList.remove('active'));
            sections.forEach(s => s.classList.add('hidden'));
            
            link.classList.add('active');
            
            const targetId = link.getAttribute('data-target');
            const targetEl = document.getElementById(targetId);
            
            if(targetEl) {
                targetEl.classList.remove('hidden');
                
                targetEl.style.opacity = 0;
                targetEl.style.transform = "translateY(15px)";
                
                setTimeout(() => {
                    targetEl.style.transition = "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
                    targetEl.style.opacity = 1;
                    targetEl.style.transform = "translateY(0)";
                }, 10);

                triggerChartRender(targetId);
            }
        });
    });
});
