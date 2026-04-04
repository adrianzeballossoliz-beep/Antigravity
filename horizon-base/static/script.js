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

    // ======== 4. HEATMAP BOLIVIA (Landing Data) ========
    const BOLIVIA_SVG = `
    <svg viewBox="57.54 -2 844.92 964" xmlns="http://www.w3.org/2000/svg">
        <path d="M256.55,429.17L233.19,405.63L222.99,381.29L212.82,377.18L212.23,361L203.7,348.16L202.58,328.97L206.9,290.87L217.31,276.15L213.65,265.04L237.9,237.46L245.9,208.99L246.41,191.36L250.76,168.29L248.45,144.89L257.91,141.81L263.81,124.79L288.71,118.52L305.56,91.03L334.84,62.72L353.09,50.43L350.15,66.35L359.56,92.3L352.66,105.35L359.03,128.34L376.26,146.85L381.69,165.05L393.83,166.3L398.77,174.93L414.21,181.48L424.18,197.57L455.12,203.2L472.91,197.73L502.44,214.49L514.96,211.22L520.02,224L535.63,235.88L562.39,245.87L581.23,246.43L583.18,254.83L602.33,274.65L617.39,271.68L478.8,352.04L452.24,359.49L453.18,384.09L472.58,420.44L485.81,429.23L491.66,444.66L415.2,441.51L402.59,439.76L367.55,444.32L355.98,474.13L324.74,484.67L304.62,480.62L280.75,458.68L273.32,445.42Z" class="dept-path" id="BO-Beni" data-name="Beni"/>
        <path d="M267.65,595.64L255.19,573.79L242.27,563.52L253.25,557.71L249.01,536.13L239.79,522.25L245.26,511.44L256.37,509.74L260.64,492.96L256.37,472.58L247.61,457.65L247.26,438.73L256.55,429.17L273.32,445.42L280.75,458.68L304.62,480.62L324.74,484.67L355.98,474.13L367.55,444.32L402.59,439.76L405.68,477.66L395.54,501.91L401.65,520.81L426.52,537.66L426.31,554.01L401.25,587.31L428.97,632.85L426.24,645.01L411.61,645.53L402,635.53L385.79,634.11L376.55,641.93L363.71,638.85L356.44,627.24L324.47,596.79L309.77,586.87L298.27,586.8L287.28,595.31Z" class="dept-path" id="BO-Cochabamba" data-name="Cochabamba"/>
        <path d="M364.15,857.56L349.38,843.73L350.94,806.32L360.01,782.87L354.86,758.79L358.3,746.55L387.78,735.15L398.97,722.36L390.26,699.57L359.68,692.24L344.59,675.4L345.31,655.98L338.37,644.45L334.41,622.46L356.44,627.24L363.71,638.85L376.55,641.93L385.79,634.11L402,635.53L411.61,645.53L426.24,645.01L430.53,656.99L454.32,682.26L466.2,688.27L472.71,775.67L499.47,778.5L575.31,778.23L570.41,784.97L570.98,817.55L451.74,817.34L437.97,809.46L436.27,825.73L424.82,827.6L400.5,812.37L392.28,824.38L368.41,815.6Z" class="dept-path" id="BO-Chuquisaca" data-name="Chuquisaca"/>
        <path d="M256.55,429.17L247.26,438.73L247.61,457.65L256.37,472.58L260.64,492.96L256.37,509.74L245.26,511.44L239.79,522.25L249.01,536.13L253.25,557.71L242.27,563.52L231.88,552.48L220.55,555.79L189.17,576.5L185.16,585.98L158.61,570.4L140.15,571.05L115.09,592.08L97.35,599.03L82.32,594.77L77.84,577.68L68.69,569.46L67.73,550.95L59.54,538.99L74.31,528.63L89.22,507.25L101.7,498.47L104.77,466.01L87.7,462.25L73.29,423.54L83.91,402.29L93.03,395.13L76.05,376.21L77.2,364.4L86.19,349.19L103.66,334.06L112.44,321.29L98.19,286.03L105.25,271.65L104.41,225.87L115.38,216.42L125.23,199.91L138.86,194.05L156.85,164.85L173.35,157.25L246.41,191.36L245.9,208.99L237.9,237.46L213.65,265.04L217.31,276.15L206.9,290.87L202.58,328.97L203.7,348.16L212.23,361L212.82,377.18L222.99,381.29L233.19,405.63Z" class="dept-path" id="BO-LaPaz" data-name="La Paz"/>
        <path d="M125.23,199.91L107.75,164.14L63.05,89.86L97.27,91L113.06,94.47L118.77,103.04L152.54,91.89L170.84,69.29L189.97,73.01L201.09,58.26L236.23,41.61L267.26,15.98L305.7,6.79L328.76,6.44L341.03,11L349.86,0L359.62,11.49L360.5,38.01L353.09,50.43L334.84,62.72L305.56,91.03L288.71,118.52L263.81,124.79L257.91,141.81L248.45,144.89L250.76,168.29L246.41,191.36L173.35,157.25L156.85,164.85L138.86,194.05Z" class="dept-path" id="BO-Pando" data-name="Pando"/>
        <path d="M97.35,599.03L115.09,592.08L140.15,571.05L158.61,570.4L185.16,585.98L189.17,576.5L220.55,555.79L231.88,552.48L242.27,563.52L255.19,573.79L267.65,595.64L259.56,600.91L263,632.06L274.54,646.71L291.95,652.73L305.16,684.89L280.75,686.8L262.66,701.07L191.12,731.74L132.27,711.28L141.23,701.48L109.52,674.33L100.85,644.49L100.92,631.65L92.85,605.42Z" class="dept-path" id="BO-Oruro" data-name="Oruro"/>
        <path d="M364.15,857.56L357.77,876.98L367.38,899.33L328.47,900.48L305.7,879.63L294.66,877.02L287.08,900.97L259.88,909.3L257.24,924.29L240.01,931.58L240.7,939.88L228.82,954.01L201.32,960L180.66,954.49L182.52,933.91L175.93,900.08L166.15,889.36L159.13,863.01L158.96,839.64L132.79,797.71L139.61,790.05L124.04,780.72L118.04,749.91L131.91,747.26L135.69,737.12L124.13,724.29L132.27,711.28L191.12,731.74L262.66,701.07L280.75,686.8L305.16,684.89L291.95,652.73L274.54,646.71L263,632.06L259.56,600.91L267.65,595.64L287.28,595.31L298.27,586.8L309.77,586.87L324.47,596.79L356.44,627.24L334.41,622.46L338.37,644.45L345.31,655.98L344.59,675.4L359.68,692.24L390.26,699.57L398.97,722.36L387.78,735.15L358.3,746.55L354.86,758.79L360.01,782.87L350.94,806.32L349.38,843.73Z" class="dept-path" id="BO-Potosi" data-name="Potosí"/>
        <path d="M575.31,778.23L499.47,778.5L472.71,775.67L466.2,688.27L454.32,682.26L430.53,656.99L426.24,645.01L428.97,632.85L401.25,587.31L426.31,554.01L426.52,537.66L401.65,520.81L395.54,501.91L405.68,477.66L402.59,439.76L415.2,441.51L491.66,444.66L485.81,429.23L472.58,420.44L453.18,384.09L452.24,359.49L478.8,352.04L617.39,271.68L624.39,274.98L655.93,270.67L681.19,288.23L695.01,292.88L701.43,306.03L694.65,318.98L708.61,351.66L710.16,385.48L688.43,385.77L712.36,413.23L717.01,469.91L836.64,474.74L843.1,487.53L834.1,499.75L838.72,537.24L868.31,559.82L884.86,566.62L886.71,584.94L900.46,611.18L883.14,662.66L882.7,673.06L858.76,724.19L877.47,741.49L859.55,754.35L856.68,730.82L791,695.24L729.42,691.4L685.52,703.36L607.03,717.07L595.17,749.22Z" class="dept-path" id="BO-SantaCruz" data-name="Santa Cruz"/>
        <path d="M367.38,899.33L357.77,876.98L364.15,857.56L368.41,815.6L392.28,824.38L400.5,812.37L424.82,827.6L436.27,825.73L437.97,809.46L451.74,817.34L570.98,817.55L571.14,821.75L544.38,910.15L532.33,892.03L454.2,892.29L441.3,923.03L430.65,940.73L418,930.86L408.92,908.22L382.72,900.3Z" class="dept-path" id="BO-Tarija" data-name="Tarija"/>
    </svg>`;

    async function initMapChart() {
        const container = document.getElementById('map-container');
        const legend = document.getElementById('legend-items');
        if(!container) return;

        container.innerHTML = BOLIVIA_SVG;
        
        try {
            const res = await fetch('/api/heatmap');
            const data = await res.json(); // Array of {departamento: "...", count: ...}
            
            const maxVal = Math.max(...data.map(d => d.count), 1);
            
            // Helper to interpolate color (from deep blue/bg to vibrant magenta/cyan)
            const getColor = (val) => {
                const ratio = val / maxVal;
                // Interpolate HSL for high-end look
                // 0 count = 220 (Blue), 100% count = 330 (Magenta)
                const hue = 220 + (110 * ratio); 
                const sat = 60 + (40 * ratio);
                const light = 20 + (40 * ratio);
                return `hsl(${hue}, ${sat}%, ${light}%)`;
            };

            // Tooltip creation
            let tooltip = document.querySelector('.map-tooltip');
            if(!tooltip) {
                tooltip = document.createElement('div');
                tooltip.className = 'map-tooltip';
                document.body.appendChild(tooltip);
            }

            data.forEach(item => {
                const id = "BO-" + item.departamento.replace(/\s+/g, '');
                const path = document.getElementById(id);
                if(path) {
                    const color = getColor(item.count);
                    path.style.fill = color;
                    
                    path.addEventListener('mousemove', (e) => {
                        tooltip.style.opacity = 1;
                        tooltip.style.left = (e.clientX + 15) + 'px';
                        tooltip.style.top = (e.clientY + 15) + 'px';
                        tooltip.innerHTML = `
                            <h4>Departmento: ${item.departamento}</h4>
                            <p>Total Reservas: <strong>${item.count}</strong></p>
                            <p>Densidad: ${Math.round((item.count/maxVal)*100)}%</p>
                        `;
                    });

                    path.addEventListener('mouseleave', () => {
                        tooltip.style.opacity = 0;
                    });
                }
            });

            // Populate Legend
            legend.innerHTML = data.sort((a,b) => b.count - a.count).map(item => `
                <div class="legend-item">
                    <div class="legend-color" style="background: ${getColor(item.count)}"></div>
                    <span class="legend-label">${item.departamento}</span>
                    <span class="legend-count">${item.count}</span>
                </div>
            `).join('');

        } catch (err) {
            console.error("Error loading heatmap data", err);
        }
    }

    function triggerChartRender(tabId) {
        if (typeof Chart === 'undefined') return;
        if(tabId === 'dash-main') setTimeout(initMainChart, 350);
        if(tabId === 'dash-financiero') setTimeout(initFinChart, 350);
        if(tabId === 'dash-operativo') setTimeout(initOpChart, 350);
        if(tabId === 'dash-satisfaccion') setTimeout(initSatChart, 350);
        if(tabId === 'dash-mantenimiento') setTimeout(initMaintChart, 350);
        if(tabId === 'dash-mapa') setTimeout(initMapChart, 350);
    }
});
