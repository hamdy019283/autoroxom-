function applyFilters() {
    const fDays = AppState.filters.days === 4 ? ["4_days_sun_wed", "4_days_sat_tue"] : ["5_days_sat_wed"];
    const addonFilterEl = document.getElementById('addon-filter');
    const addonVal = addonFilterEl ? addonFilterEl.value : 'all';
    
    document.getElementById('filter-addon-group').style.display = AppState.filters.units === 21 ? 'flex' : 'none';

    let results = [];
    DB.schedules.forEach(sch => {
        if(fDays.includes(sch.config)) {
            if (AppState.filters.units === 18) {
                results.push({
                    title: sch.id,
                    dbData: sch.schedule_18,
                    meta: "أساسي (18 وحدة)"
                });
            } else {
                if (sch.variants_21 && sch.variants_21.length > 0) {
                    sch.variants_21.forEach((v, vidx) => {
                        if(addonVal === 'all' || v.type === addonVal) {
                            results.push({
                                title: `${sch.id} - ${vidx+1}`,
                                dbData: v.schedule,
                                meta: v.added_desc
                            });
                        }
                    });
                }
            }
        }
    });

    AppState.filteredSchedules = results;
    AppState.activeScheduleIdx = 0;
    renderAutoList();
    renderAutoTable();
}

function renderAutoList() {
    const list = document.getElementById('auto-list');
    list.innerHTML = "";
    if (AppState.filteredSchedules.length === 0) {
        list.innerHTML = "<div style='color:var(--text-muted); text-align:center;'>لا يوجد جداول تطابق هذا الفلتر</div>";
        return;
    }

    AppState.filteredSchedules.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = `sch-item ${idx === AppState.activeScheduleIdx ? 'active' : ''}`;
        div.onclick = () => {
            AppState.activeScheduleIdx = idx;
            renderAutoList();
            renderAutoTable();
        };
        div.innerHTML = `
            <h3>الجدول ${item.title}</h3>
            <p>${item.meta}</p>
        `;
        list.appendChild(div);
    });
}

function renderAutoTable() {
    const table = document.getElementById('auto-table');
    table.innerHTML = "";
    if (AppState.filteredSchedules.length === 0) return;

    const data = AppState.filteredSchedules[AppState.activeScheduleIdx].dbData;
    let html = renderTableHeader() + '<tbody>';
    
    const days = Object.keys(data); // "الأحد" etc
    days.forEach(day => {
        let r = `<tr><td class="day-cell">${day}</td>`;
        data[day].forEach(block => {
            if(!block.data) {
                r += `<td colspan="${block.span}"></td>`;
            } else {
                r += `<td colspan="${block.span}">
                    <div class="course-block" style="padding: 0.5rem; height:100%;">
                        <div class="c-name">${block.data.name}</div>
                        <span class="c-type">(${block.data.type})</span>
                        <span class="c-doc">${block.data.doc}</span>
                    </div>
                </td>`;
            }
        });
        r += `</tr>`;
        html += r;
    });
    
    html += '</tbody>';
    table.innerHTML = html;
}

window.setDayFilter = (days) => {
    AppState.filters.days = days;
    document.getElementById('filter-day-4').classList.toggle('active', days === 4);
    document.getElementById('filter-day-5').classList.toggle('active', days === 5);
    applyFilters();
};

window.setUnitFilter = (units) => {
    AppState.filters.units = units;
    document.getElementById('filter-unit-18').classList.toggle('active', units === 18);
    document.getElementById('filter-unit-21').classList.toggle('active', units === 21);
    applyFilters();
};
